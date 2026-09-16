<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PodcastCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class PodcastCategoryController extends Controller
{
    public function index(Request $request)
    {
        $categories = PodcastCategory::withCount('podcasts')
            ->orderBy('sort_order', 'asc')
            ->latest('id')
            ->get();

        if ($request->wantsJson()) {
            return response()->json($categories);
        }

        return Inertia::render('Admin/PodcastCategories/Index', [
            'categories' => $categories,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:podcast_categories,slug',
            'description' => 'nullable|string|max:1000',
            'cover_image_url' => 'nullable|string|max:1000',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        if (empty($validated['slug'])) {
            $baseSlug = Str::slug($validated['name']);
            $slug = $baseSlug ?: 'category';
            $i = 1;
            while (PodcastCategory::where('slug', $slug)->exists()) {
                $slug = "{$baseSlug}-{$i}";
                $i++;
            }
            $validated['slug'] = $slug;
        } else {
            $validated['slug'] = Str::slug($validated['slug']);
        }

        $category = PodcastCategory::create($validated);

        if ($request->wantsJson()) {
            return response()->json(['success' => true, 'category' => $category]);
        }

        return back()->with('message', 'Podcast category created successfully.');
    }

    public function update(Request $request, PodcastCategory $podcastCategory)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:podcast_categories,slug,' . $podcastCategory->id,
            'description' => 'nullable|string|max:1000',
            'cover_image_url' => 'nullable|string|max:1000',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        $validated['slug'] = Str::slug($validated['slug']);

        $podcastCategory->update($validated);

        if ($request->wantsJson()) {
            return response()->json(['success' => true, 'category' => $podcastCategory]);
        }

        return back()->with('message', 'Podcast category updated successfully.');
    }

    public function destroy(PodcastCategory $podcastCategory)
    {
        $podcastCategory->delete();

        return back()->with('message', 'Podcast category deleted successfully.');
    }
}
