<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\Category;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

class HomeSectionsController extends Controller
{
    /**
     * Default configuration for homepage sections.
     */
    public static function getDefaultSections(): array
    {
        return [
            'hero' => [
                'enabled' => true,
                'badge' => 'Knowledge, Technology & Digital Discovery',
                'title' => 'Rafvex — Learn. Explore. Discover.',
                'subtitle' => 'Your place for useful knowledge and digital discovery. Explore technology, AI, how-to guides, useful apps and websites, English reading stories, tutorials, and informative articles — created to help you learn something new every day.',
                'lead_id' => null,
                'featured_ids' => [],
            ],
            'trending' => [
                'enabled' => true,
                'title' => 'Trending on Rafvex',
                'subtitle' => 'The most-read technology breakdowns and tutorials',
                'mode' => 'auto', // auto (views_count) or manual
                'article_ids' => [],
            ],
            'spotlight' => [
                'enabled' => true,
                'title' => 'Artificial Intelligence & Digital Tools',
                'subtitle' => 'Generative models, prompt engineering, and hands-on AI software testing',
                'category_id' => null, // null = auto detect AI or first tech category
                'category_slug' => 'ai-tools',
                'mode' => 'category', // category (auto pulls 1 main + 4 sub) or manual
                'main_id' => null,
                'sub_ids' => [],
            ],
            'troubleshooting' => [
                'enabled' => true,
                'title' => 'How-To Guides & Tech Troubleshooting',
                'subtitle' => 'Practical, step-by-step diagnostic solutions for everyday devices and software',
                'category_id' => null,
                'category_slug' => 'troubleshooting',
                'mode' => 'category',
                'article_ids' => [],
            ],
            'reading_stories' => [
                'enabled' => true,
                'title' => 'English Reading Stories & Daily Discovery',
                'subtitle' => 'Inspiring stories, curated essays, and rich language designed to empower your English learning journey.',
                'category_id' => null,
                'category_slug' => 'english-reading-stories',
                'mode' => 'category',
                'article_ids' => [],
            ],
            'directory' => [
                'enabled' => true,
                'title' => 'Explore All Publishing Departments',
                'subtitle' => 'Rafvex organizes knowledge across dedicated focus channels. Find exactly what you need with verified depth.',
            ],
            'latest' => [
                'enabled' => true,
                'title' => 'Latest Published Stories',
                'subtitle' => 'Fresh knowledge, breakdowns, and verified guides released by our editorial desk',
                'limit' => 10,
            ],
        ];
    }

    /**
     * Get active home sections settings.
     */
    public static function getActiveSections(): array
    {
        $defaults = self::getDefaultSections();

        try {
            if (Schema::hasTable('settings')) {
                $setting = Setting::where('key', 'home_sections')->value('value');
                if ($setting) {
                    $decoded = json_decode($setting, true);
                    if (is_array($decoded)) {
                        // Deep merge with defaults so new keys are never missing
                        foreach ($defaults as $secKey => $secVal) {
                            if (isset($decoded[$secKey]) && is_array($decoded[$secKey])) {
                                $defaults[$secKey] = array_merge($secVal, $decoded[$secKey]);
                            }
                        }
                        return $defaults;
                    }
                }
            }
        } catch (\Throwable $e) {}

        $fallbackFile = storage_path('app/home_sections.json');
        if (File::exists($fallbackFile)) {
            $fileData = json_decode(File::get($fallbackFile), true);
            if (is_array($fileData)) {
                foreach ($defaults as $secKey => $secVal) {
                    if (isset($fileData[$secKey]) && is_array($fileData[$secKey])) {
                        $defaults[$secKey] = array_merge($secVal, $fileData[$secKey]);
                    }
                }
            }
        }

        return $defaults;
    }

