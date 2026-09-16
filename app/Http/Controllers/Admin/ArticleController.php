<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\Category;
use App\Events\NewArticlePublishedEvent;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\ImageManager;

class ArticleController extends Controller
{
    public function index(Request $request)
    {
        $query = Article::with(['author', 'category.parent'])->latest('updated_at');

        // Enhanced search (title, slug, excerpt, or category)
        if ($request->filled('search')) {
            $search = trim($request->get('search'));
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('slug', 'like', "%{$search}%")
                  ->orWhere('excerpt', 'like', "%{$search}%")
                  ->orWhereHas('category', function($catQ) use ($search) {
                      $catQ->where('name', 'like', "%{$search}%");
                  });
            });
        }

        // Status filter
        if ($request->filled('status') && $request->get('status') !== 'all') {
            $query->where('status', $request->get('status'));
        }

        // Subcategory filter (exact category match)
        if ($request->filled('subcategory') && $request->get('subcategory') !== 'all') {
            $query->where('category_id', $request->get('subcategory'));
        }
        // Category filter (matches parent category or any of its children, or uncategorized)
        elseif ($request->filled('category') && $request->get('category') !== 'all') {
            $catId = $request->get('category');
            if ($catId === 'uncategorized') {
                $query->where(function($q) {
                    $q->whereNull('category_id')->orWhere('category_id', 0);
                });
            } else {
                $category = Category::find($catId);
                if ($category) {
                    $childIds = $category->children()->pluck('id')->toArray();
                    $allIds = array_merge([$category->id], $childIds);
                    $query->whereIn('category_id', $allIds);
                } else {
                    $query->where('category_id', $catId);
                }
            }
        }

        $articles = $query->paginate(20)->withQueryString();

        // Load all parent categories with their subcategories for the filter component
        $categories = Category::with(['children' => function($q) {
            $q->orderBy('sort_order')->orderBy('name');
        }])
        ->whereNull('parent_id')
        ->orderBy('sort_order')
        ->orderBy('name')
        ->get();

        $uncategorizedCount = Article::whereNull('category_id')->orWhere('category_id', 0)->count();

        return Inertia::render('Admin/Articles/Index', [
            'articles' => $articles,
            'categories' => $categories,
            'uncategorizedCount' => $uncategorizedCount,
            'filters' => $request->only(['search', 'status', 'category', 'subcategory']),
        ]);
    }

    public function create()
    {
        $categories = Category::all();
        $staffRoles = ['Super Admin', 'Administrator', 'Editor', 'Writer', 'Author'];
        $authors = \App\Models\User::where(function ($q) use ($staffRoles) {
                $q->whereHas('roles', fn($r) => $r->whereIn('name', $staffRoles))
                  ->orWhereHas('profile');
            })
            ->with('profile')
            ->get()
            ->map(function ($u) {
                return [
                    'id'        => $u->id,
                    'name'      => $u->profile?->display_name ?: $u->name,
                    'avatar'    => $u->profile?->avatar ?: $u->avatar,
                    'job_title' => $u->profile?->job_title ?: 'Author',
                ];
            });
        
        $playlists = \App\Models\Playlist::orderBy('title')->get(['id', 'title', 'slug']);
        
        return Inertia::render('Admin/Articles/Create', [
            'categories' => $categories,
            'authors'    => $authors,
            'playlists'  => $playlists,
        ]);
    }

    public function store(Request $request)
    {
        // Decode UTF-8 Base64 payloads to protect against LiteSpeed/Hostinger WAF false positives
        if ($request->filled('content_b64')) {
            $decoded = base64_decode($request->input('content_b64'), true);
            if ($decoded !== false) {
                $request->merge(['content' => $decoded]);
            }
        }
        if ($request->filled('content_raw_b64')) {
            $decodedRaw = base64_decode($request->input('content_raw_b64'), true);
            if ($decodedRaw !== false) {
                $request->merge(['content_raw' => $decodedRaw]);
            }
        }

        // Normalize empty string foreign keys and optional fields to null
        if ($request->input('category_id') === '' || $request->input('category_id') === '0') {
            $request->merge(['category_id' => null]);
        }
        if ($request->input('playlist_id') === '' || $request->input('playlist_id') === '0') {
            $request->merge(['playlist_id' => null]);
        }
        if ($request->input('video_url') === '') {
            $request->merge(['video_url' => null]);
        }
        if ($request->input('scheduled_at') === '') {
            $request->merge(['scheduled_at' => null]);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:articles,slug',
            'category_id' => 'nullable|exists:categories,id',
            'user_id' => 'nullable|exists:users,id',
            'status' => 'required|in:draft,review,approved,scheduled,published',
            'playlist_id' => 'nullable|exists:playlists,id',
            'playlist_order' => 'nullable|integer|min:0',
            'content_raw' => 'nullable|string', // Tiptap JSON
            'content' => 'nullable|string',     // HTML output
            'excerpt' => 'nullable|string',
            'cover_image_url' => 'nullable|string|max:1000',
            'cover_image_alt' => 'nullable|string|max:255',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
            'video_url' => 'nullable|string|max:1000',
            'scheduled_at' => 'nullable|date',
            'is_breaking' => 'nullable|boolean',
            'breaking_until' => 'nullable|date',
        ]);

        if (empty($validated['is_breaking'])) {
            $validated['is_breaking'] = false;
            $validated['breaking_until'] = null;
        } elseif (empty($validated['breaking_until'])) {
            $validated['breaking_until'] = null;
        }

        if (empty($validated['user_id'])) {
            $validated['user_id'] = Auth::id();
        }
        
        // Handle slug
        if (empty($validated['slug'])) {
            $baseSlug = Str::slug($validated['title']);
            $validated['slug'] = $baseSlug ?: 'article';
            $count = 1;
            while (Article::where('slug', $validated['slug'])->exists()) {
                $validated['slug'] = "{$baseSlug}-{$count}";
                $count++;
            }
        } else {
            $validated['slug'] = Str::slug($validated['slug']);
        }
        
        if ($validated['status'] === 'published') {
            $validated['published_at'] = now();
        } elseif ($validated['status'] === 'scheduled') {
            if (empty($validated['scheduled_at'])) {
                $validated['scheduled_at'] = now()->addDay();
            } elseif (\Illuminate\Support\Carbon::parse($validated['scheduled_at'])->isPast()) {
                $validated['status'] = 'published';
                $validated['published_at'] = $validated['scheduled_at'];
            }
        }

        // Auto-convert any base64 images into optimized WebP files
        [$validated['content'], $validated['content_raw']] = $this->processBase64Images(
            $validated['content'] ?? '',
            $validated['content_raw'] ?? null
        );

        $article = Article::create($validated);

        if ($article->status === 'published') {
            $this->notifyNewPublishedArticle($article);
        }

        $flashMessage = $article->status === 'draft' 
            ? 'Article draft saved successfully.' 
            : ($article->status === 'scheduled' ? 'Article scheduled successfully.' : 'Article published successfully.');

        return redirect('/ourcms/articles/' . $article->id . '/edit')->with('message', $flashMessage);
    }

    public function edit(Article $article)
    {
        $article->load(['category', 'tags', 'author.profile', 'playlist']);
        $categories = Category::all();
        $playlists = \App\Models\Playlist::orderBy('title')->get(['id', 'title', 'slug']);
        $staffRoles = ['Super Admin', 'Administrator', 'Editor', 'Writer', 'Author'];
        $authors = \App\Models\User::where(function ($q) use ($staffRoles) {
                $q->whereHas('roles', fn($r) => $r->whereIn('name', $staffRoles))
                  ->orWhereHas('profile');
            })
            ->with('profile')
            ->get()
            ->map(function ($u) {
                return [
                    'id'        => $u->id,
                    'name'      => $u->profile?->display_name ?: $u->name,
                    'avatar'    => $u->profile?->avatar ?: $u->avatar,
                    'job_title' => $u->profile?->job_title ?: 'Author',
                ];
            });

        return Inertia::render('Admin/Articles/Edit', [
            'article'    => $article,
            'categories' => $categories,
            'authors'    => $authors,
            'playlists'  => $playlists,
        ]);
    }

    public function update(Request $request, Article $article)
    {
        $wasPublished = $article->status === 'published';

        // Decode UTF-8 Base64 payloads to protect against LiteSpeed/Hostinger WAF false positives
        if ($request->filled('content_b64')) {
            $decoded = base64_decode($request->input('content_b64'), true);
            if ($decoded !== false) {
                $request->merge(['content' => $decoded]);
            }
        }
        if ($request->filled('content_raw_b64')) {
            $decodedRaw = base64_decode($request->input('content_raw_b64'), true);
            if ($decodedRaw !== false) {
                $request->merge(['content_raw' => $decodedRaw]);
            }
        }

        // Normalize empty string foreign keys and optional fields to null
        if ($request->input('category_id') === '' || $request->input('category_id') === '0') {
            $request->merge(['category_id' => null]);
        }
        if ($request->input('playlist_id') === '' || $request->input('playlist_id') === '0') {
            $request->merge(['playlist_id' => null]);
        }
        if ($request->input('video_url') === '') {
            $request->merge(['video_url' => null]);
        }
        if ($request->input('scheduled_at') === '') {
            $request->merge(['scheduled_at' => null]);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:articles,slug,' . $article->id,
            'category_id' => 'nullable|exists:categories,id',
            'user_id' => 'nullable|exists:users,id',
            'status' => 'required|in:draft,review,approved,scheduled,published',
            'playlist_id' => 'nullable|exists:playlists,id',
            'playlist_order' => 'nullable|integer|min:0',
            'content_raw' => 'nullable|string',
            'content' => 'nullable|string',
            'excerpt' => 'nullable|string',
            'cover_image_url' => 'nullable|string|max:1000',
            'cover_image_alt' => 'nullable|string|max:255',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
            'video_url' => 'nullable|string|max:1000',
            'scheduled_at' => 'nullable|date',
            'is_breaking' => 'nullable|boolean',
            'breaking_until' => 'nullable|date',
        ]);

        if (empty($validated['is_breaking'])) {
            $validated['is_breaking'] = false;
            $validated['breaking_until'] = null;
        } elseif (empty($validated['breaking_until'])) {
            $validated['breaking_until'] = null;
        }

        $validated['slug'] = Str::slug($validated['slug']);

        if ($validated['status'] === 'published') {
            if (!$article->published_at) {
                $validated['published_at'] = now();
            }
        } elseif ($validated['status'] === 'scheduled') {
            if (empty($validated['scheduled_at'])) {
                $validated['scheduled_at'] = $article->scheduled_at ?: now()->addDay();
            } elseif (\Illuminate\Support\Carbon::parse($validated['scheduled_at'])->isPast()) {
                $validated['status'] = 'published';
                $validated['published_at'] = $validated['scheduled_at'];
            }
        }

        // Auto-convert any base64 images into optimized WebP files
        [$validated['content'], $validated['content_raw']] = $this->processBase64Images(
            $validated['content'] ?? '',
            $validated['content_raw'] ?? null
        );

        $article->update($validated);

        if (!$wasPublished && $article->status === 'published') {
            $this->notifyNewPublishedArticle($article);
        }

        // Save a revision history entry
        $article->revisions()->create([
            'user_id' => Auth::id(),
            'title' => $validated['title'],
            'content_raw' => $validated['content_raw'] ?? null,
            'content' => $validated['content'] ?? null,
            'status' => $validated['status'],
            'revision_number' => $article->revision_count + 1,
        ]);
        $article->increment('revision_count');

        return redirect('/ourcms/articles/' . $article->id . '/edit')->with('message', 'Article saved successfully.');
    }

    private function notifyNewPublishedArticle(Article $article): void
    {
        try {
            $article->loadMissing('category');
            $payload = [
                'id'              => $article->id,
                'title'           => $article->title,
                'slug'            => $article->slug,
                'excerpt'         => Str::limit(strip_tags($article->excerpt ?: $article->content), 120),
                'cover_image_url' => $article->cover_image_url,
                'category_name'   => $article->category?->name,
                'published_at'    => now()->diffForHumans(),
            ];

            // Broadcast real-time Pusher event
            broadcast(new NewArticlePublishedEvent($payload));

            // Create in-app notifications for registered customers
            $customerIds = \App\Models\User::role('Customer')->pluck('id');
            $now = now();
            $notifications = [];
            foreach ($customerIds as $cId) {
                $notifications[] = [
                    'user_id'    => $cId,
                    'type'       => 'new_article',
                    'title'      => '🔥 New Article: ' . Str::limit($article->title, 50),
                    'message'    => Str::limit(strip_tags($article->excerpt ?: $article->title), 100),
                    'link'       => '/article/' . $article->slug,
                    'data'       => json_encode(['article_id' => $article->id, 'article_slug' => $article->slug]),
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
            if (!empty($notifications)) {
                \App\Models\UserNotification::insert($notifications);
            }
        } catch (\Throwable $e) {
            Log::warning('Failed to broadcast new article notification: ' . $e->getMessage());
        }
    }

    public function destroy(Article $article)
    {
        $article->delete();
        return redirect('/ourcms/articles')->with('message', 'Article moved to trash.');
    }

    /**
     * Extract any base64 images from content/content_raw, save them as optimized WebP files in public storage,
     * and replace the inline base64 data URIs with clean public URLs.
     */
    protected function processBase64Images(?string $content, ?string $contentRaw): array
    {
        if (empty($content) || !str_contains($content, 'data:image/')) {
            return [$content, $contentRaw];
        }

        try {
            $dateFolder = 'editor/' . date('Y/m');
            Storage::disk('public')->makeDirectory($dateFolder);
            $manager = new ImageManager(new Driver);

            // Match all base64 data URIs: data:image/[type];base64,[data]
            preg_match_all('/data:image\/([a-zA-Z0-9.+-]+);base64,([A-Za-z0-9+\/=\s]+)/', $content, $matches, PREG_SET_ORDER);

            foreach ($matches as $match) {
                $fullDataUri = $match[0];
                $binary = base64_decode(preg_replace('/\s+/', '', $match[2]));
                if (!$binary) {
                    continue;
                }

                $filename = 'art_' . time() . '_' . bin2hex(random_bytes(4)) . '.webp';
                $relPath = $dateFolder . '/' . $filename;
                $fullPath = storage_path('app/public/' . $relPath);

                try {
                    $image = $manager->decodeBinary($binary);
                    if ($image->width() > 1920) {
                        $image->scale(width: 1920);
                    }
                    $image->save($fullPath, quality: 82);

                    $publicUrl = Storage::url($relPath);

                    // Replace in HTML content
                    $content = str_replace($fullDataUri, $publicUrl, $content);

                    // Replace in content_raw JSON if present
                    if (!empty($contentRaw)) {
                        $contentRaw = str_replace($fullDataUri, $publicUrl, $contentRaw);
                    }
                } catch (\Throwable $imgErr) {
                    Log::warning('Individual image conversion failed: ' . $imgErr->getMessage());
                }
            }
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('Base64 image processing in ArticleController failed: ' . $e->getMessage());
        }

        return [$content, $contentRaw];
    }

    public function toggleBreaking(Article $article)
    {
        $newState = !$article->is_breaking;
        $updateData = ['is_breaking' => $newState];
        if (\Illuminate\Support\Facades\Schema::hasColumn('articles', 'breaking_until')) {
            if (!$newState) {
                $updateData['breaking_until'] = null;
            }
        }
        $article->update($updateData);
        cache()->forget('active_breaking_news');
        cache()->forget('active_breaking_items');
        return back()->with('success', 'Article breaking status updated.');
    }
}
