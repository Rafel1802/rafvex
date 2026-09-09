<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Article;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SearchController extends Controller
{
    public function index(Request $request)
    {
        $q = trim($request->get("q", ""));
        $articles = collect();
        if (strlen($q) >= 2) {
            $articles = Article::with(["category", "author"])
                ->where("status", "published")
                ->where(fn($query) => $query->where("title", "like", "%{$q}%")->orWhere("excerpt", "like", "%{$q}%"))
                ->latest("published_at")->take(30)->get();
        }
        return Inertia::render("Public/Search", ["query" => $q, "results" => $articles]);
    }

    public function live(Request $request)
    {
        $q = trim($request->get("q", ""));
        if (strlen($q) < 2) {
            return response()->json([
                'results' => [],
                'total' => 0,
            ]);
        }

        $articles = Article::with(['category:id,name,slug'])
            ->where('status', 'published')
            ->where(function ($query) use ($q) {
                $query->where('title', 'like', "%{$q}%")
                      ->orWhere('excerpt', 'like', "%{$q}%");
            })
            ->latest('published_at')
            ->take(15)
            ->get(['id', 'category_id', 'title', 'slug', 'excerpt', 'reading_time', 'published_at', 'cover_image_url']);

        return response()->json([
            'results' => $articles,
            'total' => $articles->count(),
            'query' => $q,
        ]);
    }
}
