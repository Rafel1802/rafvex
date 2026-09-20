<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\Category;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ArticleController extends Controller
{
    public function show($slug)
    {
        if ($slug === 'the-lost-wallet' || $slug === 'the-lost-wallet-story') {
            return redirect()->route('article.show', ['slug' => 'the-lost-wallet-inspiring-english-story'], 301);
        }

        $article = Article::published()
            ->with(['category', 'author.profile', 'tags', 'playlist', 'comments' => function ($q) {
                $q->whereNull('parent_id')
                    ->where('status', 'approved')
                    ->with(['replies' => function ($q) {
                        $q->where('status', 'approved')->orderBy('created_at', 'asc');
                    }])
                    ->orderBy('created_at', 'desc');
            }])
            ->where('slug', $slug)
            ->first();

        if (! $article) {
            $candidateFiles = [
                base_path("content/articles/{$slug}.json"),
                base_path('content/articles/the_lost_wallet.json'),
            ];
            $foundData = null;

            foreach ($candidateFiles as $file) {
                if (file_exists($file)) {
                    $cData = json_decode(file_get_contents($file), true);
                    if (($cData['slug'] ?? '') === $slug) {
                        $foundData = $cData;
                        break;
                    }
                }
            }

            if (! $foundData && file_exists(base_path('content/compiled_articles_cache.json'))) {
                $allCached = json_decode(file_get_contents(base_path('content/compiled_articles_cache.json')), true) ?: [];
                foreach ($allCached as $cItem) {
                    if (($cItem['slug'] ?? '') === $slug) {
                        $foundData = $cItem;
                        break;
                    }
                }
            }

            if (! $foundData && $slug === 'the-lost-wallet-inspiring-english-story') {
                $foundData = $this->getTheLostWalletData();
            }

            $seedError = null;
            if ($foundData) {
                try {
                    $author = User::first() ?? User::create([
                        'name' => 'Mr. Soporadara Rin',
                        'email' => 'rafvexofficial@gmail.com',
                        'password' => bcrypt('RafvexResearch2026!'),
                        'email_verified_at' => now(),
                    ]);

                    $parentCat = Category::firstOrCreate(
                        ['slug' => Str::slug($foundData['category'] ?? 'English Reading Stories')],
                        [
                            'name' => $foundData['category'] ?? 'English Reading Stories',
                            'description' => 'Comprehensive inspiring English stories, reading practice, and vocabulary building.',
                            'status' => 'active',
                            'featured' => true,
                        ]
                    );

                    $subCat = Category::firstOrCreate(
                        ['slug' => Str::slug($foundData['subcategory'] ?? 'Short Stories')],
                        [
                            'parent_id' => $parentCat->id,
                            'name' => $foundData['subcategory'] ?? 'Short Stories',
                            'description' => 'Engaging short stories with moral lessons and listening practice.',
                            'status' => 'active',
                            'featured' => false,
                        ]
                    );

                    Article::updateOrCreate(
                        ['slug' => $slug],
                        [
                            'user_id' => $author->id,
                            'category_id' => $subCat->id,
                            'title' => $foundData['title'],
                            'excerpt' => $foundData['meta_description'] ?? '',
                            'content' => $foundData['html_content'] ?? ($foundData['content'] ?? ''),
                            'content_raw' => null,
                            'status' => 'published',
                            'published_at' => now()->subMinute(),
                            'cover_image_url' => $foundData['cover_image_url'] ?? '',
                            'cover_image_alt' => $foundData['cover_image_alt'] ?? $foundData['title'],
                            'video_url' => $foundData['video_url'] ?? null,
                            'meta_title' => $foundData['seo_meta_title'] ?? $foundData['title'],
                            'meta_description' => $foundData['meta_description'] ?? '',
                            'reading_time' => 7,
                            'featured' => true,
                            'allow_comments' => true,
                            'ai_assisted' => true,
                        ]
                    );

                    $article = Article::where('slug', $slug)->first();
                } catch (\Throwable $e) {
                    $seedError = $e->getMessage().' in '.$e->getFile().':'.$e->getLine();
                }
            }
        }

        if (! $article) {
            if ($slug === 'the-lost-wallet-inspiring-english-story') {
                dd([
                    'msg' => 'Debugging The Lost Wallet',
                    'slug' => $slug,
                    'foundData_exists' => ! empty($foundData),
                    'seedError' => $seedError ?? null,
                    'article_in_db' => Article::where('slug', $slug)->first(),
                ]);
            }
            abort(404);
        }

        // Increment views with session deduplication to record genuine, real reader visits
        $sessionKey = 'viewed_article_'.$article->id;
        if (! session()->has($sessionKey)) {
            $article->increment('views_count');
            session()->put($sessionKey, now()->timestamp);
        }

        // Contextual related articles based on category or tags
        $related = Article::published()
            ->with(['category', 'author'])
            ->where('id', '!=', $article->id)
            ->where('category_id', $article->category_id)
            ->latest('published_at')
            ->take(3)
            ->get();

        // Fallback: If not enough related articles in same category, grab latest from other categories
        if ($related->count() < 3) {
            $extra = Article::published()
                ->with(['category', 'author'])
                ->where('id', '!=', $article->id)
                ->whereNotIn('id', $related->pluck('id'))
                ->latest('published_at')
                ->take(3 - $related->count())
                ->get();
            $related = $related->concat($extra);
        }

        // Top 5 Popular Articles across publication (strictly matching /popular query logic)
        $popularArticles = Article::published()
            ->with(['category', 'author.profile'])
            ->orderBy('views_count', 'desc')
            ->latest('published_at')
            ->take(5)
            ->get();

        // Trending stories across publication for secondary sidebar usage
        $trending = $popularArticles;

        // Custom Playlist / Series if assigned, else Topic Cluster Playlist
        $playlistTitle = null;
        $clusterPlaylist = collect();

        if ($article->playlist_id) {
            $clusterPlaylist = Article::published()
                ->select(['id', 'title', 'slug', 'category_id', 'playlist_id', 'playlist_order', 'reading_time', 'featured', 'published_at'])
                ->where('playlist_id', $article->playlist_id)
                ->orderBy('playlist_order', 'asc')
                ->orderBy('id', 'asc')
                ->get();

            if ($clusterPlaylist->isNotEmpty()) {
                $playlistTitle = $article->playlist?->title ?: 'Series Playlist';
            }
        }

        if ($clusterPlaylist->isEmpty()) {
            $clusterQuery = Article::published()
                ->select(['id', 'title', 'slug', 'category_id', 'reading_time', 'featured', 'published_at']);

            if ($article->category_id) {
                $clusterQuery->where('category_id', $article->category_id);
            }

            $clusterPlaylist = $clusterQuery->orderBy('id', 'asc')->get();

            if ($clusterPlaylist->count() < 3 && $article->category && $article->category->parent_id) {
                $siblingCatIds = Category::where('parent_id', $article->category->parent_id)->pluck('id');
                $clusterPlaylist = Article::published()
                    ->select(['id', 'title', 'slug', 'category_id', 'reading_time', 'featured', 'published_at'])
                    ->whereIn('category_id', $siblingCatIds)
                    ->orderBy('id', 'asc')
                    ->get();
            }

            $playlistTitle = 'Cluster Playlist';
        }

        // Curated / Featured Categories for Left Sidebar
        $sidebarCategories = Category::whereNull('parent_id')
            ->withCount(['articles' => fn ($q) => $q->published()])
            ->where('status', 'active')
            ->orderBy('featured', 'desc')
            ->orderBy('sort_order', 'asc')
            ->take(6)
            ->get(['id', 'name', 'slug', 'description', 'featured']);

        // Tags for the article and publication
        $articleTags = $article->tags;
        $popularTags = Tag::withCount('articles')
            ->orderBy('articles_count', 'desc')
            ->take(12)
            ->get(['id', 'name', 'slug']);

        return Inertia::render('Public/Article/Show', [
            'article' => $article,
            'related' => $related,
            'trending' => $trending,
            'popularArticles' => $popularArticles,
            'clusterPlaylist' => $clusterPlaylist,
            'playlistTitle' => $playlistTitle,
            'sidebarCategories' => $sidebarCategories,
            'popularTags' => $popularTags,
        ]);
    }

    /**
     * Fallback story data for The Lost Wallet with video narration and comprehension questions
     */
    private function getTheLostWalletData(): array
    {
        $jsonPath = base_path('content/articles/the_lost_wallet.json');
        if (file_exists($jsonPath)) {
            $data = json_decode(file_get_contents($jsonPath), true);
            if (! empty($data['title'])) {
                return $data;
            }
        }

        $embeddedB64 = 'ewogICJpZCI6IDY0LAogICJ0aXRsZSI6ICJUaGUgTG9zdCBXYWxsZXQ6IEFuIEluc3BpcmluZyBFbmdsaXNoIFN0b3J5IEFib3V0IEhvbmVzdHkgYW5kIEtpbmRuZXNzIiwKICAic2x1ZyI6ICJ0aGUtbG9zdC13YWxsZXQtaW5zcGlyaW5nLWVuZ2xpc2gtc3RvcnkiLAogICJjYXRlZ29yeSI6ICJFbmdsaXNoIFJlYWRpbmcgU3RvcmllcyIsCiAgInN1YmNhdGVnb3J5IjogIlNob3J0IFN0b3JpZXMiLAogICJwcmltYXJ5X2tleXdvcmQiOiAidGhlIGxvc3Qgd2FsbGV0IGVuZ2xpc2ggc3RvcnkgaG9uZXN0eSByZWFkaW5nIGxpc3RlbmluZyBjb21wcmVoZW5zaW9uIiwKICAic2VvX21ldGFfdGl0bGUiOiAiVGhlIExvc3QgV2FsbGV0OiBBbiBJbnNwaXJpbmcgRW5nbGlzaCBTdG9yeSBBYm91dCBIb25lc3R5IGFuZCBLaW5kbmVzcyIsCiAgIm1ldGFfZGVzY3JpcHRpb24iOiAiUmVhZCAnVGhlIExvc3QgV2FsbGV0JywgYW4gaW5zcGlyaW5nIEVuZ2xpc2ggc3RvcnkgYWJvdXQgaG9uZXN0eSwgZW1wYXRoeSwgYW5kIGRvaW5nIHRoZSByaWdodCB0aGluZy4gSW5jbHVkZXMgdmlkZW8gbmFycmF0aW9uLCB2b2NhYnVsYXJ5IGRlZmluaXRpb25zLCBhbmQgY29tcHJlaGVuc2lvbiBxdWVzdGlvbnMuIiwKICAiY292ZXJfaW1hZ2VfdXJsIjogIi9ibG9nL2VuZ2xpc2gtcmVhZGluZy1zdG9yaWVzL3Nob3J0LXN0b3JpZXMvdGhlLWxhbnRlcm4tbWFrZXIvdGhlLWxhbnRlcm4tbWFrZXItMS53ZWJwIiwKICAiY292ZXJfaW1hZ2VfYWx0IjogIkZpZ3VyZSAxOiBJbGx1c3RyYXRpb24gb2YgVG9tIGZpbmRpbmcgdGhlIGxvc3Qgd2FsbGV0IG5lYXIgYSB0cmVlIGluIGEgcXVpZXQgdG93bi4iLAogICJ2aWRlb191cmwiOiAiaHR0cHM6Ly93d3cueW91dHViZS5jb20vd2F0Y2g/dj14aUVNVVliYXI1ayIsCiAgImlzX3BpbGxhciI6IGZhbHNlLAogICJwaWxsYXJfc2x1ZyI6ICJ0aGUtbGFudGVybi1tYWtlci1pbnNwaXJpbmctZW5nbGlzaC1yZWFkaW5nLXN0b3J5IiwKICAiaHRtbF9jb250ZW50IjogIjxkaXYgY2xhc3M9XCJ0b3BpYy1jbHVzdGVyLWJhbm5lciBtYi04XCI+XG4gIDxkaXYgY2xhc3M9XCJjbHVzdGVyLWljb25cIj5cbiAgICA8c3ZnIGNsYXNzPVwidy00IGgtNFwiIGZpbGw9XCJub25lXCIgc3Ryb2tlPVwiY3VycmVudENvbG9yXCIgdmlld0JveD1cIjAgMCAyNCAyNFwiPjxwYXRoIHN0cm9rZS1saW5lY2FwPVwicm91bmRcIiBzdHJva2UtbGluZWpvaW49XCJyb3VuZFwiIHN0cm9rZS13aWR0aD1cIjJcIiBkPVwiTTE0Ljc1MiAxMS4xNjhsLTMuMTk3LTIuMTMyQTEgMSAwIDAwMTAgOS44N3Y0LjI2M2ExIDEgMCAwMDEuNTU1LjgzMmwzLjE5Ny0yLjEzMmExIDEgMCAwMDAtMS42NjR6XCI+PC9wYXRoPjxwYXRoIHN0cm9rZS1saW5lY2FwPVwicm91bmRcIiBzdHJva2UtbGluZWpvaW49XCJyb3VuZFwiIHN0cm9rZS13aWR0aD1cIjJcIiBkPVwiTTIxIDEyYTkgOSAwIDExLTE4IDAgOSA5IDAgMDExOCAwelwiPjwvcGF0aD48L3N2Zz5cbiAgPC9kaXY+XG4gIDxkaXY+XG4gICAgPHNwYW4gY2xhc3M9XCJ0ZXh0LXhzIGZvbnQtYm9sZCB1cHBlcmNhc2UgdHJhY2tpbmctd2lkZXIgdGV4dC1yZWQtNjAwIGJsb2NrIG1iLTAuNVwiPkVuZ2xpc2ggUmVhZGluZyAmYW1wOyBMaXN0ZW5pbmcgU2VyaWVzPC9zcGFuPlxuICAgIDxwIGNsYXNzPVwidGV4dC14cyBzbTp0ZXh0LXNtIHRleHQtc2xhdGUtNzAwIGRhcms6dGV4dC1zbGF0ZS0zMDAgbS0wXCI+SW1wcm92ZSB5b3VyIEVuZ2xpc2ggY29tcHJlaGVuc2lvbiBhbmQgbGlzdGVuaW5nIHNraWxscy4gRm9sbG93IGFsb25nIHdpdGggdGhlIHRleHQgYmVsb3cgd2hpbGUgbGlzdGVuaW5nIHRvIHRoZSB2aWRlbyBuYXJyYXRpb24uPC9wPlxuICA8L2Rpdj5cbjwvZGl2PlxuXG48ZGl2IGNsYXNzPVwibXktOCByb3VuZGVkLTJ4bCBvdmVyZmxvdy1oaWRkZW4gc2hhZG93LWxnIGJvcmRlciBib3JkZXItc2xhdGUtMjAwIGRhcms6Ym9yZGVyLXNsYXRlLTgwMCBiZy1zbGF0ZS05NTBcIj5cbiAgPGRpdiBjbGFzcz1cImFzcGVjdC12aWRlbyB3LWZ1bGxcIj5cbiAgICA8aWZyYW1lIGNsYXNzPVwidy1mdWxsIGgtZnVsbFwiIHNyYz1cImh0dHBzOi8vd3d3LnlvdXR1YmUtbm9jb29raWUuY29tL2VtYmVkL3hpRU1VWWJhcjVrP3JlbD0wJmFtcDttb2Rlc3RicmFuZGluZz0xXCIgdGl0bGU9XCJUaGUgTG9zdCBXYWxsZXQgLSBFbmdsaXNoIFJlYWRpbmcgU3RvcnlcIiBmcmFtZWJvcmRlcj1cIjBcIiBhbGxvdz1cImFjY2VsZXJvbWV0ZXI7IGF1dG9wbGF5OyBjbGlwYm9hcmQtd3JpdGU7IGVuY3J5cHRlZC1tZWRpYTsgZ3lyb3Njb3BlOyBwaWN0dXJlLWluLXBpY3R1cmU7IHdlYi1zaGFyZVwiIGFsbG93ZnVsbHNjcmVlbj48L2lmcmFtZT5cbiAgPC9kaXY+XG4gIDxkaXYgY2xhc3M9XCJweC00IHB5LTMgYmctc2xhdGUtOTAwIHRleHQtc2xhdGUtMzAwIHRleHQteHMgc206dGV4dC1zbSBmbGV4IGZsZXgtd3JhcCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuIGdhcC0yIGJvcmRlci10IGJvcmRlci1zbGF0ZS04MDBcIj5cbiAgICA8c3BhbiBjbGFzcz1cImZsZXggaXRlbXMtY2VudGVyIGdhcC0yXCI+XG4gICAgICA8c3BhbiBjbGFzcz1cInctMiBoLTIgcm91bmRlZC1mdWxsIGJnLXJlZC01MDAgYW5pbWF0ZS1wdWxzZVwiPjwvc3Bhbj5cbiAgICAgIDxzcGFuPk9mZmljaWFsIFZpZGVvICZhbXA7IEF1ZGlvIE5hcnJhdGlvbiAoTGlzdGVuICZhbXA7IFByYWN0aWNlKTwvc3Bhbj5cbiAgICA8L3NwYW4+XG4gICAgPGEgaHJlZj1cImh0dHBzOi8vd3d3LnlvdXR1YmUuY29tL3dhdGNoP3Y9eGlFTVVZYmFyNWtcIiB0YXJnZXQ9XCJfYmxhbmtcIiByZWw9XCJub29wZW5lciBub3JlZmVycmVyXCIgY2xhc3M9XCJ0ZXh0LXJlZC00MDAgaG92ZXI6dGV4dC1yZWQtMzAwIGZvbnQtc2VtaWJvbGQgdW5kZXJsaW5lIHRyYW5zaXRpb24tY29sb3JzXCI+V2F0Y2ggZGlyZWN0bHkgb24gWW91VHViZSAmcmFycjs8L2E+XG4gIDwvZGl2PlxuPC9kaXY+XG5cbjxoMiBjbGFzcz1cInRleHQtMnhsIHNtOnRleHQtM3hsIGZvbnQtYm9sZCB0ZXh0LXNsYXRlLTkwMCBkYXJrOnRleHQtc2xhdGUtMTAwIG10LTEyIG1iLTUgZm9udC1bJ091dGZpdCddXCI+MS4gTmFycmF0aXZlIE92ZXJ2aWV3OiBUaGUgTW9yYWwgUG93ZXIgb2YgU2ltcGxlIENob2ljZXM8L2gyPlxuXG48cCBjbGFzcz1cIm1iLTYgbGVhZGluZy1yZWxheGVkIHRleHQtc2xhdGUtNzAwIGRhcms6dGV4dC1zbGF0ZS0zMDAgdGV4dC1iYXNlIHNtOnRleHQtbGcgZm9udC1ub3JtYWxcIj5JbiBsYW5ndWFnZSBhY3F1aXNpdGlvbiBhbmQgbGl0ZXJhdHVyZSwgc3Rvcnl0ZWxsaW5nIHNlcnZlcyBhcyBvbmUgb2YgdGhlIG1vc3QgZWZmZWN0aXZlIHRvb2xzIGZvciBtYXN0ZXJpbmcgdm9jYWJ1bGFyeSwgbmF0dXJhbCBzZW50ZW5jZSByaHl0aG0sIGFuZCBsaXN0ZW5pbmcgZmx1ZW5jeS4gV2hlbiBsZWFybmVycyBjb25uZWN0IGVtb3Rpb25hbGx5IHdpdGggY2hhcmFjdGVycyBmYWNpbmcgZ2VudWluZSBodW1hbiBkaWxlbW1hcywgbmV3IHZvY2FidWxhcnkgYW5kIGdyYW1tYXIgcGF0dGVybnMgYXJlIHJldGFpbmVkIHdpdGggbGFzdGluZyBjbGFyaXR5LjwvcD5cblxuPHAgY2xhc3M9XCJtYi02IGxlYWRpbmctcmVsYXhlZCB0ZXh0LXNsYXRlLTcwMCBkYXJrOnRleHQtc2xhdGUtMzAwIHRleHQtYmFzZSBzbTp0ZXh0LWxnIGZvbnQtbm9ybWFsXCI+UHJlc2VudGVkIGJlbG93IGlzIDxlbT5UaGUgTG9zdCBXYWxsZXQ8L2VtPiwgYW4gdXBsaWZ0aW5nIHN0b3J5IG9mIGhvbmVzdHksIGVtcGF0aHksIGFuZCB1bmV4cGVjdGVkIGZyaWVuZHNoaXAuIFJlYWQgdGhlIGNvbXBsZXRlIHN0b3J5IGJlbG93LCBsaXN0ZW4gYWxvbmcgdG8gdGhlIGF1ZGlvIHZlcnNpb24gaW4gdGhlIHZpZGVvIHBsYXllciBhYm92ZSwgYW5kIGNvbXBsZXRlIHRoZSByZWFkaW5nIGNvbXByZWhlbnNpb24gZXhlcmNpc2VzIGF0IHRoZSBlbmQgdG8gZXZhbHVhdGUgeW91ciBtYXN0ZXJ5LjwvcD5cblxuPGhyIGNsYXNzPVwibXktMTAgYm9yZGVyLXNsYXRlLTIwMCBkYXJrOmJvcmRlci1zbGF0ZS04MDBcIiAvPlxuXG48aDMgY2xhc3M9XCJ0ZXh0LXhsIHNtOnRleHQtMnhsIGZvbnQtYm9sZCB0ZXh0LXNsYXRlLTkwMCBkYXJrOnRleHQtc2xhdGUtMTAwIG10LTggbWItNCBmb250LVsnT3V0Zml0J11cIj5UaGUgTG9zdCBXYWxsZXQ6IEEgU3Rvcnkgb2YgSG9uZXN0eSBhbmQgS2luZG5lc3M8L2gzPlxuXG48aDQgY2xhc3M9XCJ0ZXh0LWxnIHNtOnRleHQteGwgZm9udC1ib2xkIHRleHQtc2xhdGUtODAwIGRhcms6dGV4dC1zbGF0ZS0xMDAgbXQtNiBtYi0zIGZvbnQtWydPdXRmaXQnXVwiPkNoYXB0ZXIgSTogQSBTaW1wbGUgTGlmZSBpbiBhIFF1aWV0IFRvd248L2g0PlxuXG48cCBjbGFzcz1cIm1iLTYgbGVhZGluZy1yZWxheGVkIHRleHQtc2xhdGUtNzAwIGRhcms6dGV4dC1zbGF0ZS0zMDAgdGV4dC1iYXNlIHNtOnRleHQtbGcgZm9udC1ub3JtYWxcIj5Ub20gd2FzIGEgeW91bmcgbWFuIHdobyBsaXZlZCBpbiBhIHNtYWxsIHRvd24uIFRoZSB0b3duIHdhcyBxdWlldCBhbmQgZnJpZW5kbHkuIEl0IGhhZCBhIHNtYWxsIHBhcmssIGEgbGlicmFyeSwgYSB0cmFpbiBzdGF0aW9uLCBhIHN1cGVybWFya2V0LCBhbmQgbWFueSBsaXR0bGUgc2hvcHMuIEluIHRoZSBjZW50ZXIgb2YgdG93biBzdG9vZCBhIHNtYWxsIGNvZmZlZSBzaG9wIGNhbGxlZCA8c3Ryb25nPk1vcm5pbmcgQ29mZmVlPC9zdHJvbmc+LiBUb20gd29ya2VkIHRoZXJlLjwvcD5cblxuPHAgY2xhc3M9XCJtYi02IGxlYWRpbmctcmVsYXhlZCB0ZXh0LXNsYXRlLTcwMCBkYXJrOnRleHQtc2xhdGUtMzAwIHRleHQtYmFzZSBzbTp0ZXh0LWxnIGZvbnQtbm9ybWFsXCI+RXZlcnkgbW9ybmluZywgVG9tIHdva2UgdXAgYXQgNzowMCBBTS4gSGUgbWFkZSBhIHdhcm0gY3VwIG9mIGNvZmZlZSBhbmQgYXRlIHR3byBwaWVjZXMgb2YgYnJlYWQgZm9yIGJyZWFrZmFzdC4gVGhlbiBoZSBwdXQgb24gaGlzIGphY2tldCBhbmQgd2Fsa2VkIHRvIHdvcmsuIFRvbSBkaWQgbm90IGhhdmUgYSBsb3Qgb2YgbW9uZXksIGJ1dCBoZSB3YXMgaGFwcHkgd2l0aCBoaXMgc2ltcGxlIGxpZmUuIEhlIGxpa2VkIGhpcyBqb2IsIGhpcyBmcmllbmRzLCBhbmQgaGlzIHNtYWxsIGhvbWUuPC9wPlxuXG48cCBjbGFzcz1cIm1iLTYgbGVhZGluZy1yZWxheGVkIHRleHQtc2xhdGUtNzAwIGRhcms6dGV4dC1zbGF0ZS0zMDAgdGV4dC1iYXNlIHNtOnRleHQtbGcgZm9udC1ub3JtYWxcIj5TdGlsbCwgVG9tIGhhZCBldmVyeWRheSB3b3JyaWVzLiBIaXMgc21hcnRwaG9uZSB3YXMgb2xkLCB3aXRoIGEgbGFyZ2UgY3JhY2sgYWNyb3NzIHRoZSBzY3JlZW4uIFNvbWV0aW1lcywgaXQgdHVybmVkIG9mZiBieSBpdHNlbGYgd2l0aG91dCB3YXJuaW5nLiBUb20ga25ldyBoZSBuZWVkZWQgYSBuZXcgcGhvbmUsIGJ1dCBoZSBjb3VsZCBub3QgYWZmb3JkIG9uZSB5ZXQuPC9wPlxuXG48aDQgY2xhc3M9XCJ0ZXh0LWxnIHNtOnRleHQteGwgZm9udC1ib2xkIHRleHQtc2xhdGUtODAwIGRhcms6dGV4dC1zbGF0ZS0xMDAgbXQtNiBtYi0zIGZvbnQtWydPdXRmaXQnXVwiPkNoYXB0ZXIgSUk6IFRoZSBEaXNjb3ZlcnkgYnkgdGhlIFRyZWU8L2g0PlxuXG48cCBjbGFzcz1cIm1iLTYgbGVhZGluZy1yZWxheGVkIHRleHQtc2xhdGUtNzAwIGRhcms6dGV4dC1zbGF0ZS0zMDAgdGV4dC1iYXNlIHNtOnRleHQtbGcgZm9udC1ub3JtYWxcIj5PbmUgTW9uZGF5IG1vcm5pbmcsIFRvbSB3YWxrZWQgdG8gd29yayBhcyB1c3VhbC4gVGhlIHN1biB3YXMgYnJpZ2h0IGFuZCB0aGUgc2t5IHdhcyBibHVlLiBTdWRkZW5seSwgVG9tIHNhdyBzb21ldGhpbmcgb24gdGhlIGdyb3VuZC4gSGUgc3RvcHBlZC4gVGhlcmUgd2FzIGEgYmxhY2sgbGVhdGhlciB3YWxsZXQgcmVzdGluZyBuZWFyIHRoZSByb290cyBvZiBhIHRyZWUuPC9wPlxuXG48cCBjbGFzcz1cIm1iLTYgbGVhZGluZy1yZWxheGVkIHRleHQtc2xhdGUtNzAwIGRhcms6dGV4dC1zbGF0ZS0zMDAgdGV4dC1iYXNlIHNtOnRleHQtbGcgZm9udC1ub3JtYWxcIj5Ub20gbG9va2VkIGFyb3VuZC4gVGhlcmUgd2FzIG5vYm9keSBuZWFyIGhpbS4gSGUgYmVudCBkb3duIGFuZCBwaWNrZWQgaXQgdXAgY2FyZWZ1bGx5LiBJbnNpZGUsIHRoZXJlIHdhcyBhIHN1YnN0YW50aWFsIHN1bSBvZiBtb25leSwgYSBiYW5rIGNhcmQsIGFuIElEIGNhcmQsIGFuZCBhIHNtYWxsIGZhbWlseSBwaG90b2dyYXBoLiBUb20gdG9vayB0aGUgcGhvdG9ncmFwaCBvdXQuIEFuIG9sZGVyIG1hbiwgYSB3b21hbiwgYW5kIGEgbGl0dGxlIGdpcmwgc3Rvb2QgdG9nZXRoZXIsIHNtaWxpbmcgd2FybWx5IGF0IHRoZSBjYW1lcmEuPC9wPlxuXG48cCBjbGFzcz1cIm1iLTYgbGVhZGluZy1yZWxheGVkIHRleHQtc2xhdGUtNzAwIGRhcms6dGV4dC1zbGF0ZS0zMDAgdGV4dC1iYXNlIHNtOnRleHQtbGcgZm9udC1ub3JtYWxcIj48ZW0+XCJUaGlzIG11c3QgYmUgdmVyeSBpbXBvcnRhbnQgdG8gc29tZW9uZSxcIjwvZW0+IFRvbSBzYWlkIHNvZnRseS48L3A+XG5cbjxwIGNsYXNzPVwibWItNiBsZWFkaW5nLXJlbGF4ZWQgdGV4dC1zbGF0ZS03MDAgZGFyazp0ZXh0LXNsYXRlLTMwMCB0ZXh0LWJhc2Ugc206dGV4dC1sZyBmb250LW5vcm1hbFwiPlRoZW4gVG9tIGxvb2tlZCBhdCB0aGUgbW9uZXkuIFRoZXJlIHdhcyBxdWl0ZSBhIGxvdCBvZiBpdC4gRm9yIGEgbW9tZW50LCBUb20gc3RhcnRlZCB0aGlua2luZyBhYm91dCBoaXMgb3duIHByb2JsZW1zLiBIaXMgcGhvbmUgd2FzIGJyb2tlbi4gSGlzIHNob2VzIHdlcmUgb2xkLiBIZSBoYWQgYW4gb3ZlcmR1ZSBlbGVjdHJpY2l0eSBiaWxsIHRvIHBheS4gVGhlIG1vbmV5IGNvdWxkIHNvbHZlIGFsbCBoaXMgaW1tZWRpYXRlIHRyb3VibGVzLiBOb2JvZHkgd2FzIHdhdGNoaW5nIGhpbS4gTm9ib2R5IGtuZXcgdGhhdCBoZSBoYWQgZm91bmQgaXQuPC9wPlxuXG48aDQgY2xhc3M9XCJ0ZXh0LWxnIHNtOnRleHQteGwgZm9udC1ib2xkIHRleHQtc2xhdGUtODAwIGRhcms6dGV4dC1zbGF0ZS0xMDAgbXQtNiBtYi0zIGZvbnQtWydPdXRmaXQnXVwiPkNoYXB0ZXIgSUlJOiBDaG9vc2luZyBXaGF0IGlzIFJpZ2h0PC9oND5cblxuPHAgY2xhc3M9XCJtYi02IGxlYWRpbmctcmVsYXhlZCB0ZXh0LXNsYXRlLTcwMCBkYXJrOnRleHQtc2xhdGUtMzAwIHRleHQtYmFzZSBzbTp0ZXh0LWxnIGZvbnQtbm9ybWFsXCI+Rm9yIGEgYnJpZWYgbW9tZW50LCBUb20gY29uc2lkZXJlZCBrZWVwaW5nIHRoZSB3YWxsZXQuIEJ1dCB0aGVuIGhlIGxvb2tlZCBhdCB0aGUgZmFtaWx5IHBob3RvZ3JhcGggYWdhaW4uIEhlIHRob3VnaHQgYWJvdXQgdGhlIG1hbiB3aG8gbG9zdCBpdC4gTWF5YmUgdGhlIG1hbiB3YXMgc2VhcmNoaW5nIGZyYW50aWNhbGx5IGZvciBpdC4gTWF5YmUgaGUgbmVlZGVkIHRoZSBtb25leSBmb3IgZm9vZC4gTWF5YmUgaGUgbmVlZGVkIGl0IGZvciBtZWRpY2FsIGNhcmUuPC9wPlxuXG48cCBjbGFzcz1cIm1iLTYgbGVhZGluZy1yZWxheGVkIHRleHQtc2xhdGUtNzAwIGRhcms6dGV4dC1zbGF0ZS0zMDAgdGV4dC1iYXNlIHNtOnRleHQtbGcgZm9udC1ub3JtYWxcIj5Ub20gdG9vayBhIGRlZXAgYnJlYXRoLiA8ZW0+XCJObyxcIjwvZW0+IFRvbSBzYWlkIGZpcm1seS4gPGVtPlwiVGhpcyBpcyBub3QgbXkgbW9uZXkuIEkgbmVlZCB0byBmaW5kIHRoZSBvd25lci5cIjwvZW0+PC9wPlxuXG48cCBjbGFzcz1cIm1iLTYgbGVhZGluZy1yZWxheGVkIHRleHQtc2xhdGUtNzAwIGRhcms6dGV4dC1zbGF0ZS0zMDAgdGV4dC1iYXNlIHNtOnRleHQtbGcgZm9udC1ub3JtYWxcIj5IZSBleGFtaW5lZCB0aGUgSUQgY2FyZC4gVGhlIG93bmVyJ3MgbmFtZSB3YXMgPHN0cm9uZz5EYXZpZCBNaWxsZXI8L3N0cm9uZz4sIGFuZCB0aGUgYWRkcmVzcyB3YXMgaW4gYSBxdWlldCBuZWlnaGJvcmhvb2Qgbm90IGZhciBmcm9tIFRvbSdzIGhvbWUuIFRvbSBjaGVja2VkIGhpcyB3YXRjaC4gPGVtPlwiSSBoYXZlIHRvIGdvIHRvIHdvcmsgbm93LiBJIHdpbGwgZmluZCBEYXZpZCBhZnRlciB3b3JrLlwiPC9lbT48L3A+XG5cbjxwIGNsYXNzPVwibWItNiBsZWFkaW5nLXJlbGF4ZWQgdGV4dC1zbGF0ZS03MDAgZGFyazp0ZXh0LXNsYXRlLTMwMCB0ZXh0LWJhc2Ugc206dGV4dC1sZyBmb250LW5vcm1hbFwiPldoZW4gVG9tIGFycml2ZWQgYXQgTW9ybmluZyBDb2ZmZWUsIGhpcyBtYW5hZ2VyLCBBbm5hLCB3YXMgb3BlbmluZyB0aGUgc2hvcC4gPGVtPlwiR29vZCBtb3JuaW5nLCBUb20uIFlvdSBsb29rIHNlcmlvdXMgdG9kYXkuIElzIGV2ZXJ5dGhpbmcgb2theT9cIjwvZW0+IFRvbSB0b2xkIGhlciBhYm91dCB0aGUgd2FsbGV0LiBBbm5hIHNtaWxlZCB3aXRoIGdlbnVpbmUgcmVzcGVjdDogPGVtPlwiVGhhdCBpcyBnb29kLCBUb20uIFlvdSBjYW4gcmV0dXJuIGl0IGFmdGVyIHlvdXIgc2hpZnQuIFRoYXQgaXMgdGhlIHJpZ2h0IHRoaW5nIHRvIGRvLlwiPC9lbT48L3A+XG5cbjxwIGNsYXNzPVwibWItNiBsZWFkaW5nLXJlbGF4ZWQgdGV4dC1zbGF0ZS03MDAgZGFyazp0ZXh0LXNsYXRlLTMwMCB0ZXh0LWJhc2Ugc206dGV4dC1sZyBmb250LW5vcm1hbFwiPlRocm91Z2hvdXQgdGhlIGJ1c3kgZGF5LCBUb20gbWFkZSBjb2ZmZWUsIHNlcnZlZCBmb29kLCBhbmQgY2xlYW5lZCB0YWJsZXMsIGJ1dCBpbiBxdWlldCBtb21lbnRzLCBoaXMgdGhvdWdodHMga2VwdCByZXR1cm5pbmcgdG8gRGF2aWQgTWlsbGVyLjwvcD5cblxuPGg0IGNsYXNzPVwidGV4dC1sZyBzbTp0ZXh0LXhsIGZvbnQtYm9sZCB0ZXh0LXNsYXRlLTgwMCBkYXJrOnRleHQtc2xhdGUtMTAwIG10LTYgbWItMyBmb250LVsnT3V0Zml0J11cIj5DaGFwdGVyIElWOiBUaGUgUmVsaWV2ZWQgU3RyYW5nZXI8L2g0PlxuXG48cCBjbGFzcz1cIm1iLTYgbGVhZGluZy1yZWxheGVkIHRleHQtc2xhdGUtNzAwIGRhcms6dGV4dC1zbGF0ZS0zMDAgdGV4dC1iYXNlIHNtOnRleHQtbGcgZm9udC1ub3JtYWxcIj5BdCA2OjAwIFBNLCBUb20gZmluaXNoZWQgd29yaywgc2FpZCBnb29kYnllIHRvIEFubmEsIGFuZCBzZXQgb3V0LiBIZSBwYXNzZWQgdGhlIHRvd24gcGFyaywgY3Jvc3NlZCBhIHNtYWxsIGJyaWRnZSwgYW5kIHdhbGtlZCBkb3duIGEgcXVpZXQgcmVzaWRlbnRpYWwgbGFuZSB1bnRpbCBoZSByZWFjaGVkIGEgbmVhdCB3aGl0ZSBob3VzZSB3aXRoIGEgZnJvbnQgZ2FyZGVuLjwvcD5cblxuPHAgY2xhc3M9XCJtYi02IGxlYWRpbmctcmVsYXhlZCB0ZXh0LXNsYXRlLTcwMCBkYXJrOnRleHQtc2xhdGUtMzAwIHRleHQtYmFzZSBzbTp0ZXh0LWxnIGZvbnQtbm9ybWFsXCI+QW4gb2xkZXIgZ2VudGxlbWFuIHdhcyBzdGFuZGluZyBvdXRzaWRlLCBwYWNpbmcgYmFjayBhbmQgZm9ydGggYW54aW91c2x5LiBUaGUgbWFuIHJlcGVhdGVkbHkgY2hlY2tlZCBoaXMgZW1wdHkgcG9ja2V0cywgbG9va2luZyBkb3duIHRoZSByb2FkIHdpdGggdmlzaWJsZSB3b3JyeS4gVG9tIHdhbGtlZCB0b3dhcmQgaGltIGdlbnRseS48L3A+XG5cbjxwIGNsYXNzPVwibWItNiBsZWFkaW5nLXJlbGF4ZWQgdGV4dC1zbGF0ZS03MDAgZGFyazp0ZXh0LXNsYXRlLTMwMCB0ZXh0LWJhc2Ugc206dGV4dC1sZyBmb250LW5vcm1hbFwiPjxlbT5cIkV4Y3VzZSBtZSwgc2lyLFwiPC9lbT4gVG9tIHNhaWQuIDxlbT5cIkFyZSB5b3UgRGF2aWQgTWlsbGVyP1wiPC9lbT48L3A+XG5cbjxwIGNsYXNzPVwibWItNiBsZWFkaW5nLXJlbGF4ZWQgdGV4dC1zbGF0ZS03MDAgZGFyazp0ZXh0LXNsYXRlLTMwMCB0ZXh0LWJhc2Ugc206dGV4dC1sZyBmb250LW5vcm1hbFwiPlRoZSBtYW4ncyBleWVzIHdpZGVuZWQuIDxlbT5cIlllcyEgSSBhbSBEYXZpZC5cIjwvZW0+PC9wPlxuXG48cCBjbGFzcz1cIm1iLTYgbGVhZGluZy1yZWxheGVkIHRleHQtc2xhdGUtNzAwIGRhcms6dGV4dC1zbGF0ZS0zMDAgdGV4dC1iYXNlIHNtOnRleHQtbGcgZm9udC1ub3JtYWxcIj5Ub20gcHVsbGVkIHRoZSBibGFjayB3YWxsZXQgZnJvbSBoaXMgamFja2V0LiA8ZW0+XCJEaWQgeW91IGxvc2UgdGhpcz9cIjwvZW0+PC9wPlxuXG48cCBjbGFzcz1cIm1iLTYgbGVhZGluZy1yZWxheGVkIHRleHQtc2xhdGUtNzAwIGRhcms6dGV4dC1zbGF0ZS0zMDAgdGV4dC1iYXNlIHNtOnRleHQtbGcgZm9udC1ub3JtYWxcIj5EYXZpZCBmcm96ZSBpbiBzdHVubmVkIGRpc2JlbGllZiwgdGhlbiB0b29rIHRoZSB3YWxsZXQgaW50byBoaXMgdHJlbWJsaW5nIGhhbmRzLiBIZSBvcGVuZWQgaXQgaW1tZWRpYXRlbHk6IHRoZSBtb25leSB3YXMgdGhlcmUsIHRoZSBjYXJkcyB3ZXJlIHVudG91Y2hlZCwgYW5kIHRoZSBwaG90b2dyYXBoIG9mIGhpcyB3aWZlIGFuZCBkYXVnaHRlciB3YXMgc2FmZS4gSGUgbGV0IG91dCBhIGxvbmcsIHRyZW1ibGluZyBicmVhdGggb2YgcmVsaWVmLiA8ZW0+XCJFdmVyeXRoaW5nIGlzIGhlcmUhXCI8L2VtPjwvcD5cblxuPHAgY2xhc3M9XCJtYi02IGxlYWRpbmctcmVsYXhlZCB0ZXh0LXNsYXRlLTcwMCBkYXJrOnRleHQtc2xhdGUtMzAwIHRleHQtYmFzZSBzbTp0ZXh0LWxnIGZvbnQtbm9ybWFsXCI+VGhlbiBEYXZpZCBsb29rZWQgYXQgVG9tIHdpdGggdGVhcnMgd2VsbGluZyBpbiBoaXMgZXllcy4gPGVtPlwiWW91bmcgbWFuLi4uIHRoaXMgbW9uZXkgaXMgZm9yIG15IHdpZmUncyBtZWRpY2luZS4gU2hlIGlzIHZlcnkgaWxsIGFuZCBuZWVkcyBoZXIgcHJlc2NyaXB0aW9uIGV2ZXJ5IHNpbmdsZSBkYXkuIEkgd2FzIGRldmFzdGF0ZWQgYmVjYXVzZSB3aXRob3V0IHRoaXMgbW9uZXksIEkgY291bGQgbm90IGFmZm9yZCBoZXIgdHJlYXRtZW50LlwiPC9lbT48L3A+XG5cbjxwIGNsYXNzPVwibWItNiBsZWFkaW5nLXJlbGF4ZWQgdGV4dC1zbGF0ZS03MDAgZGFyazp0ZXh0LXNsYXRlLTMwMCB0ZXh0LWJhc2Ugc206dGV4dC1sZyBmb250LW5vcm1hbFwiPkRhdmlkIGltbWVkaWF0ZWx5IHRyaWVkIHRvIGhhbmQgVG9tIGEgZ2VuZXJvdXMgY2FzaCByZXdhcmQuIEJ1dCBUb20gc21pbGVkIGFuZCBnZW50bHkgc2hvb2sgaGlzIGhlYWQuIDxlbT5cIk5vLCB0aGFuayB5b3UsIHNpci4gSSBjYW5ub3QgdGFrZSB5b3VyIG1vbmV5LiBJdCBiZWxvbmdzIHRvIHlvdXIgd2lmZSdzIGhlYWx0aGNhcmUuIEkgZG9uJ3QgbmVlZCBtb25leSBmb3IgaGVscGluZyBzb21lb25lLlwiPC9lbT48L3A+XG5cbjxwIGNsYXNzPVwibWItNiBsZWFkaW5nLXJlbGF4ZWQgdGV4dC1zbGF0ZS03MDAgZGFyazp0ZXh0LXNsYXRlLTMwMCB0ZXh0LWJhc2Ugc206dGV4dC1sZyBmb250LW5vcm1hbFwiPkRhdmlkIGxvb2tlZCBhdCBUb20gd2l0aCBwcm9mb3VuZCBncmF0aXR1ZGUuIDxlbT5cIllvdSBhcmUgYSB0cnVseSBnb29kIHBlcnNvbiwgVG9tLlwiPC9lbT48L3A+XG5cbjxoNCBjbGFzcz1cInRleHQtbGcgc206dGV4dC14bCBmb250LWJvbGQgdGV4dC1zbGF0ZS04MDAgZGFyazp0ZXh0LXNsYXRlLTEwMCBtdC02IG1iLTMgZm9udC1bJ091dGZpdCddXCI+Q2hhcHRlciBWOiBBbiBVbmV4cGVjdGVkIEdpZnQ8L2g0PlxuXG48cCBjbGFzcz1cIm1iLTYgbGVhZGluZy1yZWxheGVkIHRleHQtc2xhdGUtNzAwIGRhcms6dGV4dC1zbGF0ZS0zMDAgdGV4dC1iYXNlIHNtOnRleHQtbGcgZm9udC1ub3JtYWxcIj5UaGUgbmV4dCBtb3JuaW5nIGF0IDc6MDAgQU0sIFRvbSBnb3QgZHJlc3NlZCBhbmQgd2Fsa2VkIHRvIHdvcmsgYXMgdXN1YWwuIEFzIGhlIGFwcHJvYWNoZWQgTW9ybmluZyBDb2ZmZWUsIGhlIHNhdyBzb21lb25lIHN0YW5kaW5nIG91dHNpZGUgYnkgdGhlIGVudHJhbmNlLiBJdCB3YXMgRGF2aWQsIGhvbGRpbmcgYSBzbWFsbCBib3ggd3JhcHBlZCBuZWF0bHkgd2l0aCBhIGJvdy48L3A+XG5cbjxwIGNsYXNzPVwibWItNiBsZWFkaW5nLXJlbGF4ZWQgdGV4dC1zbGF0ZS03MDAgZGFyazp0ZXh0LXNsYXRlLTMwMCB0ZXh0LWJhc2Ugc206dGV4dC1sZyBmb250LW5vcm1hbFwiPjxlbT5cIkdvb2QgbW9ybmluZywgVG9tLFwiPC9lbT4gRGF2aWQgc2FpZCB3YXJtbHkuIDxlbT5cIkkgYnJvdWdodCBzb21ldGhpbmcgZm9yIHlvdS4gT3BlbiBpdC5cIjwvZW0+PC9wPlxuXG48cCBjbGFzcz1cIm1iLTYgbGVhZGluZy1yZWxheGVkIHRleHQtc2xhdGUtNzAwIGRhcms6dGV4dC1zbGF0ZS0zMDAgdGV4dC1iYXNlIHNtOnRleHQtbGcgZm9udC1ub3JtYWxcIj5Ub20gb3BlbmVkIHRoZSBib3guIEluc2lkZSBsYXkgYSBicmFuZC1uZXcgc21hcnRwaG9uZS4gVG9tIGdhc3BlZC4gPGVtPlwiT2ggbm8sIERhdmlkISBJIGNhbm5vdCBhY2NlcHQgdGhpcy4gSXQgaXMgZmFyIHRvbyBleHBlbnNpdmUhXCI8L2VtPjwvcD5cblxuPHAgY2xhc3M9XCJtYi02IGxlYWRpbmctcmVsYXhlZCB0ZXh0LXNsYXRlLTcwMCBkYXJrOnRleHQtc2xhdGUtMzAwIHRleHQtYmFzZSBzbTp0ZXh0LWxnIGZvbnQtbm9ybWFsXCI+RGF2aWQgc2hvb2sgaGlzIGhlYWQgd2l0aCBhIGdlbnRsZSBzbWlsZS4gPGVtPlwiVGhpcyBpcyBub3QgYSBwYXltZW50LCBUb20uIEl0IGlzIGEgZ2lmdC4gV2hlbiBJIHJldHVybmVkIGhvbWUgYW5kIHRvbGQgbXkgd2lmZSBldmVyeXRoaW5nLCBzaGUgaW5zaXN0ZWQgb24gdGhhbmtpbmcgeW91IHByb3Blcmx5LiBQbGVhc2UsIHRha2UgaXQuXCI8L2VtPjwvcD5cblxuPHAgY2xhc3M9XCJtYi02IGxlYWRpbmctcmVsYXhlZCB0ZXh0LXNsYXRlLTcwMCBkYXJrOnRleHQtc2xhdGUtMzAwIHRleHQtYmFzZSBzbTp0ZXh0LWxnIGZvbnQtbm9ybWFsXCI+VG9tIGxvb2tlZCBkb3duIGF0IGhpcyBvd24gY3JhY2tlZCwgbWFsZnVuY3Rpb25pbmcgcGhvbmUsIHRoZW4gYXQgRGF2aWQncyBzaW5jZXJlIHNtaWxlLiBIZSBhY2NlcHRlZCB0aGUgZ2lmdCB3aXRoIGhlYXJ0ZmVsdCBncmF0aXR1ZGUuIEZyb20gdGhhdCBkYXkgb24sIFRvbSBhbmQgRGF2aWQgYmVjYW1lIGNsb3NlIGZyaWVuZHMsIHNoYXJpbmcgY29mZmVlIGFuZCBjb252ZXJzYXRpb25zIGFib3V0IGZhbWlseSwgZHJlYW1zLCBhbmQgbGlmZS48L3A+XG5cbjxociBjbGFzcz1cIm15LTEwIGJvcmRlci1zbGF0ZS0yMDAgZGFyazpib3JkZXItc2xhdGUtODAwXCIgLz5cblxuPGgyIGNsYXNzPVwidGV4dC0yeGwgc206dGV4dC0zeGwgZm9udC1ib2xkIHRleHQtc2xhdGUtOTAwIGRhcms6dGV4dC1zbGF0ZS0xMDAgbXQtMTIgbWItNSBmb250LVsnT3V0Zml0J11cIj4yLiBFc3NlbnRpYWwgVm9jYWJ1bGFyeSBpbiBDb250ZXh0PC9oMj5cblxuPHAgY2xhc3M9XCJtYi02IGxlYWRpbmctcmVsYXhlZCB0ZXh0LXNsYXRlLTcwMCBkYXJrOnRleHQtc2xhdGUtMzAwIHRleHQtYmFzZSBzbTp0ZXh0LWxnIGZvbnQtbm9ybWFsXCI+TWFzdGVyaW5nIGtleSB0ZXJtcyB1c2VkIGluIHRoaXMgc3Rvcnkgd2lsbCBleHBhbmQgeW91ciB2b2NhYnVsYXJ5IGZvciBkYWlseSBjb252ZXJzYXRpb24gYW5kIGFjYWRlbWljIHJlYWRpbmc6PC9wPlxuXG48b2wgY2xhc3M9XCJsaXN0LWRlY2ltYWwgcGwtNiBteS02IHRleHQtc2xhdGUtNzAwIGRhcms6dGV4dC1zbGF0ZS0zMDAgc3BhY2UteS00IHRleHQtYmFzZSBzbTp0ZXh0LWxnXCI+XG4gIDxsaSBjbGFzcz1cIm1iLTMuNSBwbC0xIGxlYWRpbmctcmVsYXhlZFwiPlxuICAgIDxkaXYgY2xhc3M9XCJ0ZXh0LXNsYXRlLTgwMCBkYXJrOnRleHQtc2xhdGUtMjAwIGZvbnQtbm9ybWFsXCI+XG4gICAgICA8c3Ryb25nPkludGVncml0eSAoPGNvZGUgY2xhc3M9XCJweC0xLjUgcHktMC41IHJvdW5kZWQgYmctc2xhdGUtMTAwIGRhcms6Ymctc2xhdGUtODAwIHRleHQtc2xhdGUtODAwIGRhcms6dGV4dC1zbGF0ZS0yMDAgdGV4dC14cyBmb250LW1vbm8gZm9udC1zZW1pYm9sZCBib3JkZXIgYm9yZGVyLXNsYXRlLTIwMCBkYXJrOmJvcmRlci1zbGF0ZS03MDBcIj4vyapuy4h0ZcmhLnLJmS50aS88L2NvZGU+KTwvc3Ryb25nPiAmbWRhc2g7IDxlbT5Ob3VuPC9lbT46IFRoZSBxdWFsaXR5IG9mIGJlaW5nIGhvbmVzdCBhbmQgaGF2aW5nIHN0cm9uZyBtb3JhbCBwcmluY2lwbGVzIHRoYXQgeW91IHJlZnVzZSB0byBjaGFuZ2UuXG4gICAgPC9kaXY+XG4gICAgPHVsIGNsYXNzPVwibGlzdC1kaXNjIHBsLTUgbXQtMiBtYi0xIHNwYWNlLXktMVwiPlxuICAgICAgPGxpIGNsYXNzPVwidGV4dC1zbGF0ZS02MDAgZGFyazp0ZXh0LXNsYXRlLTQwMCB0ZXh0LXNtIHNtOnRleHQtYmFzZSBsZWFkaW5nLXJlbGF4ZWRcIj48ZW0+RXR5bW9sb2d5PC9lbT46IEZyb20gTGF0aW4gPGVtPmludGVncml0YXM8L2VtPiAod2hvbGVuZXNzLCBjb21wbGV0ZW5lc3MsIHB1cml0eSkuPC9saT5cbiAgICAgIDxsaSBjbGFzcz1cInRleHQtc2xhdGUtNjAwIGRhcms6dGV4dC1zbGF0ZS00MDAgdGV4dC1zbSBzbTp0ZXh0LWJhc2UgbGVhZGluZy1yZWxheGVkXCI+PGVtPkNvbnRleHR1YWwgRXhhbXBsZTwvZW0+OiBcIlRvbSBkaXNwbGF5ZWQgZXhlbXBsYXJ5IDxzdHJvbmc+aW50ZWdyaXR5PC9zdHJvbmc+IGJ5IHJldHVybmluZyB0aGUgd2FsbGV0IHdpdGhvdXQgdGFraW5nIGEgc2luZ2xlIGRvbGxhci5cIjwvbGk+XG4gICAgPC91bD5cbiAgPC9saT5cbiAgPGxpIGNsYXNzPVwibWItMy41IHBsLTEgbGVhZGluZy1yZWxheGVkXCI+XG4gICAgPGRpdiBjbGFzcz1cInRleHQtc2xhdGUtODAwIGRhcms6dGV4dC1zbGF0ZS0yMDAgZm9udC1ub3JtYWxcIj5cbiAgICAgIDxzdHJvbmc+VGVtcHRhdGlvbiAoPGNvZGUgY2xhc3M9XCJweC0xLjUgcHktMC41IHJvdW5kZWQgYmctc2xhdGUtMTAwIGRhcms6Ymctc2xhdGUtODAwIHRleHQtc2xhdGUtODAwIGRhcms6dGV4dC1zbGF0ZS0yMDAgdGV4dC14cyBmb250LW1vbm8gZm9udC1zZW1pYm9sZCBib3JkZXIgYm9yZGVyLXNsYXRlLTIwMCBkYXJrOmJvcmRlci1zbGF0ZS03MDBcIj4vdGVtcMuIdGXJqi7Kg8mZbi88L2NvZGU+KTwvc3Ryb25nPiAmbWRhc2g7IDxlbT5Ob3VuPC9lbT46IEEgc3Ryb25nIHVyZ2Ugb3IgZGVzaXJlIHRvIGRvIHNvbWV0aGluZywgZXNwZWNpYWxseSBzb21ldGhpbmcgdW53aXNlIG9yIG1vcmFsbHkgcXVlc3Rpb25hYmxlLlxuICAgIDwvZGl2PlxuICAgIDx1bCBjbGFzcz1cImxpc3QtZGlzYyBwbC01IG10LTIgbWItMSBzcGFjZS15LTFcIj5cbiAgICAgIDxsaSBjbGFzcz1cInRleHQtc2xhdGUtNjAwIGRhcms6dGV4dC1zbGF0ZS00MDAgdGV4dC1zbSBzbTp0ZXh0LWJhc2UgbGVhZGluZy1yZWxheGVkXCI+PGVtPkV0eW1vbG9neTwvZW0+OiBGcm9tIExhdGluIDxlbT50ZW1wdGFyZTwvZW0+ICh0byBmZWVsLCB0cnksIG9yIHRlc3QpLjwvbGk+XG4gICAgICA8bGkgY2xhc3M9XCJ0ZXh0LXNsYXRlLTYwMCBkYXJrOnRleHQtc2xhdGUtNDAwIHRleHQtc20gc206dGV4dC1iYXNlIGxlYWRpbmctcmVsYXhlZFwiPjxlbT5Db250ZXh0dWFsIEV4YW1wbGU8L2VtPjogXCJEZXNwaXRlIGhpcyB1bnBhaWQgZWxlY3RyaWNpdHkgYmlsbCwgVG9tIG92ZXJjYW1lIHRoZSA8c3Ryb25nPnRlbXB0YXRpb248L3N0cm9uZz4gdG8ga2VlcCB0aGUgbW9uZXkuXCI8L2xpPlxuICAgIDwvdWw+XG4gIDwvbGk+XG4gIDxsaSBjbGFzcz1cIm1iLTMuNSBwbC0xIGxlYWRpbmctcmVsYXhlZFwiPlxuICAgIDxkaXYgY2xhc3M9XCJ0ZXh0LXNsYXRlLTgwMCBkYXJrOnRleHQtc2xhdGUtMjAwIGZvbnQtbm9ybWFsXCI+XG4gICAgICA8c3Ryb25nPlJlbGllZiAoPGNvZGUgY2xhc3M9XCJweC0xLjUgcHktMC41IHJvdW5kZWQgYmctc2xhdGUtMTAwIGRhcms6Ymctc2xhdGUtODAwIHRleHQtc2xhdGUtODAwIGRhcms6dGV4dC1zbGF0ZS0yMDAgdGV4dC14cyBmb250LW1vbm8gZm9udC1zZW1pYm9sZCBib3JkZXIgYm9yZGVyLXNsYXRlLTIwMCBkYXJrOmJvcmRlci1zbGF0ZS03MDBcIj4vcsmqy4hsacuQZi88L2NvZGU+KTwvc3Ryb25nPiAmbWRhc2g7IDxlbT5Ob3VuPC9lbT46IEEgZmVlbGluZyBvZiByZWFzc3VyYW5jZSBhbmQgcmVsYXhhdGlvbiBmb2xsb3dpbmcgcmVsZWFzZSBmcm9tIGFueGlldHkgb3IgZGlzdHJlc3MuXG4gICAgPC9kaXY+XG4gICAgPHVsIGNsYXNzPVwibGlzdC1kaXNjIHBsLTUgbXQtMiBtYi0xIHNwYWNlLXktMVwiPlxuICAgICAgPGxpIGNsYXNzPVwidGV4dC1zbGF0ZS02MDAgZGFyazp0ZXh0LXNsYXRlLTQwMCB0ZXh0LXNtIHNtOnRleHQtYmFzZSBsZWFkaW5nLXJlbGF4ZWRcIj48ZW0+RXR5bW9sb2d5PC9lbT46IEZyb20gT2xkIEZyZW5jaCA8ZW0+cmVsaWVmPC9lbT4sIGZyb20gTGF0aW4gPGVtPnJlbGV2YXJlPC9lbT4gKHRvIHJhaXNlIHVwLCBsaWdodGVuIGEgYnVyZGVuKS48L2xpPlxuICAgICAgPGxpIGNsYXNzPVwidGV4dC1zbGF0ZS02MDAgZGFyazp0ZXh0LXNsYXRlLTQwMCB0ZXh0LXNtIHNtOnRleHQtYmFzZSBsZWFkaW5nLXJlbGF4ZWRcIj48ZW0+Q29udGV4dHVhbCBFeGFtcGxlPC9lbT46IFwiRGF2aWQgbGV0IG91dCBhIHByb2ZvdW5kIHNpZ2ggb2YgPHN0cm9uZz5yZWxpZWY8L3N0cm9uZz4gd2hlbiBoZSBjb25maXJtZWQgdGhlIG1lZGljaW5lIG1vbmV5IHdhcyBzYWZlLlwiPC9saT5cbiAgICA8L3VsPlxuICA8L2xpPlxuICA8bGkgY2xhc3M9XCJtYi0zLjUgcGwtMSBsZWFkaW5nLXJlbGF4ZWRcIj5cbiAgICA8ZGl2IGNsYXNzPVwidGV4dC1zbGF0ZS04MDAgZGFyazp0ZXh0LXNsYXRlLTIwMCBmb250LW5vcm1hbFwiPlxuICAgICAgPHN0cm9uZz5BZmZvcmQgKDxjb2RlIGNsYXNzPVwicHgtMS41IHB5LTAuNSByb3VuZGVkIGJnLXNsYXRlLTEwMCBkYXJrOmJnLXNsYXRlLTgwMCB0ZXh0LXNsYXRlLTgwMCBkYXJrOnRleHQtc2xhdGUtMjAwIHRleHQteHMgZm9udC1tb25vIGZvbnQtc2VtaWJvbGQgYm9yZGVyIGJvcmRlci1zbGF0ZS0yMDAgZGFyazpib3JkZXItc2xhdGUtNzAwXCI+L8mZy4hmyZTLkGQvPC9jb2RlPik8L3N0cm9uZz4gJm1kYXNoOyA8ZW0+VmVyYjwvZW0+OiBUbyBoYXZlIGVub3VnaCBtb25leSBvciByZXNvdXJjZXMgdG8gYmUgYWJsZSB0byBidXkgb3IgZG8gc29tZXRoaW5nLlxuICAgIDwvZGl2PlxuICAgIDx1bCBjbGFzcz1cImxpc3QtZGlzYyBwbC01IG10LTIgbWItMSBzcGFjZS15LTFcIj5cbiAgICAgIDxsaSBjbGFzcz1cInRleHQtc2xhdGUtNjAwIGRhcms6dGV4dC1zbGF0ZS00MDAgdGV4dC1zbSBzbTp0ZXh0LWJhc2UgbGVhZGluZy1yZWxheGVkXCI+PGVtPkV0eW1vbG9neTwvZW0+OiBNaWRkbGUgRW5nbGlzaCA8ZW0+YWZvcnRoaTwvZW0+ICh0byBwcm9tb3RlLCBjYXJyeSBvdXQsIHByb3ZpZGUpLjwvbGk+XG4gICAgICA8bGkgY2xhc3M9XCJ0ZXh0LXNsYXRlLTYwMCBkYXJrOnRleHQtc2xhdGUtNDAwIHRleHQtc20gc206dGV4dC1iYXNlIGxlYWRpbmctcmVsYXhlZFwiPjxlbT5Db250ZXh0dWFsIEV4YW1wbGU8L2VtPjogXCJUb20gd2FudGVkIGEgbmV3IHNtYXJ0cGhvbmUsIGJ1dCBoZSBjb3VsZCBub3QgPHN0cm9uZz5hZmZvcmQ8L3N0cm9uZz4gb25lIG9uIGhpcyBjdXJyZW50IGJhcmlzdGEgd2FnZXMuXCI8L2xpPlxuICAgIDwvdWw+XG4gIDwvbGk+XG48L29sPlxuXG48aDIgY2xhc3M9XCJ0ZXh0LTJ4bCBzbTp0ZXh0LTN4bCBmb250LWJvbGQgdGV4dC1zbGF0ZS05MDAgZGFyazp0ZXh0LXNsYXRlLTEwMCBtdC0xMiBtYi01IGZvbnQtWydPdXRmaXQnXVwiPjMuIFRoZW1hdGljIENvbnRyYXN0OiBTaG9ydC1UZXJtIEdhaW4gdnMuIExvbmctVGVybSBJbnRlZ3JpdHk8L2gyPlxuXG48ZGl2IGNsYXNzPVwib3ZlcmZsb3cteC1hdXRvIG15LTggcm91bmRlZC14bCBib3JkZXIgYm9yZGVyLXNsYXRlLTIwMC84MCBkYXJrOmJvcmRlci1zbGF0ZS04MDAgc2hhZG93LXhzIGJnLXdoaXRlIGRhcms6Ymctc2xhdGUtOTAwXCI+XG4gIDx0YWJsZSBjbGFzcz1cInctZnVsbCB0ZXh0LWxlZnQgYm9yZGVyLWNvbGxhcHNlXCI+XG4gICAgPHRoZWFkPlxuICAgICAgPHRyPlxuICAgICAgICA8dGggY2xhc3M9XCJweC00IHB5LTMgYmctc2xhdGUtMTAwLzgwIGRhcms6Ymctc2xhdGUtODAwIGZvbnQtYm9sZCB0ZXh0LXNsYXRlLTgwMCBkYXJrOnRleHQtc2xhdGUtMTAwIHRleHQteHMgc206dGV4dC1zbSBib3JkZXItYiBib3JkZXItc2xhdGUtMjAwIGRhcms6Ym9yZGVyLXNsYXRlLTcwMCB3aGl0ZXNwYWNlLW5vd3JhcFwiPkRpbWVuc2lvbjwvdGg+XG4gICAgICAgIDx0aCBjbGFzcz1cInB4LTQgcHktMyBiZy1zbGF0ZS0xMDAvODAgZGFyazpiZy1zbGF0ZS04MDAgZm9udC1ib2xkIHRleHQtc2xhdGUtODAwIGRhcms6dGV4dC1zbGF0ZS0xMDAgdGV4dC14cyBzbTp0ZXh0LXNtIGJvcmRlci1iIGJvcmRlci1zbGF0ZS0yMDAgZGFyazpib3JkZXItc2xhdGUtNzAwIHdoaXRlc3BhY2Utbm93cmFwXCI+SWYgVG9tIEtlcHQgdGhlIFdhbGxldCAoSW1tZWRpYXRlIFNlbGYtSW50ZXJlc3QpPC90aD5cbiAgICAgICAgPHRoIGNsYXNzPVwicHgtNCBweS0zIGJnLXNsYXRlLTEwMC84MCBkYXJrOmJnLXNsYXRlLTgwMCBmb250LWJvbGQgdGV4dC1zbGF0ZS04MDAgZGFyazp0ZXh0LXNsYXRlLTEwMCB0ZXh0LXhzIHNtOnRleHQtc20gYm9yZGVyLWIgYm9yZGVyLXNsYXRlLTIwMCBkYXJrOmJvcmRlci1zbGF0ZS03MDAgd2hpdGVzcGFjZS1ub3dyYXBcIj5Ub20gUmV0dXJuaW5nIHRoZSBXYWxsZXQgKE1vcmFsIEludGVncml0eSk8L3RoPlxuICAgICAgPC90cj5cbiAgICA8L3RoZWFkPlxuICAgIDx0Ym9keT5cbiAgICAgIDx0ciBjbGFzcz1cImhvdmVyOmJnLXNsYXRlLTUwLzgwIGRhcms6aG92ZXI6Ymctc2xhdGUtODAwLzUwIHRyYW5zaXRpb24tY29sb3JzXCI+XG4gICAgICAgIDx0ZCBjbGFzcz1cInB4LTQgcHktMyB0ZXh0LXhzIHNtOnRleHQtc20gdGV4dC1zbGF0ZS02MDAgZGFyazp0ZXh0LXNsYXRlLTMwMCBib3JkZXItYiBib3JkZXItc2xhdGUtMTAwIGRhcms6Ym9yZGVyLXNsYXRlLTgwMCBmb250LXNlbWlib2xkXCI+SW1tZWRpYXRlIE91dGNvbWU8L3RkPlxuICAgICAgICA8dGQgY2xhc3M9XCJweC00IHB5LTMgdGV4dC14cyBzbTp0ZXh0LXNtIHRleHQtc2xhdGUtNjAwIGRhcms6dGV4dC1zbGF0ZS0zMDAgYm9yZGVyLWIgYm9yZGVyLXNsYXRlLTEwMCBkYXJrOmJvcmRlci1zbGF0ZS04MDBcIj5RdWljayBjYXNoIHRvIHBheSBiaWxscyBhbmQgYnV5IHNob2VzLjwvdGQ+XG4gICAgICAgIDx0ZCBjbGFzcz1cInB4LTQgcHktMyB0ZXh0LXhzIHNtOnRleHQtc20gdGV4dC1zbGF0ZS02MDAgZGFyazp0ZXh0LXNsYXRlLTMwMCBib3JkZXItYiBib3JkZXItc2xhdGUtMTAwIGRhcms6Ym9yZGVyLXNsYXRlLTgwMFwiPlNhdmVkIGEgc2ljayB3b21hbidzIGxpZmUgYnkgcHJvdGVjdGluZyBoZXIgbWVkaWNpbmUgZnVuZHMuPC90ZD5cbiAgICAgIDwvdHI+XG4gICAgICA8dHIgY2xhc3M9XCJob3ZlcjpiZy1zbGF0ZS01MC84MCBkYXJrOmhvdmVyOmJnLXNsYXRlLTgwMC81MCB0cmFuc2l0aW9uLWNvbG9yc1wiPlxuICAgICAgICA8dGQgY2xhc3M9XCJweC00IHB5LTMgdGV4dC14cyBzbTp0ZXh0LXNtIHRleHQtc2xhdGUtNjAwIGRhcms6dGV4dC1zbGF0ZS0zMDAgYm9yZGVyLWIgYm9yZGVyLXNsYXRlLTEwMCBkYXJrOmJvcmRlci1zbGF0ZS04MDAgZm9udC1zZW1pYm9sZFwiPlBzeWNob2xvZ2ljYWwgU3RhdGU8L3RkPlxuICAgICAgICA8dGQgY2xhc3M9XCJweC00IHB5LTMgdGV4dC14cyBzbTp0ZXh0LXNtIHRleHQtc2xhdGUtNjAwIGRhcms6dGV4dC1zbGF0ZS0zMDAgYm9yZGVyLWIgYm9yZGVyLXNsYXRlLTEwMCBkYXJrOmJvcmRlci1zbGF0ZS04MDBcIj5MaW5nZXJpbmcgZ3VpbHQsIGFueGlldHkgb2YgYmVpbmcgY2F1Z2h0LCBlcm9zaW9uIG9mIHNlbGYtcmVzcGVjdC48L3RkPlxuICAgICAgICA8dGQgY2xhc3M9XCJweC00IHB5LTMgdGV4dC14cyBzbTp0ZXh0LXNtIHRleHQtc2xhdGUtNjAwIGRhcms6dGV4dC1zbGF0ZS0zMDAgYm9yZGVyLWIgYm9yZGVyLXNsYXRlLTEwMCBkYXJrOmJvcmRlci1zbGF0ZS04MDBcIj5QZWFjZSBvZiBtaW5kLCBjbGVhbiBjb25zY2llbmNlLCByZWluZm9yY2VkIHNlbGYtcmVzcGVjdC48L3RkPlxuICAgICAgPC90cj5cbiAgICAgIDx0ciBjbGFzcz1cImhvdmVyOmJnLXNsYXRlLTUwLzgwIGRhcms6aG92ZXI6Ymctc2xhdGUtODAwLzUwIHRyYW5zaXRpb24tY29sb3JzXCI+XG4gICAgICAgIDx0ZCBjbGFzcz1cInB4LTQgcHktMyB0ZXh0LXhzIHNtOnRleHQtc20gdGV4dC1zbGF0ZS02MDAgZGFyazp0ZXh0LXNsYXRlLTMwMCBib3JkZXItYiBib3JkZXItc2xhdGUtMTAwIGRhcms6Ym9yZGVyLXNsYXRlLTgwMCBmb250LXNlbWlib2xkXCI+TG9uZy1UZXJtIFJld2FyZDwvdGQ+XG4gICAgICAgIDx0ZCBjbGFzcz1cInB4LTQgcHktMyB0ZXh0LXhzIHNtOnRleHQtc20gdGV4dC1zbGF0ZS02MDAgZGFyazp0ZXh0LXNsYXRlLTMwMCBib3JkZXItYiBib3JkZXItc2xhdGUtMTAwIGRhcms6Ym9yZGVyLXNsYXRlLTgwMFwiPk5vbmU7IG1vbmV5IHNwZW50IHF1aWNrbHksIGxlYXZpbmcgbm8gbGFzdGluZyB2YWx1ZS48L3RkPlxuICAgICAgICA8dGQgY2xhc3M9XCJweC00IHB5LTMgdGV4dC14cyBzbTp0ZXh0LXNtIHRleHQtc2xhdGUtNjAwIGRhcms6dGV4dC1zbGF0ZS0zMDAgYm9yZGVyLWIgYm9yZGVyLXNsYXRlLTEwMCBkYXJrOmJvcmRlci1zbGF0ZS04MDBcIj5BIGJyYW5kLW5ldyBwaG9uZSBnaXZlbiBmcmVlbHksIHBsdXMgYSBsb3lhbCwgbGlmZWxvbmcgZnJpZW5kLjwvdGQ+XG4gICAgICA8L3RyPlxuICAgIDwvdGJvZHk+XG4gIDwvdGFibGU+XG48L2Rpdj5cblxuPGgyIGNsYXNzPVwidGV4dC0yeGwgc206dGV4dC0zeGwgZm9udC1ib2xkIHRleHQtc2xhdGUtOTAwIGRhcms6dGV4dC1zbGF0ZS0xMDAgbXQtMTIgbWItNSBmb250LVsnT3V0Zml0J11cIj40LiBSZWFkaW5nIENvbXByZWhlbnNpb24gJmFtcDsgU3R1ZHkgUXVlc3Rpb25zPC9oMj5cblxuPHAgY2xhc3M9XCJtYi02IGxlYWRpbmctcmVsYXhlZCB0ZXh0LXNsYXRlLTcwMCBkYXJrOnRleHQtc2xhdGUtMzAwIHRleHQtYmFzZSBzbTp0ZXh0LWxnIGZvbnQtbm9ybWFsXCI+VGVzdCB5b3VyIHVuZGVyc3RhbmRpbmcgb2YgdGhlIHN0b3J5IHdpdGggdGhlc2UgY29tcHJlaGVuc2lvbiBhbmQgZGlzY3Vzc2lvbiBxdWVzdGlvbnM6PC9wPlxuXG48aDMgY2xhc3M9XCJ0ZXh0LWxnIHNtOnRleHQteGwgZm9udC1ib2xkIHRleHQtc2xhdGUtOTAwIGRhcms6dGV4dC1zbGF0ZS0xMDAgbXQtNiBtYi0zIGZvbnQtWydPdXRmaXQnXVwiPlNlY3Rpb24gQTogTXVsdGlwbGUgQ2hvaWNlIFF1ZXN0aW9uczwvaDM+XG5cbjxvbCBjbGFzcz1cImxpc3QtZGVjaW1hbCBwbC02IG15LTYgdGV4dC1zbGF0ZS03MDAgZGFyazp0ZXh0LXNsYXRlLTMwMCBzcGFjZS15LTQgdGV4dC1iYXNlIHNtOnRleHQtbGdcIj5cbiAgPGxpIGNsYXNzPVwibWItMyBwbC0xIGxlYWRpbmctcmVsYXhlZFwiPlxuICAgIDxzdHJvbmc+V2hhdCB3YXMgd3Jvbmcgd2l0aCBUb20ncyBvbGQgc21hcnRwaG9uZT88L3N0cm9uZz48YnIgLz5cbiAgICA8c3BhbiBjbGFzcz1cImJsb2NrIHRleHQtc20gc206dGV4dC1iYXNlIHRleHQtc2xhdGUtNjAwIGRhcms6dGV4dC1zbGF0ZS00MDAgbXQtMVwiPlxuICAgICAgQSkgSXQgaGFkIHdhdGVyIGRhbWFnZTxiciAvPlxuICAgICAgQikgSXQgaGFkIGEgbGFyZ2UgY3JhY2sgYWNyb3NzIHRoZSBzY3JlZW4gYW5kIHNodXQgZG93biB1bmV4cGVjdGVkbHk8YnIgLz5cbiAgICAgIEMpIEl0IHdhcyBsb3N0IG9uIHRoZSBzdWJ3YXkgdHJhaW48YnIgLz5cbiAgICAgIEQpIFRoZSBiYXR0ZXJ5IHdvdWxkbid0IGNoYXJnZSBhdCBhbGxcbiAgICA8L3NwYW4+XG4gIDwvbGk+XG4gIDxsaSBjbGFzcz1cIm1iLTMgcGwtMSBsZWFkaW5nLXJlbGF4ZWRcIj5cbiAgICA8c3Ryb25nPldoYXQgbWFkZSBUb20gY2hhbmdlIGhpcyBtaW5kIGFib3V0IGtlZXBpbmcgdGhlIG1vbmV5Pzwvc3Ryb25nPjxiciAvPlxuICAgIDxzcGFuIGNsYXNzPVwiYmxvY2sgdGV4dC1zbSBzbTp0ZXh0LWJhc2UgdGV4dC1zbGF0ZS02MDAgZGFyazp0ZXh0LXNsYXRlLTQwMCBtdC0xXCI+XG4gICAgICBBKSBBIHBvbGljZSBvZmZpY2VyIHdhbGtlZCBwYXN0IGhpbTxiciAvPlxuICAgICAgQikgTG9va2luZyBhdCB0aGUgc21pbGluZyBmYW1pbHkgcGhvdG9ncmFwaCBhbmQgaW1hZ2luaW5nIHRoZSBvd25lcidzIGhhcmRzaGlwPGJyIC8+XG4gICAgICBDKSBIaXMgbWFuYWdlciBBbm5hIHdhcm5lZCBoaW0gbm90IHRvIGtlZXAgaXQ8YnIgLz5cbiAgICAgIEQpIEhlIHJlYWxpemVkIHRoZSBjYXNoIHdhcyBjb3VudGVyZmVpdFxuICAgIDwvc3Bhbj5cbiAgPC9saT5cbiAgPGxpIGNsYXNzPVwibWItMyBwbC0xIGxlYWRpbmctcmVsYXhlZFwiPlxuICAgIDxzdHJvbmc+V2h5IGRpZCBEYXZpZCBNaWxsZXIgbmVlZCB0aGUgbW9uZXkgdXJnZW50bHk/PC9zdHJvbmc+PGJyIC8+XG4gICAgPHNwYW4gY2xhc3M9XCJibG9jayB0ZXh0LXNtIHNtOnRleHQtYmFzZSB0ZXh0LXNsYXRlLTYwMCBkYXJrOnRleHQtc2xhdGUtNDAwIG10LTFcIj5cbiAgICAgIEEpIFRvIHBheSBmb3IgaGlzIGhvbWUgcmVwYWlyPGJyIC8+XG4gICAgICBCKSBUbyBidXkgdGlja2V0cyBmb3IgYSBmYW1pbHkgdmFjYXRpb248YnIgLz5cbiAgICAgIEMpIFRvIHB1cmNoYXNlIGVzc2VudGlhbCBkYWlseSBtZWRpY2luZSBmb3IgaGlzIHNpY2sgd2lmZTxiciAvPlxuICAgICAgRCkgVG8gaW52ZXN0IGluIGEgbmVpZ2hib3Job29kIGJ1c2luZXNzXG4gICAgPC9zcGFuPlxuICA8L2xpPlxuICA8bGkgY2xhc3M9XCJtYi0zIHBsLTEgbGVhZGluZy1yZWxheGVkXCI+XG4gICAgPHN0cm9uZz5Ib3cgZGlkIERhdmlkIHRoYW5rIFRvbSB0aGUgbmV4dCBtb3JuaW5nPzwvc3Ryb25nPjxiciAvPlxuICAgIDxzcGFuIGNsYXNzPVwiYmxvY2sgdGV4dC1zbSBzbTp0ZXh0LWJhc2UgdGV4dC1zbGF0ZS02MDAgZGFyazp0ZXh0LXNsYXRlLTQwMCBtdC0xXCI+XG4gICAgICBBKSBCeSBvZmZlcmluZyBoaW0gYW4gZW52ZWxvcGUgb2YgY2FzaDxiciAvPlxuICAgICAgQikgQnkgYnJpbmdpbmcgaGltIGEgYnJhbmQtbmV3IHNtYXJ0cGhvbmUgYXMgYSBzaW5jZXJlIGdpZnQ8YnIgLz5cbiAgICAgIEMpIEJ5IGJ1eWluZyBjb2ZmZWUgZm9yIGV2ZXJ5b25lIGluIHRvd248YnIgLz5cbiAgICAgIEQpIEJ5IG9mZmVyaW5nIGhpbSBhIG5ldyBqb2IgaW4gYW4gb2ZmaWNlXG4gICAgPC9zcGFuPlxuICA8L2xpPlxuPC9vbD5cblxuPGgzIGNsYXNzPVwidGV4dC1sZyBzbTp0ZXh0LXhsIGZvbnQtYm9sZCB0ZXh0LXNsYXRlLTkwMCBkYXJrOnRleHQtc2xhdGUtMTAwIG10LTYgbWItMyBmb250LVsnT3V0Zml0J11cIj5TZWN0aW9uIEI6IFJlZmxlY3Rpb24gJmFtcDsgRGlzY3Vzc2lvbiBQcm9tcHRzPC9oMz5cblxuPHVsIGNsYXNzPVwibGlzdC1kaXNjIHBsLTYgbXktNiB0ZXh0LXNsYXRlLTcwMCBkYXJrOnRleHQtc2xhdGUtMzAwIHNwYWNlLXktMyB0ZXh0LWJhc2Ugc206dGV4dC1sZ1wiPlxuICA8bGkgY2xhc3M9XCJsZWFkaW5nLXJlbGF4ZWRcIj48c3Ryb25nPlByb21wdCAxOjwvc3Ryb25nPiBXaHkgZG8geW91IHRoaW5rIERhdmlkIGFuZCBoaXMgd2lmZSBnYXZlIFRvbSBhIDxlbT5zbWFydHBob25lPC9lbT4gcmF0aGVyIHRoYW4gb2ZmZXJpbmcgY2FzaCBhIHNlY29uZCB0aW1lPzwvbGk+XG4gIDxsaSBjbGFzcz1cImxlYWRpbmctcmVsYXhlZFwiPjxzdHJvbmc+UHJvbXB0IDI6PC9zdHJvbmc+IEhhdmUgeW91IGV2ZXIgZXhwZXJpZW5jZWQgYSBtb21lbnQgd2hlcmUgZG9pbmcgdGhlIHJpZ2h0IHRoaW5nIHdhcyBkaWZmaWN1bHQ/IEhvdyBkaWQgeW91IGZlZWwgYWZ0ZXJ3YXJkPzwvbGk+XG4gIDxsaSBjbGFzcz1cImxlYWRpbmctcmVsYXhlZFwiPjxzdHJvbmc+UHJvbXB0IDM6PC9zdHJvbmc+IFNoYXJlIHlvdXIgdGhvdWdodHMgYW5kIHJlZmxlY3Rpb25zIGluIHRoZSBjb21tZW50cyBvbiBvdXIgWW91VHViZSB2aWRlbyE8L2xpPlxuPC91bD5cblxuPGRpdiBjbGFzcz1cIm15LTggcC02IGJnLXNsYXRlLTUwIGRhcms6Ymctc2xhdGUtODAwLzYwIHJvdW5kZWQtMnhsIGJvcmRlciBib3JkZXItc2xhdGUtMjAwIGRhcms6Ym9yZGVyLXNsYXRlLTcwMFwiPlxuICA8aDQgY2xhc3M9XCJ0ZXh0LWJhc2Ugc206dGV4dC1sZyBmb250LWJvbGQgdGV4dC1zbGF0ZS05MDAgZGFyazp0ZXh0LXNsYXRlLTEwMCBtYi0yIGZvbnQtWydPdXRmaXQnXVwiPkFuc3dlciBLZXk8L2g0PlxuICA8cCBjbGFzcz1cInRleHQtc20gdGV4dC1zbGF0ZS02MDAgZGFyazp0ZXh0LXNsYXRlLTMwMCBtYi0yXCI+PHN0cm9uZz4xLiBCPC9zdHJvbmc+ICZtZGFzaDsgSXQgaGFkIGEgbGFyZ2UgY3JhY2sgYWNyb3NzIHRoZSBzY3JlZW4gYW5kIHNodXQgZG93biB1bmV4cGVjdGVkbHkuPC9wPlxuICA8cCBjbGFzcz1cInRleHQtc20gdGV4dC1zbGF0ZS02MDAgZGFyazp0ZXh0LXNsYXRlLTMwMCBtYi0yXCI+PHN0cm9uZz4yLiBCPC9zdHJvbmc+ICZtZGFzaDsgTG9va2luZyBhdCB0aGUgc21pbGluZyBmYW1pbHkgcGhvdG9ncmFwaCBhbmQgaW1hZ2luaW5nIHRoZSBvd25lcidzIGhhcmRzaGlwLjwvcD5cbiAgPHAgY2xhc3M9XCJ0ZXh0LXNtIHRleHQtc2xhdGUtNjAwIGRhcms6dGV4dC1zbGF0ZS0zMDAgbWItMlwiPjxzdHJvbmc+My4gQzwvc3Ryb25nPiAmbWRhc2g7IFRvIHB1cmNoYXNlIGVzc2VudGlhbCBkYWlseSBtZWRpY2luZSBmb3IgaGlzIHNpY2sgd2lmZS48L3A+XG4gIDxwIGNsYXNzPVwidGV4dC1zbSB0ZXh0LXNsYXRlLTYwMCBkYXJrOnRleHQtc2xhdGUtMzAwIG0tMFwiPjxzdHJvbmc+NC4gQjwvc3Ryb25nPiAmbWRhc2g7IEJ5IGJyaW5naW5nIGhpbSBhIGJyYW5kLW5ldyBzbWFydHBob25lIGFzIGEgc2luY2VyZSBnaWZ0LjwvcD5cbjwvZGl2PlxuXG48aHIgY2xhc3M9XCJteS0xMCBib3JkZXItc2xhdGUtMjAwIGRhcms6Ym9yZGVyLXNsYXRlLTgwMFwiIC8+XG5cbjxkaXYgY2xhc3M9XCJwLTYgc206cC04IGJnLWdyYWRpZW50LXRvLWJyIGZyb20tcmVkLTUwIHRvLW9yYW5nZS01MCBkYXJrOmZyb20tc2xhdGUtOTAwIGRhcms6dG8tc2xhdGUtODAwIHJvdW5kZWQtM3hsIGJvcmRlciBib3JkZXItcmVkLTEwMCBkYXJrOmJvcmRlci1zbGF0ZS03MDAgZmxleCBmbGV4LWNvbCBzbTpmbGV4LXJvdyBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuIGdhcC02XCI+XG4gIDxkaXY+XG4gICAgPGgzIGNsYXNzPVwidGV4dC14bCBmb250LWJvbGQgdGV4dC1zbGF0ZS05MDAgZGFyazp0ZXh0LXNsYXRlLTEwMCBtYi0yIGZvbnQtWydPdXRmaXQnXVwiPkVuam95aW5nIHRoaXMgc3Rvcnk/PC9oMz5cbiAgICA8cCBjbGFzcz1cInRleHQtc20gdGV4dC1zbGF0ZS02MDAgZGFyazp0ZXh0LXNsYXRlLTMwMCBtLTBcIj5XYXRjaCBtb3JlIGluc3BpcmluZyBzdG9yaWVzLCBhdWRpb2Jvb2tzLCBhbmQgRW5nbGlzaCBsaXN0ZW5pbmcgcHJhY3RpY2Ugc2Vzc2lvbnMgb24gb3VyIFlvdVR1YmUgY2hhbm5lbC48L3A+XG4gIDwvZGl2PlxuICA8YSBocmVmPVwiaHR0cHM6Ly93d3cueW91dHViZS5jb20vd2F0Y2g/dj14aUVNVVliYXI1a1wiIHRhcmdldD1cIl9ibGFua1wiIHJlbD1cIm5vb3BlbmVyIG5vcmVmZXJyZXJcIiBjbGFzcz1cImlubGluZS1mbGV4IGl0ZW1zLWNlbnRlciBnYXAtMiBweC02IHB5LTMgcm91bmRlZC1mdWxsIGJnLXJlZC02MDAgaG92ZXI6YmctcmVkLTcwMCB0ZXh0LXdoaXRlIHRleHQtc20gZm9udC1zZW1pYm9sZCBzaGFkb3ctbWQgaG92ZXI6c2hhZG93LWxnIHRyYW5zaXRpb24tYWxsIHNocmluay0wXCI+XG4gICAgPHN2ZyBjbGFzcz1cInctNSBoLTUgZmlsbC1jdXJyZW50XCIgdmlld0JveD1cIjAgMCAyNCAyNFwiPjxwYXRoIGQ9XCJNMjMuNDk4IDYuMTg2YTMuMDE2IDMuMDE2IDAgMCAwLTIuMTIyLTIuMTM2QzE5LjUwNSAzLjU0NSAxMiAzLjU0NSAxMiAzLjU0NXMtNy41MDUgMC05LjM3Ny41MDVBMy4wMTcgMy4wMTcgMCAwIDAgLjUwMiA2LjE4NkMwIDguMDcgMCAxMiAwIDEyczAgMy45My41MDIgNS44MTRhMy4wMTYgMy4wMTYgMCAwIDAgMi4xMjIgMi4xMzZjMS44NzEuNTA1IDkuMzc2LjUwNSA5LjM3Ni41MDVzNy41MDUgMCA5LjM3Ny0uNTA1YTMuMDE1IDMuMDE1IDAgMCAwIDIuMTIyLTIuMTM2QzI0IDE1LjkzIDI0IDEyIDI0IDEyczAtMy45My0uNTAyLTUuODE0ek05LjU0NSAxNS41NjhWOC40MzJMMTUuODE4IDEybC02LjI3MyAzLjU2OHpcIi8+PC9zdmc+XG4gICAgPHNwYW4+V2F0Y2ggb24gWW91VHViZTwvc3Bhbj5cbiAgPC9hPlxuPC9kaXY+XG4iCn0=';

        return json_decode(base64_decode($embeddedB64), true) ?: [];
    }
}
