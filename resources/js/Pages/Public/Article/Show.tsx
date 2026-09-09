import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import VideoEmbed from '@/Components/VideoEmbed';
import {
  Clock, Share2, Link as LinkIcon, ChevronRight, MessageSquare,
  BookOpen, ArrowRight, Check, TrendingUp, Sparkles, User,
  FolderOpen, Tag as TagIcon, Play, Radio
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import Comments from '@/Components/Comments';
import AdBanner from '@/Components/AdBanner';
import BookmarkButton from '@/Components/Public/BookmarkButton';
import ReadBadge from '@/Components/Public/ReadBadge';
import { useUserInteractions } from '@/hooks/useUserInteractions';

// Clean raw markdown asterisks (stars **bold** and *italic*) in tables and text for both desktop and mobile
function sanitizeArticleHtml(rawHtml: string): string {
  if (!rawHtml) return '';
  let content = rawHtml;

  // 1. Process all table cells (th and td) to convert markdown bold (**text**) and italic (*text*) into proper HTML tags
  content = content.replace(/<(td|th)([^>]*)>([\s\S]*?)<\/\1>/gi, (_match, tag, attrs, inner) => {
    let formatted = inner;
    // Convert bold: **text** -> <strong>text</strong>
    formatted = formatted.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
    // Convert italic: *text* -> <em>text</em>
    formatted = formatted.replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '<em>$1</em>');
    // Convert inline code: `code` -> <code class="...">code</code>
    formatted = formatted.replace(/`([^`\n]+)`/g, '<code class="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-xs font-mono font-semibold">$1</code>');
    return `<${tag}${attrs}>${formatted}</${tag}>`;
  });

  // 2. Convert markdown asterisks inside paragraphs, list items, headings, and blockquotes (ignoring code blocks)
  content = content.replace(/<(p|li|blockquote|figcaption|h[1-6])([^>]*)>([\s\S]*?)<\/\1>/gi, (match, tag, attrs, inner) => {
    if (!inner.includes('**') && !inner.includes('*')) return match;
    if (attrs.includes('code-terminal') || attrs.includes('font-mono')) return match;
    let formatted = inner;
    formatted = formatted.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
    return `<${tag}${attrs}>${formatted}</${tag}>`;
  });

  return content;
}

export default function Show({
  auth,
  article,
  related = [],
  trending = [],
  clusterPlaylist = [],
  sidebarCategories = [],
  popularTags = [],
}: any) {
  const { site } = usePage().props as any;
  const [copied, setCopied] = useState(false);
  const [tagsExpanded, setTagsExpanded] = useState(false);
  const [headerShareDropdownOpen, setHeaderShareDropdownOpen] = useState(false);
  const headerShareRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [headings, setHeadings] = useState<{ id: string; text: string; index: number }[]>([]);
  const [activeHeadingId, setActiveHeadingId] = useState<string>('');

  // Sanitize article content so that markdown bold/italic/stars in tables and text render cleanly on both laptop and mobile
  const sanitizedContent = useMemo(() => sanitizeArticleHtml(article.content || ''), [article.content]);

  const combinedTags = (article.tags && article.tags.length > 0)
    ? article.tags
    : (popularTags || []);

  const { markAsRead } = useUserInteractions();

  // Close header share dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (headerShareRef.current && !headerShareRef.current.contains(event.target as Node)) {
        setHeaderShareDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Automatically record this article in user's reading history
  useEffect(() => {
    if (article?.id) {
      markAsRead(article.id);
    }
  }, [article?.id]);

  // High-performance RAF Scroll Progress without component re-renders
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

  // Parse Headings for Sticky Table of Contents
  useEffect(() => {
    const articleEl = document.querySelector('.article-prose');
    if (!articleEl) return;

    const h2Elements = articleEl.querySelectorAll('h2, h3');
    const items: { id: string; text: string; index: number }[] = [];

    h2Elements.forEach((el, idx) => {
      const text = el.textContent?.trim() || `Section ${idx + 1}`;
      let id = el.id;
      if (!id) {
        id = `heading-${idx + 1}-${text
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')}`;
        el.id = id;
      }
      el.setAttribute('data-heading-idx', String(idx));
      items.push({ id, text, index: idx });
    });

    setHeadings(items);

    // Observer for Active Heading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveHeadingId(entry.target.id);
          }
        });
      },
      { rootMargin: '-90px 0px -60% 0px' }
    );

    h2Elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sanitizedContent]);

  // Interactive Copy Code Button Handler & Code Block Contrast Sanitizer
  useEffect(() => {
    const articleEl = document.querySelector('.article-prose');
    if (!articleEl) return;

    // Ensure all terminal blocks, pre, and nested elements maintain high contrast & full opacity
    const terminalBlocks = articleEl.querySelectorAll<HTMLElement>('.code-terminal-block');
    terminalBlocks.forEach((block) => {
      block.style.backgroundColor = '#0f172a';
      block.style.color = '#f8fafc';

      const pElements = block.querySelectorAll<HTMLElement>('p');
      pElements.forEach((p) => {
        p.classList.remove('text-slate-700', 'text-slate-800', 'text-slate-900', 'text-slate-600', 'text-slate-500');
        p.classList.add('text-slate-100', 'font-mono');
        p.style.color = '#f8fafc';
        p.style.opacity = '1';
      });

      const codeElements = block.querySelectorAll<HTMLElement>('code, pre');
      codeElements.forEach((el) => {
        el.style.color = '#f8fafc';
        el.style.opacity = '1';
      });
    });

    // Ensure all tables are enclosed in an overflow-x-auto container so they never push out the mobile page width
    const tables = articleEl.querySelectorAll<HTMLTableElement>('table');
    tables.forEach((tbl) => {
      if (!tbl.parentElement?.classList.contains('overflow-x-auto')) {
        const wrapper = document.createElement('div');
        wrapper.className = 'overflow-x-auto my-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900';
        tbl.parentNode?.insertBefore(wrapper, tbl);
        wrapper.appendChild(tbl);
      }
    });

    // Ensure table cells and prose elements have no raw markdown asterisks (**bold**)
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

    // Remove any hardcoded dark inline style colors so dark mode CSS classes display at full contrast
    const styledElements = articleEl.querySelectorAll<HTMLElement>('[style*="color"]');
    styledElements.forEach((el) => {
      if (el.closest('.code-terminal-block') || el.classList.contains('copy-code-btn')) return;
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

    const copyButtons = articleEl.querySelectorAll<HTMLButtonElement>('.copy-code-btn');
    const handlers: { btn: HTMLButtonElement; fn: () => void }[] = [];

    copyButtons.forEach((btn) => {
      const fn = () => {
        const rawCode = btn.getAttribute('data-code');
        const codeText = rawCode ? decodeURIComponent(rawCode) : (btn.closest('.code-terminal-block')?.querySelector('code')?.textContent || '');
        if (!codeText) return;

        navigator.clipboard.writeText(codeText).then(() => {
          btn.classList.add('copied');
          const originalHtml = btn.innerHTML;
          btn.innerHTML = '<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg><span>Copied!</span>';
          setTimeout(() => {
            btn.classList.remove('copied');
            btn.innerHTML = originalHtml;
          }, 2000);
        });
      };

      btn.addEventListener('click', fn);
      handlers.push({ btn, fn });
    });

    return () => {
      handlers.forEach(({ btn, fn }) => btn.removeEventListener('click', fn));
    };
  }, [sanitizedContent]);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const shareTwitter = () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(window.location.href)}`, '_blank');
  const shareFacebook = () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank');
  const shareLinkedin = () => window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(article.title)}`, '_blank');
  const shareWhatsapp = () => window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(article.title + ' ' + window.location.href)}`, '_blank');

  const scrollToComments = () => {
    const el = document.getElementById('comments-section');
    if (el) {
      const headerOffset = 90;
      const elementPosition = el.getBoundingClientRect().top;
      const currentScroll = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
      const targetY = elementPosition + currentScroll - headerOffset;
      window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
    }
  };

  const scrollToHeading = (id: string, index?: number) => {
    let el = document.getElementById(id);
    if (!el && typeof index === 'number') {
      el = document.querySelector(`[data-heading-idx="${index}"]`) as HTMLElement;
      if (!el) {
        const allHeadings = document.querySelectorAll('.article-prose h2, .article-prose h3');
        el = allHeadings[index] as HTMLElement;
      }
    }
    if (el) {
      const headerOffset = 90;
      const elementPosition = el.getBoundingClientRect().top;
      const currentScroll = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
      const targetY = elementPosition + currentScroll - headerOffset;

      window.scrollTo({
        top: Math.max(0, targetY),
        behavior: 'smooth',
      });

      setActiveHeadingId(id);
    }
  };

  const commentsCount = (article.comments || []).length;

  const authorDisplayName = article.author?.profile?.display_name ||
    (article.author?.name && !['Rafvex', 'Admin User', 'admin'].includes(article.author.name)
      ? article.author.name
      : (site?.founder_name || 'Soporadara Rin'));

  return (
    <PublicLayout auth={auth}>
      <Head>
        <title>{`${article.meta_title || article.title} — Rafvex`}</title>
        <meta name="description" content={article.meta_description || article.excerpt} />
        {article.canonical_url && <link rel="canonical" href={article.canonical_url} />}
        <meta property="og:title" content={article.og_title || article.meta_title || article.title} />
        <meta property="og:description" content={article.og_description || article.meta_description || article.excerpt} />
        {article.cover_image_url && <meta property="og:image" content={article.cover_image_url} />}
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@rafvex" />
        <meta name="twitter:title" content={article.meta_title || article.title} />
        <meta name="twitter:description" content={article.meta_description || article.excerpt} />
        {article.cover_image_url && <meta name="twitter:image" content={article.cover_image_url} />}
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "TechArticle",
          "headline": article.title,
          "description": article.meta_description || article.excerpt,
          "inLanguage": "en-US",
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": article.canonical_url || `https://rafvex.com/article/${article.slug}`
          },
          "datePublished": article.published_at,
          "dateModified": article.updated_at || article.published_at,
          "author": {
            "@type": "Person",
            "name": authorDisplayName,
            "url": "https://rafvex.com/about"
          },
          "publisher": {
            "@type": "Organization",
            "name": "Rafvex",
            "url": "https://rafvex.com",
            "logo": {
              "@type": "ImageObject",
              "url": "https://rafvex.com/logo.png"
            }
          },
          "image": article.cover_image_url ? [article.cover_image_url] : [],
          "articleSection": article.category?.name || "Technology",
          "keywords": article.tags?.map((t: any) => t.name).join(', ') || article.primary_keyword || "technology, ai, computing"
        })}</script>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": "https://rafvex.com"
            },
            ...(article.category ? [{
              "@type": "ListItem",
              "position": 2,
              "name": article.category.name,
              "item": `https://rafvex.com/category/${article.category.slug}`
            }] : []),
            {
              "@type": "ListItem",
              "position": article.category ? 3 : 2,
              "name": article.title,
              "item": `https://rafvex.com/article/${article.slug}`
            }
          ]
        })}</script>
      </Head>

      {/* ── READING PROGRESS BAR AT TOP ── */}
      <div
        ref={progressBarRef}
        className="fixed top-0 left-0 h-[3.5px] z-50 pointer-events-none transition-all duration-75 ease-out"
        style={{
          width: '0%',
          background: 'linear-gradient(90deg, #dc2626 0%, #ef4444 60%, #f97316 100%)',
          boxShadow: '0 1px 6px rgba(220, 38, 38, 0.4)',
          willChange: 'width',
        }}
      />

      {/* ── EDITORIAL CONTAINER (US Tech Blog 3-Column Design) ── */}
      <div className="w-full max-w-[1440px] 2xl:max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 pt-6 sm:pt-10">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-6 flex-wrap font-medium">
          <Link href="/" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">Home</Link>
          <ChevronRight size={12} className="text-slate-400 dark:text-slate-500" />
          {article.category && (
            <>
              <Link href={`/category/${article.category.slug}`} className="hover:text-red-600 dark:hover:text-red-400 transition-colors">
                {article.category.name}
              </Link>
              <ChevronRight size={12} className="text-slate-400 dark:text-slate-500" />
            </>
          )}
          <span className="text-slate-900 dark:text-slate-100 font-semibold truncate max-w-[280px] sm:max-w-md">
            {article.title}
          </span>
        </nav>

        {/* ── 2-COLUMN LAYOUT: Main Reading Article on Left | Sticky Sidebar on Right ── */}
        <div className="flex flex-col lg:flex-row gap-8 xl:gap-12 items-start relative">

          {/* ── MAIN ARTICLE COLUMN (LEFT) ── */}
          <main className="flex-1 min-w-0 max-w-full lg:max-w-[860px] xl:max-w-[940px] 2xl:max-w-[980px]">
            
            {/* Category Pill & Save Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              {article.category ? (
                <Link
                  href={`/category/${article.category.slug}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/50 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 dark:bg-red-400" />
                  {article.category.name}
                </Link>
              ) : <div />}

              <div className="flex items-center gap-2">
                <ReadBadge articleId={article.id} />
                <BookmarkButton articleId={article.id} showText className="px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 hover:border-red-300 dark:hover:border-red-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 shadow-2xs" />

                {/* Header Share Dropdown Button */}
                <div ref={headerShareRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setHeaderShareDropdownOpen(!headerShareDropdownOpen)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 hover:border-red-300 dark:hover:border-red-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-red-600 dark:hover:text-red-400 shadow-2xs transition-colors cursor-pointer"
                  >
                    <Share2 size={13} />
                    <span>Share</span>
                    <ChevronRight size={12} className={`transition-transform duration-200 ${headerShareDropdownOpen ? 'rotate-90' : ''}`} />
                  </button>

                  {headerShareDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200/90 dark:border-slate-800 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block px-2.5 py-1">
                        Share This Story
                      </span>
                      <button
                        type="button"
                        onClick={() => { shareTwitter(); setHeaderShareDropdownOpen(false); }}
                        className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer text-left"
                      >
                        <span className="w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-[11px]">𝕏</span>
                        <span>Share on X</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => { shareFacebook(); setHeaderShareDropdownOpen(false); }}
                        className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer text-left"
                      >
                        <span className="w-6 h-6 rounded-lg bg-[#1877F2] text-white flex items-center justify-center font-bold text-[11px]">f</span>
                        <span>Share on Facebook</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => { shareLinkedin(); setHeaderShareDropdownOpen(false); }}
                        className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer text-left"
                      >
                        <span className="w-6 h-6 rounded-lg bg-[#0A66C2] text-white flex items-center justify-center font-bold text-[11px]">in</span>
                        <span>Share on LinkedIn</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => { shareWhatsapp(); setHeaderShareDropdownOpen(false); }}
                        className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer text-left"
                      >
                        <span className="w-6 h-6 rounded-lg bg-[#25D366] text-white flex items-center justify-center font-bold text-[11px]">
                          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.969.587 1.771.865 2.796.865 3.183 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.768-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.062-2.12-.533-1.637-.681-2.673-2.355-2.755-2.464-.08-.109-.652-.868-.652-1.656 0-.787.411-1.177.557-1.336.145-.16.319-.199.426-.199.106 0 .213.001.306.006.098.005.23-.037.36.275.133.319.456 1.111.496 1.192.04.08.067.173.014.28-.053.107-.08.173-.16.267-.079.093-.167.208-.239.279-.08.08-.163.167-.07.327.093.16.413.682.887 1.103.61.542 1.124.71 1.284.79.16.08.254.067.348-.04.093-.107.4-.466.507-.626.107-.16.213-.133.36-.08.146.053.931.439 1.091.519.16.08.267.12.306.186.039.066.039.387-.105.792z"/></svg>
                        </span>
                        <span>Share on WhatsApp</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => { copyLink(); setHeaderShareDropdownOpen(false); }}
                        className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer border-t border-slate-100 dark:border-slate-800 mt-1 text-left"
                      >
                        <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center">
                          <LinkIcon size={12} />
                        </span>
                        <span>{copied ? 'Link Copied!' : 'Copy Link'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Article Headline */}
            <h1
              className="font-extrabold text-slate-900 dark:text-slate-100 tracking-tight leading-[1.14] mb-5 font-['Outfit']"
              style={{ fontSize: 'clamp(28px, 4.2vw, 46px)' }}
            >
              {article.title}
            </h1>

            {/* Dek / Standfirst Excerpt */}
            {article.excerpt && (
              <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed font-normal mb-7 border-l-2 border-slate-200 dark:border-slate-700 pl-4">
                {article.excerpt}
              </p>
            )}

            {/* Featured Image */}
            {article.cover_image_url && (
              <figure className="mb-8 rounded-2xl overflow-hidden shadow-sm border border-slate-200/70 dark:border-slate-800 bg-slate-100 dark:bg-slate-800">
                <div className="aspect-video w-full overflow-hidden">
                  <img
                    src={article.cover_image_url}
                    alt={article.cover_image_alt || article.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                {article.cover_image_alt && (
                  <figcaption className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 py-3 px-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex items-start gap-2">
                    <span className="font-bold text-slate-900 dark:text-slate-200 shrink-0">Figure 1:</span>
                    <span>{article.cover_image_alt}</span>
                  </figcaption>
                )}
              </figure>
            )}

            {/* Video Broadcast Attachment (if present) */}
            {article.video_url && (
              <div className="mb-10">
                <VideoEmbed url={article.video_url} title={article.title} />
              </div>
            )}

            {/* ── ARTICLE PROSE CONTENT ── */}
            <div
              className="article-prose"
              dangerouslySetInnerHTML={{ __html: sanitizedContent }}
            />

            {/* Article Tags */}
            {article.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-10 pt-6 border-t border-slate-200 dark:border-slate-800">
                {article.tags.map((tag: any) => (
                  <span
                    key={tag.id}
                    className="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/60 hover:text-red-600 dark:hover:text-red-400 rounded-full text-xs font-medium text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                  >
                    #{tag.name}
                  </span>
                ))}
              </div>
            )}

            {/* ── Author Bio Card (Compact & Sleek) ── */}
            {article.author && (() => {
              const authorName = article.author?.profile?.display_name ||
                (article.author?.name && !['Rafvex', 'Admin User', 'admin'].includes(article.author.name)
                  ? article.author.name
                  : (site?.founder_name || 'Soporadara Rin'));

              const rawBio = article.author?.profile?.bio;
              const isOldDefaultBio = !rawBio || rawBio.includes('Site Administrator for Rafelblog') || rawBio.includes('Site Administrator for Rafvex') || rawBio.includes('Passionate researcher');
              const authorBio = article.author?.profile?.job_title
                ? `${article.author.profile.job_title}${rawBio && !isOldDefaultBio ? ` · ${rawBio}` : ''}`
                : (site?.founder_bio && site.founder_bio !== 'Passionate researcher, writer, and technology explorer dedicated to sharing knowledge and digital discoveries with the world.'
                    ? site.founder_bio
                    : (!isOldDefaultBio ? rawBio : 'Author'));

              const authorAvatar = article.author?.profile?.avatar || article.author?.avatar || site?.founder_avatar;
              const authorInitial = authorName.charAt(0) || 'A';

              return (
                <div className="mt-8 p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs flex items-center gap-4 sm:gap-5">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-red-600 to-rose-700 text-white font-bold text-lg flex items-center justify-center shrink-0 shadow-xs">
                    {authorAvatar ? (
                      <img src={authorAvatar} alt={authorName} className="w-full h-full object-cover" />
                    ) : (
                      <span>{authorInitial}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-red-600 dark:text-red-400">Rafvex</span>
                      {article.published_at && (
                        <>
                          <span className="text-slate-300 dark:text-slate-600">•</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                            Published on {format(new Date(article.published_at), 'MMMM d, yyyy')}
                          </span>
                        </>
                      )}
                      {article.reading_time && (
                        <>
                          <span className="text-slate-300 dark:text-slate-600">•</span>
                          <span className="text-xs text-slate-400 dark:text-slate-500 inline-flex items-center gap-1">
                            <Clock size={12} className="text-slate-400 dark:text-slate-500" /> {article.reading_time} min read
                          </span>
                        </>
                      )}
                    </div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 leading-snug">{authorName}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                      {authorBio || 'Author'}
                    </p>
                  </div>
                </div>
              );
            })()}

            {/* In-Article Mid/Bottom Google AdSense Slot */}
            <AdBanner slot="7890123456" className="my-8" />

            {/* ── Comments Section ── */}
            <div id="comments-section" className="mt-8 pt-10 border-t border-slate-200 dark:border-slate-800 relative isolate z-10">
              <Comments articleId={article.id} comments={article.comments || []} />
            </div>

          </main>

          {/* ── RIGHT COLUMN: Consolidated Editorial & Tech Publication Sidebar ── */}
          <aside className="w-full lg:w-[350px] xl:w-[380px] shrink-0 space-y-6 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-6.5rem)] lg:overflow-y-auto lg:pr-1.5 custom-sidebar-scroll">

            {/* 1. Quick Share & Save */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-3.5 shadow-sm">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-2 px-1">
                Quick Share &amp; Save
              </span>
              <div className="flex items-center justify-between gap-1.5">
                <button
                  type="button"
                  onClick={shareTwitter}
                  title="Share on X"
                  className="w-8 h-8 rounded-lg flex items-center justify-center bg-black hover:bg-neutral-800 text-white transition-all shadow-2xs cursor-pointer active:scale-95 shrink-0"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={shareFacebook}
                  title="Share on Facebook"
                  className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#1877F2] hover:bg-[#166fe5] text-white transition-all shadow-2xs cursor-pointer active:scale-95 shrink-0"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={shareLinkedin}
                  title="Share on LinkedIn"
                  className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#0A66C2] hover:bg-[#084e96] text-white transition-all shadow-2xs cursor-pointer active:scale-95 shrink-0"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={copyLink}
                  title={copied ? "Link Copied!" : "Copy Link"}
                  className={`flex-1 h-8 rounded-lg flex items-center justify-center gap-1.5 text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95 ${
                    copied ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700'
                  }`}
                >
                  {copied ? <Check size={13} /> : <LinkIcon size={13} className="text-slate-600 dark:text-slate-400" />}
                  <span className="text-[11px]">{copied ? 'Copied' : 'Link'}</span>
                </button>
                <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/50 hover:bg-red-100 dark:hover:bg-red-950/80 border border-red-100/90 dark:border-red-900/60 flex items-center justify-center shadow-2xs transition-colors shrink-0">
                  <BookmarkButton articleId={article.id} size={15} />
                </div>
              </div>
            </div>

            {/* 2. Table of Contents (if 2 or more headings found) */}
            {headings.length >= 2 && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
                  <BookOpen size={16} className="text-red-600 dark:text-red-400" />
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm tracking-tight">On This Page</h3>
                </div>
                <nav className="flex flex-col space-y-1">
                  {headings.map((h, idx) => {
                    const isActive = activeHeadingId === h.id;
                    return (
                      <button
                        key={h.id}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          scrollToHeading(h.id, idx);
                        }}
                        className={`w-full text-left text-xs py-2 px-2.5 rounded-lg transition-all flex items-start gap-2 cursor-pointer ${
                          isActive
                            ? 'bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 font-bold'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 font-normal'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                          isActive ? 'bg-red-600 dark:bg-red-400' : 'bg-slate-300 dark:bg-slate-600'
                        }`} />
                        <span className="line-clamp-1">{h.text}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            )}

            {/* 3. Cluster Playlist / Series */}
            {clusterPlaylist.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-sm">
                <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                    <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100">
                      Cluster Playlist
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full">
                    {clusterPlaylist.length} Chapters
                  </span>
                </div>

                <div className="space-y-1 max-h-64 overflow-y-auto pr-1 scrollbar-thin">
                  {clusterPlaylist.map((item: any, idx: number) => {
                    const isCurrent = item.id === article.id;
                    return (
                      <Link
                        key={item.id}
                        href={`/article/${item.slug}`}
                        prefetch="hover"
                        className={`flex items-start gap-2 p-2 rounded-xl transition-all text-xs group ${
                          isCurrent
                            ? 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 font-bold border border-red-200/80 dark:border-red-900/50 shadow-2xs'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400'
                        }`}
                      >
                        <span className={`w-5 h-5 rounded-lg flex items-center justify-center font-mono text-[10px] shrink-0 font-bold mt-0.5 ${
                          isCurrent ? 'bg-red-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700'
                        }`}>
                          {isCurrent ? '▶' : idx + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 leading-tight">{item.title}</p>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal mt-0.5 block">
                            {isCurrent ? '● Currently Reading' : `${item.reading_time || 8}m read`}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 4. Trending in Tech */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <TrendingUp size={17} className="text-red-600 dark:text-red-400" />
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm tracking-tight">Trending in Tech</h3>
                </div>
                <span className="text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/60 px-2 py-0.5 rounded uppercase">Popular</span>
              </div>

              <div className="space-y-4">
                {(trending ?? related ?? []).slice(0, 5).map((story: any, index: number) => (
                  <Link
                    key={story.id}
                    href={`/article/${story.slug}`}
                    className="group flex items-start gap-3.5 pb-4 border-b border-slate-100 dark:border-slate-800 last:border-0 last:pb-0"
                  >
                    {/* Ranked Number Badge */}
                    <span className="font-extrabold text-lg text-slate-300 dark:text-slate-600 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors w-5 shrink-0 text-center">
                      0{index + 1}
                    </span>

                    <div className="flex-1 min-w-0">
                      {story.category && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400 block mb-1">
                          {story.category.name}
                        </span>
                      )}
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors leading-snug line-clamp-2">
                        {story.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-400 dark:text-slate-500">
                        <span>{story.reading_time || 5}m read</span>
                        {story.published_at && (
                          <>
                            <span>•</span>
                            <span>{format(new Date(story.published_at), 'MMM d')}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Mini Thumbnail */}
                    <div className="w-16 h-12 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-100 dark:border-slate-800 relative">
                      {story.cover_image_url ? (
                        <img
                          src={story.cover_image_url}
                          alt={story.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-red-400">
                          <BookOpen size={16} />
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* 5. Key Categories */}
            {sidebarCategories.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-sm">
                <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <FolderOpen size={14} className="text-red-600 dark:text-red-400" />
                    <span>Key Categories</span>
                  </span>
                  <Link href="/sitemap" prefetch="hover" className="text-[10px] font-bold text-red-600 dark:text-red-400 hover:underline">
                    All &rarr;
                  </Link>
                </div>
                <div className="space-y-1">
                  {sidebarCategories.map((cat: any) => (
                    <Link
                      key={cat.id}
                      href={`/category/${cat.slug}`}
                      prefetch="hover"
                      className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    >
                      <span className="truncate">{cat.name}</span>
                      <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 font-medium">
                        {cat.articles_count ? `${cat.articles_count}` : ''}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* 6. Topics & Tags Cloud */}
            {combinedTags.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-sm">
                <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <TagIcon size={13} className="text-red-600 dark:text-red-400" />
                    <span>Topics &amp; Tags</span>
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                    {combinedTags.length} tags
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(tagsExpanded ? combinedTags : combinedTags.slice(0, 8)).map((tag: any) => (
                    <Link
                      key={tag.id || tag.name}
                      href={`/search?q=${encodeURIComponent(tag.name)}`}
                      prefetch="hover"
                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/60 hover:text-red-600 dark:hover:text-red-400 text-slate-600 dark:text-slate-300 text-[11px] font-medium transition-colors"
                    >
                      #{tag.name}
                    </Link>
                  ))}
                </div>
                {combinedTags.length > 8 && (
                  <button
                    type="button"
                    onClick={() => setTagsExpanded(!tagsExpanded)}
                    className="mt-2.5 text-[11px] font-bold text-red-600 dark:text-red-400 hover:underline block cursor-pointer"
                  >
                    {tagsExpanded ? '▲ Show Fewer Tags' : `▼ +${combinedTags.length - 8} More Topics`}
                  </button>
                )}
              </div>
            )}

            {/* 7. Follow Us (Facebook, IG, Youtube, X) */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-sm">
              <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 block pb-2.5 mb-3 border-b border-slate-100 dark:border-slate-800">
                Follow Us
              </span>
              <div className="grid grid-cols-2 gap-2">
                {/* Facebook */}
                <a
                  href={site?.facebook_url || 'https://facebook.com/rafvex'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/80 hover:bg-[#1877F2] hover:text-white text-slate-700 dark:text-slate-300 transition-all text-xs font-bold group"
                >
                  <span className="w-5 h-5 rounded-md bg-blue-100 dark:bg-blue-950/60 group-hover:bg-white/20 text-[#1877F2] group-hover:text-white flex items-center justify-center shrink-0">
                    <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  </span>
                  <span className="truncate">Facebook</span>
                </a>

                {/* Instagram */}
                <a
                  href={site?.instagram_url || 'https://instagram.com/rafvex'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/80 hover:bg-gradient-to-tr hover:from-amber-500 hover:via-rose-500 hover:to-purple-600 hover:text-white text-slate-700 dark:text-slate-300 transition-all text-xs font-bold group"
                >
                  <span className="w-5 h-5 rounded-md bg-pink-100 dark:bg-pink-950/60 group-hover:bg-white/20 text-pink-600 group-hover:text-white flex items-center justify-center shrink-0">
                    <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                  </span>
                  <span className="truncate">Instagram</span>
                </a>

                {/* YouTube */}
                <a
                  href={site?.youtube_url || 'https://youtube.com/@rafvex'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/80 hover:bg-red-600 hover:text-white text-slate-700 dark:text-slate-300 transition-all text-xs font-bold group"
                >
                  <span className="w-5 h-5 rounded-md bg-red-100 dark:bg-red-950/60 group-hover:bg-white/20 text-red-600 group-hover:text-white flex items-center justify-center shrink-0">
                    <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                  </span>
                  <span className="truncate">YouTube</span>
                </a>

                {/* Twitter / X */}
                <a
                  href={site?.twitter_handle ? `https://twitter.com/${site.twitter_handle.replace('@', '')}` : 'https://twitter.com/rafvex'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/80 hover:bg-black hover:text-white text-slate-700 dark:text-slate-300 transition-all text-xs font-bold group"
                >
                  <span className="w-5 h-5 rounded-md bg-slate-200 dark:bg-slate-700 group-hover:bg-white/20 text-slate-900 dark:text-slate-100 group-hover:text-white flex items-center justify-center shrink-0 text-[11px]">
                    𝕏
                  </span>
                  <span className="truncate">Twitter / 𝕏</span>
                </a>
              </div>
            </div>

            {/* 8. Newsletter Card */}
            <div className="bg-gradient-to-br from-red-50/70 via-white to-white dark:from-slate-900 dark:via-slate-900 dark:to-[#0f172a] border border-red-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm relative overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center mb-3.5 shadow-sm">
                <Sparkles size={18} />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base mb-1.5 font-['Outfit']">Stay Ahead in Tech</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Get our weekly digest of verified tech breakdowns, AI research, and practical guides.
              </p>
              <form onSubmit={e => e.preventDefault()} className="space-y-2">
                <input
                  type="email"
                  placeholder="Enter your work email"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors shadow-sm"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-sm tracking-wide uppercase"
                >
                  Join The Inner Circle
                </button>
              </form>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center mt-2.5">Weekly edition. Zero spam.</p>
            </div>

          </aside>
        </div>
      </div>

      {/* ── BOTTOM SECTION: Full-Width Related Stories Grid ── */}
      {related?.length > 0 && (
        <section className="bg-slate-50/80 dark:bg-[#070b14]/90 border-t border-slate-200 dark:border-slate-800 py-14 mt-16 transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider block mb-1">More to Explore</span>
                <h2 className="font-extrabold text-slate-900 dark:text-slate-100 text-2xl font-['Outfit'] tracking-tight">
                  Related Stories
                </h2>
              </div>
              <Link
                href={`/category/${article.category?.slug || 'ai-tools'}`}
                className="text-xs font-bold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 inline-flex items-center gap-1 transition-colors"
              >
                View Category <ArrowRight size={13} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.slice(0, 4).map((rel: any) => (
                <Link
                  key={rel.id}
                  href={`/article/${rel.slug}`}
                  className="group bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col"
                >
                  <div className="aspect-[16/9] bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
                    {rel.cover_image_url ? (
                      <img
                        src={rel.cover_image_url}
                        alt={rel.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-red-950 flex flex-col items-center justify-center text-slate-300 relative group-hover:scale-105 transition-transform duration-300 p-4 text-center">
                        <div className="w-11 h-11 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400 mb-2 shadow-inner">
                          <BookOpen size={22} />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Rafvex Feature</span>
                      </div>
                    )}
                    {rel.category && (
                      <span className="absolute top-3 left-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm text-slate-900 dark:text-slate-100 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                        {rel.category.name}
                      </span>
                    )}
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors leading-snug line-clamp-2 mb-2 font-['Outfit']">
                        {rel.title}
                      </h3>
                      {rel.excerpt && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-3">
                          {rel.excerpt}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 pt-3 border-t border-slate-100 dark:border-slate-800 mt-auto">
                      <span>{rel.published_at ? format(new Date(rel.published_at), 'MMM d, yyyy') : 'Recently published'}</span>
                      <span>{rel.reading_time || 5} min read</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </PublicLayout>
  );
}
