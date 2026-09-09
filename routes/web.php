<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\Public\HomeController;
use App\Http\Controllers\Public\ArticleController;
use App\Http\Controllers\Public\CategoryController;
use App\Http\Controllers\Public\ContactController;
use App\Http\Controllers\Public\SearchController;
use App\Http\Controllers\Public\SitemapController;
use Illuminate\Support\Facades\Route;

/* ══════════════════════════════════════════
   Media Library Direct Image Route
   Serves https://rafvex.com/blog/{path} from public/medialibrary/blog/{path}
══════════════════════════════════════════ */
Route::get('/blog/{path}', function ($path) {
    if (str_contains($path, '..')) {
        abort(404);
    }
    $filePath = public_path('medialibrary/blog/' . $path);
    if (!file_exists($filePath) || !is_file($filePath)) {
        abort(404);
    }
    $mimeType = mime_content_type($filePath) ?: 'application/octet-stream';
    return response()->file($filePath, [
        'Content-Type' => $mimeType,
        'Cache-Control' => 'public, max-age=31536000, immutable',
    ]);
})->where('path', '.*')->withoutMiddleware('web')->name('media.blog.file');

/* ══════════════════════════════════════════
   Public Routes (with maintenance check)
══════════════════════════════════════════ */
Route::middleware([\App\Http\Middleware\CheckMaintenance::class])->group(function () {
    Route::get('/', [HomeController::class, 'index'])->name('home');
    Route::get('/article/{slug}', [ArticleController::class, 'show'])->name('article.show');
    Route::get('/articles/{slug}', fn($slug) => redirect()->route('article.show', ['slug' => $slug], 301));
    Route::get('/articles', fn() => redirect()->route('home', [], 301));
    Route::post('/article/{article}/comments', [\App\Http\Controllers\Public\CommentController::class, 'store'])->name('article.comment.store');
    Route::get('/category/{slug}', [CategoryController::class, 'show'])->name('category.show');
    Route::get('/popular', [\App\Http\Controllers\Public\PopularController::class, 'index'])->name('popular.index');
    Route::get('/news', [\App\Http\Controllers\Public\NewsController::class, 'index'])->name('news.index');
    Route::get('/news/{slug}', [\App\Http\Controllers\Public\NewsController::class, 'show'])->name('news.show');
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
        $adsTxt = \App\Models\Setting::where('key', 'ads_txt')->value('value');
        if (empty($adsTxt) && file_exists(public_path('ads.txt'))) {
            $adsTxt = file_get_contents(public_path('ads.txt'));
        }
        return response($adsTxt ?: "# Google AdSense configuration for rafvex.com\n# google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0\n", 200, [
            'Content-Type' => 'text/plain',
        ]);
    })->name('ads.txt');
    Route::get('/terms-of-service', function () { return Inertia\Inertia::render('Public/Terms'); })->name('terms');
    Route::get('/privacy-policy', function () { return Inertia\Inertia::render('Public/Privacy'); })->name('privacy');
    Route::get('/about', function () { return Inertia\Inertia::render('Public/About'); })->name('about');
    Route::get('/contact', [ContactController::class, 'index'])->name('contact');
    Route::post('/contact', [ContactController::class, 'store'])->name('contact.store');

    // Member Authentication Routes
    Route::post('/auth/register', [\App\Http\Controllers\Public\AuthController::class, 'register'])->name('public.register');
    Route::post('/auth/login', [\App\Http\Controllers\Public\AuthController::class, 'login'])->name('public.login');
    Route::post('/auth/google', [\App\Http\Controllers\Public\AuthController::class, 'googleLogin'])->name('public.google');
    Route::post('/auth/logout', [\App\Http\Controllers\Public\AuthController::class, 'logout'])->name('public.logout');

    // User Interactions (Favorites & Read History)
    Route::post('/api/articles/{article}/favorite', [\App\Http\Controllers\Public\UserInteractionController::class, 'toggleFavorite'])->name('article.favorite');
    Route::post('/api/articles/{article}/read', [\App\Http\Controllers\Public\UserInteractionController::class, 'recordRead'])->name('article.read');
    Route::get('/api/user/interactions', [\App\Http\Controllers\Public\UserInteractionController::class, 'getUserInteractions'])->name('user.interactions');

    // In-App Real-Time Notifications
    Route::get('/api/notifications', [\App\Http\Controllers\Public\NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/api/notifications/{notification}/read', [\App\Http\Controllers\Public\NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::post('/api/notifications/read-all', [\App\Http\Controllers\Public\NotificationController::class, 'markAllAsRead'])->name('notifications.read-all');

    // Member Profile & Dashboard (Auth Protected)
    Route::middleware(['auth'])->group(function () {
        Route::get('/my/profile', [\App\Http\Controllers\Public\ProfileController::class, 'index'])->name('profile.index');
        Route::post('/my/profile', [\App\Http\Controllers\Public\ProfileController::class, 'update'])->name('profile.update');
        Route::post('/my/profile/password', [\App\Http\Controllers\Public\ProfileController::class, 'updatePassword'])->name('profile.password');
        Route::delete('/my/profile/history', [\App\Http\Controllers\Public\ProfileController::class, 'clearReadingHistory'])->name('profile.history.clear');
        Route::delete('/my/profile/history/{article}', [\App\Http\Controllers\Public\ProfileController::class, 'removeHistoryItem'])->name('profile.history.item');
    });
});