    /**
     * Display the Homepage Sections Manager in CMS.
     */
    public function index()
    {
        $sections = self::getActiveSections();

        // Fetch all parent and active categories
        $categories = collect();
        try {
            if (Schema::hasTable('categories')) {
                $categories = Category::whereNull('parent_id')
                    ->with('children')
                    ->orderBy('name')
                    ->get(['id', 'name', 'slug']);
            }
        } catch (\Throwable $e) {}

        // Gather referenced article IDs to hydrate previews
        $referencedIds = collect();
        if (!empty($sections['hero']['lead_id'])) $referencedIds->push($sections['hero']['lead_id']);
        if (!empty($sections['hero']['featured_ids'])) $referencedIds = $referencedIds->concat($sections['hero']['featured_ids']);
        if (!empty($sections['trending']['article_ids'])) $referencedIds = $referencedIds->concat($sections['trending']['article_ids']);
        if (!empty($sections['spotlight']['main_id'])) $referencedIds->push($sections['spotlight']['main_id']);
        if (!empty($sections['spotlight']['sub_ids'])) $referencedIds = $referencedIds->concat($sections['spotlight']['sub_ids']);
        if (!empty($sections['troubleshooting']['article_ids'])) $referencedIds = $referencedIds->concat($sections['troubleshooting']['article_ids']);
        if (!empty($sections['reading_stories']['article_ids'])) $referencedIds = $referencedIds->concat($sections['reading_stories']['article_ids']);

        $hydratedArticles = collect();
        try {
            if (Schema::hasTable('articles') && $referencedIds->isNotEmpty()) {
                $hydratedArticles = Article::with('category')
                    ->whereIn('id', $referencedIds->unique()->filter())
                    ->get(['id', 'title', 'slug', 'category_id', 'cover_image_url', 'published_at'])
                    ->keyBy('id');
            }
        } catch (\Throwable $e) {}

        // Recent articles for quick selecting
        $recentArticles = collect();
        try {
            if (Schema::hasTable('articles')) {
                $recentArticles = Article::with('category')
                    ->where('status', 'published')
                    ->orderBy('published_at', 'desc')
                    ->take(30)
                    ->get(['id', 'title', 'slug', 'category_id', 'cover_image_url', 'published_at']);
            }
        } catch (\Throwable $e) {}

        return Inertia::render('Admin/HomeSections/Index', [
            'sections' => $sections,
            'categories' => $categories,
            'hydratedArticles' => $hydratedArticles,
            'recentArticles' => $recentArticles,
        ]);
    }

    /**
     * AJAX search endpoint for articles.
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
                          ->orWhereHas('category', fn($cq) => $cq->where('name', 'like', "%{$q}%"));
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
     * Save homepage section settings.
     */
    public function update(Request $request)
    {
        $sectionsInput = $request->input('sections', []);
        $defaults = self::getDefaultSections();

        // Merge input with defaults
        foreach ($defaults as $k => $v) {
            if (isset($sectionsInput[$k]) && is_array($sectionsInput[$k])) {
                $defaults[$k] = array_merge($v, $sectionsInput[$k]);
            }
        }

        // Save in Setting model
        try {
            if (Schema::hasTable('settings')) {
                Setting::updateOrCreate(
                    ['key' => 'home_sections'],
                    [
                        'value' => json_encode($defaults),
                        'group' => 'homepage',
                        'type' => 'json',
                        'label' => 'Homepage Sections Configuration',
                    ]
                );

                // Also sync hero & trending to pinned_stories for backward compatibility
                $pinnedData = [
                    'lead_id' => $defaults['hero']['lead_id'] ?? null,
                    'featured_ids' => array_values(array_filter($defaults['hero']['featured_ids'] ?? [])),
                    'trending_ids' => array_values(array_filter($defaults['trending']['article_ids'] ?? [])),
                ];

                Setting::updateOrCreate(
                    ['key' => 'pinned_stories'],
                    [
                        'value' => json_encode($pinnedData),
                        'group' => 'general',
                        'type' => 'json',
                        'label' => 'Pinned Stories',
                    ]
                );
            }
        } catch (\Throwable $e) {}

        // Always save to fallback file
        try {
            $fallbackFile = storage_path('app/home_sections.json');
            File::put($fallbackFile, json_encode($defaults, JSON_PRETTY_PRINT));
        } catch (\Throwable $e) {}

        Cache::flush();

        return back()->with('success', 'Homepage sections updated successfully! All changes are now live on your site.');
    }
}
