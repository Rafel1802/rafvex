<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Article;
use Inertia\Inertia;

class PopularController extends Controller
{
    public function index()
    {
        // Top 20 most-read / most-viewed articles
        $popularArticles = Article::with(['category', 'author.profile'])
            ->where('status', 'published')
            ->orderBy('views_count', 'desc')
            ->latest('published_at')
            ->take(20)
            ->get();

        return Inertia::render('Public/Popular', [
            'articles' => $popularArticles,
        ]);
    }
}
