import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import VideoEmbed from '@/Components/VideoEmbed';
import {
  Radio, Clock, Eye, Share2, Check, Link as LinkIcon, ChevronRight,
  AlertCircle, ArrowLeft, Printer, ExternalLink, Bookmark, Sparkles,
  Send, Copy, ArrowRight, Rss, Globe, Type
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

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

// Crisp Vector Brand Icons for Social Platforms
const SocialIcons = {
  X: () => (
    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  Facebook: () => (
    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  ),
  LinkedIn: () => (
    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451c.979 0 1.778-.773 1.778-1.729V1.73C24 .774 23.205 0 22.225 0z" />
    </svg>
  ),
  WhatsApp: () => (
    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12.031 0C5.405 0 .022 5.383.022 12.008c0 2.115.553 4.179 1.602 6.002L.07 24l6.166-1.616a11.96 11.96 0 005.795 1.492h.005c6.626 0 12.009-5.384 12.009-12.01A12.012 12.012 0 0012.031 0zm0 21.996h-.004a9.96 9.96 0 01-5.074-1.385l-.364-.216-3.771.989 1.006-3.676-.237-.377a9.965 9.965 0 01-1.528-5.323c0-5.503 4.478-9.982 9.987-9.982a9.93 9.93 0 017.06 2.926 9.93 9.93 0 012.927 7.06c0 5.503-4.479 9.984-9.985 9.984zm5.474-7.481c-.3-.15-1.775-.875-2.05-1.025-.275-.15-.475-.225-.675.15-.2.375-.775 1.025-.95 1.225-.175.2-.35.225-.65.075-.3-.15-1.267-.467-2.414-1.488-.893-.796-1.496-1.78-1.671-2.08-.175-.3-.019-.462.131-.611.135-.135.3-.35.45-.525.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.675-1.625-.925-2.225-.244-.583-.492-.504-.675-.513l-.575-.01c-.2 0-.525.075-.8.375s-1.05 1.025-1.05 2.5 1.075 2.899 1.225 3.099c.15.2 2.115 3.23 5.124 4.53.716.31 1.275.495 1.71.633.72.228 1.375.196 1.893.118.578-.087 1.775-.726 2.025-1.427.25-.701.25-1.302.175-1.427-.075-.125-.275-.2-.575-.35z" />
    </svg>
  ),
  Telegram: () => (
    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  ),
  Reddit: () => (
    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.688-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
    </svg>
  ),
};

interface NewsShowProps {
  news: any;
  related: any[];
}

export default function NewsShow({ news, related = [] }: NewsShowProps) {
  const [copiedMain, setCopiedMain] = useState(false);
  const [copiedItemSlug, setCopiedItemSlug] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const progressBarRef = useRef<HTMLDivElement>(null);

  const sanitizedContent = useMemo(() => sanitizeNewsHtml(news.content || ''), [news.content]);

  // Reading time calculation
  const readingTime = useMemo(() => {
    const text = (news.content || '') + ' ' + (news.summary || '');
    const clean = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const words = clean ? clean.split(/\s+/).length : 0;
    const minutes = Math.max(1, Math.ceil(words / 220));
    return `${minutes} min read`;
  }, [news.content, news.summary]);

  // Scroll Progress Bar
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (progressBarRef.current) {
            const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = totalHeight > 0 ? Math.min(100, Math.max(0, (window.scrollY / totalHeight) * 100)) : 0;
            progressBarRef.current.style.width = `${progress}%`;
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Post-processing for article content (tables, inline styles)
  useEffect(() => {
    const articleEl = document.querySelector('.article-prose');
    if (!articleEl) return;

    // Wrap tables that are not in an overflow container
    const tables = articleEl.querySelectorAll<HTMLTableElement>('table');
    tables.forEach((tbl) => {
      if (!tbl.parentElement?.classList.contains('overflow-x-auto')) {
        const wrapper = document.createElement('div');
        wrapper.className = 'overflow-x-auto my-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs';
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

  const getFullUrl = (slug?: string) => {
    if (typeof window === 'undefined') return '';
    if (slug) {
      return `${window.location.origin}/news/${slug}`;
    }
    return window.location.href;
  };

  const copyUrlToClipboard = (slug?: string) => {
    const url = getFullUrl(slug);
    navigator.clipboard.writeText(url).then(() => {
      if (slug) {
        setCopiedItemSlug(slug);
        setTimeout(() => setCopiedItemSlug(null), 2000);
      } else {
        setCopiedMain(true);
        setTimeout(() => setCopiedMain(false), 2000);
      }
    });
  };

  const sharePlatform = (
    platform: 'twitter' | 'facebook' | 'linkedin' | 'whatsapp' | 'telegram' | 'reddit',
    customTitle?: string,
    customSlug?: string
  ) => {
    const url = encodeURIComponent(getFullUrl(customSlug));
    const title = encodeURIComponent(customTitle || news.title);

    let shareUrl = '';
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${title}&url=${url}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
      case 'whatsapp':
        shareUrl = `https://api.whatsapp.com/send?text=${title}%20${url}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${url}&text=${title}`;
        break;
      case 'reddit':
        shareUrl = `https://reddit.com/submit?url=${url}&title=${title}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'noopener,noreferrer,width=640,height=560');
    }
  };

  const handleDeviceShare = async (customTitle?: string, customSlug?: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: customTitle || news.title,
          text: news.summary || customTitle || news.title,
          url: getFullUrl(customSlug),
        });
      } catch (e) {
        // Ignored if user dismissed share dialog
      }
    } else {
      copyUrlToClipboard(customSlug);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const currentUrlDisplay = typeof window !== 'undefined' ? window.location.href : 'https://rafvex.com/news/' + news.slug;

  return (
    <PublicLayout>
      <Head>
        <title>{`${news.title} — Rafvex News Wire`}</title>
        <meta name="description" content={news.summary || news.title} />
        <meta property="og:title" content={`${news.title} — Rafvex News Wire`} />
        <meta property="og:description" content={news.summary || news.title} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={getFullUrl()} />
        {news.cover_image_url && <meta property="og:image" content={news.cover_image_url} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={news.title} />
        <meta name="twitter:description" content={news.summary || news.title} />
        {news.cover_image_url && <meta name="twitter:image" content={news.cover_image_url} />}
      </Head>

      {/* Reading Progress Bar */}
      <div
        ref={progressBarRef}
        className="fixed top-0 left-0 h-[3.5px] z-50 pointer-events-none transition-all duration-75 ease-out"
        style={{
          width: '0%',
          background: 'linear-gradient(90deg, #dc2626 0%, #ef4444 60%, #f97316 100%)',
          boxShadow: '0 1px 6px rgba(220, 38, 38, 0.45)',
          willChange: 'width',
        }}
      />

      <div className="bg-[#fcfbf9] dark:bg-[#080d1a] min-h-screen py-6 sm:py-10 transition-colors duration-200">
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 20px' }}>

          {/* Breadcrumb Navigation Bar */}
          <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-6 flex-wrap font-medium">
            <Link href="/" className="hover:text-red-600 dark:hover:text-red-400 transition-colors flex items-center gap-1">
              <span>Home</span>
            </Link>
            <ChevronRight size={12} className="text-slate-400 dark:text-slate-600" />
            <Link href="/news" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">
              Newsroom Wire
            </Link>
            <ChevronRight size={12} className="text-slate-400 dark:text-slate-600" />
            <span className="text-slate-900 dark:text-slate-200 font-bold truncate max-w-[280px] sm:max-w-md">
              {news.title}
            </span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-10 items-start">

            {/* ═══════════════════════════════════════════════
                MAIN NEWS DISPATCH COLUMN (8 COLS)
            ═══════════════════════════════════════════════ */}
            <main className="lg:col-span-8 bg-white dark:bg-slate-900/95 p-6 sm:p-10 rounded-2xl border border-slate-200/90 dark:border-slate-800/80 shadow-sm backdrop-blur-xs">

              {/* Editorial Agency Dateline & Kicker */}
              <div className="flex items-center justify-between gap-3 flex-wrap pb-4 border-b border-slate-100 dark:border-slate-800/80 mb-6">
                <div className="flex items-center gap-2.5 flex-wrap">
                  {news.is_breaking ? (
                    <span className="px-3 py-1 rounded-full bg-red-600 text-white text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                      BREAKING NEWS
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-slate-900 text-white dark:bg-red-950/80 dark:text-red-300 dark:border dark:border-red-800/50 text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
                      <Radio size={12} className="text-red-500 animate-pulse" />
                      WIRE DISPATCH
                    </span>
                  )}

                  <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-md border border-slate-200/60 dark:border-slate-700/60">
                    {news.source || 'Rafvex News Wire'}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {news.views_count !== undefined && (
                    <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400" title="Total Views">
                      <Eye size={13} />
                      <span>{news.views_count.toLocaleString()} views</span>
                    </span>
                  )}
                  <span className="text-slate-300 dark:text-slate-700">&bull;</span>
                  <span className="flex items-center gap-1" title="Reading Duration">
                    <Clock size={13} />
                    <span>{readingTime}</span>
                  </span>
                </div>
              </div>

              {/* Published Dateline */}
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-4 font-mono flex items-center gap-2 flex-wrap">
                <span className="text-red-600 dark:text-red-400 font-bold uppercase tracking-widest text-[11px]">
                  NEWS BUREAU
                </span>
                <span>&bull;</span>
                <span>
                  {news.published_at ? format(new Date(news.published_at), 'EEEE, MMMM d, yyyy • h:mm a') : 'Live Report'}
                </span>
                {news.published_at && (
                  <>
                    <span>&bull;</span>
                    <span className="text-slate-400 dark:text-slate-500">
                      ({formatDistanceToNow(new Date(news.published_at), { addSuffix: true })})
                    </span>
                  </>
                )}
              </div>

              {/* News Headline */}
              <h1
                style={{ fontFamily: "'Outfit', sans-serif" }}
                className="text-2xl sm:text-4xl lg:text-[42px] font-black text-slate-950 dark:text-slate-50 tracking-tight leading-[1.18] mb-6"
              >
                {news.title}
              </h1>

              {/* ── TOP ACTION BAR: SOCIAL SHARING & READER TOOLS ── */}
              <div className="py-3 px-4 mb-8 rounded-xl bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-750 flex items-center justify-between flex-wrap gap-3">
                
                {/* Social Share Icon Buttons */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mr-1.5 flex items-center gap-1">
                    <Share2 size={13} className="text-red-600" />
                    <span>Share:</span>
                  </span>

                  {/* X (Twitter) */}
                  <button
                    onClick={() => sharePlatform('twitter')}
                    className="w-8 h-8 rounded-lg bg-black hover:bg-neutral-800 text-white flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-2xs cursor-pointer"
                    title="Share to X"
                  >
                    <SocialIcons.X />
                  </button>

                  {/* Facebook */}
                  <button
                    onClick={() => sharePlatform('facebook')}
                    className="w-8 h-8 rounded-lg bg-[#1877F2] hover:bg-[#166fe5] text-white flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-2xs cursor-pointer"
                    title="Share to Facebook"
                  >
                    <SocialIcons.Facebook />
                  </button>

                  {/* WhatsApp */}
                  <button
                    onClick={() => sharePlatform('whatsapp')}
                    className="w-8 h-8 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-white flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-2xs cursor-pointer"
                    title="Share on WhatsApp"
                  >
                    <SocialIcons.WhatsApp />
                  </button>

                  {/* LinkedIn */}
                  <button
                    onClick={() => sharePlatform('linkedin')}
                    className="w-8 h-8 rounded-lg bg-[#0A66C2] hover:bg-[#095196] text-white flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-2xs cursor-pointer"
                    title="Share to LinkedIn"
                  >
                    <SocialIcons.LinkedIn />
                  </button>

                  {/* Telegram */}
                  <button
                    onClick={() => sharePlatform('telegram')}
                    className="w-8 h-8 rounded-lg bg-[#229ED9] hover:bg-[#1c8ec4] text-white flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-2xs cursor-pointer"
                    title="Share on Telegram"
                  >
                    <SocialIcons.Telegram />
                  </button>

                  {/* Reddit */}
                  <button
                    onClick={() => sharePlatform('reddit')}
                    className="w-8 h-8 rounded-lg bg-[#FF4500] hover:bg-[#e03d00] text-white flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-2xs cursor-pointer"
                    title="Share on Reddit"
                  >
                    <SocialIcons.Reddit />
                  </button>

                  {/* Copy Link */}
                  <button
                    onClick={() => copyUrlToClipboard()}
                    className={`h-8 px-2.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95 ${
                      copiedMain
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600'
                    }`}
                    title="Copy Article Link"
                  >
                    {copiedMain ? <Check size={13} className="text-white" /> : <LinkIcon size={13} className="text-slate-500 dark:text-slate-400" />}
                    <span>{copiedMain ? 'Copied!' : 'Copy'}</span>
                  </button>

                  {/* Native Device Share (Mobile / Tablet) */}
                  <button
                    onClick={() => handleDeviceShare()}
                    className="h-8 px-2.5 rounded-lg text-xs font-bold bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95"
                    title="Share via device options"
                  >
                    <Share2 size={13} />
                    <span className="hidden sm:inline">Share</span>
                  </button>
                </div>

                {/* Reader Controls (Font Size & Print) */}
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center bg-white dark:bg-slate-700 rounded-lg p-0.5 border border-slate-200 dark:border-slate-600 text-xs font-bold">
                    <button
                      onClick={() => setFontSize('normal')}
                      className={`px-2 py-1 rounded cursor-pointer transition-colors ${
                        fontSize === 'normal' ? 'bg-slate-900 text-white dark:bg-slate-900' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                      }`}
                      title="Default font size"
                    >
                      A
                    </button>
                    <button
                      onClick={() => setFontSize('large')}
                      className={`px-2 py-1 rounded cursor-pointer transition-colors ${
                        fontSize === 'large' ? 'bg-slate-900 text-white dark:bg-slate-900' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                      }`}
                      title="Larger font size"
                    >
                      A+
                    </button>
                    <button
                      onClick={() => setFontSize('xlarge')}
                      className={`px-2 py-1 rounded cursor-pointer transition-colors ${
                        fontSize === 'xlarge' ? 'bg-slate-900 text-white dark:bg-slate-900' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                      }`}
                      title="Extra large font size"
                    >
                      A++
                    </button>
                  </div>

                  <button
                    onClick={handlePrint}
                    className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                    title="Print Dispatch"
                  >
                    <Printer size={14} />
                  </button>
                </div>

              </div>

              {/* Key Dispatch Takeaways / Executive Kicker */}
              {news.summary && (
                <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border-l-[5px] border-red-600 mb-8 shadow-2xs">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-red-600"></span>
                    <span className="text-xs font-black uppercase tracking-wider text-red-600 dark:text-red-400">
                      Key Takeaways &bull; Quick Brief
                    </span>
                  </div>
                  <p className="text-lg sm:text-xl font-medium text-slate-900 dark:text-slate-100 leading-relaxed">
                    {news.summary}
                  </p>
                </div>
              )}

              {/* News Cover Image */}
              {news.cover_image_url && (
                <figure className="mb-8 rounded-2xl overflow-hidden aspect-video bg-slate-100 dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-800">
                  <img
                    src={news.cover_image_url}
                    alt={news.cover_image_alt || news.title}
                    className="w-full h-full object-cover"
                  />
                  {news.cover_image_alt && (
                    <figcaption className="text-xs text-slate-500 dark:text-slate-400 py-3 px-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
                      <span className="font-medium italic">{news.cover_image_alt}</span>
                      {news.source && (
                        <span className="font-bold text-slate-600 dark:text-slate-300 bg-slate-200/80 dark:bg-slate-700/80 px-2 py-0.5 rounded text-[11px]">
                          Wire Photo: {news.source}
                        </span>
                      )}
                    </figcaption>
                  )}
                </figure>
              )}

              {/* Video Player (YouTube or Facebook) */}
              {news.video_url && (
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
                    <span>Live Broadcast &bull; Video Dispatch</span>
                  </div>
                  <VideoEmbed url={news.video_url} title={news.title} />
                </div>
              )}

              {/* Article Dateline Lead & Body Content */}
              <div
                className={`article-prose max-w-none transition-all duration-150 ${
                  fontSize === 'xlarge'
                    ? '[&]:![font-size:1.375rem] [&]:![line-height:1.9]'
                    : fontSize === 'large'
                    ? '[&]:![font-size:1.25rem] [&]:![line-height:1.85]'
                    : ''
                }`}
                dangerouslySetInnerHTML={{ __html: sanitizedContent }}
              />



            </main>

            {/* ═══════════════════════════════════════════════
                SIDEBAR: SOCIAL SHARE & WIRE FEED (4 COLS)
            ═══════════════════════════════════════════════ */}
            <aside className="lg:col-span-4 space-y-6 sticky top-24">

              {/* ── CARD 1: SHARE THIS DISPATCH (NEW SOCIAL HUB) ── */}
              <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm">
                
                {/* Header with live badge */}
                <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center">
                      <Share2 size={15} />
                    </div>
                    <h3
                      style={{ fontFamily: "'Outfit', sans-serif" }}
                      className="text-sm font-black uppercase tracking-wider text-slate-950 dark:text-slate-100"
                    >
                      Share This Story
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    Social Hub
                  </span>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                  Circulate this breaking news dispatch across social channels and messaging networks:
                </p>

                {/* 1-Click Social Grid */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {/* X */}
                  <button
                    onClick={() => sharePlatform('twitter')}
                    className="p-2.5 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-transform hover:scale-102 active:scale-95 shadow-2xs cursor-pointer"
                  >
                    <SocialIcons.X />
                    <span className="text-[11px]">X (Twitter)</span>
                  </button>

                  {/* Facebook */}
                  <button
                    onClick={() => sharePlatform('facebook')}
                    className="p-2.5 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-transform hover:scale-102 active:scale-95 shadow-2xs cursor-pointer"
                  >
                    <SocialIcons.Facebook />
                    <span className="text-[11px]">Facebook</span>
                  </button>

                  {/* WhatsApp */}
                  <button
                    onClick={() => sharePlatform('whatsapp')}
                    className="p-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-transform hover:scale-102 active:scale-95 shadow-2xs cursor-pointer"
                  >
                    <SocialIcons.WhatsApp />
                    <span className="text-[11px]">WhatsApp</span>
                  </button>

                  {/* LinkedIn */}
                  <button
                    onClick={() => sharePlatform('linkedin')}
                    className="p-2.5 rounded-xl bg-[#0A66C2] hover:bg-[#095196] text-white text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-transform hover:scale-102 active:scale-95 shadow-2xs cursor-pointer"
                  >
                    <SocialIcons.LinkedIn />
                    <span className="text-[11px]">LinkedIn</span>
                  </button>

                  {/* Telegram */}
                  <button
                    onClick={() => sharePlatform('telegram')}
                    className="p-2.5 rounded-xl bg-[#229ED9] hover:bg-[#1c8ec4] text-white text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-transform hover:scale-102 active:scale-95 shadow-2xs cursor-pointer"
                  >
                    <SocialIcons.Telegram />
                    <span className="text-[11px]">Telegram</span>
                  </button>

                  {/* Reddit */}
                  <button
                    onClick={() => sharePlatform('reddit')}
                    className="p-2.5 rounded-xl bg-[#FF4500] hover:bg-[#e03d00] text-white text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-transform hover:scale-102 active:scale-95 shadow-2xs cursor-pointer"
                  >
                    <SocialIcons.Reddit />
                    <span className="text-[11px]">Reddit</span>
                  </button>
                </div>

                {/* 1-Click Copy Short URL Bar */}
                <div className="relative flex items-center rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 p-1.5">
                  <div className="flex-1 px-2.5 text-xs text-slate-500 dark:text-slate-400 font-mono truncate select-all">
                    {currentUrlDisplay}
                  </div>
                  <button
                    onClick={() => copyUrlToClipboard()}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs shrink-0 ${
                      copiedMain
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-red-600 dark:hover:bg-red-500'
                    }`}
                  >
                    {copiedMain ? <Check size={13} /> : <Copy size={13} />}
                    <span>{copiedMain ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                {/* Native Device Share Link */}
                <button
                  onClick={() => handleDeviceShare()}
                  className="mt-3 w-full py-2 px-3 rounded-xl bg-slate-100/80 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-200/60 dark:border-slate-700/60"
                >
                  <Share2 size={13} className="text-red-600 dark:text-red-400" />
                  <span>More Sharing Options...</span>
                </button>
              </div>

              {/* ── CARD 2: LATEST WIRE FEED (REDESIGNED PROFESSIONAL NEWS WIRE) ── */}
              <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm">
                
                {/* Live Radar Header */}
                <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
                    </span>
                    <h3
                      style={{ fontFamily: "'Outfit', sans-serif" }}
                      className="text-sm font-black uppercase tracking-wider text-slate-950 dark:text-slate-100"
                    >
                      Latest Wire Feed
                    </h3>
                  </div>

                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-200/60 dark:border-red-900/50 flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-red-600 animate-pulse" />
                    <span>Real-Time</span>
                  </span>
                </div>

                {/* Wire Feed Dispatches */}
                <div className="space-y-3.5">
                  {related.length === 0 ? (
                    <p className="text-xs text-slate-400 dark:text-slate-500 italic py-2">
                      No additional dispatches at this moment.
                    </p>
                  ) : (
                    related.map((item: any) => {
                      const isItemCopied = copiedItemSlug === item.slug;

                      return (
                        <article
                          key={item.id}
                          className="group relative p-3 rounded-xl hover:bg-slate-50/90 dark:hover:bg-slate-800/60 transition-all duration-150 border border-slate-100/60 dark:border-slate-800/40 hover:border-slate-200 dark:hover:border-slate-700/80"
                        >
                          {/* Metadata Row: Source & Timestamp */}
                          <div className="flex items-center justify-between gap-2 mb-1.5 text-[10px] font-bold uppercase tracking-wider">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {item.is_breaking && (
                                <span className="px-1.5 py-0.5 rounded bg-red-600 text-white font-black text-[9px] tracking-widest shadow-2xs">
                                  BREAKING
                                </span>
                              )}
                              <span className="text-slate-700 dark:text-slate-300 font-extrabold bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                                {item.source || 'Wire Feed'}
                              </span>
                            </div>

                            <span className="text-slate-400 dark:text-slate-500 font-mono text-[10px] shrink-0 flex items-center gap-1">
                              <Clock size={10} />
                              {item.published_at ? formatDistanceToNow(new Date(item.published_at), { addSuffix: true }) : 'Just now'}
                            </span>
                          </div>

                          {/* Content Row: Headline & Optional Thumbnail */}
                          <div className="flex items-start gap-3">
                            <div className="flex-1 min-w-0">
                              <Link
                                href={`/news/${item.slug}`}
                                className="block"
                              >
                                <h4
                                  style={{ fontFamily: "'Outfit', sans-serif" }}
                                  className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-2 leading-snug"
                                >
                                  {item.title}
                                </h4>
                              </Link>
                            </div>

                            {/* Small Thumbnail if available */}
                            {item.cover_image_url && (
                              <Link
                                href={`/news/${item.slug}`}
                                className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                              >
                                <img
                                  src={item.cover_image_url}
                                  alt={item.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                  loading="lazy"
                                />
                              </Link>
                            )}
                          </div>

                          {/* Micro-actions Row on Wire Item */}
                          <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
                            <Link
                              href={`/news/${item.slug}`}
                              className="text-slate-500 dark:text-slate-400 group-hover:text-red-600 dark:group-hover:text-red-400 font-bold flex items-center gap-1 transition-colors"
                            >
                              <span>Read Dispatch</span>
                              <ChevronRight size={12} className="transition-transform group-hover:translate-x-0.5" />
                            </Link>

                            <div className="flex items-center gap-1">
                              {/* Quick Share to X */}
                              <button
                                onClick={() => sharePlatform('twitter', item.title, item.slug)}
                                className="p-1 rounded hover:bg-slate-200/70 dark:hover:bg-slate-700 text-slate-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                                title="Share to X"
                              >
                                <SocialIcons.X />
                              </button>

                              {/* Quick Share to WhatsApp */}
                              <button
                                onClick={() => sharePlatform('whatsapp', item.title, item.slug)}
                                className="p-1 rounded hover:bg-slate-200/70 dark:hover:bg-slate-700 text-slate-400 hover:text-[#25D366] transition-colors cursor-pointer"
                                title="Share to WhatsApp"
                              >
                                <SocialIcons.WhatsApp />
                              </button>

                              {/* Quick Copy Link */}
                              <button
                                onClick={() => copyUrlToClipboard(item.slug)}
                                className={`px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                                  isItemCopied
                                    ? 'bg-emerald-600 text-white'
                                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-700'
                                }`}
                                title="Copy wire link"
                              >
                                {isItemCopied ? <Check size={11} /> : <LinkIcon size={11} />}
                                <span>{isItemCopied ? 'Copied' : 'Copy'}</span>
                              </button>
                            </div>
                          </div>

                        </article>
                      );
                    })
                  )}
                </div>

                {/* View All Dispatches CTA */}
                <Link
                  href="/news"
                  className="group mt-5 w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-750 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs"
                >
                  <span>View All News Dispatches</span>
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-1 text-red-400" />
                </Link>

              </div>



            </aside>

          </div>

        </div>
      </div>
    </PublicLayout>
  );
}
