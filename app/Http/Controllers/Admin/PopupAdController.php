<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PopupAd;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class PopupAdController extends Controller
{
    public function index()
    {
        $ads = PopupAd::latest()->get();

        $stats = [
            'total_ads' => $ads->count(),
            'active_ads' => $ads->where('is_currently_running', true)->count(),
            'total_impressions' => (int) $ads->sum('impressions_count'),
            'total_clicks' => (int) $ads->sum('clicks_count'),
            'average_ctr' => $ads->sum('impressions_count') > 0
                ? round(($ads->sum('clicks_count') / $ads->sum('impressions_count')) * 100, 1)
                : 0.0,
        ];

        return Inertia::render('Admin/PopupAds/Index', [
            'ads' => $ads,
            'stats' => $stats,
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/PopupAds/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'subtitle' => 'nullable|string|max:1000',
            'sponsor_name' => 'nullable|string|max:255',
            'media_type' => 'required|in:image,video,gif',
            'media_file' => 'nullable|file|max:51200', // max 50MB
            'media_url' => 'nullable|string|max:2000',
            'video_url' => 'nullable|string|max:2000',
            'aspect_ratio' => 'required|in:auto,landscape,portrait,square',
            'button_text' => 'nullable|string|max:100',
            'button_url' => 'nullable|string|max:2000',
            'button_color' => 'nullable|string|max:50',
            'is_active' => 'boolean',
            'delay_seconds' => 'integer|min:0|max:60',
            'show_on_pages' => 'required|in:all,home,articles',
            'show_frequency' => 'required|in:once_per_session,always,once_per_day',
            'start_at' => 'nullable|date',
            'end_at' => 'nullable|date|after_or_equal:start_at',
            'notes' => 'nullable|string|max:2000',
        ]);

        $mediaPath = $validated['media_url'] ?? null;

        if ($request->hasFile('media_file')) {
            $file = $request->file('media_file');
            $filename = time().'_'.Str::slug($validated['title']).'.'.$file->getClientOriginalExtension();
            $path = $file->storeAs('popup-ads', $filename, 'public');
            $mediaPath = Storage::url($path);
        }

        PopupAd::create([
            'title' => $validated['title'],
            'subtitle' => $validated['subtitle'] ?? null,
            'sponsor_name' => $validated['sponsor_name'] ?? null,
            'media_type' => $validated['media_type'],
            'media_url' => $mediaPath,
            'video_url' => $validated['video_url'] ?? null,
            'aspect_ratio' => $validated['aspect_ratio'] ?? 'auto',
            'button_text' => $validated['button_text'] ?? 'Visit Sponsor',
            'button_url' => $validated['button_url'] ?? null,
            'button_color' => $validated['button_color'] ?? '#dc2626',
            'is_active' => $request->boolean('is_active', true),
            'delay_seconds' => $validated['delay_seconds'] ?? 3,
            'show_on_pages' => $validated['show_on_pages'] ?? 'all',
            'show_frequency' => $validated['show_frequency'] ?? 'once_per_session',
            'start_at' => $validated['start_at'] ?? null,
            'end_at' => $validated['end_at'] ?? null,
            'impressions_count' => 0,
            'clicks_count' => 0,
            'notes' => $validated['notes'] ?? null,
        ]);

        return redirect()->route('admin.popup-ads.index')
            ->with('success', 'Sponsored Pop up ad created successfully!');
    }

    public function edit(PopupAd $popupAd)
    {
        return Inertia::render('Admin/PopupAds/Edit', [
            'popupAd' => $popupAd,
        ]);
    }

    public function update(Request $request, PopupAd $popupAd)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'subtitle' => 'nullable|string|max:1000',
            'sponsor_name' => 'nullable|string|max:255',
            'media_type' => 'required|in:image,video,gif',
            'media_file' => 'nullable|file|max:51200', // max 50MB
            'media_url' => 'nullable|string|max:2000',
            'video_url' => 'nullable|string|max:2000',
            'aspect_ratio' => 'required|in:auto,landscape,portrait,square',
            'button_text' => 'nullable|string|max:100',
            'button_url' => 'nullable|string|max:2000',
            'button_color' => 'nullable|string|max:50',
            'is_active' => 'boolean',
            'delay_seconds' => 'integer|min:0|max:60',
            'show_on_pages' => 'required|in:all,home,articles',
            'show_frequency' => 'required|in:once_per_session,always,once_per_day',
            'start_at' => 'nullable|date',
            'end_at' => 'nullable|date|after_or_equal:start_at',
            'notes' => 'nullable|string|max:2000',
        ]);

        $mediaPath = $validated['media_url'] ?? $popupAd->media_url;

        if ($request->hasFile('media_file')) {
            // Remove old uploaded media if local
            if ($popupAd->media_url && str_contains($popupAd->media_url, '/storage/popup-ads/')) {
                $oldPath = str_replace('/storage/', '', $popupAd->media_url);
                Storage::disk('public')->delete($oldPath);
            }

            $file = $request->file('media_file');
            $filename = time().'_'.Str::slug($validated['title']).'.'.$file->getClientOriginalExtension();
            $path = $file->storeAs('popup-ads', $filename, 'public');
            $mediaPath = Storage::url($path);
        }

        $popupAd->update([
            'title' => $validated['title'],
            'subtitle' => $validated['subtitle'] ?? null,
            'sponsor_name' => $validated['sponsor_name'] ?? null,
            'media_type' => $validated['media_type'],
            'media_url' => $mediaPath,
            'video_url' => $validated['video_url'] ?? null,
            'aspect_ratio' => $validated['aspect_ratio'] ?? 'auto',
            'button_text' => $validated['button_text'] ?? 'Visit Sponsor',
            'button_url' => $validated['button_url'] ?? null,
            'button_color' => $validated['button_color'] ?? '#dc2626',
            'is_active' => $request->boolean('is_active', true),
            'delay_seconds' => $validated['delay_seconds'] ?? 3,
            'show_on_pages' => $validated['show_on_pages'] ?? 'all',
            'show_frequency' => $validated['show_frequency'] ?? 'once_per_session',
            'start_at' => $validated['start_at'] ?? null,
            'end_at' => $validated['end_at'] ?? null,
            'notes' => $validated['notes'] ?? null,
        ]);

        return redirect()->route('admin.popup-ads.index')
            ->with('success', 'Sponsored Pop up ad updated successfully!');
    }

    public function destroy(PopupAd $popupAd)
    {
        if ($popupAd->media_url && str_contains($popupAd->media_url, '/storage/popup-ads/')) {
            $oldPath = str_replace('/storage/', '', $popupAd->media_url);
            Storage::disk('public')->delete($oldPath);
        }

        $popupAd->delete();

        return redirect()->route('admin.popup-ads.index')
            ->with('success', 'Pop up ad removed successfully.');
    }

    public function toggleStatus(PopupAd $popupAd)
    {
        $popupAd->is_active = ! $popupAd->is_active;
        $popupAd->save();

        $status = $popupAd->is_active ? 'activated (ON)' : 'paused (OFF)';

        return back()->with('success', "Pop up ad has been {$status}.");
    }

    public function resetStats(PopupAd $popupAd)
    {
        $popupAd->impressions_count = 0;
        $popupAd->clicks_count = 0;
        $popupAd->save();

        return back()->with('success', "Analytics stats for '{$popupAd->title}' have been reset.");
    }
}
