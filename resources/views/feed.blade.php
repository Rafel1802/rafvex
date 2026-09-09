<?= '<?xml version="1.0" encoding="UTF-8"?>' ?>
<rss version="2.0" 
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:wfw="http://wellformedweb.org/CommentAPI/"
     xmlns:dc="http://purl.org/dc/elements/1.1/"
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:sy="http://purl.org/rss/1.0/modules/syndication/">
  <channel>
    <title>{{ $siteName }} — {{ $siteTagline }}</title>
    <atom:link href="{{ url('/feed') }}" rel="self" type="application/rss+xml" />
    <link>{{ url('/') }}</link>
    <description>{{ $siteDescription }}</description>
    <lastBuildDate>{{ now()->toRssString() }}</lastBuildDate>
    <language>en-US</language>
    <sy:updatePeriod>hourly</sy:updatePeriod>
    <sy:updateFrequency>1</sy:updateFrequency>
    <image>
      <url>{{ $siteLogoUrl }}</url>
      <title>{{ $siteName }}</title>
      <link>{{ url('/') }}</link>
    </image>
    @foreach($articles as $article)
    <item>
      <title><![CDATA[{{ $article->title }}]]></title>
      <link>{{ url('/article/' . $article->slug) }}</link>
      <guid isPermaLink="true">{{ url('/article/' . $article->slug) }}</guid>
      <pubDate>{{ \Carbon\Carbon::parse($article->published_at)->toRssString() }}</pubDate>
      <dc:creator><![CDATA[{{ $article->author->name ?? 'Rafvex Editorial' }}]]></dc:creator>
      <description><![CDATA[{{ $article->excerpt ?? $article->meta_description }}]]></description>
      @if($article->category)
      <category><![CDATA[{{ $article->category->name }}]]></category>
      @endif
      @if($article->cover_image_url)
      <enclosure url="{{ str_starts_with($article->cover_image_url, 'http') ? $article->cover_image_url : url($article->cover_image_url) }}" type="image/webp" length="0" />
      @endif
    </item>
    @endforeach
  </channel>
</rss>
