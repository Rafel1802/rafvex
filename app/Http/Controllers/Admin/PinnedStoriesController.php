<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class PinnedStoriesController extends Controller
{
    /**
     * Display the Pinned Stories Manager in CMS
     */
    public function index()
    {
        $pinned = [
            'lead_id' => null,
            'featured_ids' => [],
            'trending_ids' => [],
        ];

        try {
            $pinnedRaw = Setting::where('key', 'pinned_stories')->value('value');
            if ($pinnedRaw) {
                $decoded = json_decode($pinnedRaw, true);
                if (is_array($decoded)) {
                    $pinned = array_merge($pinned, $decoded);
                }
            }
        } catch (\Throwable $e) {
            \Log::error('PinnedStoriesController index error: '.$e->getMessage());
        }

        // If pinned is empty, sync from HomeSections if available
        if (empty($pinned['lead_id']) && empty($pinned['featured_ids']) && empty($pinned['trending_ids'])) {
            try {
                $hs = HomeSectionsController::getActiveSections();
                if (! empty($hs['hero']['lead_id'])) {
                    $pinned['lead_id'] = (int) $hs['hero']['lead_id'];
                }
                if (! empty($hs['hero']['featured_ids']) && is_array($hs['hero']['featured_ids'])) {
                    $pinned['featured_ids'] = array_values(array_map('intval', array_filter($hs['hero']['featured_ids'])));
                }
                if (! empty($hs['trending']['article_ids']) && is_array($hs['trending']['article_ids'])) {
                    $pinned['trending_ids'] = array_values(array_map('intval', array_filter($hs['trending']['article_ids'])));
                }
            } catch (\Throwable $e) {
            }
        }

        $leadId = ! empty($pinned['lead_id']) ? (int) $pinned['lead_id'] : null;
        $leadArticle = null;
        if ($leadId) {
            try {
                $leadArticle = Article::with('category')->find($leadId);
            } catch (\Throwable $e) {
            }
        }

        $featuredIds = is_array($pinned['featured_ids'] ?? null)
            ? array_values(array_map('intval', array_filter($pinned['featured_ids'])))
            : [];
        $featuredArticles = [];
        if (! empty($featuredIds)) {
            try {
                $fetched = Article::with('category')->whereIn('id', $featuredIds)->get()->keyBy('id');
                foreach ($featuredIds as $fid) {
                    if (isset($fetched[$fid])) {
                        $featuredArticles[] = $fetched[$fid];
                    }
                }
            } catch (\Throwable $e) {
            }
        }

        $trendingIds = is_array($pinned['trending_ids'] ?? null)
            ? array_values(array_map('intval', array_filter($pinned['trending_ids'])))
            : [];
        $trendingArticles = [];
        if (! empty($trendingIds)) {
            try {
                $fetchedTrending = Article::with('category')->whereIn('id', $trendingIds)->get()->keyBy('id');
                foreach ($trendingIds as $tid) {
                    if (isset($fetchedTrending[$tid])) {
                        $trendingArticles[] = $fetchedTrending[$tid];
                    }
                }
            } catch (\Throwable $e) {
            }
        }

        // Recent published articles for quick picking
        $recentArticles = [];
        try {
            $recentArticles = Article::with('category')
                ->where('status', 'published')
                ->orderBy('published_at', 'desc')
                ->take(25)
                ->get(['id', 'title', 'slug', 'category_id', 'cover_image_url', 'published_at'])
                ->values()
                ->all();
        } catch (\Throwable $e) {
        }

        return Inertia::render('Admin/Pinned/Index', [
            'pinned' => [
                'lead_id' => $leadId,
                'featured_ids' => $featuredIds,
                'trending_ids' => $trendingIds,
            ],
            'leadArticle' => $leadArticle,
            'featuredArticles' => array_values($featuredArticles),
            'trendingArticles' => array_values($trendingArticles),
            'recentArticles' => array_values($recentArticles),
        ]);
    }

    /**
     * Search published articles via AJAX for instant slot assignment
     */
    public function search(Request $request)
    {
        $q = trim($request->input('q', ''));
        if (strlen($q) < 1) {
            return response()->json(['results' => []]);
        }

        try {
            $articles = Article::with('category')
                ->where('status', 'published')
                ->where(function ($query) use ($q) {
                    $query->where('title', 'like', "%{$q}%")
                        ->orWhere('slug', 'like', "%{$q}%")
                        ->orWhereHas('category', fn ($cq) => $cq->where('name', 'like', "%{$q}%"));
                })
                ->orderBy('published_at', 'desc')
                ->take(20)
                ->get(['id', 'title', 'slug', 'category_id', 'cover_image_url', 'published_at']);

            return response()->json(['results' => $articles]);
        } catch (\Throwable $e) {
            return response()->json(['results' => []]);
        }
    }

    /**
     * Save pinned stories
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'lead_id' => 'nullable|integer|exists:articles,id',
            'featured_ids' => 'nullable|array|max:2',
            'featured_ids.*' => 'integer|exists:articles,id',
            'trending_ids' => 'nullable|array|max:4',
            'trending_ids.*' => 'integer|exists:articles,id',
        ]);

        $leadId = $validated['lead_id'] ?? null;
        $featuredIds = array_values(array_map('intval', array_filter($validated['featured_ids'] ?? [])));
        $trendingIds = array_values(array_map('intval', array_filter($validated['trending_ids'] ?? [])));

        $data = [
            'lead_id' => $leadId,
            'featured_ids' => $featuredIds,
            'trending_ids' => $trendingIds,
        ];

        Setting::updateOrCreate(
            ['key' => 'pinned_stories'],
            [
                'value' => json_encode($data),
                'group' => 'general',
                'label' => 'Pinned Stories',
            ]
        );

        // Also sync to home_sections so homepage hero and trending update seamlessly
        try {
            $sections = HomeSectionsController::getActiveSections();
            $sections['hero']['lead_id'] = $leadId;
            $sections['hero']['featured_ids'] = $featuredIds;
            if (! empty($trendingIds)) {
                $sections['trending']['article_ids'] = $trendingIds;
                $sections['trending']['mode'] = 'manual';
            }
            Setting::updateOrCreate(
                ['key' => 'home_sections'],
                [
                    'value' => json_encode($sections),
                    'group' => 'general',
                    'label' => 'Homepage Sections Configuration',
                ]
            );
        } catch (\Throwable $e) {
        }

        Cache::flush();

        return back()->with('message', 'Homepage pinned stories updated successfully!');
    }
}
