<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuthorProfile;
use App\Models\Setting;
use App\Models\User;
use App\Services\PusherBeamsService;
use App\Services\SearchIndexingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class SettingsController extends Controller
{
    private array $settingKeys = [
        'site_name', 'site_tagline', 'site_description',
        'favicon', 'logo', 'og_default_image', 'login_bg_image', 'founder_avatar',
        'twitter_handle', 'facebook_url', 'telegram_url', 'linkedin_url',
        'youtube_url', 'instagram_url', 'github_url',
        'contact_email', 'contact_phone', 'contact_address',
        'founder_name', 'founder_title', 'founder_bio',
        'footer_text', 'analytics_id',
        'pusher_beams_instance_id', 'pusher_beams_secret_key',
    ];

    public function index()
    {
        $settings = Setting::whereIn('key', $this->settingKeys)
            ->get()
            ->pluck('value', 'key')
            ->toArray();

        $user = Auth::user();

        $indexingService = app(SearchIndexingService::class);
        $totalIndexableUrls = count($indexingService->getAllPublishedUrls());
        $indexNowKey = $indexingService->getOrCreateIndexNowKey();

        return Inertia::render('Admin/Settings/Index', [
            'settings' => $settings,
            'google_status' => [
                'linked' => ! empty($user->google_id),
                'email' => $user->google_email ?? null,
                'avatar' => $user->google_avatar ?? null,
                'linked_at' => $user->google_linked_at ? $user->google_linked_at->toDateString() : null,
            ],
            'indexing_stats' => [
                'total_urls' => $totalIndexableUrls,
                'key' => $indexNowKey,
                'key_url' => url('/'.$indexNowKey.'.txt'),
            ],
        ]);
    }

    public function update(Request $request)
    {
        $fileKeys = ['favicon', 'logo', 'og_default_image', 'login_bg_image', 'founder_avatar'];
        $data = $request->except(array_merge(['_token', '_method'], $fileKeys));

        foreach ($fileKeys as $fileKey) {
            if ($request->hasFile($fileKey)) {
                $file = $request->file($fileKey);
                $allowed = ['jpg', 'jpeg', 'png', 'gif', 'ico', 'webp', 'svg'];
                if (! in_array(strtolower($file->getClientOriginalExtension()), $allowed)) {
                    return back()->withErrors([$fileKey => 'Invalid file type.']);
                }
                if ($file->getSize() > 5 * 1024 * 1024) {
                    return back()->withErrors([$fileKey => 'File too large. Max 5MB.']);
                }
                $path = $file->store("settings/$fileKey", 'public');
                if ($fileKey === 'logo') {
                    $this->trimImageTransparency($path);
                } elseif ($fileKey === 'favicon') {
                    $this->syncPublicFavicons($path);
                }
                $data[$fileKey] = Storage::url($path);
            }
        }

        foreach ($data as $key => $value) {
            if (in_array($key, $this->settingKeys)) {
                Setting::updateOrCreate(
                    ['key' => $key],
                    ['value' => $value, 'group' => 'general', 'label' => ucwords(str_replace('_', ' ', $key))]
                );
            }
        }

        // Sync primary author profile with founder settings if provided
        $authorUpdates = [];
        if (! empty($data['founder_name'])) {
            User::whereIn('name', ['Rafvex', 'Admin User', 'admin'])->update(['name' => $data['founder_name']]);
            $authorUpdates['display_name'] = $data['founder_name'];
        }
        if (isset($data['founder_bio'])) {
            $authorUpdates['bio'] = $data['founder_bio'];
        }
        if (! empty($data['founder_avatar'])) {
            $authorUpdates['avatar'] = $data['founder_avatar'];
            $primaryUser = User::first();
            if ($primaryUser && Schema::hasColumn('users', 'avatar')) {
                $primaryUser->update(['avatar' => $data['founder_avatar']]);
            }
        }
        if (! empty($authorUpdates)) {
            $primaryUser = User::first();
            if ($primaryUser) {
                AuthorProfile::updateOrCreate(
                    ['user_id' => $primaryUser->id],
                    $authorUpdates
                );
            }
        }

        cache()->forget('site_settings');

        return back()->with('message', 'Settings saved successfully.');
    }

    /**
     * Send a test push notification via Pusher Beams
     */
    public function testNotification(Request $request)
    {
        $res = PusherBeamsService::notifyImportantActivity(
            'Test Notification',
            'Your Pusher Beams real-time notifications are working on Rafvex!',
            url('/ourcms/settings')
        );

        return response()->json([
            'success' => $res,
            'message' => $res
                ? 'Test notification published to device interests [hello, admin]!'
                : 'Secret key not configured or Pusher rejected. Please check your Pusher Beams Secret Key.',
        ]);
    }

    /**
     * Crop away excessive transparent whitespace around uploaded logo images
     */
    private function trimImageTransparency(string $relativePath): void
    {
        try {
            $fullPath = Storage::disk('public')->path($relativePath);
            if (! file_exists($fullPath)) {
                return;
            }

            $ext = strtolower(pathinfo($fullPath, PATHINFO_EXTENSION));
            if ($ext !== 'png' && $ext !== 'webp') {
                return;
            }

            $im = $ext === 'png' ? @imagecreatefrompng($fullPath) : @imagecreatefromwebp($fullPath);
            if (! $im) {
                return;
            }

            imagealphablending($im, false);
            imagesavealpha($im, true);
            $w = imagesx($im);
            $h = imagesy($im);
            $minX = $w;
            $maxX = 0;
            $minY = $h;
            $maxY = 0;

            for ($y = 0; $y < $h; $y++) {
                for ($x = 0; $x < $w; $x++) {
                    $rgba = imagecolorat($im, $x, $y);
                    $alpha = ($rgba >> 24) & 0x7F;
                    if ($alpha < 125) {
                        if ($x < $minX) {
                            $minX = $x;
                        }
                        if ($x > $maxX) {
                            $maxX = $x;
                        }
                        if ($y < $minY) {
                            $minY = $y;
                        }
                        if ($y > $maxY) {
                            $maxY = $y;
                        }
                    }
                }
            }

            if ($maxX >= $minX && $maxY >= $minY) {
                $pad = 10;
                $cropX = max(0, $minX - $pad);
                $cropY = max(0, $minY - $pad);
                $cropW = min($w - $cropX, ($maxX - $minX + 1) + ($pad * 2));
                $cropH = min($h - $cropY, ($maxY - $minY + 1) + ($pad * 2));
                $cropped = imagecrop($im, ['x' => $cropX, 'y' => $cropY, 'width' => $cropW, 'height' => $cropH]);
                if ($cropped) {
                    imagealphablending($cropped, false);
                    imagesavealpha($cropped, true);
                    if ($ext === 'png') {
                        imagepng($cropped, $fullPath);
                    } else {
                        imagewebp($cropped, $fullPath);
                    }
                    imagedestroy($cropped);
                }
            }
            imagedestroy($im);
        } catch (\Throwable $e) {
            // Silently failover to original image if GD crop encounters issue
        }
    }

    /**
     * Synchronize and generate all standard Google Search & browser favicons in public directory
     */
    private function syncPublicFavicons(string $relativePath): void
    {
        try {
            $fullPath = Storage::disk('public')->path($relativePath);
            if (! file_exists($fullPath)) {
                return;
            }

            $ext = strtolower(pathinfo($fullPath, PATHINFO_EXTENSION));
            $src = null;
            if ($ext === 'png') {
                $src = @imagecreatefrompng($fullPath);
            } elseif ($ext === 'webp') {
                $src = @imagecreatefromwebp($fullPath);
            } elseif ($ext === 'jpg' || $ext === 'jpeg') {
                $src = @imagecreatefromjpeg($fullPath);
            }

            if (! $src) {
                return;
            }

            $srcW = imagesx($src);
            $srcH = imagesy($src);

            $resizePng = function ($w, $h, $destPath) use ($src, $srcW, $srcH) {
                $dest = imagecreatetruecolor($w, $h);
                imagealphablending($dest, false);
                imagesavealpha($dest, true);
                $transparent = imagecolorallocatealpha($dest, 0, 0, 0, 127);
                imagefilledrectangle($dest, 0, 0, $w, $h, $transparent);
                imagecopyresampled($dest, $src, 0, 0, 0, 0, $w, $h, $srcW, $srcH);
                imagepng($dest, $destPath, 9);
            };

            $getPngData = function ($w, $h) use ($src, $srcW, $srcH) {
                $dest = imagecreatetruecolor($w, $h);
                imagealphablending($dest, false);
                imagesavealpha($dest, true);
                $transparent = imagecolorallocatealpha($dest, 0, 0, 0, 127);
                imagefilledrectangle($dest, 0, 0, $w, $h, $transparent);
                imagecopyresampled($dest, $src, 0, 0, 0, 0, $w, $h, $srcW, $srcH);
                ob_start();
                imagepng($dest, null, 9);

                return ob_get_clean();
            };

            // 1. Generate all standard PNG sizes
            $sizes = [
                public_path('favicon-16x16.png') => 16,
                public_path('favicon-32x32.png') => 32,
                public_path('favicon-48x48.png') => 48,
                public_path('favicon-96x96.png') => 96,
                public_path('favicon-144x144.png') => 144,
                public_path('apple-touch-icon.png') => 180,
                public_path('android-chrome-192x192.png') => 192,
                public_path('android-chrome-512x512.png') => 512,
                public_path('favicon.png') => 512,
            ];

            foreach ($sizes as $path => $size) {
                $resizePng($size, $size, $path);
            }

            // 2. Generate multi-resolution valid Windows ICO (16x16, 32x32, 48x48)
            $icoData = [
                48 => $getPngData(48, 48),
                32 => $getPngData(32, 32),
                16 => $getPngData(16, 16),
            ];
            $count = count($icoData);
            $header = pack('vvv', 0, 1, $count);
            $entries = '';
            $data = '';
            $offset = 6 + ($count * 16);

            foreach ($icoData as $size => $pngBytes) {
                $w = $size >= 256 ? 0 : $size;
                $h = $size >= 256 ? 0 : $size;
                $len = strlen($pngBytes);
                $entries .= pack('CCCCvvVV', $w, $h, 0, 0, 1, 32, $len, $offset);
                $data .= $pngBytes;
                $offset += $len;
            }
            file_put_contents(public_path('favicon.ico'), $header.$entries.$data);

            // Clean up legacy pseudo-SVG if present
            if (file_exists(public_path('favicon.svg'))) {
                @unlink(public_path('favicon.svg'));
            }
        } catch (\Throwable $e) {
            // Silently failover
        }
    }

    /**
     * Trigger instant indexing across all search engines (IndexNow, Bing, Google, Yahoo).
     */
    public function instantIndex(SearchIndexingService $service)
    {
        $result = $service->submitAll();

        return response()->json([
            'success' => $result['success'],
            'total_urls' => $result['total_urls'],
            'submitted_count' => $result['submitted_count'],
            'message' => $result['message'],
            'key' => $result['key'],
        ]);
    }
}
