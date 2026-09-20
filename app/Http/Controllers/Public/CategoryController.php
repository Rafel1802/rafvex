<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\Category;
use Inertia\Inertia;

class CategoryController extends Controller
{
    public function show($slug)
    {
        $aliases = [
            'online-security' => 'basic-online-security',
            'security' => 'basic-online-security',
            'how-to' => 'troubleshooting',
            'review' => 'reviews',
            'tips' => 'tips-tricks',
            'tricks' => 'tips-tricks',
        ];

        if (isset($aliases[$slug])) {
            $slug = $aliases[$slug];
        }

        $category = Category::where('slug', $slug)->first();

        if (! $category) {
            $formattedName = ucwords(str_replace(['-', '_'], ' ', $slug));
            $category = Category::where('name', 'like', $formattedName)->first();
        }

        if (! $category) {
            abort(404);
        }

        // Determine parent category and child subcategories
        if ($category->parent_id) {
            $parentCategory = Category::find($category->parent_id) ?? $category;
            $initialSubcat = $category->slug;
        } else {
            $parentCategory = $category;
            $initialSubcat = request()->query('sub', 'all');
        }

        // Fetch all available subcategories under this parent
        $subcategories = Category::where('parent_id', $parentCategory->id)
            ->where('status', 'active')
            ->orderBy('sort_order', 'asc')
            ->orderBy('name', 'asc')
            ->get();

        // Collect all IDs in this branch (parent + all subcategories)
        $allCategoryIds = $subcategories->pluck('id')->push($parentCategory->id)->unique();

        // Fetch all published articles under this category family
        $articles = Article::with(['category', 'author', 'tags'])
            ->whereIn('category_id', $allCategoryIds)
            ->where('status', 'published')
            ->latest('published_at')
            ->get();

        // Fallback search if empty
        if ($articles->isEmpty()) {
            $keyword = explode(' ', $parentCategory->name)[0] ?? '';
            $articles = Article::with(['category', 'author', 'tags'])
                ->where('status', 'published')
                ->where(function ($q) use ($keyword) {
                    if ($keyword) {
                        $q->where('title', 'like', "%{$keyword}%")
                            ->orWhere('excerpt', 'like', "%{$keyword}%");
                    }
                })
                ->latest('published_at')
                ->take(12)
                ->get();

            if ($articles->isEmpty()) {
                $articles = Article::with(['category', 'author', 'tags'])
                    ->where('status', 'published')
                    ->latest('published_at')
                    ->take(12)
                    ->get();
            }
        }

        // Calculate counts for each subcategory and only retain subcategories with published content
        $subcategoriesWithCounts = $subcategories->map(function ($sub) use ($articles) {
            $count = $articles->where('category_id', $sub->id)->count();

            return [
                'id' => $sub->id,
                'name' => $sub->name,
                'slug' => $sub->slug,
                'description' => $sub->description,
                'articles_count' => $count,
            ];
        })->filter(fn ($sub) => $sub['articles_count'] > 0)->values();

        return Inertia::render('Public/Category/Show', [
            'category' => $category,
            'parentCategory' => $parentCategory,
            'subcategories' => $subcategoriesWithCounts,
            'articles' => $articles,
            'initialSubcat' => $initialSubcat,
        ]);
    }
}
