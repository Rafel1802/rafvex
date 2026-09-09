import React, { useState, useEffect, useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import VideoEmbed from '@/Components/VideoEmbed';
import { Radio, Clock, Eye, Share2, Check, Link as LinkIcon, ChevronRight, AlertCircle, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';

function sanitizeNewsHtml(rawHtml: string): string {
  if (!rawHtml) return '';
  let content = rawHtml;

  // Process table cells
  content = content.replace(/<(td|th)([^>]*)>([\s\S]*?)<\/\1>/gi, (_match, tag, attrs, inner) => {
    let formatted = inner;
    formatted = formatted.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '<em>$1</em>');
    formatted = formatted.replace(/`([^`\n]+)`/g, '<code class="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-xs font-mono font-semibold">$1</code>');
    return `<${tag}${attrs}>${formatted}</${tag}>`;
  });

  // Process prose elements
  content = content.replace(/<(p|li|blockquote|figcaption|h[1-6])([^>]*)>([\s\S]*?)<\/\1>/gi, (match, tag, attrs, inner) => {
    if (!inner.includes('**') && !inner.includes('*')) return match;
    if (attrs.includes('code-terminal') || attrs.includes('font-mono')) return match;
    let formatted = inner;
    formatted = formatted.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
    return `<${tag}${attrs}>${formatted}</${tag}>`;
  });

  return content;
}

interface NewsShowProps {
  news: any;
  related: any[];
}

export default function NewsShow({ news, related = [] }: NewsShowProps) {
  const [copied, setCopied] = useState(false);
  const sanitizedContent = useMemo(() => sanitizeNewsHtml(news.content || ''), [news.content]);

  useEffect(() => {
    const articleEl = document.querySelector('.article-prose');
    if (!articleEl) return;

    // Wrap tables that are not in an overflow container
    const tables = articleEl.querySelectorAll<HTMLTableElement>('table');
    tables.forEach((tbl) => {
      if (!tbl.parentElement?.classList.contains('overflow-x-auto')) {
        const wrapper = document.createElement('div');
        wrapper.className = 'overflow-x-auto my-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900';
        tbl.parentNode?.insertBefore(wrapper, tbl);
        wrapper.appendChild(tbl);
      }
    });

    // Ensure table cells and prose elements have no raw markdown asterisks
    const proseElements = articleEl.querySelectorAll<HTMLElement>('th, td, p, li, blockquote');
    proseElements.forEach((el) => {
      if (el.closest('.code-terminal-block') || el.closest('pre') || el.closest('code')) return;
      if (el.innerHTML.includes('**')) {
        el.innerHTML = el.innerHTML.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
      }
      if ((el.tagName === 'TH' || el.tagName === 'TD') && el.innerHTML.includes('*') && !el.innerHTML.includes('<img')) {
        el.innerHTML = el.innerHTML.replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '<em>$1</em>');
      }
    });

    // Remove any hardcoded dark inline colors
    const styledElements = articleEl.querySelectorAll<HTMLElement>('[style*="color"]');
    styledElements.forEach((el) => {
      const c = el.style.color ? el.style.color.replace(/\s+/g, '').toLowerCase() : '';
      if (
        c.includes('rgb(15,23,42)') ||
        c.includes('rgb(30,41,59)') ||
        c.includes('rgb(51,65,85)') ||
        c.includes('rgb(71,85,105)') ||
        c.includes('#0f172a') ||
        c.includes('#1e293b') ||
        c.includes('#334155') ||
        c.includes('#475569') ||
        c === 'black' ||
        c === '#000' ||
        c === '#000000'
      ) {
        el.style.removeProperty('color');
      }
    });
  }, [sanitizedContent]);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const shareTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(news.title)}&url=${encodeURIComponent(window.location.href)}`, '_blank');
  };

  const shareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank');
  };

  return (
    <PublicLayout>
      <Head>
        <title>{`${news.title} — Rafvex News Wire`}</title>
        <meta name="description" content={news.summary || news.title} />
        <meta property="og:title" content={news.title} />
        <meta property="og:description" content={news.summary || news.title} />
        {news.cover_image_url && <meta property="og:image" content={news.cover_image_url} />}
      </Head>

      <div className="bg-[#fdfcfb] dark:bg-[#0b1120] min-h-screen py-8 sm:py-12 transition-colors duration-200">
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
          
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-6">
            <Link href="/" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">Home</Link>
            <ChevronRight size={12} className="text-slate-400 dark:text-slate-500" />
            <Link href="/news" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">Newsroom</Link>
            <ChevronRight size={12} className="text-slate-400 dark:text-slate-500" />
            <span className="text-slate-900 dark:text-slate-100 font-bold truncate max-w-sm">{news.title}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Main Article Content (8 Cols) */}
            <main className="lg:col-span-8 bg-white dark:bg-slate-900 p-6 sm:p-10 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm">
              
              {/* Breaking Badge & Metadata Bar */}
              <div className="flex items-center gap-2.5 flex-wrap pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
                {news.is_breaking && (
                  <span className="px-3 py-1 rounded-full bg-red-600 text-white text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    BREAKING DISPATCH
                  </span>
                )}
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                  {news.source || 'Rafvex News Wire'}
                </span>
                <span className="text-slate-300 dark:text-slate-600">&bull;</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {news.published_at && `${format(new Date(news.published_at), 'MMMM d, yyyy')} • ${format(new Date(news.published_at), 'h:mm a')}`}
                </span>
              </div>

              {/* News Headline */}
              <h1
                style={{ fontFamily: "'Outfit', sans-serif" }}
                className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-snug mb-6"
              >
                {news.title}
              </h1>

              {/* US News Summary / Kicker Box */}
              {news.summary && (
                <div className="p-4 sm:p-5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border-l-4 border-red-600 mb-8">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                    Key Dispatch Takeaways
                  </span>
                  <p className="text-sm sm:text-base font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                    {news.summary}
                  </p>
                </div>
              )}

              {/* Cover Image */}
              {news.cover_image_url && (
                <figure className="mb-8 rounded-xl overflow-hidden aspect-video bg-slate-100 dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-800">
                  <img
                    src={news.cover_image_url}
                    alt={news.cover_image_alt || news.title}
                    className="w-full h-full object-cover"
                  />
                  {news.cover_image_alt && (
                    <figcaption className="text-xs text-slate-500 dark:text-slate-400 py-2.5 px-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span>{news.cover_image_alt}</span>
                      {news.source && <span className="font-semibold text-slate-400 dark:text-slate-500">Photo: {news.source}</span>}
                    </figcaption>
                  )}
                </figure>
              )}

              {/* Video Player (YouTube or Facebook) */}
              {news.video_url && (
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-2.5 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                    <span>Broadcast / Video Report</span>
                  </div>
                  <VideoEmbed url={news.video_url} title={news.title} />
                </div>
              )}

              {/* Dateline & Body Content */}
              <div
                className="article-prose max-w-none text-base sm:text-lg text-slate-800 dark:text-slate-200 leading-relaxed font-normal"
                dangerouslySetInnerHTML={{ __html: sanitizedContent }}
              />

              {/* Share Bar */}
              <div className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mr-2">Share Dispatch:</span>
                  <button
                    onClick={shareTwitter}
                    className="w-8 h-8 rounded-lg bg-black hover:bg-neutral-800 text-white flex items-center justify-center transition-all shadow-2xs cursor-pointer active:scale-95"
                    title="Share on X"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </button>
                  <button
                    onClick={shareFacebook}
                    className="w-8 h-8 rounded-lg bg-[#1877F2] hover:bg-[#166fe5] text-white flex items-center justify-center transition-all shadow-2xs cursor-pointer active:scale-95"
                    title="Share on Facebook"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </button>
                  <button
                    onClick={copyLink}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95 ${
                      copied ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700'
                    }`}
                  >
                    {copied ? <Check size={13} /> : <LinkIcon size={13} className="text-slate-600 dark:text-slate-400" />}
                    <span>{copied ? 'Copied' : 'Copy Link'}</span>
                  </button>
                </div>

                <Link
                  href="/news"
                  className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 inline-flex items-center gap-1"
                >
                  <ArrowLeft size={13} />
                  <span>Back to Newsroom</span>
                </Link>
              </div>

            </main>

            {/* Sidebar: Latest Dispatches (4 Cols) */}
            <aside className="lg:col-span-4 space-y-6 sticky top-28">
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                  className="text-base font-bold text-slate-900 dark:text-slate-100 uppercase tracking-tight pb-3 mb-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2"
                >
                  <Radio size={16} className="text-red-600 dark:text-red-400" />
                  <span>Latest Wire Feed</span>
                </h3>

                <div className="space-y-4">
                  {related.map((item: any) => (
                    <Link
                      key={item.id}
                      href={`/news/${item.slug}`}
                      className="group block pb-3 border-b border-slate-100 dark:border-slate-800 last:border-0 last:pb-0"
                    >
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mb-1">
                        {item.is_breaking && <span className="text-red-600 dark:text-red-400">BREAKING</span>}
                        <span>{item.source || 'Wire'}</span>
                      </div>
                      <h4
                        style={{ fontFamily: "'Outfit', sans-serif" }}
                        className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-2 leading-snug"
                      >
                        {item.title}
                      </h4>
                    </Link>
                  ))}
                </div>

                <Link
                  href="/news"
                  className="mt-5 w-full py-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1 transition-colors border border-slate-200/80 dark:border-slate-700"
                >
                  <span>View All News Dispatches</span>
                  <span>&rarr;</span>
                </Link>
              </div>
            </aside>

          </div>

        </div>
      </div>
    </PublicLayout>
  );
}
