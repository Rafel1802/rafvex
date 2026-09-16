<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd
        http://www.google.com/schemas/sitemap-image/1.1
        http://www.google.com/schemas/sitemap-image/1.1/sitemap-image.xsd">
    {{-- Core Institutional & High-Value Pages --}}
    @if(isset($staticPages) && is_array($staticPages))
    @foreach($staticPages as $page)
    <url>
        <loc>{{ $page['loc'] }}</loc>
        <lastmod>{{ $page['lastmod'] }}</lastmod>
        <changefreq>{{ $page['changefreq'] }}</changefreq>
        <priority>{{ $page['priority'] }}</priority>
        @if($page['loc'] === rtrim(url("/"), '/') . '/')
        <image:image>
            <image:loc>{{ url('/android-chrome-512x512.png') }}</image:loc>
            <image:title>Rafvex — Technology, AI, Guides &amp; Knowledge</image:title>
        </image:image>
        @endif
    </url>
    @endforeach
    @else
    <url>
        <loc>{{ rtrim(url("/"), '/') . '/' }}</loc>
        <lastmod>{{ now()->toAtomString() }}</lastmod>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
        <image:image>
            <image:loc>{{ url('/android-chrome-512x512.png') }}</image:loc>
            <image:title>Rafvex — Technology, AI, Guides &amp; Knowledge</image:title>
        </image:image>
    </url>
    <url>
        <loc>{{ url("/sitemap") }}</loc>
        <lastmod>{{ now()->toAtomString() }}</lastmod>
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
        @if(!empty($article->cover_image_url))
        <image:image>
            <image:loc>{{ str_starts_with($article->cover_image_url, 'http') ? $article->cover_image_url : url($article->cover_image_url) }}</image:loc>
            <image:title>{{ htmlspecialchars($article->title ?? 'Rafvex Article') }}</image:title>
        </image:image>
        @endif
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
        @if(!empty($item->cover_image_url))
        <image:image>
            <image:loc>{{ str_starts_with($item->cover_image_url, 'http') ? $item->cover_image_url : url($item->cover_image_url) }}</image:loc>
            <image:title>{{ htmlspecialchars($item->title ?? 'Rafvex News') }}</image:title>
        </image:image>
        @endif
    </url>
    @endforeach
    @endif

    {{-- Podcasts & Audio Shows --}}
    @if(isset($podcasts) && count($podcasts) > 0)
    @foreach($podcasts as $podcast)
    <url>
        <loc>{{ url("/podcast/" . $podcast->slug) }}</loc>
        <lastmod>{{ ($podcast->updated_at ?? $podcast->published_at ?? now())->toAtomString() }}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
        @if(!empty($podcast->cover_image_url))
        <image:image>
            <image:loc>{{ str_starts_with($podcast->cover_image_url, 'http') ? $podcast->cover_image_url : url($podcast->cover_image_url) }}</image:loc>
            <image:title>{{ htmlspecialchars($podcast->title ?? 'Rafvex Podcast') }}</image:title>
        </image:image>
        @endif
    </url>
    @endforeach
    @endif
</urlset>
