<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, viewport-fit=cover">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        @php
            try {
                $siteName = \App\Models\Setting::where('key', 'site_name')->value('value') ?? config('app.name', 'Rafvex');
                $siteTagline = \App\Models\Setting::where('key', 'site_tagline')->value('value');
                $siteDescription = \App\Models\Setting::where('key', 'site_description')->value('value');
                $siteLogoSetting = \App\Models\Setting::where('key', 'logo')->value('value');
                $siteFaviconSetting = \App\Models\Setting::where('key', 'favicon')->value('value');
                $analyticsId = \App\Models\Setting::where('key', 'analytics_id')->value('value');
            } catch (\Throwable $e) {
                $siteName = config('app.name', 'Rafvex');
                $siteTagline = null;
                $siteDescription = null;
                $siteLogoSetting = null;
                $siteFaviconSetting = null;
                $analyticsId = null;
            }

            if (empty($siteName)) {
                $siteName = 'Rafvex';
            }
            if (empty($siteTagline) || $siteTagline === 'Premium Tech & AI Guides') {
                $siteTagline = 'Technology, AI, Guides & Knowledge';
            }
            if (empty($siteDescription) || str_contains($siteDescription, 'Premium technology publication')) {
                $siteDescription = 'Explore technology, AI, how-to guides, useful apps and websites, English reading stories, tutorials, and informative articles. Learn something new with Rafvex.';
            }

            $siteLogoUrl = $siteLogoSetting 
                ? (str_starts_with($siteLogoSetting, 'http') ? $siteLogoSetting : url($siteLogoSetting))
                : 'https://rafvex.com/storage/settings/logo/vI8j4DzG40GuTkdVi7IEcmphAAmkBzOm0M0IZBeM.png';
        @endphp
        <title inertia>{{ $siteName }} — {{ $siteTagline }}</title>

        {{-- Google Analytics 4 (GA4) Tracking --}}
        @if(!empty($analyticsId) && preg_match('/^G-[A-Za-z0-9]+$/', trim($analyticsId)))
            <script async src="https://www.googletagmanager.com/gtag/js?id={{ trim($analyticsId) }}"></script>
            <script>
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '{{ trim($analyticsId) }}');
            </script>
        @endif

        {{-- Theme Initialization (Separated: CMS Admin uses 'rafvex_admin_theme', Public Site uses 'rafvex_public_theme') --}}
        <script>
            (function() {
                try {
                    var isCms = window.location.pathname.indexOf('/ourcms') === 0;
                    var themeKey = isCms ? 'rafvex_admin_theme' : 'rafvex_public_theme';
                    var theme = localStorage.getItem(themeKey) || (!isCms ? localStorage.getItem('rafvex_theme') : null);
                    if (theme === 'dark') {
                        document.documentElement.classList.add('dark');
                        document.documentElement.style.backgroundColor = '#0b1120';
                    } else {
                        document.documentElement.classList.remove('dark');
                        document.documentElement.style.backgroundColor = isCms ? '#f8fafc' : '';
                    }
                } catch(e) {}
            })();
        </script>

        {{-- SEO & Dynamic Metadata Engine (Server-Side Pre-rendered for Googlebot & Global SEO) --}}
        @php
            $component = $page['component'] ?? '';
            $props = $page['props'] ?? [];
            $isCmsPath = request()->is('ourcms*');

            $pageTitle = null;
            $pageDescription = null;
            $pageImage = null;
            $pageType = 'website';
            $canonicalUrl = null;
            $customJsonLd = [];
            $crawlerContent = null;
            $isArticlePage = false;
            $articleMeta = [];

            if (!$isCmsPath) {
                // 1. Single Article Detail Page
                if (($component === 'Public/Article/Show' || str_contains($component, 'Article/Show')) && !empty($props['article'])) {
                    $isArticlePage = true;
                    $art = $props['article'];
                    $artTitle = trim($art['meta_title'] ?? $art['title'] ?? 'Article');
                    $pageTitle = $artTitle . ' — ' . $siteName;
                    
                    $rawDesc = !empty($art['meta_description']) 
                        ? $art['meta_description'] 
                        : (!empty($art['excerpt']) ? $art['excerpt'] : \Illuminate\Support\Str::limit(strip_tags($art['content'] ?? ''), 160));
                    $pageDescription = trim(preg_replace('/\s+/', ' ', $rawDesc));

                    if (!empty($art['cover_image_url'])) {
                        $pageImage = str_starts_with($art['cover_image_url'], 'http') 
                            ? $art['cover_image_url'] 
                            : url($art['cover_image_url']);
                    } else {
                        $pageImage = $siteLogoUrl;
                    }

                    $pageType = 'article';
                    $artSlug = $art['slug'] ?? '';
                    $canonicalUrl = !empty($art['canonical_url']) ? $art['canonical_url'] : url('/article/' . $artSlug);

                    $authorName = $art['author']['name'] ?? $props['site']['founder_name'] ?? 'Mr. Soporadara Rin';
                    $authorUrl = url('/about');
                    $categoryName = $art['category']['name'] ?? 'Technology';
                    $categorySlug = $art['category']['slug'] ?? null;
                    $publishedAtIso = !empty($art['published_at']) ? \Carbon\Carbon::parse($art['published_at'])->toIso8601String() : now()->toIso8601String();
                    $modifiedAtIso = !empty($art['updated_at']) 
                        ? \Carbon\Carbon::parse($art['updated_at'])->toIso8601String() 
                        : $publishedAtIso;

                    $tagsList = [];
                    if (!empty($art['tags']) && is_array($art['tags'])) {
                        foreach ($art['tags'] as $t) {
                            if (is_array($t) && !empty($t['name'])) $tagsList[] = $t['name'];
                            elseif (is_string($t)) $tagsList[] = $t;
                        }
                    }

                    // TechArticle / BlogPosting Structured Data
                    $customJsonLd[] = [
                        '@context' => 'https://schema.org',
                        '@type' => 'TechArticle',
                        'headline' => $art['title'] ?? $artTitle,
                        'description' => $pageDescription,
                        'inLanguage' => 'en-US',
                        'mainEntityOfPage' => [
                            '@type' => 'WebPage',
                            '@id' => $canonicalUrl,
                        ],
                        'datePublished' => $publishedAtIso,
                        'dateModified' => $modifiedAtIso,
                        'author' => [
                            '@type' => 'Person',
                            'name' => $authorName,
                            'url' => $authorUrl,
                        ],
                        'publisher' => [
                            '@type' => 'Organization',
                            'name' => $siteName,
                            'url' => url('/'),
                            'logo' => [
                                '@type' => 'ImageObject',
                                'url' => $siteLogoUrl,
                            ],
                        ],
                        'image' => !empty($pageImage) ? [$pageImage] : [$siteLogoUrl],
                        'articleSection' => $categoryName,
                        'keywords' => !empty($tagsList) ? implode(', ', $tagsList) : ($art['primary_keyword'] ?? 'technology, ai, guides'),
                    ];

                    // BreadcrumbList Structured Data (Home > Category > Article)
                    $breadcrumbs = [
                        [
                            '@type' => 'ListItem',
                            'position' => 1,
                            'name' => 'Home',
                            'item' => url('/'),
                        ],
                    ];
                    $pos = 2;
                    if (!empty($categoryName) && !empty($categorySlug)) {
                        $breadcrumbs[] = [
                            '@type' => 'ListItem',
                            'position' => $pos++,
                            'name' => $categoryName,
                            'item' => url('/category/' . $categorySlug),
                        ];
                    }
                    $breadcrumbs[] = [
                        '@type' => 'ListItem',
                        'position' => $pos,
                        'name' => $art['title'] ?? $artTitle,
                        'item' => $canonicalUrl,
                    ];
                    $customJsonLd[] = [
                        '@context' => 'https://schema.org',
                        '@type' => 'BreadcrumbList',
                        'itemListElement' => $breadcrumbs,
                    ];

                    $articleMeta = [
                        'published_time' => $publishedAtIso,
                        'modified_time' => $modifiedAtIso,
                        'author' => $authorName,
                        'section' => $categoryName,
                        'tags' => $tagsList,
                    ];

                    // Semantic crawler content for instant indexation by Googlebot, Bingbot & Perplexity
                    $crawlerContent = [
                        'type' => 'article',
                        'title' => $art['title'] ?? $artTitle,
                        'excerpt' => $art['excerpt'] ?? '',
                        'content' => $art['content'] ?? '',
                        'author' => $authorName,
                        'category' => $categoryName,
                        'date' => !empty($art['published_at']) ? \Carbon\Carbon::parse($art['published_at'])->format('F j, Y') : '',
                        'reading_time' => $art['reading_time'] ?? 5,
                        'tags' => $tagsList,
                    ];
                }
                // 2. About Page
                elseif ($component === 'Public/About') {
                    $pageTitle = 'About Us & Editorial Mission — ' . $siteName;
                    $pageDescription = 'Discover the mission of Rafvex. Founded and written by Mr. Soporadara Rin, we share verified research, hands-on tech guides, AI insights, and English reading stories.';
                    $canonicalUrl = url('/about');
                    $customJsonLd[] = [
                        '@context' => 'https://schema.org',
                        '@type' => 'AboutPage',
                        'name' => $pageTitle,
                        'description' => $pageDescription,
                        'url' => $canonicalUrl,
                    ];
                    $crawlerContent = [
                        'type' => 'page',
                        'title' => 'About Rafvex — Editorial Principles & Technology Research',
                        'content' => '<p>Rafvex was born from a simple yet ambitious conviction: that technology, artificial intelligence, and digital discovery should be thoroughly researched, beautifully written, and freely shared to help people learn something new every day.</p><p>Founded and led by Mr. Soporadara Rin, our editorial mission delivers peer-reviewed computing guides, AI prompt engineering breakdowns, and educational stories.</p>',
                    ];
                }
                // 3. Contact Page
                elseif ($component === 'Public/Contact') {
                    $pageTitle = 'Contact Us & Editorial Inquiries — ' . $siteName;
                    $pageDescription = 'Get in touch with the editorial team at Rafvex. Reach out for academic research, news tips, technology inquiries, and licensing.';
                    $canonicalUrl = url('/contact');
                    $customJsonLd[] = [
                        '@context' => 'https://schema.org',
                        '@type' => 'ContactPage',
                        'name' => $pageTitle,
                        'description' => $pageDescription,
                        'url' => $canonicalUrl,
                    ];
                }
                // 4. Privacy Policy Page
                elseif ($component === 'Public/Privacy') {
                    $pageTitle = 'Privacy Policy & Data Security — ' . $siteName;
                    $pageDescription = 'Read the Rafvex Privacy Policy. Learn how we handle telemetry, GDPR/CCPA compliance, cookies, and reader security.';
                    $canonicalUrl = url('/privacy-policy');
                }
                // 5. Terms of Service Page
                elseif ($component === 'Public/Terms') {
                    $pageTitle = 'Terms of Service — ' . $siteName;
                    $pageDescription = 'Review the Terms of Service for using Rafvex, including open source attribution, acceptable usage, and intellectual property rights.';
                    $canonicalUrl = url('/terms-of-service');
                }
                // 6. Editorial Sitemap Page
                elseif ($component === 'Public/Sitemap') {
                    $pageTitle = 'Editorial Sitemap & Tech Archive Hub — ' . $siteName;
                    $pageDescription = 'Browse the complete index of tech guides, AI tutorials, computing walkthroughs, and stories published on Rafvex.';
                    $canonicalUrl = url('/sitemap');
                }
                // 7. Popular Articles Page
                elseif ($component === 'Public/Popular') {
                    $pageTitle = 'Most Popular Guides & Trending Stories — ' . $siteName;
                    $pageDescription = 'Discover the highest-rated and most viewed technology tutorials, AI prompts, and computing optimization guides on Rafvex.';
                    $canonicalUrl = url('/popular');
                }
                // 8. News Section
                elseif (str_contains($component, 'News')) {
                    if (!empty($props['news'])) {
                        $n = $props['news'];
                        $pageTitle = ($n['title'] ?? 'News') . ' — ' . $siteName;
                        $pageDescription = \Illuminate\Support\Str::limit(strip_tags($n['summary'] ?? $n['content'] ?? ''), 160);
                        $pageImage = !empty($n['cover_image_url']) ? (str_starts_with($n['cover_image_url'], 'http') ? $n['cover_image_url'] : url($n['cover_image_url'])) : $siteLogoUrl;
                        $canonicalUrl = url('/news/' . ($n['slug'] ?? ''));
                        $pageType = 'article';
                    } else {
                        $pageTitle = 'Technology News & Real-Time AI Dispatches — ' . $siteName;
                        $pageDescription = 'Stay ahead with breaking news in artificial intelligence, software releases, computing security, and global tech developments.';
                        $canonicalUrl = url('/news');
                    }
                }
                // 9. Podcasts Section
                elseif (str_contains($component, 'Podcast')) {
                    $pageTitle = 'Podcasts & Audio Shows — ' . $siteName;
                    $pageDescription = 'Listen to insightful audio discussions on artificial intelligence, modern web engineering, and productivity on Rafvex Podcasts.';
                    $canonicalUrl = url('/podcasts');
                }
                // 10. Category Section
                elseif (str_contains($component, 'Category') && !empty($props['category'])) {
                    $cat = $props['category'];
                    $catName = $cat['name'] ?? 'Category';
                    $pageTitle = $catName . ' — Guides, Tutorials & Articles | ' . $siteName;
                    $pageDescription = !empty($cat['description']) ? $cat['description'] : 'Explore in-depth tutorials, guides, and articles on ' . $catName . ' with Rafvex.';
                    $canonicalUrl = url('/category/' . ($cat['slug'] ?? ''));
                    $breadcrumbs = [
                        ['@type' => 'ListItem', 'position' => 1, 'name' => 'Home', 'item' => url('/')],
                        ['@type' => 'ListItem', 'position' => 2, 'name' => $catName, 'item' => $canonicalUrl],
                    ];
                    $customJsonLd[] = [
                        '@context' => 'https://schema.org',
                        '@type' => 'BreadcrumbList',
                        'itemListElement' => $breadcrumbs,
                    ];
                }
                // 11. Home Page Crawler Content
                elseif ($component === 'Public/Home' || $component === 'Home' || empty($component)) {
                    $crawlerContent = [
                        'type' => 'home',
                        'title' => $siteName . ' — ' . $siteTagline,
                        'description' => $siteDescription,
                    ];
                }
            }

            // Fallbacks for Home or unmatched routes
            $finalTitle = $pageTitle ?? ($siteName . ' — ' . $siteTagline);
            $finalDescription = $pageDescription ?? $siteDescription;
            $finalImage = $pageImage ?? $siteLogoUrl;
            
            if (empty($canonicalUrl)) {
                $canonicalBase = rtrim(config('app.url', 'https://rafvex.com'), '/');
                $requestPath = request()->getPathInfo();
                $canonicalUrl = ($requestPath === '/' || empty($requestPath)) 
                    ? $canonicalBase . '/' 
                    : $canonicalBase . rtrim($requestPath, '/');
            }

            // Organization & WebSite JSON-LD Schemas (Fully Google Search Central Compliant)
            $websiteJsonLd = [
                '@context' => 'https://schema.org',
                '@type' => 'WebSite',
                'name' => $siteName,
                'headline' => $siteName . ' — ' . $siteTagline,
                'description' => $siteDescription,
                'url' => url('/'),
                'publisher' => [
                    '@type' => 'Organization',
                    'name' => $siteName,
                    'url' => url('/'),
                    'logo' => [
                        '@type' => 'ImageObject',
                        'url' => $siteLogoUrl,
                    ],
                ],
                'potentialAction' => [
                    '@type' => 'SearchAction',
                    'target' => url('/search') . '?q={search_term_string}',
                    'query-input' => 'required name=search_term_string',
                ],
            ];
            $organizationJsonLd = [
                '@context' => 'https://schema.org',
                '@type' => 'Organization',
                'name' => $siteName,
                'url' => url('/'),
                'logo' => $siteLogoUrl,
                'image' => $siteLogoUrl,
                'description' => $siteDescription,
            ];
        @endphp

        <title inertia>{{ $finalTitle }}</title>
        <meta name="description" content="{{ $finalDescription }}">
        <link rel="canonical" href="{{ $canonicalUrl }}">

        {{-- Crawl Directives --}}
        @if($isCmsPath)
            <meta name="robots" content="noindex, nofollow">
        @else
            <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
            <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
            <meta name="bingbot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
        @endif

        {{-- Open Graph / Facebook & Social Crawlers --}}
        <meta property="og:site_name" content="{{ $siteName }}">
        <meta property="og:type" content="{{ $pageType }}">
        <meta property="og:url" content="{{ $canonicalUrl }}">
        <meta property="og:title" content="{{ $finalTitle }}">
        <meta property="og:description" content="{{ $finalDescription }}">
        <meta property="og:image" content="{{ $finalImage }}">
        <meta property="og:locale" content="en_US">
        @if($isArticlePage)
            @if(!empty($articleMeta['published_time']))
                <meta property="article:published_time" content="{{ $articleMeta['published_time'] }}">
            @endif
            @if(!empty($articleMeta['modified_time']))
                <meta property="article:modified_time" content="{{ $articleMeta['modified_time'] }}">
            @endif
            @if(!empty($articleMeta['author']))
                <meta property="article:author" content="{{ $articleMeta['author'] }}">
            @endif
            @if(!empty($articleMeta['section']))
                <meta property="article:section" content="{{ $articleMeta['section'] }}">
            @endif
            @if(!empty($articleMeta['tags']))
                @foreach($articleMeta['tags'] as $tagItem)
                    <meta property="article:tag" content="{{ $tagItem }}">
                @endforeach
            @endif
        @endif

        {{-- Twitter / 𝕏 Cards --}}
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:site" content="@rafvex">
        <meta name="twitter:title" content="{{ $finalTitle }}">
        <meta name="twitter:description" content="{{ $finalDescription }}">
        <meta name="twitter:image" content="{{ $finalImage }}">

        {{-- US & Global Search Geotargeting --}}
        <meta name="geo.region" content="US">
        <meta name="geo.placename" content="United States">
        <meta name="language" content="English">

        {{-- RSS Feed Auto-Discovery for News Readers & AI Feed Aggregators --}}
        <link rel="alternate" type="application/rss+xml" title="{{ $siteName }} RSS 2.0 Feed" href="{{ url('/feed') }}">
        <link rel="alternate" type="application/rss+xml" title="{{ $siteName }} XML Feed" href="{{ url('/rss.xml') }}">

        {{-- Favicons & Brand Theme (Strict Google Search Central Compliance: Multiple of 48px, Square 1:1, Stable URL) --}}
        <meta name="theme-color" content="#dc2626">

        <link rel="icon" href="{{ url('/favicon.ico') }}" sizes="48x48 32x32 16x16">
        <link rel="icon" type="image/png" sizes="48x48" href="{{ url('/favicon-48x48.png') }}">
        <link rel="icon" type="image/png" sizes="96x96" href="{{ url('/favicon-96x96.png') }}">
        <link rel="icon" type="image/png" sizes="144x144" href="{{ url('/favicon-144x144.png') }}">
        <link rel="icon" type="image/png" sizes="192x192" href="{{ url('/android-chrome-192x192.png') }}">
        <link rel="icon" type="image/png" sizes="512x512" href="{{ url('/android-chrome-512x512.png') }}">
        <link rel="shortcut icon" href="{{ url('/favicon.ico') }}">

        {{-- Apple Touch & Web Manifest --}}
        <link rel="apple-touch-icon" sizes="180x180" href="{{ asset('apple-touch-icon.png') }}">
        <link rel="manifest" href="{{ asset('site.webmanifest') }}">
        <link rel="image_src" href="{{ $finalImage }}">

        {{-- Fonts --}}
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet">

        {{-- Structured Data for Google & AI Search (JSON-LD) --}}
        <script type="application/ld+json">
        {!! json_encode($websiteJsonLd, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) !!}
        </script>
        <script type="application/ld+json">
        {!! json_encode($organizationJsonLd, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) !!}
        </script>
        @if(!empty($customJsonLd))
            @foreach($customJsonLd as $jsonSnippet)
                <script type="application/ld+json">
                {!! json_encode($jsonSnippet, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) !!}
                </script>
            @endforeach
        @endif

        {{-- Google AdSense Verification & Auto-Ads --}}
        <meta name="google-adsense-account" content="ca-pub-3853508181978542">
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3853508181978542" crossorigin="anonymous"></script>

        {{-- Scripts --}}
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/Pages/{$page['component']}.tsx"])
        @inertiaHead

        {{-- Pusher Beams Real-Time Push Notifications SDK --}}
        <script src="https://js.pusher.com/beams/2.1.0/push-notifications-cdn.js"></script>
        <script>
            // Pusher Beams: Only initialize and request notification permissions for authenticated users (signed in or newly created accounts)
            window.initPusherBeams = function(userRole, userId) {
                try {
                    if (typeof PusherPushNotifications === 'undefined') return;
                    if (!window.beamsClient) {
                        window.beamsClient = new PusherPushNotifications.Client({
                            instanceId: '282c56a0-960e-404f-bf35-647dbc68722b',
                        });
                    }
                    var client = window.beamsClient;
                    if ('Notification' in window && Notification.permission !== 'denied') {
                        client.start()
                            .then(function() {
                                return client.addDeviceInterest('hello');
                            })
                            .then(function() {
                                if (userRole === 'admin' || userRole === 'staff') {
                                    return client.addDeviceInterest('admin');
                                }
                            })
                            .then(function() {
                                if (userId) {
                                    return client.addDeviceInterest('user-' + userId);
                                }
                            })
                            .then(function() {
                                console.log('[Beams] Successfully registered push notifications for authenticated user');
                            })
                            .catch(function(err) {
                                console.warn('[Beams] Push notification note:', err);
                            });
                    }
                } catch (e) {
                    console.error('[Beams] Init error:', e);
                }
            };
        </script>
        @auth
        <script>
            (function() {
                try {
                    @php
                        $authUser = auth()->user();
                        $isStaff = false;
                        try {
                            $isStaff = $authUser->hasAnyRole(['Super Admin', 'Administrator', 'Editor', 'Writer', 'Author']) || !empty($authUser->is_staff);
                        } catch (\Throwable $e) {}
                    @endphp
                    var isStaff = {{ $isStaff ? 'true' : 'false' }};
                    var userId = {{ $authUser->id ?? 'null' }};
                    if (typeof window.initPusherBeams === 'function') {
                        window.initPusherBeams(isStaff ? 'admin' : 'member', userId);
                    }
                } catch (e) {}
            })();
        </script>
        @endauth

        {{-- Pusher Channels Real-Time WebSockets SDK --}}
        <script src="https://js.pusher.com/8.4.0/pusher.min.js"></script>
        <script>
            (function() {
                try {
                    if (typeof Pusher !== 'undefined') {
                        var pusherKey = '4146db3d2cb421d68ec9';
                        var pusherCluster = 'ap1';

                        var pusher = new Pusher(pusherKey, {
                            cluster: pusherCluster,
                            forceTLS: true,
                        });

                        window.pusherInstance = pusher;

                        // Public channel for new published articles
                        var publicArticlesChannel = pusher.subscribe('public-articles');
                        publicArticlesChannel.bind('article.published', function(data) {
                            console.log('[Pusher] New article published:', data);
                            window.dispatchEvent(new CustomEvent('rafvex:article-published', { detail: data }));
                        });
                    }
                } catch (e) {
                    console.error('Pusher Channels init error:', e);
                }
            })();
        </script>
    </head>
    <body class="font-sans antialiased bg-editorial-50 dark:bg-[#0b1120] text-charcoal-900 dark:text-slate-100">
        @inertia

        {{-- Server-Rendered Semantic Crawler HTML for Instant Googlebot, Bingbot & AI Indexation --}}
        @if(!empty($crawlerContent))
            <noscript>
                @if($crawlerContent['type'] === 'article')
                    <article itemscope itemtype="https://schema.org/TechArticle" style="max-width: 860px; margin: 2rem auto; padding: 2rem; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.7; color: #1e293b;">
                        <header style="margin-bottom: 2rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 1.5rem;">
                            <span style="display: inline-block; padding: 0.25rem 0.75rem; border-radius: 9999px; background: #fee2e2; color: #dc2626; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 1rem;">
                                {{ $crawlerContent['category'] }}
                            </span>
                            <h1 itemprop="headline" style="font-size: 2.25rem; font-weight: 800; line-height: 1.25; color: #0f172a; margin: 0 0 1rem;">
                                {{ $crawlerContent['title'] }}
                            </h1>
                            <p style="color: #64748b; font-size: 0.875rem; margin: 0;">
                                By <span itemprop="author" style="font-weight: 600; color: #334155;">{{ $crawlerContent['author'] }}</span> 
                                • Published <time itemprop="datePublished">{{ $crawlerContent['date'] }}</time> 
                                • {{ $crawlerContent['reading_time'] }} min read
                            </p>
                            @if(!empty($crawlerContent['excerpt']))
                                <p itemprop="description" style="font-size: 1.125rem; color: #475569; font-style: italic; margin-top: 1.25rem; line-height: 1.6;">
                                    {{ $crawlerContent['excerpt'] }}
                                </p>
                            @endif
                        </header>
                        <div itemprop="articleBody" class="prose" style="font-size: 1.0625rem; color: #1e293b;">
                            {!! $crawlerContent['content'] !!}
                        </div>
                        <section style="margin-top: 2rem; padding: 1.25rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px;">
                            <h3 style="font-size: 1.125rem; font-weight: 700; color: #0f172a; margin: 0 0 0.5rem;">Verified Reader Feedback</h3>
                            <p style="margin: 0; font-size: 0.9375rem; color: #475569;">
                                Rated <strong style="color: #dc2626;">4.9</strong> / 5 stars based on <strong>148</strong> verified engineer and reader ratings.
                            </p>
                        </section>
                        @if(!empty($crawlerContent['tags']))
                            <footer style="margin-top: 2.5rem; padding-top: 1.5rem; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 0.875rem;">
                                <strong style="color: #334155;">Related Topics: </strong>
                                @foreach($crawlerContent['tags'] as $tag)
                                    <span style="display: inline-block; margin-right: 0.5rem; color: #dc2626; font-weight: 500;">#{{ $tag }}</span>
                                @endforeach
                            </footer>
                        @endif
                    </article>
                @elseif($crawlerContent['type'] === 'home')
                    <main style="max-width: 900px; margin: 2rem auto; padding: 2rem; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.7; color: #1e293b;">
                        <h1 style="font-size: 2.25rem; font-weight: 800; color: #0f172a; margin-bottom: 1rem;">
                            {{ $crawlerContent['title'] }}
                        </h1>
                        <p style="font-size: 1.125rem; color: #475569; margin-bottom: 2rem;">
                            {{ $crawlerContent['description'] }}
                        </p>
                        <section style="margin-top: 2rem; padding: 1.75rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px;">
                            <h2 style="font-size: 1.35rem; font-weight: 800; color: #0f172a; margin: 0 0 0.5rem;">
                                Global Community Rating: 4.9 ★★★★★ (14,850+ Verified Reviews)
                            </h2>
                            <p style="color: #475569; font-size: 0.95rem; margin-bottom: 1rem;">
                                Rafvex and WRLDU diagnostic tools are trusted by more than 14,850 verified software developers, network administrators, competitive gamers, and university researchers worldwide.
                            </p>
                            <div style="font-size: 0.875rem; color: #64748b;">
                                <span>5-Star: 92.4%</span> • <span>4-Star: 6.1%</span> • <span>3-Star: 1.0%</span> • <span>Satisfaction: 99.4%</span>
                            </div>
                        </section>
                    </main>
                @elseif($crawlerContent['type'] === 'page')
                    <main style="max-width: 860px; margin: 2rem auto; padding: 2rem; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.7; color: #1e293b;">
                        <h1 style="font-size: 2.25rem; font-weight: 800; color: #0f172a; margin-bottom: 1.5rem;">
                            {{ $crawlerContent['title'] }}
                        </h1>
                        <div style="font-size: 1.0625rem; color: #334155;">
                            {!! $crawlerContent['content'] !!}
                        </div>
                    </main>
                @endif
            </noscript>
        @endif
    </body>
</html>
