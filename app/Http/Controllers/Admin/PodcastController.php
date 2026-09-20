<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Podcast;
use App\Models\PodcastCategory;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class PodcastController extends Controller
{
    public function index(Request $request)
    {
        $query = Podcast::with(['category', 'author']);

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('summary', 'like', "%{$search}%")
                    ->orWhere('host_name', 'like', "%{$search}%");
            });
        }

        if ($category = $request->input('category_id')) {
            $query->where('category_id', $category);
        }

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        if ($liveStatus = $request->input('live_status')) {
            $query->where('live_status', $liveStatus);
        }

        $podcasts = $query->latest('id')->paginate(15)->withQueryString();
        $categories = PodcastCategory::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Admin/Podcasts/Index', [
            'podcasts' => $podcasts,
            'categories' => $categories,
            'filters' => $request->only(['search', 'category_id', 'status', 'live_status']),
        ]);
    }

    public function create()
    {
        $categories = PodcastCategory::orderBy('sort_order')->get(['id', 'name', 'slug']);
        $staffRoles = ['Super Admin', 'Administrator', 'Editor', 'Writer', 'Author'];
        $authors = User::where(function ($q) use ($staffRoles) {
            $q->whereHas('roles', fn ($r) => $r->whereIn('name', $staffRoles))
                ->orWhereHas('profile');
        })
            ->with('profile')
            ->get()
            ->map(fn ($u) => [
                'id' => $u->id,
                'name' => $u->profile?->display_name ?: $u->name,
            ]);

        return Inertia::render('Admin/Podcasts/Create', [
            'categories' => $categories,
            'authors' => $authors,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:podcasts,slug',
            'category_id' => 'nullable|exists:podcast_categories,id',
            'author_id' => 'nullable|exists:users,id',
            'summary' => 'nullable|string|max:1000',
            'description' => 'nullable|string',
            'audio_file' => 'nullable|file|mimes:mp3,wav,m4a,aac,ogg,webm|max:102400', // max 100MB
            'audio_url' => 'nullable|string|max:1000',
            'duration_seconds' => 'nullable|integer|min:0',
            'cover_image_url' => 'nullable|string|max:1000',
            'host_name' => 'nullable|string|max:255',
            'episode_number' => 'nullable|integer|min:1',
            'season_number' => 'nullable|integer|min:1',
            'status' => 'required|in:draft,published,scheduled',
            'published_at' => 'nullable|date',
            'is_featured' => 'nullable|boolean',
            'live_status' => 'required|in:none,upcoming,live,ended',
            'live_scheduled_at' => 'nullable|date',
        ]);

        if (empty($validated['author_id'])) {
            $validated['author_id'] = Auth::id();
        }

        // Slug generation
        if (empty($validated['slug'])) {
            $base = Str::slug($validated['title']);
            $slug = $base ?: 'podcast';
            $i = 1;
            while (Podcast::where('slug', $slug)->exists()) {
                $slug = "{$base}-{$i}";
                $i++;
            }
            $validated['slug'] = $slug;
        } else {
            $validated['slug'] = Str::slug($validated['slug']);
        }

        // Audio file upload with storage efficiency
        if ($request->hasFile('audio_file')) {
            $file = $request->file('audio_file');
            $filename = time().'_'.Str::random(8).'.'.$file->getClientOriginalExtension();
            $path = 'podcasts/'.date('Y/m');
            $storedPath = $file->storeAs($path, $filename, 'public');

            $validated['audio_path'] = $storedPath;
            $validated['audio_format'] = strtolower($file->getClientOriginalExtension());
            $validated['audio_size_bytes'] = $file->getSize();
        }

        // Live stream lifecycle management
        if ($validated['live_status'] === 'live') {
            $validated['live_started_at'] = now();
        }

        if ($validated['status'] === 'published' && empty($validated['published_at'])) {
            $validated['published_at'] = now();
        }

        unset($validated['audio_file']);

        $podcast = Podcast::create($validated);

        return redirect('/ourcms/podcasts')->with('message', 'Podcast episode created successfully.');
    }

    public function edit(Podcast $podcast)
    {
        $podcast->load(['category', 'author']);
        $categories = PodcastCategory::orderBy('sort_order')->get(['id', 'name', 'slug']);
        $staffRoles = ['Super Admin', 'Administrator', 'Editor', 'Writer', 'Author'];
        $authors = User::where(function ($q) use ($staffRoles) {
            $q->whereHas('roles', fn ($r) => $r->whereIn('name', $staffRoles))
                ->orWhereHas('profile');
        })
            ->with('profile')
            ->get()
            ->map(fn ($u) => [
                'id' => $u->id,
                'name' => $u->profile?->display_name ?: $u->name,
            ]);

        return Inertia::render('Admin/Podcasts/Edit', [
            'podcast' => $podcast,
            'categories' => $categories,
            'authors' => $authors,
        ]);
    }

    public function update(Request $request, Podcast $podcast)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:podcasts,slug,'.$podcast->id,
            'category_id' => 'nullable|exists:podcast_categories,id',
            'author_id' => 'nullable|exists:users,id',
            'summary' => 'nullable|string|max:1000',
            'description' => 'nullable|string',
            'audio_file' => 'nullable|file|mimes:mp3,wav,m4a,aac,ogg,webm|max:102400',
            'audio_url' => 'nullable|string|max:1000',
            'duration_seconds' => 'nullable|integer|min:0',
            'cover_image_url' => 'nullable|string|max:1000',
            'host_name' => 'nullable|string|max:255',
            'episode_number' => 'nullable|integer|min:1',
            'season_number' => 'nullable|integer|min:1',
            'status' => 'required|in:draft,published,scheduled',
            'published_at' => 'nullable|date',
            'is_featured' => 'nullable|boolean',
            'live_status' => 'required|in:none,upcoming,live,ended',
            'live_scheduled_at' => 'nullable|date',
        ]);

        $validated['slug'] = Str::slug($validated['slug']);

        // Handle Audio file replacement (delete old audio to strictly save 20GB disk space!)
        if ($request->hasFile('audio_file')) {
            if ($podcast->audio_path && Storage::disk('public')->exists($podcast->audio_path)) {
                Storage::disk('public')->delete($podcast->audio_path);
            }

            $file = $request->file('audio_file');
            $filename = time().'_'.Str::random(8).'.'.$file->getClientOriginalExtension();
            $path = 'podcasts/'.date('Y/m');
            $storedPath = $file->storeAs($path, $filename, 'public');

            $validated['audio_path'] = $storedPath;
            $validated['audio_format'] = strtolower($file->getClientOriginalExtension());
            $validated['audio_size_bytes'] = $file->getSize();
        }

        // Live stream transition tracking
        if ($validated['live_status'] === 'live' && $podcast->live_status !== 'live') {
            $validated['live_started_at'] = now();
            $validated['live_ended_at'] = null;
        } elseif ($validated['live_status'] === 'ended' && $podcast->live_status === 'live') {
            $validated['live_ended_at'] = now();
        }

        if ($validated['status'] === 'published' && ! $podcast->published_at) {
            $validated['published_at'] = now();
        }

        unset($validated['audio_file']);

        $podcast->update($validated);

        return redirect('/ourcms/podcasts/'.$podcast->id.'/edit')->with('message', 'Podcast episode updated successfully.');
    }

    public function toggleLive(Request $request, Podcast $podcast)
    {
        $action = $request->input('action'); // 'start' or 'end'

        if ($action === 'start') {
            $podcast->update([
                'live_status' => 'live',
                'live_started_at' => now(),
                'live_ended_at' => null,
                'status' => 'published',
            ]);
            $msg = 'Podcast is now BROADCASTING LIVE on the website!';
        } else {
            $podcast->update([
                'live_status' => 'ended',
                'live_ended_at' => now(),
            ]);
            $msg = 'Live broadcast concluded. Full replay is now active on website.';
        }

        if ($request->wantsJson()) {
            return response()->json(['success' => true, 'podcast' => $podcast, 'message' => $msg]);
        }

        return back()->with('message', $msg);
    }

    public function destroy(Podcast $podcast)
    {
        // Delete audio file if stored locally (preserves disk space)
        if ($podcast->audio_path && Storage::disk('public')->exists($podcast->audio_path)) {
            Storage::disk('public')->delete($podcast->audio_path);
        }

        $podcast->delete();

        return redirect('/ourcms/podcasts')->with('message', 'Podcast episode deleted successfully.');
    }
}
