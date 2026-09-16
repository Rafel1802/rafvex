<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Playlist;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PlaylistController extends Controller
{
    public function index(Request $request)
    {
        $playlists = Playlist::withCount('articles')->latest()->get();

        if ($request->wantsJson()) {
            return response()->json($playlists);
        }

        return \Inertia\Inertia::render('Admin/Playlists/Index', [
            'playlists' => $playlists,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'cover_image_url' => 'nullable|string|max:1000',
        ]);

        $baseSlug = Str::slug($validated['title']);
        $slug = $baseSlug ?: 'playlist';
        $i = 1;
        while (Playlist::where('slug', $slug)->exists()) {
            $slug = "{$baseSlug}-{$i}";
            $i++;
        }
        $validated['slug'] = $slug;

        $playlist = Playlist::create($validated);

        if ($request->wantsJson() || $request->ajax()) {
            return response()->json([
                'success' => true,
                'playlist' => $playlist,
                'message' => 'Playlist created successfully.',
            ]);
        }

        return back()->with('message', 'Playlist created successfully.');
    }

    public function update(Request $request, Playlist $playlist)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'cover_image_url' => 'nullable|string|max:1000',
        ]);

        $playlist->update($validated);

        if ($request->wantsJson()) {
            return response()->json(['success' => true, 'playlist' => $playlist]);
        }

        return back()->with('message', 'Playlist updated successfully.');
    }

    public function destroy(Playlist $playlist)
    {
        $playlist->delete();

        return back()->with('message', 'Playlist deleted successfully.');
    }
}
