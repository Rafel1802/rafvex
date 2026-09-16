<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Article;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ArticleController extends Controller
{
    public function show($slug)
    {
        $article = Article::published()
            ->with(['category', 'author.profile', 'tags', 'playlist', 'comments' => function ($q) {
                $q->whereNull('parent_id')
                  ->where('status', 'approved')
                  ->with(['replies' => function ($q) {
                      $q->where('status', 'approved')->orderBy('created_at', 'asc');
                  }])
                  ->orderBy('created_at', 'desc');
            }])
            ->where('slug', $slug)
            ->firstOrFail();

        // Increment views with session deduplication to record genuine, real reader visits
        $sessionKey = 'viewed_article_' . $article->id;
        if (!session()->has($sessionKey)) {
            $article->increment('views_count');
            session()->put($sessionKey, now()->timestamp);
        }

        // Contextual related articles based on category or tags
        $related = Article::published()
            ->with(['category', 'author'])
            ->where('id', '!=', $article->id)
            ->where('category_id', $article->category_id)
            ->latest('published_at')
            ->take(3)
            ->get();

        // Fallback: If not enough related articles in same category, grab latest from other categories
        if ($related->count() < 3) {
            $extra = Article::published()
                ->with(['category', 'author'])
                ->where('id', '!=', $article->id)
                ->whereNotIn('id', $related->pluck('id'))
                ->latest('published_at')
                ->take(3 - $related->count())
                ->get();
            $related = $related->concat($extra);
        }

        // Top 5 Popular Articles across publication (strictly matching /popular query logic)
        $popularArticles = Article::published()
            ->with(['category', 'author.profile'])
            ->orderBy('views_count', 'desc')
            ->latest('published_at')
            ->take(5)
            ->get();

        // Trending stories across publication for secondary sidebar usage
        $trending = $popularArticles;

        // Custom Playlist / Series if assigned, else Topic Cluster Playlist
        $playlistTitle = null;
        $clusterPlaylist = collect();

        if ($article->playlist_id) {
            $clusterPlaylist = Article::published()
                ->select(['id', 'title', 'slug', 'category_id', 'playlist_id', 'playlist_order', 'reading_time', 'featured', 'published_at'])
                ->where('playlist_id', $article->playlist_id)
                ->orderBy('playlist_order', 'asc')
                ->orderBy('id', 'asc')
                ->get();

            if ($clusterPlaylist->isNotEmpty()) {
                $playlistTitle = $article->playlist?->title ?: 'Series Playlist';
            }
        }

        if ($clusterPlaylist->isEmpty()) {
            $clusterQuery = Article::published()
                ->select(['id', 'title', 'slug', 'category_id', 'reading_time', 'featured', 'published_at']);

            if ($article->category_id) {
                $clusterQuery->where('category_id', $article->category_id);
            }

            $clusterPlaylist = $clusterQuery->orderBy('id', 'asc')->get();

            if ($clusterPlaylist->count() < 3 && $article->category && $article->category->parent_id) {
                $siblingCatIds = \App\Models\Category::where('parent_id', $article->category->parent_id)->pluck('id');
                $clusterPlaylist = Article::published()
                    ->select(['id', 'title', 'slug', 'category_id', 'reading_time', 'featured', 'published_at'])
                    ->whereIn('category_id', $siblingCatIds)
                    ->orderBy('id', 'asc')
                    ->get();
            }

            $playlistTitle = 'Cluster Playlist';
        }

        // Curated / Featured Categories for Left Sidebar
        $sidebarCategories = \App\Models\Category::whereNull('parent_id')
            ->withCount(['articles' => fn($q) => $q->published()])
            ->where('status', 'active')
            ->orderBy('featured', 'desc')
            ->orderBy('sort_order', 'asc')
            ->take(6)
            ->get(['id', 'name', 'slug', 'description', 'featured']);

        // Tags for the article and publication
        $articleTags = $article->tags;
        $popularTags = \App\Models\Tag::withCount('articles')
            ->orderBy('articles_count', 'desc')
            ->take(12)
            ->get(['id', 'name', 'slug']);

        return Inertia::render('Public/Article/Show', [
            'article' => $article,
            'related' => $related,
            'trending' => $trending,
            'popularArticles' => $popularArticles,
            'clusterPlaylist' => $clusterPlaylist,
            'playlistTitle' => $playlistTitle,
            'sidebarCategories' => $sidebarCategories,
            'popularTags' => $popularTags,
        ]);
    }
}
