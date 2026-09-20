<?php

use App\Http\Controllers\Admin\AuthorController;
use App\Http\Controllers\Admin\ContactMessageController;
use App\Http\Controllers\Admin\CustomerController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\GoogleAuthController;
use App\Http\Controllers\Admin\HomeAdController;
use App\Http\Controllers\Admin\HomeSectionsController;
use App\Http\Controllers\Admin\MaintenanceController;
use App\Http\Controllers\Admin\MediaController;
use App\Http\Controllers\Admin\PlaylistController;
use App\Http\Controllers\Admin\PodcastCategoryController;
use App\Http\Controllers\Admin\PopupAdController;
use App\Http\Controllers\Admin\SecurityController;
use App\Http\Controllers\Admin\SettingsController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Public\ArticleController;
use App\Http\Controllers\Public\CategoryController;
use App\Http\Controllers\Public\CommentController;
use App\Http\Controllers\Public\ContactController;
use App\Http\Controllers\Public\HomeAdTrackerController;
use App\Http\Controllers\Public\HomeController;
use App\Http\Controllers\Public\NewsController;
use App\Http\Controllers\Public\NotificationController;
use App\Http\Controllers\Public\PodcastController;
use App\Http\Controllers\Public\PopularController;
use App\Http\Controllers\Public\PopupAdTrackerController;
use App\Http\Controllers\Public\ProfileController;
use App\Http\Controllers\Public\SearchController;
use App\Http\Controllers\Public\SitemapController;
use App\Http\Controllers\Public\UserInteractionController;
use App\Http\Middleware\CheckMaintenance;
use App\Http\Middleware\EnsureStaff;
use App\Models\Setting;
use Illuminate\Support\Facades\Route;

/* ══════════════════════════════════════════
   Media Library Direct Image Route
   Serves https://rafvex.com/blog/{path} from public/medialibrary/blog/{path}
══════════════════════════════════════════ */
Route::get('/blog/{path}', function ($path) {
    if (str_contains($path, '..')) {
        abort(404);
    }
    $filePath = public_path('medialibrary/blog/'.$path);
    if (! file_exists($filePath) || ! is_file($filePath)) {
        // Resilient fallback: locate image by filename and folder
        $filename = basename($path);
        $parts = explode('/', trim($path, '/'));
        $slugFolder = count($parts) >= 2 ? $parts[count($parts) - 2] : '';
        $found = null;
        if ($slugFolder !== '') {
            $candidates = glob(public_path('medialibrary/blog/*/*/'.$slugFolder.'/'.$filename));
            if (! empty($candidates) && is_file($candidates[0])) {
                $found = $candidates[0];
            }
        }
        if (! $found) {
            $candidates = glob(public_path('medialibrary/blog/*/*/*/'.$filename));
            if (! empty($candidates) && is_file($candidates[0])) {
                $found = $candidates[0];
            }
        }
        if ($found) {
            $filePath = $found;
        } else {
            abort(404);
        }
    }
    $mimeType = mime_content_type($filePath) ?: 'image/webp';

    return response()->file($filePath, [
        'Content-Type' => $mimeType,
        'Cache-Control' => 'public, max-age=31536000, immutable',
    ]);
})->where('path', '.*')->withoutMiddleware('web')->name('media.blog.file');

