<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\Category;
use App\Models\News;
use App\Models\Setting;
use Carbon\Carbon;
use Illuminate\Http\Response;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class SitemapController extends Controller
{
    /**
     * Editorial HTML Sitemap & Viral Discovery Hub (Inspired by CNN & Modern Tech Hubs)
     */
    public function html(): InertiaResponse
    {
        try {
            // 1. Fetch all top-level categories with subcategories
            $parentCategories = Category::whereNull('parent_id')
                ->with(['children' => fn($q) => $q->select(['id', 'parent_id', 'name', 'slug'])])
                ->get();

            // 2. Build structured category groups with their articles
            $categoriesData = $parentCategories->map(function ($cat) {
                $categoryIds = $cat->children->pluck('id')->push($cat->id);

                $articles = Article::whereIn('category_id', $categoryIds)
                    ->where('status', 'published')
                    ->where(fn($q) => $q->whereNull('noindex')->orWhere('noindex', false))
                    ->latest('published_at')
                    ->select(['id', 'category_id', 'title', 'slug', 'published_at', 'reading_time', 'views_count', 'cover_image_url'])
                    ->limit(12)
                    ->get();

                $totalCount = Article::whereIn('category_id', $categoryIds)
                    ->where('status', 'published')
                    ->where(fn($q) => $q->whereNull('noindex')->orWhere('noindex', false))
                    ->count();

                return [
                    'id' => $cat->id,
                    'name' => $cat->name,
                    'slug' => $cat->slug,
                    'description' => $cat->description,
                    'total_articles' => $totalCount,
                    'subcategories' => $cat->children->map(fn($c) => [
                        'id' => $c->id,
                        'name' => $c->name,
                        'slug' => $c->slug,
                    ]),
                    'articles' => $articles->map(fn($a) => [
                        'id' => $a->id,
                        'title' => $a->title,
                        'slug' => $a->slug,
                        'published_at' => $a->published_at ? Carbon::parse($a->published_at)->format('M d, Y') : null,
                        'reading_time' => $a->reading_time ?? 5,
                        'views_count' => $a->views_count ?? 0,
                        'cover_image_url' => $a->cover_image_url,
                    ]),
                ];
            });

            // 3. Trending / Viral Highlights (Most viewed & featured articles)
            $trendingArticles = Article::where('status', 'published')
                ->where(fn($q) => $q->whereNull('noindex')->orWhere('noindex', false))
                ->with(['category:id,name,slug'])
                ->orderByDesc('featured')
                ->orderByDesc('views_count')
                ->latest('published_at')
                ->take(4)
                ->get(['id', 'category_id', 'title', 'slug', 'excerpt', 'cover_image_url', 'reading_time', 'published_at', 'views_count'])
                ->map(fn($a) => [
                    'id' => $a->id,
                    'title' => $a->title,
                    'slug' => $a->slug,
                    'excerpt' => $a->excerpt,
                    'cover_image_url' => $a->cover_image_url,
                    'reading_time' => $a->reading_time ?? 5,
                    'published_at' => $a->published_at ? Carbon::parse($a->published_at)->format('M d, Y') : null,
                    'views_count' => $a->views_count ?? 0,
                    'category' => $a->category ? ['name' => $a->category->name, 'slug' => $a->category->slug] : null,
                ]);

            // 4. Random Article Slug for "🎲 Surprise Me / Random Guide" viral feature
            $randomArticleSlug = Article::where('status', 'published')
                ->where(fn($q) => $q->whereNull('noindex')->orWhere('noindex', false))
                ->inRandomOrder()
                ->value('slug');

            // 5. Stats for header
            $totalArticles = Article::where('status', 'published')
                ->where(fn($q) => $q->whereNull('noindex')->orWhere('noindex', false))
                ->count();
            $totalCategories = Category::count();
            $latestArticleDate = Article::where('status', 'published')
                ->latest('published_at')
                ->value('published_at');

            // 6. Institutional / Compliance Static Pages
            $staticPages = [
                ['name' => 'About Us & Editorial Charter', 'slug' => 'about', 'desc' => 'Our mission, peer-review editorial principles, and research methodology.'],
                ['name' => 'Institutional Contact & Inquiries', 'slug' => 'contact', 'desc' => 'Direct lines for academic collaboration, licensing, and editorial feedback.'],
                ['name' => 'Privacy Policy & Data Rights', 'slug' => 'privacy-policy', 'desc' => 'GDPR/CCPA compliance, telemetry policies, and cryptographic security standards.'],
                ['name' => 'Terms of Service', 'slug' => 'terms-of-service', 'desc' => 'Usage terms, open source attribution, and intellectual property.'],
            ];
        } catch (\Throwable $e) {
            $categoriesData = collect();
            $trendingArticles = collect();
            $randomArticleSlug = null;
            $totalArticles = 0;
            $totalCategories = 0;
            $latestArticleDate = null;
            $staticPages = [];
        }

        return Inertia::render('Public/Sitemap', [
            'categories' => $categoriesData,
            'trending_articles' => $trendingArticles,
            'random_slug' => $randomArticleSlug,
            'stats' => [
                'total_articles' => $totalArticles,
                'total_categories' => $totalCategories,
                'last_updated' => $latestArticleDate ? Carbon::parse($latestArticleDate)->format('M d, Y') : date('M d, Y'),
            ],
            'static_pages' => $staticPages,
        ]);
    }

    /**
     * XML Sitemap for Google Search Console (Standard sitemaps.org format)
     */
    public function index(): Response
    {
        $articles = Article::where('status', 'published')
            ->where(fn($q) => $q->whereNull('noindex')->orWhere('noindex', false))
            ->latest('published_at')
            ->get(['slug', 'updated_at', 'published_at']);

        $news = News::where('status', 'published')
            ->latest('published_at')
            ->get(['slug', 'updated_at', 'published_at']);

        $categories = Category::get(['slug', 'updated_at']);

        $staticPages = [
            ['loc' => rtrim(url('/'), '/') . '/', 'priority' => '1.0', 'changefreq' => 'daily', 'lastmod' => now()->toAtomString()],
            ['loc' => url('/sitemap'), 'priority' => '0.8', 'changefreq' => 'daily', 'lastmod' => now()->toAtomString()],
            ['loc' => url('/popular'), 'priority' => '0.9', 'changefreq' => 'daily', 'lastmod' => now()->toAtomString()],
            ['loc' => url('/news'), 'priority' => '0.9', 'changefreq' => 'hourly', 'lastmod' => now()->toAtomString()],
            ['loc' => url('/about'), 'priority' => '0.7', 'changefreq' => 'monthly', 'lastmod' => now()->subDays(7)->toAtomString()],
            ['loc' => url('/contact'), 'priority' => '0.7', 'changefreq' => 'monthly', 'lastmod' => now()->subDays(7)->toAtomString()],
            ['loc' => url('/privacy-policy'), 'priority' => '0.5', 'changefreq' => 'monthly', 'lastmod' => now()->subDays(30)->toAtomString()],
            ['loc' => url('/terms-of-service'), 'priority' => '0.5', 'changefreq' => 'monthly', 'lastmod' => now()->subDays(30)->toAtomString()],
        ];

        $xml = view('sitemap', compact('articles', 'categories', 'news', 'staticPages'))->render();
        return response($xml, 200, ['Content-Type' => 'application/xml; charset=utf-8']);
    }

    /**
     * Standard RSS 2.0 Feed for Search Engines, News Aggregators & AI Feed Ingestion
     */
    public function feed(): Response
    {
        $siteName = Setting::where('key', 'site_name')->value('value') ?? 'Rafvex';
        $siteTagline = Setting::where('key', 'site_tagline')->value('value') ?? 'Technology, AI, Guides & Knowledge';
        $siteDescription = Setting::where('key', 'site_description')->value('value') ?? 'Explore technology, AI, computing guides, and research on Rafvex.';
        $siteLogoUrl = 'https://rafvex.com/logo.png';

        $articles = Article::where('status', 'published')
            ->where(fn($q) => $q->whereNull('noindex')->orWhere('noindex', false))
            ->with(['category:id,name,slug', 'author:id,name'])
            ->latest('published_at')
            ->take(30)
            ->get();

        $xml = view('feed', compact('siteName', 'siteTagline', 'siteDescription', 'siteLogoUrl', 'articles'))->render();
        return response($xml, 200, ['Content-Type' => 'application/rss+xml; charset=utf-8']);
    }

    /**
     * Serves /llms.txt for AI Search Engines & LLM Citation Crawlers (GEO Standard)
     */
    public function llms(): Response
    {
        $filePath = public_path('llms.txt');
        if (file_exists($filePath)) {
            $content = file_get_contents($filePath);
        } else {
            $content = "# Rafvex\n\n> Technology, AI, Guides & Knowledge\n\nhttps://rafvex.com\n";
        }
        return response($content, 200, ['Content-Type' => 'text/plain; charset=utf-8']);
    }

    /**
     * Robots.txt Directives
     */
    public function robots(): Response
    {
        $content = implode("\n", [
            "# Standard Search Engine Crawlers (Google, Bing, Yahoo, DuckDuckGo)",
            "User-agent: *",
            "Allow: /",
            "Allow: /article/",
            "Allow: /category/",
            "Allow: /news/",
            "Allow: /popular",
            "Allow: /search",
            "Allow: /blog/",
            "Allow: /sitemap",
            "Allow: /feed",
            "Allow: /rss.xml",
            "Allow: /llms.txt",
            "Disallow: /ourcms/",
            "Disallow: /ourcms",
            "Disallow: /api/",
            "",
            "# Google Search & Favicon Crawlers",
            "User-agent: Googlebot",
            "Allow: /",
            "Allow: /favicon.ico",
            "Allow: /favicon*.png",
            "Allow: /apple-touch-icon.png",
            "Allow: /android-chrome*.png",
            "Allow: /site.webmanifest",
            "Allow: /storage/",
            "Allow: /sitemap",
            "Allow: /feed",
            "Allow: /llms.txt",
            "Disallow: /ourcms/",
            "Disallow: /api/",
            "",
            "# Google AdSense & Advertising Crawlers",
            "User-agent: Mediapartners-Google",
            "Allow: /",
            "",
            "User-agent: AdsBot-Google",
            "Allow: /",
            "",
            "User-agent: AdsBot-Google-Mobile",
            "Allow: /",
            "",
            "User-agent: Googlebot-Image",
            "Allow: /",
            "Allow: /favicon.ico",
            "Allow: /favicon*.png",
            "Allow: /apple-touch-icon.png",
            "Allow: /android-chrome*.png",
            "Allow: /site.webmanifest",
            "Allow: /storage/",
            "",
            "# AI Crawlers & Agents (GPTBot, Claude, Perplexity, Google-Extended, Cohere, Meta)",
            "User-agent: GPTBot",
            "Allow: /",
            "",
            "User-agent: ChatGPT-User",
            "Allow: /",
            "",
            "User-agent: Google-Extended",
            "Allow: /",
            "",
            "User-agent: ClaudeBot",
            "Allow: /",
            "",
            "User-agent: anthropic-ai",
            "Allow: /",
            "",
            "User-agent: PerplexityBot",
            "Allow: /",
            "",
            "User-agent: Applebot-Extended",
            "Allow: /",
            "",
            "User-agent: cohere-ai",
            "Allow: /",
            "",
            "User-agent: Meta-ExternalAgent",
            "Allow: /",
            "",
            "User-agent: CCBot",
            "Allow: /",
            "",
            "# Sitemaps & Feeds",
            "Sitemap: " . url("/sitemap.xml"),
            "Sitemap: " . url("/feed"),
        ]);
        return response($content, 200, ['Content-Type' => 'text/plain; charset=utf-8']);
    }
}
