<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\Category;
use App\Models\Comment;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $stats = [
            'total_articles' => 0,
            'published' => 0,
            'drafts' => 0,
            'scheduled' => 0,
            'categories' => 0,
            'total_comments' => 0,
            'pending_comments' => 0,
        ];

        try {
            $stats['total_articles'] = Article::count();
            $stats['published'] = Article::where('status', 'published')->count();
            $stats['drafts'] = Article::where('status', 'draft')->count();
            $stats['scheduled'] = Article::where('status', 'scheduled')->count();
            $stats['categories'] = Category::count();
            $stats['total_comments'] = Comment::count();
            $stats['pending_comments'] = Comment::where('status', 'pending')->count();
        } catch (\Throwable $e) {
            \Log::error('Dashboard stats error: '.$e->getMessage());
        }

        $recentArticles = [];
        try {
            $recentArticles = Article::with(['author', 'category'])
                ->latest('updated_at')
                ->take(6)
                ->get()
                ->map(fn ($a) => [
                    'id' => $a->id,
                    'title' => $a->title,
                    'slug' => $a->slug,
                    'status' => $a->status,
                    'cover_image_url' => $a->cover_image_url,
                    'category' => $a->category ? ['name' => $a->category->name] : null,
                    'author' => $a->author ? ['name' => $a->author->name] : null,
                    'published_at' => $a->published_at?->toDateString(),
                    'updated_at' => $a->updated_at?->toDateString(),
                ])
                ->values()
                ->all();
        } catch (\Throwable $e) {
            \Log::error('Dashboard recentArticles error: '.$e->getMessage());
        }

        $recentComments = [];
        try {
            $recentComments = Comment::with('article:id,title,slug')
                ->latest('created_at')
                ->take(5)
                ->get()
                ->map(fn ($c) => [
                    'id' => $c->id,
                    'author_name' => $c->author_name,
                    'content' => $c->content,
                    'status' => $c->status,
                    'article' => $c->article ? ['title' => $c->article->title, 'slug' => $c->article->slug] : null,
                    'created_at' => $c->created_at?->toIso8601String(),
                ])
                ->values()
                ->all();
        } catch (\Throwable $e) {
            \Log::error('Dashboard recentComments error: '.$e->getMessage());
        }

        $recentActivity = [];
        try {
            if (Schema::hasTable('activity_log')) {
                $recentActivity = DB::table('activity_log')->orderBy('created_at', 'desc')->take(10)->get();
            }
        } catch (\Throwable $e) {
        }

        return Inertia::render('Admin/Dashboard', [
            'stats' => $stats,
            'recentArticles' => array_values($recentArticles),
            'recentComments' => array_values($recentComments),
            'recentActivity' => $recentActivity,
        ]);
    }
}