/* ══════════════════════════════════════════
   Auth Routes (Login & Authentication)
══════════════════════════════════════════ */
Route::get('/ourcms', [AuthController::class, 'showLoginForm'])->name('login');
Route::get('/ourcms/login', [AuthController::class, 'showLoginForm']);
Route::post('/ourcms/login', [AuthController::class, 'login'])->name('ourcms.login.post');
Route::post('/ourcms/auth/google/login', [\App\Http\Controllers\Admin\GoogleAuthController::class, 'loginWithGoogle'])->name('ourcms.google.login');

// Legacy & convenience redirects
Route::get('/login', fn() => redirect('/ourcms'));
Route::get('/dashboard', fn() => redirect()->route('admin.dashboard'));

/* ══════════════════════════════════════════
   CMS Routes (Authenticated Staff Only)
══════════════════════════════════════════ */
Route::middleware(['auth', 'active', \App\Http\Middleware\EnsureStaff::class])->prefix('ourcms')->name('admin.')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    // Google SSO Account Linking
    Route::post('/auth/google/connect', [\App\Http\Controllers\Admin\GoogleAuthController::class, 'connectGoogle'])->name('google.connect');
    Route::post('/auth/google/disconnect', [\App\Http\Controllers\Admin\GoogleAuthController::class, 'disconnectGoogle'])->name('google.disconnect');

    // Dashboard
    Route::get('/dashboard', [\App\Http\Controllers\Admin\DashboardController::class, 'index'])->name('dashboard');

    // Customers Management
    Route::resource('customers', \App\Http\Controllers\Admin\CustomerController::class)->only(['index', 'show', 'update', 'destroy']);
    Route::post('customers/{customer}/toggle', [\App\Http\Controllers\Admin\CustomerController::class, 'toggleStatus'])->name('customers.toggle');

    // Articles
    Route::resource('articles', \App\Http\Controllers\Admin\ArticleController::class);

    // Newsroom
    Route::resource('news', \App\Http\Controllers\Admin\NewsController::class);
    Route::post('news/{news}/toggle-breaking', [\App\Http\Controllers\Admin\NewsController::class, 'toggleBreaking'])->name('news.toggle-breaking');

    // Categories
    Route::resource('categories', \App\Http\Controllers\Admin\CategoryController::class)
        ->except(['create', 'edit', 'show']);

    // Media
    Route::resource('media', \App\Http\Controllers\Admin\MediaController::class)
        ->only(['index', 'store', 'destroy']);

    // Comments
    Route::resource('comments', \App\Http\Controllers\Admin\CommentController::class)
        ->only(['index', 'update', 'destroy']);
    Route::post('comments/{comment}/reply', [\App\Http\Controllers\Admin\CommentController::class, 'reply'])->name('comments.reply');

    // Authors Management
    Route::resource('authors', \App\Http\Controllers\Admin\AuthorController::class);

    // Editorial Messages / Inquiries
    Route::resource('messages', \App\Http\Controllers\Admin\ContactMessageController::class)
        ->only(['index', 'destroy']);
    Route::post('messages/{message}/read', [\App\Http\Controllers\Admin\ContactMessageController::class, 'markAsRead'])->name('messages.read');
    Route::post('messages/read-all', [\App\Http\Controllers\Admin\ContactMessageController::class, 'markAllAsRead'])->name('messages.read-all');

    // Users Management
    Route::resource('users', \App\Http\Controllers\Admin\UserController::class)
        ->except(['show', 'create', 'edit']);
    Route::post('/profile', [\App\Http\Controllers\Admin\UserController::class, 'updateProfile'])->name('profile.update');
    Route::get('/profile', [\App\Http\Controllers\Admin\UserController::class, 'showProfile'])->name('profile.show');


    // Security Management (Blocked IPs, Device Lockout & Activity Logs)
    Route::get('/security', [\App\Http\Controllers\Admin\SecurityController::class, 'index'])->name('security.index');
    Route::post('/security/block-ip', [\App\Http\Controllers\Admin\SecurityController::class, 'blockIp'])->name('security.block-ip');
    Route::delete('/security/unblock-ip/{id}', [\App\Http\Controllers\Admin\SecurityController::class, 'unblockIp'])->name('security.unblock-ip');
    Route::post('/security/clear-logs', [\App\Http\Controllers\Admin\SecurityController::class, 'clearLogs'])->name('security.clear-logs');

    // Settings (favicon, logo, site identity, pusher beams)
    Route::get('/settings', [\App\Http\Controllers\Admin\SettingsController::class, 'index'])->name('settings.index');
    Route::post('/settings', [\App\Http\Controllers\Admin\SettingsController::class, 'update'])->name('settings.update');
    Route::post('/settings/test-notification', [\App\Http\Controllers\Admin\SettingsController::class, 'testNotification'])->name('settings.test-notification');

    // Maintenance Mode
    Route::get('/maintenance', [\App\Http\Controllers\Admin\MaintenanceController::class, 'index'])->name('maintenance.index');
    Route::post('/maintenance', [\App\Http\Controllers\Admin\MaintenanceController::class, 'update'])->name('maintenance.update');
    Route::post('/maintenance/toggle', [\App\Http\Controllers\Admin\MaintenanceController::class, 'toggle'])->name('maintenance.toggle');

    // Pinned Stories (Top Featured & Trending)
    Route::get('/pinned', [\App\Http\Controllers\Admin\PinnedStoriesController::class, 'index'])->name('pinned.index');
    Route::get('/pinned/search', [\App\Http\Controllers\Admin\PinnedStoriesController::class, 'search'])->name('pinned.search');
    Route::post('/pinned', [\App\Http\Controllers\Admin\PinnedStoriesController::class, 'update'])->name('pinned.update');

    // Home Sections Manager (Control all homepage sections, categories, and blogs)
    Route::get('/home-sections', [\App\Http\Controllers\Admin\HomeSectionsController::class, 'index'])->name('home-sections.index');
    Route::post('/home-sections', [\App\Http\Controllers\Admin\HomeSectionsController::class, 'update'])->name('home-sections.update');
    Route::get('/home-sections/search', [\App\Http\Controllers\Admin\HomeSectionsController::class, 'search'])->name('home-sections.search');

    // Home Ads (Sidebar & Feed Sponsor Ads)
    Route::resource('home-ads', \App\Http\Controllers\Admin\HomeAdController::class);
    Route::post('home-ads/{homeAd}/toggle', [\App\Http\Controllers\Admin\HomeAdController::class, 'toggleStatus'])->name('home-ads.toggle');
    Route::post('home-ads/{homeAd}/reset-stats', [\App\Http\Controllers\Admin\HomeAdController::class, 'resetStats'])->name('home-ads.reset-stats');

    // Pop up ads (Customer Sponsored Popups)
    Route::resource('popup-ads', \App\Http\Controllers\Admin\PopupAdController::class);
    Route::post('popup-ads/{popupAd}/toggle', [\App\Http\Controllers\Admin\PopupAdController::class, 'toggleStatus'])->name('popup-ads.toggle');
    Route::post('popup-ads/{popupAd}/reset-stats', [\App\Http\Controllers\Admin\PopupAdController::class, 'resetStats'])->name('popup-ads.reset-stats');
});

