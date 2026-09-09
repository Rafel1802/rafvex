<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Admin\HomeAdController;
use App\Http\Controllers\Controller;
use App\Models\HomeAd;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

class HomeAdTrackerController extends Controller
{
    /**
     * Track impression asynchronously.
     */
    public function trackImpression($id)
    {
        $sessionKey = 'ad_imp_' . $id;
        if (session()->has($sessionKey)) {
            return response()->json(['success' => true]);
        }
        session()->put($sessionKey, now()->timestamp);

        try {
            if (Schema::hasTable('home_ads')) {
                $ad = HomeAd::find((int) $id);
                if ($ad) {
                    $ad->increment('impressions_count');
                    return response()->json(['success' => true]);
                }
            }
        } catch (\Throwable $e) {}

        // Fallback file tracking
        $all = HomeAdController::loadAllAds();
        foreach ($all as &$ad) {
            if ((int) ($ad['id'] ?? 0) === (int) $id) {
                $ad['impressions_count'] = ((int) ($ad['impressions_count'] ?? 0)) + 1;
                break;
            }
        }
        HomeAdController::saveFallbackAds($all);

        return response()->json(['success' => true]);
    }

    /**
     * Track click asynchronously.
     */
    public function trackClick($id)
    {
        try {
            if (Schema::hasTable('home_ads')) {
                $ad = HomeAd::find((int) $id);
                if ($ad) {
                    $ad->increment('clicks_count');
                    return response()->json(['success' => true]);
                }
            }
        } catch (\Throwable $e) {}

        // Fallback file tracking
        $all = HomeAdController::loadAllAds();
        foreach ($all as &$ad) {
            if ((int) ($ad['id'] ?? 0) === (int) $id) {
                $ad['clicks_count'] = ((int) ($ad['clicks_count'] ?? 0)) + 1;
                break;
            }
        }
        HomeAdController::saveFallbackAds($all);

        return response()->json(['success' => true]);
    }

    /**
     * Redirect click to sponsor URL while tracking.
     */
    public function redirectClick($id)
    {
        $targetUrl = 'https://rafvex.com';

        try {
            if (Schema::hasTable('home_ads')) {
                $ad = HomeAd::find((int) $id);
                if ($ad) {
                    $ad->increment('clicks_count');
                    if (!empty($ad->link_url)) {
                        $targetUrl = $ad->link_url;
                    }
                    return redirect()->away($targetUrl);
                }
            }
        } catch (\Throwable $e) {}

        $all = HomeAdController::loadAllAds();
        foreach ($all as &$ad) {
            if ((int) ($ad['id'] ?? 0) === (int) $id) {
                $ad['clicks_count'] = ((int) ($ad['clicks_count'] ?? 0)) + 1;
                if (!empty($ad['link_url'])) {
                    $targetUrl = $ad['link_url'];
                }
                break;
            }
        }
        HomeAdController::saveFallbackAds($all);

        return redirect()->away($targetUrl);
    }
}
