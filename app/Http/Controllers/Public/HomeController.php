<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Admin\HomeAdController;
use App\Http\Controllers\Admin\HomeSectionsController;
use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\Category;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function index()
    {
        // 0. Load Home Sections CMS Configuration
        $homeSections = HomeSectionsController::getActiveSections();

        // 1. Resolve Hero Section (Lead Story + 2 Secondary Featured + 2 Sub-Featured)
        $heroConfig = $homeSections['hero'] ?? [];
        $heroMode = $heroConfig['mode'] ?? 'auto';

        $leadStory = null;
        $secondaryStories = collect();
        $subFeaturedStories = collect();
        $usedIds = collect();

        if ($heroMode === 'manual') {
            $leadId = ! empty($heroConfig['lead_id']) ? (int) $heroConfig['lead_id'] : null;
            if ($leadId) {
                $leadStory = Article::with(['category', 'author'])
                    ->where('id', $leadId)
                    ->where('status', 'published')
                    ->first();
                if ($leadStory) {
                    $usedIds->push($leadStory->id);
                }
            }

            $featuredIds = ! empty($heroConfig['featured_ids']) && is_array($heroConfig['featured_ids'])
                ? array_map('intval', array_slice($heroConfig['featured_ids'], 0, 2))
                : [];
            if (! empty($featuredIds)) {
                $fetched = Article::with(['category', 'author'])
                    ->whereIn('id', $featuredIds)
                    ->where('status', 'published')
                    ->get()
                    ->keyBy('id');
                foreach ($featuredIds as $fid) {
                    if (isset($fetched[$fid])) {
                        $secondaryStories->push($fetched[$fid]);
                        $usedIds->push($fid);
                    }
                }
            }

            $subIds = ! empty($heroConfig['sub_featured_ids']) && is_array($heroConfig['sub_featured_ids'])
                ? array_map('intval', array_slice($heroConfig['sub_featured_ids'], 0, 2))
                : [];
            if (! empty($subIds)) {
                $fetchedSubs = Article::with(['category', 'author'])
                    ->whereIn('id', $subIds)
                    ->where('status', 'published')
                    ->get()
                    ->keyBy('id');
                foreach ($subIds as $sId) {
                    if (isset($fetchedSubs[$sId])) {
                        $subFeaturedStories->push($fetchedSubs[$sId]);
                        $usedIds->push($sId);
                    }
                }
            }
        }

        // Auto-detect or fallbacks for unfilled hero slots (pulls newest published articles)
        if (! $leadStory) {
            $leadStory = Article::with(['category', 'author'])
                ->where('status', 'published')
                ->whereNotIn('id', $usedIds)
                ->orderByRaw('COALESCE(published_at, created_at) DESC')
                ->first();
            if ($leadStory) {
                $usedIds->push($leadStory->id);
            }
        }

        while ($secondaryStories->count() < 2) {
            $fallback = Article::with(['category', 'author'])
                ->where('status', 'published')
                ->whereNotIn('id', $usedIds)
                ->orderByRaw('COALESCE(published_at, created_at) DESC')
                ->first();
            if (! $fallback) {
                break;
            }
            $secondaryStories->push($fallback);
            $usedIds->push($fallback->id);
        }

        while ($subFeaturedStories->count() < 2) {
            $fallback = Article::with(['category', 'author'])
                ->where('status', 'published')
                ->whereNotIn('id', $usedIds)
                ->orderByRaw('COALESCE(published_at, created_at) DESC')
                ->first();
            if (! $fallback) {
                break;
            }
            $subFeaturedStories->push($fallback);
            $usedIds->push($fallback->id);
        }

        // 2. Resolve 4 Trending Stories (Auto by views or Manual Pin)
        $trendingConfig = $homeSections['trending'] ?? [];
        $trendingMode = $trendingConfig['mode'] ?? 'auto';
        $trendingStories = collect();

        if ($trendingMode === 'manual' && ! empty($trendingConfig['article_ids'])) {
            $trendingIds = array_map('intval', array_slice($trendingConfig['article_ids'], 0, 4));
            $fetchedTrending = Article::with(['category', 'author'])
                ->whereIn('id', $trendingIds)
                ->where('status', 'published')
                ->get()
                ->keyBy('id');
            foreach ($trendingIds as $tid) {
                if (isset($fetchedTrending[$tid])) {
                    $trendingStories->push($fetchedTrending[$tid]);
                }
            }
        }

        while ($trendingStories->count() < 4) {
            $fallbackTrending = Article::with(['category', 'author'])
                ->where('status', 'published')
                ->whereNotIn('id', $trendingStories->pluck('id'))
                ->orderBy('views_count', 'desc')
                ->orderByRaw('COALESCE(published_at, created_at) DESC')
                ->first();
            if (! $fallbackTrending) {
                break;
            }
            $trendingStories->push($fallbackTrending);
        }

        $allExclude = $usedIds->concat($trendingStories->pluck('id'))->unique();

        // 5. Latest Articles for Category Showcases and Chronological Stream
        $latest = Article::with(['category', 'author'])
            ->where('status', 'published')
            ->whereNotIn('id', $allExclude)
            ->orderByRaw('COALESCE(published_at, created_at) DESC')
            ->take(30)
            ->get();

        if ($latest->count() < 10) {
            $latest = Article::with(['category', 'author'])
                ->where('status', 'published')
                ->where('id', '!=', $leadStory?->id)
                ->orderByRaw('COALESCE(published_at, created_at) DESC')
                ->take(30)
                ->get();
        }

        // 5b. Dedicated Chronological Stream for "Latest Published Stories" (true last 10 published posts)
        $latestLimit = (int) ($homeSections['latest']['limit'] ?? 10);
        if ($latestLimit <= 0) {
            $latestLimit = 10;
        }

        $latestStories = Article::with(['category', 'author'])
            ->where('status', 'published')
            ->orderByRaw('COALESCE(published_at, created_at) DESC')
            ->take($latestLimit)
            ->get();

        // 6. Dedicated 4 English Reading Stories (guaranteed 4 latest blogs, customizable via CMS)
        $readingConfig = $homeSections['reading_stories'] ?? [];
        $readingSlug = $readingConfig['category_slug'] ?? 'english-reading-stories';
        $storyStories = collect();

        if (($readingConfig['mode'] ?? 'category') === 'manual' && ! empty($readingConfig['article_ids'])) {
            $fetchedReading = Article::with(['category', 'author'])
                ->whereIn('id', $readingConfig['article_ids'])
                ->where('status', 'published')
                ->get()
                ->keyBy('id');
            foreach ($readingConfig['article_ids'] as $rId) {
                if (isset($fetchedReading[$rId])) {
                    $storyStories->push($fetchedReading[$rId]);
                }
            }
        }

        if ($storyStories->count() < 4) {
            $catStories = Article::with(['category', 'author'])
                ->where('status', 'published')
                ->where(function ($q) use ($readingSlug) {
                    $q->whereHas('category', function ($cq) use ($readingSlug) {
                        $cq->where('slug', $readingSlug)
                            ->orWhere('slug', 'like', "%{$readingSlug}%")
                            ->orWhere('slug', 'like', '%story%')
                            ->orWhere('slug', 'like', '%stories%')
                            ->orWhere('slug', 'like', '%english%');
                    })->orWhere('title', 'like', "%{$readingSlug}%")
                        ->orWhere('title', 'like', '%story%')
                        ->orWhere('title', 'like', '%english%')
                        ->orWhere('title', 'like', '%reading%');
                })
                ->whereNotIn('id', $storyStories->pluck('id'))
                ->orderByRaw('COALESCE(published_at, created_at) DESC')
                ->take(4 - $storyStories->count())
                ->get();
            $storyStories = $storyStories->concat($catStories);
        }

        if ($storyStories->count() < 4) {
            $extraStories = Article::with(['category', 'author'])
                ->where('status', 'published')
                ->whereNotIn('id', $storyStories->pluck('id'))
                ->orderByRaw('COALESCE(published_at, created_at) DESC')
                ->take(4 - $storyStories->count())
                ->get();
            $storyStories = $storyStories->concat($extraStories);
        }

        // 7. Dedicated 4 Tech Troubleshooting & How-To Guides (guaranteed 4 latest blogs, customizable via CMS)
        $tbConfig = $homeSections['troubleshooting'] ?? [];
        $tbSlug = $tbConfig['category_slug'] ?? 'troubleshooting';
        $troubleshootingStories = collect();

        if (($tbConfig['mode'] ?? 'category') === 'manual' && ! empty($tbConfig['article_ids'])) {
            $fetchedTb = Article::with(['category', 'author'])
                ->whereIn('id', $tbConfig['article_ids'])
                ->where('status', 'published')
                ->get()
                ->keyBy('id');
            foreach ($tbConfig['article_ids'] as $tId) {
                if (isset($fetchedTb[$tId])) {
                    $troubleshootingStories->push($fetchedTb[$tId]);
                }
            }
        }

        if ($troubleshootingStories->count() < 4) {
            $catTb = Article::with(['category', 'author'])
                ->where('status', 'published')
                ->where(function ($q) use ($tbSlug) {
                    $q->whereHas('category', function ($cq) use ($tbSlug) {
                        $cq->where('slug', $tbSlug)
                            ->orWhere('slug', 'like', "%{$tbSlug}%")
                            ->orWhere('slug', 'like', '%troubleshoot%')
                            ->orWhere('slug', 'like', '%how-to%')
                            ->orWhere('slug', 'like', '%fix%')
                            ->orWhere('slug', 'like', '%guide%');
                    })->orWhere('title', 'like', "%{$tbSlug}%")
                        ->orWhere('title', 'like', '%troubleshoot%')
                        ->orWhere('title', 'like', '%how to%')
                        ->orWhere('title', 'like', '%how-to%')
                        ->orWhere('title', 'like', '%fix%')
                        ->orWhere('title', 'like', '%guide%')
                        ->orWhere('title', 'like', '%battery%')
                        ->orWhere('title', 'like', '%audio%')
                        ->orWhere('title', 'like', '%wifi%')
                        ->orWhere('title', 'like', '%settings%');
                })
                ->whereNotIn('id', $troubleshootingStories->pluck('id'))
                ->orderByRaw('COALESCE(published_at, created_at) DESC')
                ->take(4 - $troubleshootingStories->count())
                ->get();
            $troubleshootingStories = $troubleshootingStories->concat($catTb);
        }

        if ($troubleshootingStories->count() < 4) {
            $extraTb = Article::with(['category', 'author'])
                ->where('status', 'published')
                ->whereNotIn('id', $troubleshootingStories->pluck('id'))
                ->orderByRaw('COALESCE(published_at, created_at) DESC')
                ->take(4 - $troubleshootingStories->count())
                ->get();
            $troubleshootingStories = $troubleshootingStories->concat($extraTb);
        }

        // 8. Enriched Categories for Directory & Department Showcases
        $categories = Category::whereNull('parent_id')
            ->with([
                'children' => function ($q) {
                    $q->select(['id', 'parent_id', 'name', 'slug'])
                        ->withCount(['articles' => fn ($aq) => $aq->where('status', 'published')]);
                },
            ])
            ->withCount(['articles' => function ($query) {
                $query->where('status', 'published');
            }])
            ->orderBy('articles_count', 'desc')
            ->take(12)
            ->get();

        // 9. Resolve Category Spotlight Showcase (1 Main + 4 Sub-Articles = 5 articles total)
        $spotlightConfig = $homeSections['spotlight'] ?? [];
        $spotlightMain = null;
        $spotlightSubs = collect();

        if (($spotlightConfig['mode'] ?? 'category') === 'manual') {
            if (! empty($spotlightConfig['main_id'])) {
                $spotlightMain = Article::with(['category', 'author'])
                    ->where('id', $spotlightConfig['main_id'])
                    ->where('status', 'published')
                    ->first();
            }
            if (! empty($spotlightConfig['sub_ids']) && is_array($spotlightConfig['sub_ids'])) {
                $fetchedSubs = Article::with(['category', 'author'])
                    ->whereIn('id', $spotlightConfig['sub_ids'])
                    ->where('status', 'published')
                    ->get()
                    ->keyBy('id');
                foreach ($spotlightConfig['sub_ids'] as $sId) {
                    if (isset($fetchedSubs[$sId])) {
                        $spotlightSubs->push($fetchedSubs[$sId]);
                    }
                }
            }
        }

        // If category mode or fallbacks needed
        $catSlug = $spotlightConfig['category_slug'] ?? 'ai-tools';
        if (! $spotlightMain || $spotlightSubs->count() < 4) {
            $catArticles = Article::with(['category', 'author'])
                ->where('status', 'published')
                ->where(function ($q) use ($catSlug) {
                    $q->whereHas('category', function ($cq) use ($catSlug) {
                        $cq->where('slug', $catSlug)
                            ->orWhere('slug', 'like', "%{$catSlug}%");
                    })->orWhere('title', 'like', "%{$catSlug}%");
                })
                ->orderByRaw('COALESCE(published_at, created_at) DESC')
                ->take(10)
                ->get();

            // Tech fallback articles if category returns fewer than 5
            if ($catArticles->count() < 5) {
                $extraCat = Article::with(['category', 'author'])
                    ->where('status', 'published')
                    ->whereNotIn('id', $catArticles->pluck('id'))
                    ->orderByRaw('COALESCE(published_at, created_at) DESC')
                    ->take(5 - $catArticles->count())
                    ->get();
                $catArticles = $catArticles->concat($extraCat);
            }

            if (! $spotlightMain && $catArticles->isNotEmpty()) {
                $spotlightMain = $catArticles->first();
            }

            $remaining = $catArticles->where('id', '!=', $spotlightMain?->id)->values();
            foreach ($remaining as $rem) {
                if ($spotlightSubs->count() >= 4) {
                    break;
                }
                if (! $spotlightSubs->contains('id', $rem->id)) {
                    $spotlightSubs->push($rem);
                }
            }
        }

        // Guarantee exactly 4 sub-articles
        while ($spotlightSubs->count() < 4) {
            $filler = $latest->first(function ($art) use ($spotlightMain, $spotlightSubs) {
                return $art->id !== $spotlightMain?->id && ! $spotlightSubs->contains('id', $art->id);
            });
            if (! $filler) {
                break;
            }
            $spotlightSubs->push($filler);
        }

        // 10. Load Active Home Ads (Up to 4 responsive ads for sidebar widget)
        $allAds = HomeAdController::loadAllAds();
        $homeAds = collect($allAds)
            ->filter(fn ($ad) => ! empty($ad['is_active']))
            ->sortBy('order')
            ->values()
            ->take(4);

        // Featured list: [0] => leadStory, [1..2] => secondaryStories
        $featuredList = collect([$leadStory])->filter()->concat($secondaryStories)->values();

        return Inertia::render('Public/Home', [
            'featured' => $featuredList,
            'leadStory' => $leadStory,
            'secondaryStories' => $secondaryStories->values(),
            'subFeaturedStories' => $subFeaturedStories->values(),
            'trendingStories' => $trendingStories->values(),
            'storyStories' => $storyStories->values(),
            'troubleshootingStories' => $troubleshootingStories->values(),
            'latest' => $latest,
            'latestStories' => $latestStories->values(),
            'topCategories' => $categories,
            'homeSections' => $homeSections,
            'spotlightMain' => $spotlightMain,
            'spotlightSubs' => $spotlightSubs->values(),
            'homeAds' => $homeAds,
        ]);
    }
}
