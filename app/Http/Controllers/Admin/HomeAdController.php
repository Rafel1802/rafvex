<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\HomeAd;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class HomeAdController extends Controller
{
    /**
     * File path for fallback JSON storage when database table is not migrated.
     */
    protected static function getFallbackFile(): string
    {
        return storage_path('app/home_ads.json');
    }

    /**
     * Default demo ads to guarantee 4 responsive sponsor items.
     */
    public static function getDefaultDemoAds(): array
    {
        return [
            [
                'id' => 1,
                'title' => 'NextGen Cloud Clusters & Dedicated GPU Scaling',
                'sponsor_name' => 'CloudScale Infrastructure',
                'subtitle' => 'Deploy bare-metal NVIDIA H100 servers with instant provisioning and 99.99% uptime.',
                'media_type' => 'image',
                'media_url' => 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
                'video_url' => null,
                'link_url' => 'https://rafvex.com/about',
                'aspect_ratio' => 'landscape',
                'badge_text' => 'Sponsored',
                'order' => 1,
                'is_active' => true,
                'impressions_count' => 0,
                'clicks_count' => 0,
                'notes' => 'Flagship homepage sidebar cloud sponsor.',
                'created_at' => '2026-09-01 10:00:00',
            ],
            [
                'id' => 2,
                'title' => 'AI Prompt Engineering & Fine-Tuning Studio',
                'sponsor_name' => 'PromptLab Pro',
                'subtitle' => 'Interactive playground to benchmark Claude 3.7, GPT-4o, and DeepSeek R1 outputs side-by-side.',
                'media_type' => 'image',
                'media_url' => 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
                'video_url' => null,
                'link_url' => 'https://rafvex.com/category/ai-tools',
                'aspect_ratio' => 'square',
                'badge_text' => 'Featured Sponsor',
                'order' => 2,
                'is_active' => true,
                'impressions_count' => 0,
                'clicks_count' => 0,
                'notes' => 'AI tools focus ad.',
                'created_at' => '2026-09-02 11:30:00',
            ],
            [
                'id' => 3,
                'title' => 'NordShield Zero-Trust VPN & Privacy Shield',
                'sponsor_name' => 'NordShield Security',
                'subtitle' => 'Protect your personal browsing across macOS, Windows, iOS, and Android with WireGuard encryption.',
                'media_type' => 'image',
                'media_url' => 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80',
                'video_url' => null,
                'link_url' => 'https://rafvex.com/category/basic-online-security',
                'aspect_ratio' => 'landscape',
                'badge_text' => 'Official Partner',
                'order' => 3,
                'is_active' => true,
                'impressions_count' => 0,
                'clicks_count' => 0,
                'notes' => 'Cybersecurity sponsor slot.',
                'created_at' => '2026-09-03 14:00:00',
            ],
            [
                'id' => 4,
                'title' => 'UltraQuiet Studio Noise-Canceling Wireless Headphones',
                'sponsor_name' => 'SoundMaster Pro Audio',
                'subtitle' => 'Engineered for audio engineers, researchers, and remote coders with 45-hour high-res playback.',
                'media_type' => 'image',
                'media_url' => 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80',
                'video_url' => null,
                'link_url' => 'https://rafvex.com/category/reviews',
                'aspect_ratio' => 'landscape',
                'badge_text' => 'Tech Partner',
                'order' => 4,
                'is_active' => true,
                'impressions_count' => 0,
                'clicks_count' => 0,
                'notes' => 'Hardware audio sponsor.',
                'created_at' => '2026-09-04 16:45:00',
            ],
        ];
    }

    /**
     * Check if home ads have ever been initialized.
     */
    public static function isInitialized(): bool
    {
        try {
            if (Schema::hasTable('settings')) {
                $setting = Setting::where('key', 'home_ads_initialized')->first();
                if ($setting && $setting->value === '1') {
                    return true;
                }
            }
            if (Schema::hasTable('home_ads') && HomeAd::withTrashed()->exists()) {
                return true;
            }
        } catch (\Throwable $e) {}
        return false;
    }

    /**
     * Seed initial ads to database once if table has never been populated.
     */
    public static function ensureDbSeeded(): void
    {
        if (!Schema::hasTable('home_ads')) {
            return;
        }

        if (self::isInitialized()) {
            return;
        }

        // Check fallback JSON file first for any pre-existing custom data
        $fallbackFile = self::getFallbackFile();
        $initialAds = [];
        if (File::exists($fallbackFile)) {
            $data = json_decode(File::get($fallbackFile), true);
            if (is_array($data) && !empty($data)) {
                $initialAds = $data;
            }
        }

        if (empty($initialAds)) {
            $initialAds = self::getDefaultDemoAds();
        }

        foreach ($initialAds as $adData) {
            HomeAd::create([
                'title' => $adData['title'] ?? 'Sponsored Ad',
                'sponsor_name' => $adData['sponsor_name'] ?? 'Sponsored',
                'subtitle' => $adData['subtitle'] ?? null,
                'media_type' => $adData['media_type'] ?? 'image',
                'media_url' => $adData['media_url'] ?? null,
                'video_url' => $adData['video_url'] ?? null,
                'link_url' => $adData['link_url'] ?? 'https://rafvex.com',
                'aspect_ratio' => $adData['aspect_ratio'] ?? 'landscape',
                'badge_text' => $adData['badge_text'] ?? 'Sponsored',
                'order' => (int) ($adData['order'] ?? 0),
                'is_active' => isset($adData['is_active']) ? (bool) $adData['is_active'] : true,
                'impressions_count' => (int) ($adData['impressions_count'] ?? 0),
                'clicks_count' => (int) ($adData['clicks_count'] ?? 0),
                'notes' => $adData['notes'] ?? null,
            ]);
        }

        try {
            if (Schema::hasTable('settings')) {
                Setting::updateOrCreate(
                    ['key' => 'home_ads_initialized'],
                    ['value' => '1']
                );
            }
        } catch (\Throwable $e) {}
    }

    /**
     * Sync database ads into the fallback JSON file.
     */
    public static function syncDbToFallback(): void
    {
        try {
            if (Schema::hasTable('home_ads')) {
                $ads = HomeAd::orderBy('order', 'asc')->latest()->get()->toArray();
                self::saveFallbackAds($ads);
            }
        } catch (\Throwable $e) {}
    }

    /**
     * Load all ads from database, or fallback file if DB table is unavailable.
     */
    public static function loadAllAds(): array
    {
        try {
            if (Schema::hasTable('home_ads')) {
                self::ensureDbSeeded();
                return HomeAd::orderBy('order', 'asc')->latest()->get()->toArray();
            }
        } catch (\Throwable $e) {
            // Database unreachable or table not migrated yet; continue to fallback
        }

        $fallbackFile = self::getFallbackFile();
        if (File::exists($fallbackFile)) {
            $data = json_decode(File::get($fallbackFile), true);
            if (is_array($data)) {
                return $data;
            }
        }

        // Seed default demo ads to fallback file only if it doesn't exist
        $demo = self::getDefaultDemoAds();
        self::saveFallbackAds($demo);
        return $demo;
    }

    /**
     * Save ads to fallback JSON file.
     */
    public static function saveFallbackAds(array $ads): void
    {
        $dir = dirname(self::getFallbackFile());
        if (!File::exists($dir)) {
            File::makeDirectory($dir, 0755, true);
        }
        File::put(self::getFallbackFile(), json_encode(array_values($ads), JSON_PRETTY_PRINT));
    }

    /**
     * Display a listing of Home Ads in CMS.
     */
    public function index()
    {
        $ads = collect(self::loadAllAds())->map(function ($ad) {
            $imp = (int) ($ad['impressions_count'] ?? 0);
            $clk = (int) ($ad['clicks_count'] ?? 0);
            $ad['ctr'] = $imp > 0 ? round(($clk / $imp) * 100, 1) : 0.0;
            $ad['is_currently_running'] = (bool) ($ad['is_active'] ?? false);
            $ad['status_label'] = $ad['is_currently_running'] ? 'Active' : 'Paused';
            return $ad;
        });

        $totalAds = $ads->count();
        $activeAds = $ads->where('is_currently_running', true)->count();
        $totalImpressions = (int) $ads->sum('impressions_count');
        $totalClicks = (int) $ads->sum('clicks_count');
        $avgCtr = $totalImpressions > 0 ? round(($totalClicks / $totalImpressions) * 100, 1) : 0.0;

        return Inertia::render('Admin/HomeAds/Index', [
            'ads' => $ads->values(),
            'stats' => [
                'total_ads' => $totalAds,
                'active_ads' => $activeAds,
                'total_impressions' => $totalImpressions,
                'total_clicks' => $totalClicks,
                'average_ctr' => $avgCtr,
            ],
        ]);
    }

    /**
     * Show the form for creating a new Home Ad.
     */
    public function create()
    {
        return Inertia::render('Admin/HomeAds/Create');
    }

    /**
     * Store a newly created Home Ad.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'sponsor_name' => 'nullable|string|max:255',
            'subtitle' => 'nullable|string|max:1000',
            'media_type' => 'required|in:image,video,gif',
            'media_file' => 'nullable|file|max:51200', // 50MB
            'media_url' => 'nullable|string|max:2000',
            'video_url' => 'nullable|string|max:2000',
            'link_url' => 'nullable|string|max:2000',
            'aspect_ratio' => 'required|in:landscape,square,auto',
            'badge_text' => 'nullable|string|max:50',
            'order' => 'integer|min:0|max:100',
            'is_active' => 'boolean',
            'notes' => 'nullable|string|max:2000',
        ]);

        $mediaPath = $validated['media_url'] ?? null;

        if ($request->hasFile('media_file')) {
            $file = $request->file('media_file');
            $filename = time() . '_' . Str::slug($validated['title']) . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('home-ads', $filename, 'public');
            $mediaPath = Storage::url($path);
        }

        $newAdData = [
            'title' => $validated['title'],
            'sponsor_name' => $validated['sponsor_name'] ?? 'Sponsored',
            'subtitle' => $validated['subtitle'] ?? null,
            'media_type' => $validated['media_type'],
            'media_url' => $mediaPath,
            'video_url' => $validated['video_url'] ?? null,
            'link_url' => $validated['link_url'] ?? 'https://rafvex.com',
            'aspect_ratio' => $validated['aspect_ratio'] ?? 'landscape',
            'badge_text' => $validated['badge_text'] ?? 'Sponsored',
            'order' => $validated['order'] ?? 0,
            'is_active' => $request->boolean('is_active'),
            'impressions_count' => 0,
            'clicks_count' => 0,
            'notes' => $validated['notes'] ?? null,
        ];

        try {
            if (Schema::hasTable('home_ads')) {
                self::ensureDbSeeded();
                HomeAd::create($newAdData);
                self::syncDbToFallback();
                return redirect()->route('admin.home-ads.index')
                    ->with('success', 'Home Ad created successfully!');
            }
        } catch (\Throwable $e) {}

        // Fallback JSON mode
        $allAds = self::loadAllAds();
        $nextId = count($allAds) > 0 ? (max(array_column($allAds, 'id') ?: [0]) + 1) : 1;
        $newAdData['id'] = $nextId;
        $newAdData['created_at'] = now()->toDateTimeString();
        $newAdData['updated_at'] = now()->toDateTimeString();
        $allAds[] = $newAdData;
        self::saveFallbackAds($allAds);

        return redirect()->route('admin.home-ads.index')
            ->with('success', 'Home Ad created successfully!');
    }

    /**
     * Show the form for editing the specified Home Ad.
     */
    public function edit($id)
    {
        try {
            if (Schema::hasTable('home_ads')) {
                self::ensureDbSeeded();
                $ad = HomeAd::find((int) $id);
                if ($ad) {
                    return Inertia::render('Admin/HomeAds/Edit', [
                        'homeAd' => $ad,
                    ]);
                }
            }
        } catch (\Throwable $e) {}

        $allAds = self::loadAllAds();
        $ad = collect($allAds)->firstWhere('id', (int) $id);

        if (!$ad) {
            return redirect()->route('admin.home-ads.index')
                ->with('error', 'Home Ad not found.');
        }

        return Inertia::render('Admin/HomeAds/Edit', [
            'homeAd' => $ad,
        ]);
    }

    /**
     * Update the specified Home Ad.
     */
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'sponsor_name' => 'nullable|string|max:255',
            'subtitle' => 'nullable|string|max:1000',
            'media_type' => 'required|in:image,video,gif',
            'media_file' => 'nullable|file|max:51200',
            'media_url' => 'nullable|string|max:2000',
            'video_url' => 'nullable|string|max:2000',
            'link_url' => 'nullable|string|max:2000',
            'aspect_ratio' => 'required|in:landscape,square,auto',
            'badge_text' => 'nullable|string|max:50',
            'order' => 'integer|min:0|max:100',
            'is_active' => 'boolean',
            'notes' => 'nullable|string|max:2000',
        ]);

        $mediaPath = $validated['media_url'] ?? null;

        if ($request->hasFile('media_file')) {
            $file = $request->file('media_file');
            $filename = time() . '_' . Str::slug($validated['title']) . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('home-ads', $filename, 'public');
            $mediaPath = Storage::url($path);
        }

        $updateData = [
            'title' => $validated['title'],
            'sponsor_name' => $validated['sponsor_name'] ?? 'Sponsored',
            'subtitle' => $validated['subtitle'] ?? null,
            'media_type' => $validated['media_type'],
            'media_url' => $mediaPath ?: ($validated['media_url'] ?? null),
            'video_url' => $validated['video_url'] ?? null,
            'link_url' => $validated['link_url'] ?? 'https://rafvex.com',
            'aspect_ratio' => $validated['aspect_ratio'] ?? 'landscape',
            'badge_text' => $validated['badge_text'] ?? 'Sponsored',
            'order' => $validated['order'] ?? 0,
            'is_active' => $request->boolean('is_active'),
            'notes' => $validated['notes'] ?? null,
        ];

        try {
            if (Schema::hasTable('home_ads')) {
                self::ensureDbSeeded();
                $dbAd = HomeAd::find((int) $id);
                if ($dbAd) {
                    $dbAd->update($updateData);
                    self::syncDbToFallback();
                    return redirect()->route('admin.home-ads.index')
                        ->with('success', 'Home Ad updated successfully!');
                }
            }
        } catch (\Throwable $e) {}

        // Fallback JSON mode
        $allAds = self::loadAllAds();
        foreach ($allAds as &$ad) {
            if ((int) $ad['id'] === (int) $id) {
                $ad = array_merge($ad, $updateData);
                $ad['updated_at'] = now()->toDateTimeString();
                break;
            }
        }
        self::saveFallbackAds($allAds);

        return redirect()->route('admin.home-ads.index')
            ->with('success', 'Home Ad updated successfully!');
    }

    /**
     * Remove the specified Home Ad.
     */
    public function destroy($id)
    {
        try {
            if (Schema::hasTable('settings')) {
                Setting::updateOrCreate(
                    ['key' => 'home_ads_initialized'],
                    ['value' => '1']
                );
            }
            if (Schema::hasTable('home_ads')) {
                $dbAd = HomeAd::find((int) $id);
                if ($dbAd) {
                    $dbAd->delete();
                }
                self::syncDbToFallback();
                return redirect()->route('admin.home-ads.index')
                    ->with('success', 'Home Ad removed successfully!');
            }
        } catch (\Throwable $e) {}

        $allAds = self::loadAllAds();
        $allAds = array_values(array_filter($allAds, fn($ad) => (int) ($ad['id'] ?? 0) !== (int) $id));
        self::saveFallbackAds($allAds);

        return redirect()->route('admin.home-ads.index')
            ->with('success', 'Home Ad removed successfully!');
    }

    /**
     * Quick toggle active status.
     */
    public function toggleStatus($id)
    {
        try {
            if (Schema::hasTable('home_ads')) {
                self::ensureDbSeeded();
                $dbAd = HomeAd::find((int) $id);
                if ($dbAd) {
                    $dbAd->is_active = !$dbAd->is_active;
                    $dbAd->save();
                    self::syncDbToFallback();
                    $label = $dbAd->is_active ? 'Active' : 'Paused';
                    return back()->with('success', "Home Ad status toggled to {$label}.");
                }
            }
        } catch (\Throwable $e) {}

        $allAds = self::loadAllAds();
        $newStatus = false;
        foreach ($allAds as &$ad) {
            if ((int) $ad['id'] === (int) $id) {
                $ad['is_active'] = !($ad['is_active'] ?? false);
                $newStatus = $ad['is_active'];
                break;
            }
        }
        self::saveFallbackAds($allAds);

        $label = $newStatus ? 'Active' : 'Paused';
        return back()->with('success', "Home Ad status toggled to {$label}.");
    }

    /**
     * Reset analytics metrics for this ad.
     */
    public function resetStats($id)
    {
        try {
            if (Schema::hasTable('home_ads')) {
                self::ensureDbSeeded();
                $dbAd = HomeAd::find((int) $id);
                if ($dbAd) {
                    $dbAd->impressions_count = 0;
                    $dbAd->clicks_count = 0;
                    $dbAd->save();
                    self::syncDbToFallback();
                    return back()->with('success', 'Ad metrics successfully reset to zero.');
                }
            }
        } catch (\Throwable $e) {}

        $allAds = self::loadAllAds();
        foreach ($allAds as &$ad) {
            if ((int) $ad['id'] === (int) $id) {
                $ad['impressions_count'] = 0;
                $ad['clicks_count'] = 0;
                break;
            }
        }
        self::saveFallbackAds($allAds);

        return back()->with('success', 'Ad metrics successfully reset to zero.');
    }
}
