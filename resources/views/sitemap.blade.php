<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
    {{-- Core Institutional & High-Value Pages --}}
    @if(isset($staticPages) && is_array($staticPages))
    @foreach($staticPages as $page)
    <url>
        <loc>{{ $page['loc'] }}</loc>
        <lastmod>{{ $page['lastmod'] }}</lastmod>
        <changefreq>{{ $page['changefreq'] }}</changefreq>
        <priority>{{ $page['priority'] }}</priority>
    </url>
    @endforeach
    @else
    <url>
        <loc>{{ rtrim(url("/"), '/') . '/' }}</loc>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
    </url>
    <url>
        <loc>{{ url("/sitemap") }}</loc>
        <changefreq>daily</changefreq>
        <priority>0.8</priority>
    </url>
    @endif

    {{-- Category Sections --}}
    @foreach($categories as $category)
    <url>
        <loc>{{ url("/category/" . $category->slug) }}</loc>
        <lastmod>{{ $category->updated_at ? $category->updated_at->toAtomString() : now()->toAtomString() }}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>
    @endforeach

    {{-- Published Articles --}}
    @foreach($articles as $article)
    <url>
        <loc>{{ url("/article/" . $article->slug) }}</loc>
        <lastmod>{{ ($article->updated_at ?? $article->published_at ?? now())->toAtomString() }}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>
    @endforeach

    {{-- Technology News Dispatches --}}
    @if(isset($news) && count($news) > 0)
    @foreach($news as $item)
    <url>
        <loc>{{ url("/news/" . $item->slug) }}</loc>
        <lastmod>{{ ($item->updated_at ?? $item->published_at ?? now())->toAtomString() }}</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.9</priority>
    </url>
    @endforeach
    @endif
</urlset>
