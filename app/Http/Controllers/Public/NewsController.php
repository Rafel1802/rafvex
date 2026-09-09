<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\News;
use Inertia\Inertia;

class NewsController extends Controller
{
    public function index()
    {
        // 1. Breaking News Ticker
        $breakingNews = News::published()
            ->breaking()
            ->latest('published_at')
            ->take(5)
            ->get();

        // 2. Lead Story (Hero)
        $leadStory = News::published()
            ->latest('published_at')
            ->first();

        // 3. News Wire Grid
        $wireNews = News::published()
            ->when($leadStory, fn($q) => $q->where('id', '!=', $leadStory->id))
            ->latest('published_at')
            ->paginate(18);

        return Inertia::render('Public/News/Index', [
            'breakingNews' => $breakingNews,
            'leadStory' => $leadStory,
            'wireNews' => $wireNews,
        ]);
    }

    public function show($slug)
    {
        $news = News::published()
            ->where('slug', $slug)
            ->firstOrFail();

        $sessionKey = 'viewed_news_' . $news->id;
        if (!session()->has($sessionKey)) {
            $news->increment('views_count');
            session()->put($sessionKey, now()->timestamp);
        }

        // Related / Latest stories
        $related = News::published()
            ->where('id', '!=', $news->id)
            ->latest('published_at')
            ->take(6)
            ->get();

        return Inertia::render('Public/News/Show', [
            'news' => $news,
            'related' => $related,
        ]);
    }
}
