<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Podcast;
use App\Models\PodcastCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PodcastController extends Controller
{
    public function index(Request $request)
    {
        // 1. Active live broadcast (if any)
        $livePodcast = Podcast::published()
            ->where('live_status', 'live')
            ->with(['category', 'author.profile'])
            ->latest('live_started_at')
            ->first();

        // 2. Featured podcast (if live exists, prioritize live; otherwise featured or latest)
        $featuredPodcast = $livePodcast;
        if (! $featuredPodcast) {
            $featuredPodcast = Podcast::published()
                ->where('is_featured', true)
                ->with(['category', 'author.profile'])
                ->latest('published_at')
                ->first();
        }
        if (! $featuredPodcast) {
            $featuredPodcast = Podcast::published()
                ->with(['category', 'author.profile'])
                ->latest('published_at')
                ->first();
        }

        // 3. Each category with exactly top 5 podcast episodes
        $categories = PodcastCategory::where('is_active', true)
            ->with(['podcasts' => function ($q) {
                $q->published()
                    ->with(['category', 'author.profile'])
                    ->latest('published_at')
                    ->latest('id')
                    ->take(5);
            }])
            ->orderBy('sort_order', 'asc')
            ->get();

        // 4. Latest recent episodes overall
        $recentPodcasts = Podcast::published()
            ->with(['category', 'author.profile'])
            ->latest('published_at')
            ->latest('id')
            ->take(8)
            ->get();

        return Inertia::render('Public/Podcasts/Index', [
            'livePodcast' => $livePodcast,
            'featuredPodcast' => $featuredPodcast,
            'categories' => $categories,
            'recentPodcasts' => $recentPodcasts,
        ]);
    }

    public function show($slug)
    {
        $podcast = Podcast::published()
            ->where('slug', $slug)
            ->with(['category', 'author.profile'])
            ->firstOrFail();

        // Increment view count with session deduplication
        $sessionKey = 'viewed_podcast_'.$podcast->id;
        if (! session()->has($sessionKey)) {
            $podcast->increment('views_count');
            session()->put($sessionKey, now()->timestamp);
        }

        // Related episodes in the same category
        $relatedPodcasts = Podcast::published()
            ->where('id', '!=', $podcast->id)
            ->when($podcast->category_id, fn ($q) => $q->where('category_id', $podcast->category_id))
            ->with(['category', 'author.profile'])
            ->latest('published_at')
            ->take(5)
            ->get();

        // Check if there is an active live stream happening now across the station
        $stationLive = Podcast::published()
            ->where('live_status', 'live')
            ->where('id', '!=', $podcast->id)
            ->first();

        return Inertia::render('Public/Podcasts/Show', [
            'podcast' => $podcast,
            'relatedPodcasts' => $relatedPodcasts,
            'stationLive' => $stationLive,
        ]);
    }

    public function trackPlay(Podcast $podcast)
    {
        $podcast->increment('plays_count');

        return response()->json(['success' => true, 'plays_count' => $podcast->plays_count]);
    }
}
