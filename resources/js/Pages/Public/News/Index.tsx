import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import VideoEmbed from '@/Components/VideoEmbed';
import { Radio, AlertCircle, Clock, ExternalLink, ChevronRight, Video, Share2, Check, Link as LinkIcon } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

interface NewsIndexProps {
  breakingNews: any[];
  leadStory: any | null;
  wireNews: {
    data: any[];
    links: any[];
    current_page: number;
    last_page: number;
  };
}

export default function NewsIndex({ breakingNews = [], leadStory, wireNews }: NewsIndexProps) {
  const newsItems = wireNews?.data || [];
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const copyUrl = (slug: string) => {
    const url = typeof window !== 'undefined' ? `${window.location.origin}/news/${slug}` : `/news/${slug}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedSlug(slug);
      setTimeout(() => setCopiedSlug(null), 2000);
    });
  };

  const shareToTwitter = (title: string, slug: string) => {
    const url = encodeURIComponent(typeof window !== 'undefined' ? `${window.location.origin}/news/${slug}` : `/news/${slug}`);
    const text = encodeURIComponent(title);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank', 'noopener,noreferrer,width=640,height=560');
  };

  return (
    <PublicLayout>
      <Head>
        <title>Rafvex Newsroom &bull; Live Technology & AI Dispatches</title>
        <meta
          name="description"
          content="Live breaking news, tech developments, AI model releases, cybersecurity alerts, and policy updates reported in real-time."
        />
        <meta property="og:title" content="Rafvex Newsroom &bull; Live Technology & AI Dispatches" />
        <meta
          property="og:description"
          content="Live breaking news and dispatches from the Rafvex Newsroom."
        />
      </Head>

      <div className="bg-[#fdfcfb] dark:bg-[#0b1120] min-h-screen py-6 sm:py-10 transition-colors duration-200">
        <div style={{ maxWidth: 1320, margin: '0 auto', padding: '0 20px' }}>
          
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-4">
            <Link href="/" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">Home</Link>
            <ChevronRight size={12} className="text-slate-400 dark:text-slate-500" />
            <span className="text-slate-900 dark:text-slate-100 font-bold">Newsroom</span>
          </nav>

          {/* ── 1. US NEWS RED BREAKING TICKER ── */}
          {breakingNews.length > 0 && (
            <div className="mb-8 rounded-2xl bg-red-600 text-white p-3 sm:p-4 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-300">
              <div className="flex items-center gap-3 shrink-0">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                </span>
                <span className="text-xs font-black uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-md">
                  BREAKING NEWS
                </span>
              </div>
              <div className="flex-1 overflow-hidden">
                <Link
                  href={`/news/${breakingNews[0].slug}`}
                  prefetch="hover"
                  className="text-xs sm:text-sm font-bold text-white hover:underline truncate block"
                >
                  {breakingNews[0].title}
                </Link>
              </div>
              <span className="text-[11px] text-white/80 font-medium shrink-0">
                {breakingNews[0].published_at &&
                  formatDistanceToNow(new Date(breakingNews[0].published_at), { addSuffix: true })}
              </span>
            </div>
          )}

          {/* News Header Header */}
          <div className="border-b-2 border-slate-900 dark:border-slate-700 pb-4 mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-xs font-extrabold tracking-widest uppercase mb-1">
                <Radio size={15} className="animate-pulse text-red-600 dark:text-red-400" />
                <span>Rafvex Wire Service &bull; Live Bureau</span>
              </div>
              <h1
                style={{ fontFamily: "'Outfit', sans-serif" }}
                className="text-3xl sm:text-5xl font-black text-slate-950 dark:text-slate-100 tracking-tight"
              >
                Technology &amp; AI Newsroom
              </h1>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              <span>{format(new Date(), 'EEEE, MMMM d, yyyy')}</span>
            </div>
          </div>

          {/* ── 2. US NEWS LEAD HERO STORY ── */}
          {leadStory && (
            <div className="mb-12 pb-12 border-b border-slate-200 dark:border-slate-800">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7">
                  {leadStory.video_url ? (
                    <VideoEmbed url={leadStory.video_url} title={leadStory.title} />
                  ) : leadStory.cover_image_url ? (
                    <Link href={`/news/${leadStory.slug}`} className="block rounded-2xl overflow-hidden aspect-[16/9] bg-slate-100 dark:bg-slate-800 shadow-lg group">
                      <img
                        src={leadStory.cover_image_url}
                        alt={leadStory.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </Link>
                  ) : (
                    <div className="rounded-2xl aspect-[16/9] bg-slate-900 flex items-center justify-center text-white p-8">
                      <Radio size={48} className="text-red-500" />
                    </div>
                  )}
                </div>
                <div className="lg:col-span-5 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-3">
                    {leadStory.is_breaking && (
                      <span className="px-2.5 py-0.5 rounded-md bg-red-600 text-white text-[11px] font-black uppercase tracking-wider">
                        BREAKING
                      </span>
                    )}
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {leadStory.source || 'Rafvex News Wire'}
                    </span>
                    <span className="text-slate-300 dark:text-slate-600">&bull;</span>
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      {leadStory.published_at && formatDistanceToNow(new Date(leadStory.published_at), { addSuffix: true })}
                    </span>
                  </div>

                  <Link href={`/news/${leadStory.slug}`} prefetch="hover">
                    <h2
                      style={{ fontFamily: "'Outfit', sans-serif" }}
                      className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-slate-100 hover:text-red-600 dark:hover:text-red-400 transition-colors leading-tight mb-4"
                    >
                      {leadStory.title}
                    </h2>
                  </Link>

                  {leadStory.summary && (
                    <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed font-normal mb-6">
                      {leadStory.summary}
                    </p>
                  )}

                  <div className="flex items-center gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <Link
                      href={`/news/${leadStory.slug}`}
                      prefetch="hover"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-700 text-white font-bold text-xs transition-colors shadow-sm cursor-pointer"
                    >
                      <span>Read Full Report</span>
                      <span>&rarr;</span>
                    </Link>
                    {leadStory.video_url && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400">
                        <Video size={14} className="text-red-600 dark:text-red-400" />
                        <span>Video Included</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── 3. WIRE DISPATCHES GRID (US News Stream) ── */}
          <div>
            <div className="flex items-center justify-between pb-3 mb-6 border-b border-slate-200 dark:border-slate-800">
              <h3
                style={{ fontFamily: "'Outfit', sans-serif" }}
                className="text-xl font-bold text-slate-900 dark:text-slate-100 uppercase tracking-tight flex items-center gap-2"
              >
                <span>Latest Wire Dispatches</span>
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Updated continuously</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {newsItems.map((item: any) => (
                <article
                  key={item.id}
                  className="group flex flex-col justify-between p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:shadow-xl dark:hover:shadow-slate-950/50 hover:border-red-300 dark:hover:border-red-500/50 transition-all duration-200"
                >
                  <div>
                    {item.cover_image_url && (
                      <Link href={`/news/${item.slug}`} prefetch="hover" className="aspect-video w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 mb-3.5 block relative">
                        <img
                          src={item.cover_image_url}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                        {item.video_url && (
                          <div className="absolute top-2.5 right-2.5 px-2 py-1 rounded-md bg-black/80 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1">
                            <Video size={11} className="text-red-500" />
                            <span>Video</span>
                          </div>
                        )}
                      </Link>
                    )}

                    <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-2">
                      {item.is_breaking && (
                        <span className="text-red-600 dark:text-red-400 font-black">BREAKING &bull;</span>
                      )}
                      <span>{item.source || 'Wire Dispatch'}</span>
                      <span>&bull;</span>
                      <span>
                        {item.published_at && formatDistanceToNow(new Date(item.published_at), { addSuffix: true })}
                      </span>
                    </div>

                    <Link href={`/news/${item.slug}`} prefetch="hover">
                      <h4
                        style={{ fontFamily: "'Outfit', sans-serif" }}
                        className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 hover:text-red-600 dark:hover:text-red-400 transition-colors line-clamp-2 leading-snug mb-2"
                      >
                        {item.title}
                      </h4>
                    </Link>

                    {item.summary && (
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed mb-4">
                        {item.summary}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1 text-[11px]">
                      <Clock size={12} />
                      <span>{format(new Date(item.published_at || item.created_at), 'h:mm a')}</span>
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => shareToTwitter(item.title, item.slug)}
                        className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                        title="Share on X"
                      >
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                      </button>

                      <button
                        onClick={() => copyUrl(item.slug)}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                          copiedSlug === item.slug
                            ? 'bg-emerald-600 text-white'
                            : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                        title="Copy article link"
                      >
                        {copiedSlug === item.slug ? <Check size={11} /> : <LinkIcon size={11} />}
                        <span>{copiedSlug === item.slug ? 'Copied' : 'Copy'}</span>
                      </button>

                      <Link href={`/news/${item.slug}`} className="text-red-600 dark:text-red-400 font-bold hover:underline ml-1">
                        Read &rarr;
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {newsItems.length === 0 && !leadStory && (
              <div className="py-20 text-center text-slate-500 dark:text-slate-400">
                <Radio size={40} className="mx-auto mb-3 text-slate-400 dark:text-slate-500" />
                <p className="text-base font-medium">No news dispatches published yet.</p>
              </div>
            )}

            {/* Pagination */}
            {wireNews?.links && wireNews.links.length > 3 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                {wireNews.links.map((link: any, idx: number) => (
                  <Link
                    key={idx}
                    href={link.url || '#'}
                    preserveScroll
                    dangerouslySetInnerHTML={{ __html: link.label }}
                    className={`px-3.5 py-2 text-xs font-bold rounded-xl border transition-colors ${
                      link.active
                        ? 'bg-slate-900 dark:bg-red-600 text-white border-slate-900 dark:border-red-600'
                        : link.url
                        ? 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                        : 'bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-600 border-slate-100 dark:border-slate-800 cursor-not-allowed'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </PublicLayout>
  );
}
