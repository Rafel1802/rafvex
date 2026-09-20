<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class CategoryController extends Controller
{
    public function index()
    {
        // Load categories with parent, article count, and sample articles
        $categories = Category::with('parent')
            ->withCount('articles')
            ->with(['articles' => function ($q) {
                $q->select('id', 'category_id', 'title', 'slug', 'cover_image_url', 'status', 'created_at')
                    ->latest()
                    ->take(6);
            }])
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/Categories/Index', [
            'categories' => $categories,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:categories,slug',
            'parent_id' => 'nullable|exists:categories,id',
            'description' => 'nullable|string',
            'cover_image' => 'nullable|string',
            'cover_image_file' => 'nullable|image|max:3072',
        ]);

        // Handle uploaded cover image file if provided
        if ($request->hasFile('cover_image_file')) {
            $path = $request->file('cover_image_file')->store('categories', 'public');
            $validated['cover_image'] = '/storage/'.$path;
        }

        // Generate or clean slug
        if (empty($validated['slug'])) {
            $slugBase = Str::slug($validated['name']);
            $validated['slug'] = $slugBase ?: 'category';
            $count = 1;
            while (Category::where('slug', $validated['slug'])->exists()) {
                $validated['slug'] = "{$slugBase}-{$count}";
                $count++;
            }
        } else {
            $validated['slug'] = Str::slug($validated['slug']);
        }

        unset($validated['cover_image_file']);

        Category::create($validated);

        return redirect()->back()->with('message', 'Category created successfully.');
    }

    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:categories,slug,'.$category->id,
            'parent_id' => 'nullable|exists:categories,id',
            'description' => 'nullable|string',
            'cover_image' => 'nullable|string',
            'cover_image_file' => 'nullable|image|max:3072',
        ]);

        if ($request->hasFile('cover_image_file')) {
            $path = $request->file('cover_image_file')->store('categories', 'public');
            $validated['cover_image'] = '/storage/'.$path;
        }

        $validated['slug'] = Str::slug($validated['slug']);

        // Cannot be parent of oneself
        if (isset($validated['parent_id']) && (int) $validated['parent_id'] === (int) $category->id) {
            $validated['parent_id'] = null;
        }

        unset($validated['cover_image_file']);

        $category->update($validated);

        return redirect()->back()->with('message', 'Category updated successfully.');
    }

    public function destroy(Category $category)
    {
        // Safely unlink articles so they aren't lost (category_id is nullable)
        $category->articles()->update(['category_id' => null]);

        // Unlink articles from subcategories and remove subcategories
        foreach ($category->children as $child) {
            $child->articles()->update(['category_id' => null]);
            $child->delete();
        }

        $name = $category->name;
        $category->delete();

        return redirect()->back()->with('message', "Category '{$name}' deleted successfully.");
    }
}