/* ══════════════════════════════════════════
   Public Routes (with maintenance check)
══════════════════════════════════════════ */
Route::middleware([CheckMaintenance::class])->group(function () {
    Route::get('/', [HomeController::class, 'index'])->name('home');
    Route::get('/article/the-lantern-maker-inspiring-english-story', fn () => redirect()->route('article.show', ['slug' => 'the-lantern-maker-inspiring-english-reading-story'], 301));
    Route::get('/article/the-mountain-and-the-seed-daily-habits', fn () => redirect()->route('article.show', ['slug' => 'the-mountain-and-the-seed-lesson-daily-habits'], 301));
    Route::get('/article/the-lost-wallet', fn () => redirect()->route('article.show', ['slug' => 'the-lost-wallet-inspiring-english-story'], 301));
    Route::get('/article/the-lost-wallet-story', fn () => redirect()->route('article.show', ['slug' => 'the-lost-wallet-inspiring-english-story'], 301));
    Route::get('/article/{slug}', [ArticleController::class, 'show'])->name('article.show');
    Route::get('/articles/{slug}', fn ($slug) => redirect()->route('article.show', ['slug' => $slug], 301));
    Route::get('/articles', fn () => redirect()->route('home', [], 301));
    Route::post('/article/{article}/comments', [CommentController::class, 'store'])->name('article.comment.store');
    Route::get('/category/{slug}', [CategoryController::class, 'show'])->name('category.show');
    Route::get('/popular', [PopularController::class, 'index'])->name('popular.index');
    Route::get('/news', [NewsController::class, 'index'])->name('news.index');
    Route::get('/news/{slug}', [NewsController::class, 'show'])->name('news.show');
    Route::get('/podcasts', [PodcastController::class, 'index'])->name('podcasts.index');
    Route::get('/podcast/{slug}', [PodcastController::class, 'show'])->name('podcast.show');
    Route::post('/api/podcast/{podcast}/play', [PodcastController::class, 'trackPlay'])->name('podcast.track-play');
    Route::get('/search', [SearchController::class, 'index'])->name('search');
    Route::get('/api/search/live', [SearchController::class, 'live'])->name('api.search.live');
    Route::get('/sitemap.xml', [SitemapController::class, 'index'])->name('sitemap.xml');
    Route::get('/sitemap', [SitemapController::class, 'html'])->name('sitemap');
    Route::get('/feed', [SitemapController::class, 'feed'])->name('feed');
    Route::get('/rss.xml', [SitemapController::class, 'feed'])->name('rss.xml');
    Route::get('/llms.txt', [SitemapController::class, 'llms'])->name('llms.txt');
    Route::get('/llms-full.txt', [SitemapController::class, 'llms'])->name('llms-full.txt');
    Route::get('/robots.txt', [SitemapController::class, 'robots'])->name('robots');
    Route::get('/ads.txt', function () {
        $adsTxt = Setting::where('key', 'ads_txt')->value('value');
        if (empty($adsTxt) && file_exists(public_path('ads.txt'))) {
            $adsTxt = file_get_contents(public_path('ads.txt'));
        }

        return response($adsTxt ?: "# Google AdSense configuration for rafvex.com\n# google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0\n", 200, [
            'Content-Type' => 'text/plain',
        ]);
    })->name('ads.txt');

    // IndexNow Verification Key Route (Bing, Copilot AI, Yahoo, Yandex)
    Route::get('/{key}.txt', function ($key) {
        $savedKey = Setting::where('key', 'indexnow_key')->value('value');
        if (! empty($savedKey) && strcasecmp(trim($savedKey), trim($key)) === 0) {
            return response($savedKey, 200, [
                'Content-Type' => 'text/plain; charset=utf-8',
                'Cache-Control' => 'public, max-age=86400',
            ]);
        }
        abort(404);
    })->where('key', '[a-f0-9]{16,64}')->name('indexnow.verify');
    Route::get('/terms-of-service', function () {
        return Inertia\Inertia::render('Public/Terms');
    })->name('terms');
    Route::get('/privacy-policy', function () {
        return Inertia\Inertia::render('Public/Privacy');
    })->name('privacy');
    Route::get('/about', function () {
        return Inertia\Inertia::render('Public/About');
    })->name('about');
    Route::get('/contact', [ContactController::class, 'index'])->name('contact');
    Route::post('/contact', [ContactController::class, 'store'])->name('contact.store');
    Route::get('/disclaimer', function () {
        return Inertia\Inertia::render('Public/Disclaimer');
    })->name('disclaimer');

    // Member Authentication Routes
    Route::post('/auth/register', [App\Http\Controllers\Public\AuthController::class, 'register'])->name('public.register');
    Route::post('/auth/login', [App\Http\Controllers\Public\AuthController::class, 'login'])->name('public.login');
    Route::post('/auth/google', [App\Http\Controllers\Public\AuthController::class, 'googleLogin'])->name('public.google');
    Route::post('/auth/logout', [App\Http\Controllers\Public\AuthController::class, 'logout'])->name('public.logout');

    // User Interactions (Favorites & Read History)
    Route::post('/api/articles/{article}/favorite', [UserInteractionController::class, 'toggleFavorite'])->name('article.favorite');
    Route::post('/api/articles/{article}/read', [UserInteractionController::class, 'recordRead'])->name('article.read');
    Route::get('/api/user/interactions', [UserInteractionController::class, 'getUserInteractions'])->name('user.interactions');

    // In-App Real-Time Notifications
    Route::get('/api/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/api/notifications/{notification}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::post('/api/notifications/read-all', [NotificationController::class, 'markAllAsRead'])->name('notifications.read-all');

    // Member Profile & Dashboard (Auth Protected)
    Route::middleware(['auth'])->group(function () {
        Route::get('/my/profile', [ProfileController::class, 'index'])->name('profile.index');
        Route::post('/my/profile', [ProfileController::class, 'update'])->name('profile.update');
        Route::post('/my/profile/password', [ProfileController::class, 'updatePassword'])->name('profile.password');
        Route::delete('/my/profile/history', [ProfileController::class, 'clearReadingHistory'])->name('profile.history.clear');
        Route::delete('/my/profile/history/{article}', [ProfileController::class, 'removeHistoryItem'])->name('profile.history.item');
    });
});

/* ══════════════════════════════════════════
   Auth Routes (Login & Authentication)
══════════════════════════════════════════ */
Route::get('/ourcms', [AuthController::class, 'showLoginForm'])->name('login');
Route::get('/ourcms/login', [AuthController::class, 'showLoginForm']);
Route::post('/ourcms/login', [AuthController::class, 'login'])->name('ourcms.login.post');
Route::post('/ourcms/auth/google/login', [GoogleAuthController::class, 'loginWithGoogle'])->name('ourcms.google.login');

// Legacy & convenience redirects
Route::get('/login', fn () => redirect('/ourcms'));
Route::get('/dashboard', fn () => redirect()->route('admin.dashboard'));

/* ══════════════════════════════════════════
   CMS Routes (Authenticated Staff Only)
══════════════════════════════════════════ */
Route::middleware(['auth', 'active', EnsureStaff::class])->prefix('ourcms')->name('admin.')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    // Google SSO Account Linking
    Route::post('/auth/google/connect', [GoogleAuthController::class, 'connectGoogle'])->name('google.connect');
    Route::post('/auth/google/disconnect', [GoogleAuthController::class, 'disconnectGoogle'])->name('google.disconnect');

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Customers Management
    Route::resource('customers', CustomerController::class)->only(['index', 'show', 'update', 'destroy']);
    Route::post('customers/{customer}/toggle', [CustomerController::class, 'toggleStatus'])->name('customers.toggle');

    // Articles & Playlists
    Route::resource('articles', App\Http\Controllers\Admin\ArticleController::class);
    Route::post('articles/{article}/toggle-breaking', [App\Http\Controllers\Admin\ArticleController::class, 'toggleBreaking'])->name('articles.toggle-breaking');
    Route::resource('playlists', PlaylistController::class);

    // Podcasts & Categories
    Route::resource('podcasts', App\Http\Controllers\Admin\PodcastController::class);
    Route::post('podcasts/{podcast}/toggle-live', [App\Http\Controllers\Admin\PodcastController::class, 'toggleLive'])->name('podcasts.toggle-live');
    Route::resource('podcast-categories', PodcastCategoryController::class);

    // Newsroom
    Route::resource('news', App\Http\Controllers\Admin\NewsController::class);
    Route::post('news/{news}/toggle-breaking', [App\Http\Controllers\Admin\NewsController::class, 'toggleBreaking'])->name('news.toggle-breaking');

    // Categories
    Route::resource('categories', App\Http\Controllers\Admin\CategoryController::class)
        ->except(['create', 'edit', 'show']);

    // Media
    Route::get('media-library/browse', [MediaController::class, 'browseMediaLibrary'])->name('media-library.browse');
    Route::post('media/upload-editor', [MediaController::class, 'uploadEditorImage'])->name('media.upload-editor');
    Route::resource('media', MediaController::class)
        ->only(['index', 'store', 'destroy']);

    // Comments
    Route::resource('comments', App\Http\Controllers\Admin\CommentController::class)
        ->only(['index', 'update', 'destroy']);
    Route::post('comments/{comment}/reply', [App\Http\Controllers\Admin\CommentController::class, 'reply'])->name('comments.reply');

    // Authors Management
    Route::resource('authors', AuthorController::class);

    // Editorial Messages / Inquiries
    Route::resource('messages', ContactMessageController::class)
        ->only(['index', 'destroy']);
    Route::post('messages/{message}/read', [ContactMessageController::class, 'markAsRead'])->name('messages.read');
    Route::post('messages/read-all', [ContactMessageController::class, 'markAllAsRead'])->name('messages.read-all');

    // Users Management
    Route::resource('users', UserController::class)
        ->except(['show', 'create', 'edit']);
    Route::post('/profile', [UserController::class, 'updateProfile'])->name('profile.update');
    Route::get('/profile', [UserController::class, 'showProfile'])->name('profile.show');

    // Security Management (Blocked IPs, Device Lockout & Activity Logs)
    Route::get('/security', [SecurityController::class, 'index'])->name('security.index');
    Route::post('/security/block-ip', [SecurityController::class, 'blockIp'])->name('security.block-ip');
    Route::delete('/security/unblock-ip/{id}', [SecurityController::class, 'unblockIp'])->name('security.unblock-ip');
    Route::post('/security/clear-logs', [SecurityController::class, 'clearLogs'])->name('security.clear-logs');

    // Settings (favicon, logo, site identity, pusher beams, instant search indexing)
    Route::get('/settings', [SettingsController::class, 'index'])->name('settings.index');
    Route::post('/settings', [SettingsController::class, 'update'])->name('settings.update');
    Route::post('/settings/test-notification', [SettingsController::class, 'testNotification'])->name('settings.test-notification');
    Route::post('/settings/instant-index', [SettingsController::class, 'instantIndex'])->name('settings.instant-index');

    // Maintenance Mode
    Route::get('/maintenance', [MaintenanceController::class, 'index'])->name('maintenance.index');
    Route::post('/maintenance', [MaintenanceController::class, 'update'])->name('maintenance.update');
    Route::post('/maintenance/toggle', [MaintenanceController::class, 'toggle'])->name('maintenance.toggle');

    // Pinned Stories (Redirected to Unified Home Sections Manager)
    Route::get('/pinned', fn () => redirect()->route('admin.home-sections.index'))->name('pinned.index');
    Route::get('/pinned/search', [HomeSectionsController::class, 'search'])->name('pinned.search');
    Route::post('/pinned', [HomeSectionsController::class, 'update'])->name('pinned.update');

    // Home Sections Manager (Control all homepage sections, categories, and blogs)
    Route::get('/home-sections', [HomeSectionsController::class, 'index'])->name('home-sections.index');
    Route::post('/home-sections', [HomeSectionsController::class, 'update'])->name('home-sections.update');
    Route::get('/home-sections/search', [HomeSectionsController::class, 'search'])->name('home-sections.search');

    // Home Ads (Sidebar & Feed Sponsor Ads)
    Route::resource('home-ads', HomeAdController::class);
    Route::post('home-ads/{homeAd}/toggle', [HomeAdController::class, 'toggleStatus'])->name('home-ads.toggle');
    Route::post('home-ads/{homeAd}/reset-stats', [HomeAdController::class, 'resetStats'])->name('home-ads.reset-stats');

    // Pop up ads (Customer Sponsored Popups)
    Route::resource('popup-ads', PopupAdController::class);
    Route::post('popup-ads/{popupAd}/toggle', [PopupAdController::class, 'toggleStatus'])->name('popup-ads.toggle');
    Route::post('popup-ads/{popupAd}/reset-stats', [PopupAdController::class, 'resetStats'])->name('popup-ads.reset-stats');
});

/* ══════════════════════════════════════════
   Public Popup Ads Analytics Tracking
══════════════════════════════════════════ */
Route::post('/api/popup-ads/{popupAd}/impression', [PopupAdTrackerController::class, 'trackImpression'])->name('popup-ads.impression');
Route::post('/api/popup-ads/{popupAd}/click', [PopupAdTrackerController::class, 'trackClick'])->name('popup-ads.click');
Route::get('/ad-click/{popupAd}', [PopupAdTrackerController::class, 'redirectClick'])->name('popup-ads.redirect');

/* ══════════════════════════════════════════
   Public Home Ads Analytics Tracking
══════════════════════════════════════════ */
Route::post('/api/home-ads/{homeAd}/impression', [HomeAdTrackerController::class, 'trackImpression'])->name('home-ads.impression');
Route::post('/api/home-ads/{homeAd}/click', [HomeAdTrackerController::class, 'trackClick'])->name('home-ads.click');
Route::get('/home-ad-click/{homeAd}', [HomeAdTrackerController::class, 'redirectClick'])->name('home-ads.redirect');
