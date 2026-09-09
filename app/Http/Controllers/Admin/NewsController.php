<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\News;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class NewsController extends Controller
{
    public function index(Request $request)
    {
        $query = News::query();

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('summary', 'like', "%{$search}%")
                  ->orWhere('source', 'like', "%{$search}%");
            });
        }

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        if ($request->has('is_breaking') && $request->input('is_breaking') !== '') {
            $query->where('is_breaking', filter_var($request->input('is_breaking'), FILTER_VALIDATE_BOOLEAN));
        }

        $news = $query->latest('published_at')
            ->latest('id')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/News/Index', [
            'news' => $news,
            'filters' => $request->only(['search', 'status', 'is_breaking']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/News/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:news,slug',
            'summary' => 'nullable|string|max:1000',
            'content' => 'required|string',
            'content_raw' => 'nullable|string',
            'cover_image_url' => 'nullable|string|max:1000',
            'cover_image_alt' => 'nullable|string|max:255',
            'video_url' => 'nullable|string|max:1000',
            'source' => 'nullable|string|max:255',
            'source_url' => 'nullable|string|max:1000',
            'is_breaking' => 'boolean',
            'status' => 'required|in:published,draft',
            'published_at' => 'nullable|date',
        ]);

        $slug = !empty($validated['slug'])
            ? Str::slug($validated['slug'])
            : Str::slug($validated['title']);

        // Ensure unique slug
        $originalSlug = $slug;
        $count = 1;
        while (News::where('slug', $slug)->exists()) {
            $slug = "{$originalSlug}-{$count}";
            $count++;
        }
        $validated['slug'] = $slug;

        if (empty($validated['published_at'])) {
            $validated['published_at'] = now();
        }

        if (empty($validated['source'])) {
            $validated['source'] = 'Rafvex News Wire';
        }

        News::create($validated);

        return redirect()->route('admin.news.index')->with('success', 'News dispatch published successfully.');
    }

    public function edit(News $news)
    {
        return Inertia::render('Admin/News/Edit', [
            'news' => $news,
        ]);
    }

    public function update(Request $request, News $news)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:news,slug,' . $news->id,
            'summary' => 'nullable|string|max:1000',
            'content' => 'required|string',
            'content_raw' => 'nullable|string',
            'cover_image_url' => 'nullable|string|max:1000',
            'cover_image_alt' => 'nullable|string|max:255',
            'video_url' => 'nullable|string|max:1000',
            'source' => 'nullable|string|max:255',
            'source_url' => 'nullable|string|max:1000',
            'is_breaking' => 'boolean',
            'status' => 'required|in:published,draft',
            'published_at' => 'nullable|date',
        ]);

        $news->update($validated);

        return redirect()->route('admin.news.index')->with('success', 'News dispatch updated successfully.');
    }

    public function destroy(News $news)
    {
        $news->delete();
        return back()->with('success', 'News dispatch archived.');
    }

    public function toggleBreaking(News $news)
    {
        $news->update(['is_breaking' => !$news->is_breaking]);
        return back()->with('success', 'Breaking status updated.');
    }
}
