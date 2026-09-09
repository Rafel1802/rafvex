<?php

namespace App\Http\Middleware;

use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function handle(Request $request, \Closure $next)
    {
        $response = parent::handle($request, $next);

        // Ensure Vary header always includes both X-Inertia AND Accept
        // so browsers and intermediate caches understand that the response format (HTML vs JSON)
        // depends on both the X-Inertia header and the Accept header.
        $currentVary = $response->headers->get('Vary');
        $varyHeaders = array_filter(array_map('trim', explode(',', $currentVary ?? '')));
        if (!in_array('X-Inertia', $varyHeaders)) {
            $varyHeaders[] = 'X-Inertia';
        }
        if (!in_array('Accept', $varyHeaders)) {
            $varyHeaders[] = 'Accept';
        }
        $response->headers->set('Vary', implode(', ', $varyHeaders));

        // When returning an Inertia JSON response (XHR navigation), forbid browsers and proxies
        // from storing the raw JSON in disk cache.
        // 'no-store' is critical: it prevents browsers (specifically Chromium and Safari)
        // from serving the cached raw JSON payload when the user clicks the browser "Back" button.
        if ($request->header('X-Inertia') || $response->headers->has('X-Inertia')) {
            $response->headers->set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
            $response->headers->set('Pragma', 'no-cache');
            $response->headers->set('Expires', 'Sat, 01 Jan 2000 00:00:00 GMT');
            $response->headers->set('X-LiteSpeed-Cache-Control', 'no-cache');
        }

        return $response;
    }

    public function share(Request $request): array
    {
        // Cache settings for performance
        $settings = cache()->remember('site_settings', 300, function () {
            try {
                return Setting::whereIn('key', [
                    'site_name', 'site_tagline', 'site_description', 'logo', 'favicon',
                    'twitter_handle', 'facebook_url', 'telegram_url', 'linkedin_url',
                    'youtube_url', 'instagram_url', 'github_url',
                    'contact_email', 'contact_phone', 'contact_address',
                    'founder_name', 'founder_title', 'founder_bio', 'founder_avatar',
                    'adsense_client_id', 'adsense_slot_home', 'adsense_slot_article'
                ])
                    ->get()
                    ->pluck('value', 'key')
                    ->toArray();
            } catch (\Throwable $e) {
                return [];
            }
        });

        // Cache active mega menu categories
        $megaMenuCategories = cache()->remember('mega_menu_categories', 180, function () {
            try {
                return \App\Models\Category::whereNull('parent_id')
                    ->with([
                        'children' => fn($q) => $q->select(['id', 'parent_id', 'name', 'slug', 'sort_order'])
                            ->withCount(['articles' => fn($aq) => $aq->where('status', 'published')])
                            ->orderBy('sort_order', 'asc')
                    ])
                    ->withCount(['articles' => fn($q) => $q->where('status', 'published')])
                    ->orderBy('sort_order', 'asc')
                    ->get(['id', 'name', 'slug', 'description', 'sort_order'])
                    ->map(fn($cat) => [
                        'id' => $cat->id,
                        'name' => $cat->name,
                        'slug' => $cat->slug,
                        'description' => $cat->description,
                        'total_articles' => (int) ($cat->articles_count + $cat->children->sum('articles_count')),
                        'subcategories' => $cat->children->map(fn($sub) => [
                            'id' => $sub->id,
                            'name' => $sub->name,
                            'slug' => $sub->slug,
                            'count' => (int) $sub->articles_count,
                        ])->values()->all(),
                    ])->values()->all();
            } catch (\Throwable $e) {
                // Fallback structured categories
                return collect([
                    [
                        'id' => 1,
                        'name' => 'AI Tools',
                        'slug' => 'ai-tools',
                        'description' => 'Artificial intelligence breakthroughs, generative models & prompt guides',
                        'total_articles' => 14,
                        'subcategories' => [
                            ['id' => 11, 'name' => 'ChatGPT & LLMs', 'slug' => 'chatgpt-llms', 'count' => 6],
                            ['id' => 12, 'name' => 'Prompt Engineering', 'slug' => 'prompt-engineering', 'count' => 4],
                            ['id' => 13, 'name' => 'AI Image Generators', 'slug' => 'ai-image-generators', 'count' => 4],
                        ],
                    ],
                    [
                        'id' => 2,
                        'name' => 'Phones',
                        'slug' => 'android-iphone',
                        'description' => 'Smartphone comparisons, iOS & Android tips, hidden settings',
                        'total_articles' => 9,
                        'subcategories' => [
                            ['id' => 21, 'name' => 'iPhone & iOS', 'slug' => 'iphone-ios', 'count' => 5],
                            ['id' => 22, 'name' => 'Android Tips', 'slug' => 'android-tips', 'count' => 4],
                        ],
                    ],
                    [
                        'id' => 3,
                        'name' => 'Computing',
                        'slug' => 'windows-mac',
                        'description' => 'PC performance, macOS shortcuts, hardware optimization',
                        'total_articles' => 11,
                        'subcategories' => [
                            ['id' => 31, 'name' => 'Windows 11', 'slug' => 'windows-11', 'count' => 6],
                            ['id' => 32, 'name' => 'macOS Guides', 'slug' => 'macos-guides', 'count' => 5],
                        ],
                    ],
                    [
                        'id' => 4,
                        'name' => 'Apps & Web',
                        'slug' => 'websites-apps',
                        'description' => 'Useful online tools, productivity apps, web discovery',
                        'total_articles' => 15,
                        'subcategories' => [
                            ['id' => 41, 'name' => 'Productivity Software', 'slug' => 'productivity-software', 'count' => 8],
                            ['id' => 42, 'name' => 'Web Utilities', 'slug' => 'web-utilities', 'count' => 7],
                        ],
                    ],
                    [
                        'id' => 5,
                        'name' => 'Security',
                        'slug' => 'basic-online-security',
                        'description' => 'Digital privacy, VPNs, password managers, cyber defense',
                        'total_articles' => 8,
                        'subcategories' => [
                            ['id' => 51, 'name' => 'Privacy & VPNs', 'slug' => 'privacy-vpns', 'count' => 4],
                            ['id' => 52, 'name' => 'Account Security', 'slug' => 'account-security', 'count' => 4],
                        ],
                    ],
                    [
                        'id' => 6,
                        'name' => 'How-To & Guides',
                        'slug' => 'troubleshooting',
                        'description' => 'Step-by-step tutorials and tech problem solving',
                        'total_articles' => 12,
                        'subcategories' => [
                            ['id' => 61, 'name' => 'Troubleshooting', 'slug' => 'troubleshooting-tips', 'count' => 6],
                            ['id' => 62, 'name' => 'Step-by-Step Fixes', 'slug' => 'step-by-step-fixes', 'count' => 6],
                        ],
                    ],
                    [
                        'id' => 7,
                        'name' => 'English Reading Stories',
                        'slug' => 'english-reading-stories',
                        'description' => 'Inspiring articles and stories crafted for reading, learning and discovery',
                        'total_articles' => 7,
                        'subcategories' => [
                            ['id' => 71, 'name' => 'Short Stories', 'slug' => 'short-stories', 'count' => 4],
                            ['id' => 72, 'name' => 'Vocabulary & Life', 'slug' => 'vocabulary-life', 'count' => 3],
                        ],
                    ],
                ]);
            }
        });

        // Ensure megaMenuCategories is always a clean zero-indexed PHP array for JSON encoding
        $safeMegaMenuCategories = is_array($megaMenuCategories) 
            ? array_values($megaMenuCategories) 
            : (is_iterable($megaMenuCategories) ? array_values(iterator_to_array($megaMenuCategories)) : []);

        // Fetch active sponsored popup ad if available
        $activePopupAd = null;
        try {
            $activePopupAd = \App\Models\PopupAd::active()->latest()->first();
        } catch (\Throwable $e) {}

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user() ? [
                    'id'                         => $request->user()->id,
                    'name'                       => $request->user()->name,
                    'email'                      => $request->user()->email,
                    'avatar'                     => $request->user()->avatar,
                    'roles'                      => $request->user()->getRoleNames(),
                    'is_staff'                   => $request->user()->isStaff(),
                    'primary_role'               => $request->user()->isStaff() ? ($request->user()->getRoleNames()->first(fn($r) => in_array($r, ['Super Admin', 'Administrator', 'Editor', 'Writer', 'Author'])) ?? 'Administrator') : 'Reader',
                    'permissions'                => $request->user()->getAllPermissions()->pluck('name'),
                    'unread_notifications_count' => \App\Models\UserNotification::where('user_id', $request->user()->id)->whereNull('read_at')->count(),
                    'google_id'                  => $request->user()->google_id,
                    'google_email'               => $request->user()->google_email,
                    'google_avatar'              => $request->user()->google_avatar,
                    'google_linked_at'           => $request->user()->google_linked_at?->toDateString(),
                ] : null,
            ],
            'flash' => [
                'message' => fn () => $request->session()->get('message') ?? $request->session()->get('success') ?? $request->session()->get('status'),
                'error'   => fn () => $request->session()->get('error'),
            ],
            'site' => [
                'name'             => $settings['site_name']            ?? config('app.name', 'Rafvex'),
                'google_client_id' => '424918974382-qbnphracdndii7vf9fhc1vf0n5e7qdgp.apps.googleusercontent.com',
                'tagline'         => $settings['site_tagline']         ?? 'Technology, AI, Guides & Knowledge',
                'description'     => $settings['site_description']     ?? 'Explore technology, AI, how-to guides, useful apps and websites, English reading stories, tutorials, and informative articles. Learn something new with Rafvex.',
                'logo'            => $settings['logo']            ?? null,
                'favicon'         => $settings['favicon']         ?? null,
                'login_bg_image'  => $settings['login_bg_image']  ?? null,
                'twitter_handle'  => $settings['twitter_handle']  ?? null,
                'facebook_url'    => $settings['facebook_url']    ?? null,
                'telegram_url'    => $settings['telegram_url']    ?? null,
                'linkedin_url'    => $settings['linkedin_url']    ?? null,
                'youtube_url'     => $settings['youtube_url']     ?? null,
                'instagram_url'   => $settings['instagram_url']   ?? null,
                'github_url'      => $settings['github_url']      ?? null,
                'contact_email'   => $settings['contact_email']   ?? 'rafvexofficial@gmail.com',
                'contact_phone'   => $settings['contact_phone']   ?? null,
                'contact_address' => $settings['contact_address'] ?? null,
                'founder_name'    => $settings['founder_name']    ?? 'Soporadara Rin',
                'founder_title'   => $settings['founder_title']   ?? 'Founder, Writer & Lead Researcher',
                'founder_bio'     => $settings['founder_bio']     ?? 'Author',
                'founder_avatar'  => $settings['founder_avatar']  ?? null,
            ],
            'mega_menu_categories' => $safeMegaMenuCategories,
            'active_popup_ad'      => $activePopupAd,
        ];
    }
}
