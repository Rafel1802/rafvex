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
        $article = Article::with(['category', 'author.profile', 'tags', 'comments' => function ($q) {
            $q->whereNull('parent_id')
              ->where('status', 'approved')
              ->with(['replies' => function ($q) {
                  $q->where('status', 'approved')->orderBy('created_at', 'asc');
              }])
              ->orderBy('created_at', 'desc');
        }])
            ->where('slug', $slug)
            ->where('status', 'published')
            ->firstOrFail();

        // Increment views with session deduplication to record genuine, real reader visits
        $sessionKey = 'viewed_article_' . $article->id;
        if (!session()->has($sessionKey)) {
            $article->increment('views_count');
            session()->put($sessionKey, now()->timestamp);
        }

        // Related stories in same category
        $related = Article::with(['category', 'author'])
            ->where('category_id', $article->category_id)
            ->where('id', '!=', $article->id)
            ->where('status', 'published')
            ->latest('published_at')
            ->take(4)
            ->get();

        if ($related->count() < 4) {
            $extra = Article::with(['category', 'author'])
                ->where('id', '!=', $article->id)
                ->where('status', 'published')
                ->whereNotIn('id', $related->pluck('id'))
                ->latest('published_at')
                ->take(4 - $related->count())
                ->get();
            $related = $related->concat($extra);
        }

        // Trending stories across publication for sidebar ranking
        $trending = Article::with(['category', 'author'])
            ->where('id', '!=', $article->id)
            ->where('status', 'published')
            ->orderBy('views_count', 'desc')
            ->latest('published_at')
            ->take(5)
            ->get();

        // Topic Cluster Playlist (Pillar + companion sub-blogs in the same cluster/subcategory)
        $clusterQuery = Article::select(['id', 'title', 'slug', 'category_id', 'reading_time', 'featured', 'published_at'])
            ->where('status', 'published');

        if ($article->category_id) {
            $clusterQuery->where('category_id', $article->category_id);
        }

        $clusterPlaylist = $clusterQuery->orderBy('id', 'asc')->get();

        if ($clusterPlaylist->count() < 3 && $article->category && $article->category->parent_id) {
            $siblingCatIds = \App\Models\Category::where('parent_id', $article->category->parent_id)->pluck('id');
            $clusterPlaylist = Article::select(['id', 'title', 'slug', 'category_id', 'reading_time', 'featured', 'published_at'])
                ->where('status', 'published')
                ->whereIn('category_id', $siblingCatIds)
                ->orderBy('id', 'asc')
                ->get();
        }

        // Curated / Featured Categories for Left Sidebar
        $sidebarCategories = \App\Models\Category::whereNull('parent_id')
            ->withCount(['articles' => fn($q) => $q->where('status', 'published')])
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
            'clusterPlaylist' => $clusterPlaylist,
            'sidebarCategories' => $sidebarCategories,
            'popularTags' => $popularTags,
        ]);
    }
}
