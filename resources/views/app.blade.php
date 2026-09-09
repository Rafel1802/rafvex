<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, viewport-fit=cover">
        @php
            try {
                $siteName = \App\Models\Setting::where('key', 'site_name')->value('value') ?? config('app.name', 'Rafvex');
                $siteTagline = \App\Models\Setting::where('key', 'site_tagline')->value('value');
                $siteDescription = \App\Models\Setting::where('key', 'site_description')->value('value');
                $siteLogoSetting = \App\Models\Setting::where('key', 'logo')->value('value');
                $analyticsId = \App\Models\Setting::where('key', 'analytics_id')->value('value');
            } catch (\Throwable $e) {
                $siteName = config('app.name', 'Rafvex');
                $siteTagline = null;
                $siteDescription = null;
                $siteLogoSetting = null;
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

        {{-- SEO & AI Search Engine Indexing Directives --}}
        @php
            $canonicalBase = rtrim(config('app.url', 'https://rafvex.com'), '/');
            $requestPath = request()->getPathInfo();
            $canonicalUrl = ($requestPath === '/' || empty($requestPath)) 
                ? $canonicalBase . '/' 
                : $canonicalBase . rtrim($requestPath, '/');
        @endphp
        <link rel="canonical" href="{{ $canonicalUrl }}">
        <meta property="og:url" content="{{ $canonicalUrl }}">
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
        <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
        <meta name="bingbot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">

        {{-- Favicons & Brand Theme (Strict Google Search Central Compliance: Multiple of 48px, Square 1:1, Stable URL) --}}
        <meta name="theme-color" content="#dc2626">

        <link rel="icon" type="image/png" sizes="48x48" href="{{ url('/favicon-48x48.png') }}">
        <link rel="icon" type="image/png" sizes="96x96" href="{{ url('/favicon-96x96.png') }}">
        <link rel="icon" type="image/png" sizes="144x144" href="{{ url('/favicon-144x144.png') }}">
        <link rel="icon" type="image/png" sizes="192x192" href="{{ url('/android-chrome-192x192.png') }}">
        <link rel="icon" type="image/png" sizes="512x512" href="{{ url('/android-chrome-512x512.png') }}">
        <link rel="icon" type="image/png" sizes="576x576" href="{{ url('/favicon.png') }}">
        <link rel="icon" href="{{ url('/favicon.ico') }}" sizes="any">
        <link rel="shortcut icon" href="{{ url('/favicon.ico') }}">
        <link rel="icon" type="image/svg+xml" href="{{ url('/favicon.svg') }}">

        {{-- Apple Touch & Web Manifest --}}
        <link rel="apple-touch-icon" sizes="180x180" href="{{ asset('apple-touch-icon.png') }}">
        <link rel="manifest" href="{{ asset('site.webmanifest') }}">
        <link rel="image_src" href="{{ $siteLogoUrl }}">

        {{-- Fonts --}}
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet">

        {{-- Structured Data for Google & AI Search (JSON-LD) --}}
        @php
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
        <meta name="description" content="{{ $siteDescription }}">
        <meta property="og:site_name" content="{{ $siteName }}">
        <meta property="og:type" content="website">
        <meta property="og:title" content="{{ $siteName }} — {{ $siteTagline }}">
        <meta property="og:description" content="{{ $siteDescription }}">
        <meta property="og:image" content="{{ $siteLogoUrl }}">
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="{{ $siteName }} — {{ $siteTagline }}">
        <meta name="twitter:description" content="{{ $siteDescription }}">
        <meta name="twitter:image" content="{{ $siteLogoUrl }}">
        <script type="application/ld+json">
        {!! json_encode($websiteJsonLd, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT) !!}
        </script>
        <script type="application/ld+json">
        {!! json_encode($organizationJsonLd, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT) !!}
        </script>

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
    </body>
</html>
