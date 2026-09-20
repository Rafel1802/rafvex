<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\PopupAd;

class PopupAdTrackerController extends Controller
{
    public function trackImpression(PopupAd $popupAd)
    {
        $sessionKey = 'popup_imp_'.$popupAd->id;
        if (! session()->has($sessionKey)) {
            $popupAd->timestamps = false;
            $popupAd->increment('impressions_count');
            session()->put($sessionKey, now()->timestamp);
        }

        return response()->json([
            'success' => true,
            'impressions' => $popupAd->impressions_count,
        ]);
    }

    public function trackClick(PopupAd $popupAd)
    {
        $popupAd->timestamps = false;
        $popupAd->increment('clicks_count');

        return response()->json([
            'success' => true,
            'clicks' => $popupAd->clicks_count,
        ]);
    }

    public function redirectClick(PopupAd $popupAd)
    {
        $popupAd->timestamps = false;
        $popupAd->increment('clicks_count');

        $targetUrl = $popupAd->button_url ?: url('/');

        return redirect()->away($targetUrl);
    }
}
