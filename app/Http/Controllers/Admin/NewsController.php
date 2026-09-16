<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\News;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\ImageManager;

class NewsController extends Controller
{
    public function index(Request $request)
    {
        $query = News::query();

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('summary', 'like', "%{$search}%")
                  ->orWhere('source', 'like', "%{$search}%");
            });
        }

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        if ($request->has('is_breaking') && $request->input('is_breaking') !== '') {
            $query->where('is_breaking', filter_var($request->input('is_breaking'), FILTER_VALIDATE_BOOLEAN));
        }

        $columns = [
            'id', 'title', 'slug', 'summary', 'cover_image_url',
            'cover_image_alt', 'video_url', 'source', 'source_url',
            'is_breaking', 'views_count', 'status', 'published_at',
            'created_at', 'updated_at'
        ];
        try {
            if (Schema::hasColumn('news', 'breaking_until')) {
                $columns[] = 'breaking_until';
            }
        } catch (\Throwable $e) {}

        $news = $query->select($columns)
            ->latest('published_at')
            ->latest('id')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/News/Index', [
            'news' => $news,
            'filters' => $request->only(['search', 'status', 'is_breaking']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/News/Create');
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

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:news,slug',
            'summary' => 'nullable|string|max:1000',
            'content' => 'required|string',
            'content_raw' => 'nullable|string',
            'cover_image_url' => 'nullable|string|max:1000',
            'cover_image_alt' => 'nullable|string|max:255',
            'video_url' => 'nullable|string|max:1000',
            'source' => 'nullable|string|max:255',
            'source_url' => 'nullable|string|max:1000',
            'is_breaking' => 'boolean',
            'breaking_until' => 'nullable|date',
            'status' => 'required|in:published,draft',
            'published_at' => 'nullable|date',
        ]);

        $slug = !empty($validated['slug'])
            ? Str::slug($validated['slug'])
            : Str::slug($validated['title']);

        // Ensure unique slug
        $originalSlug = $slug;
        $count = 1;
        while (News::where('slug', $slug)->exists()) {
            $slug = "{$originalSlug}-{$count}";
            $count++;
        }
        $validated['slug'] = $slug;

        if (empty($validated['published_at'])) {
            $validated['published_at'] = now();
        }

        if (empty($validated['source'])) {
            $validated['source'] = 'Rafvex News Wire';
        }

        // Intercept and auto-convert any base64 images into optimized WebP files
        [$validated['content'], $validated['content_raw']] = $this->processBase64Images(
            $validated['content'],
            $validated['content_raw'] ?? null
        );

        if (empty($validated['is_breaking'])) {
            $validated['is_breaking'] = false;
            $validated['breaking_until'] = null;
        } elseif (empty($validated['breaking_until'])) {
            $validated['breaking_until'] = null;
        }

        try {
            if (!Schema::hasColumn('news', 'breaking_until')) {
                unset($validated['breaking_until']);
            }
        } catch (\Throwable $e) {}

        News::create($validated);
        cache()->forget('active_breaking_news');

        return redirect()->route('admin.news.index')->with('success', 'News dispatch published successfully.');
    }

    public function edit(News $news)
    {
        return Inertia::render('Admin/News/Edit', [
            'news' => $news,
        ]);
    }

    public function update(Request $request, News $news)
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

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:news,slug,' . $news->id,
            'summary' => 'nullable|string|max:1000',
            'content' => 'required|string',
            'content_raw' => 'nullable|string',
            'cover_image_url' => 'nullable|string|max:1000',
            'cover_image_alt' => 'nullable|string|max:255',
            'video_url' => 'nullable|string|max:1000',
            'source' => 'nullable|string|max:255',
            'source_url' => 'nullable|string|max:1000',
            'is_breaking' => 'boolean',
            'breaking_until' => 'nullable|date',
            'status' => 'required|in:published,draft',
            'published_at' => 'nullable|date',
        ]);

        // Intercept and auto-convert any base64 images into optimized WebP files
        [$validated['content'], $validated['content_raw']] = $this->processBase64Images(
            $validated['content'],
            $validated['content_raw'] ?? null
        );

        if (empty($validated['is_breaking'])) {
            $validated['is_breaking'] = false;
            $validated['breaking_until'] = null;
        } elseif (empty($validated['breaking_until'])) {
            $validated['breaking_until'] = null;
        }

        try {
            if (!Schema::hasColumn('news', 'breaking_until')) {
                unset($validated['breaking_until']);
            }
        } catch (\Throwable $e) {}

        $news->update($validated);
        cache()->forget('active_breaking_news');

        return redirect()->route('admin.news.index')->with('success', 'News dispatch updated successfully.');
    }

    public function destroy(News $news)
    {
        $news->delete();
        return back()->with('success', 'News dispatch archived.');
    }

    public function toggleBreaking(News $news)
    {
        $newState = !$news->is_breaking;
        $updateData = ['is_breaking' => $newState];
        try {
            if (Schema::hasColumn('news', 'breaking_until')) {
                // If toggled off or toggled on via quick button, clear expiry so it's clean/forever
                $updateData['breaking_until'] = null;
            }
        } catch (\Throwable $e) {}

        $news->update($updateData);
        cache()->forget('active_breaking_news');
        return back()->with('success', 'Breaking status updated.');
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

                $filename = 'news_' . time() . '_' . bin2hex(random_bytes(4)) . '.webp';
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
                    Log::warning('Individual news image conversion failed: ' . $imgErr->getMessage());
                }
            }
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('Base64 image processing in NewsController failed: ' . $e->getMessage());
        }

        return [$content, $contentRaw];
    }
}