/* ══════════════════════════════════════════
   Public Popup Ads Analytics Tracking
══════════════════════════════════════════ */
Route::post('/api/popup-ads/{popupAd}/impression', [\App\Http\Controllers\Public\PopupAdTrackerController::class, 'trackImpression'])->name('popup-ads.impression');
Route::post('/api/popup-ads/{popupAd}/click', [\App\Http\Controllers\Public\PopupAdTrackerController::class, 'trackClick'])->name('popup-ads.click');
Route::get('/ad-click/{popupAd}', [\App\Http\Controllers\Public\PopupAdTrackerController::class, 'redirectClick'])->name('popup-ads.redirect');

/* ══════════════════════════════════════════
   Public Home Ads Analytics Tracking
══════════════════════════════════════════ */
Route::post('/api/home-ads/{homeAd}/impression', [\App\Http\Controllers\Public\HomeAdTrackerController::class, 'trackImpression'])->name('home-ads.impression');
Route::post('/api/home-ads/{homeAd}/click', [\App\Http\Controllers\Public\HomeAdTrackerController::class, 'trackClick'])->name('home-ads.click');
Route::get('/home-ad-click/{homeAd}', [\App\Http\Controllers\Public\HomeAdTrackerController::class, 'redirectClick'])->name('home-ads.redirect');



