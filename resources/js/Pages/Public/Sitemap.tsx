import React, { useState, useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import {
  Search,
  Clock,
  ExternalLink,
  ArrowRight,
  Layers,
  FileText,
  Globe,
  Shield,
  BookOpen,
  Flame,
  Shuffle,
  Share2,
  Copy,
  Check,
  Compass,
  Sparkles,
  TrendingUp,
  Eye,
  Hash,
} from 'lucide-react';

interface ArticleItem {
  id: number;
  title: string;
  slug: string;
  published_at: string | null;
  reading_time: number;
  views_count?: number;
  cover_image_url?: string | null;
}

interface TrendingArticle {
  id: number;
  title: string;
  slug: string;
  excerpt?: string | null;
  cover_image_url?: string | null;
  reading_time: number;
  published_at: string | null;
  views_count?: number;
  category?: {
    name: string;
    slug: string;
  } | null;
}

interface SubcategoryItem {
  id: number;
  name: string;
  slug: string;
}

interface CategoryGroup {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  total_articles: number;
  subcategories: SubcategoryItem[];
  articles: ArticleItem[];
}

interface StaticPage {
  title: string;
  url: string;
  description: string;
  badge: string;
}

interface SitemapProps {
  auth?: any;
  categories: CategoryGroup[];
  trending_articles?: TrendingArticle[];
  random_slug?: string | null;
  stats: {
    total_articles: number;
    total_categories: number;
    last_updated: string;
  };
  static_pages: StaticPage[];
}

export default function Sitemap({
  auth,
  categories = [],
  trending_articles = [],
  random_slug,
  stats,
  static_pages = [],
}: SitemapProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>('all');
  const [copied, setCopied] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://rafvex.com';
  const sitemapUrl = `${siteUrl}/sitemap`;

  // Real-time filtering across categories, articles, and subtopics
  const filteredCategories = useMemo(() => {
    let list = categories;

    // Filter by tab if selected
    if (selectedCategoryTab !== 'all') {
      list = list.filter(c => c.slug === selectedCategoryTab);
    }

    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase().trim();

    return list
      .map(cat => {
        const matchesCategory =
          cat.name.toLowerCase().includes(q) ||
          (cat.description && cat.description.toLowerCase().includes(q));
        const matchedArticles = cat.articles.filter(a => a.title.toLowerCase().includes(q));
        const matchedSubcats = cat.subcategories.filter(s => s.name.toLowerCase().includes(q));

        if (matchesCategory || matchedArticles.length > 0 || matchedSubcats.length > 0) {
          return {
            ...cat,
            articles: matchesCategory ? cat.articles : matchedArticles,
          };
        }
        return null;
      })
      .filter((c): c is CategoryGroup => c !== null);
  }, [categories, searchQuery, selectedCategoryTab]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(sitemapUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const shareText = encodeURIComponent(
    'Explore the complete Rafvex knowledge hub & sitemap — Technology, AI, Guides & Digital Discovery:'
  );
  const encodedUrl = encodeURIComponent(sitemapUrl);

  // Schema.org Structured Data
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Home',
        'item': siteUrl,
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': 'Sitemap',
        'item': sitemapUrl,
      },
    ],
  };

  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Rafvex Knowledge Directory & Sitemap',
    description:
      'Explore the complete architecture of Rafvex: Technology, AI, how-to guides, useful apps, and English reading stories.',
    url: sitemapUrl,
    hasPart: categories.map(cat => ({
      '@type': 'WebPage',
      name: cat.name,
      url: `${siteUrl}/category/${cat.slug}`,
    })),
  };

  return (
    <PublicLayout auth={auth}>
      <Head>
        <title>Sitemap — Rafvex</title>
        <meta
          name="description"
          content="Explore the complete Rafvex directory: Technology, AI, how-to guides, useful apps and websites, English reading stories, and informative articles. All systematically organized for readers and search engines."
        />
        <link rel="canonical" href={sitemapUrl} />
        <meta property="og:title" content="Rafvex Sitemap & Knowledge Directory" />
        <meta
          property="og:description"
          content="Explore technology, AI, how-to guides, useful apps and websites, English reading stories, tutorials, and informative articles."
        />
        <meta property="og:url" content={sitemapUrl} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Rafvex Sitemap & Knowledge Directory" />
        <meta
          name="twitter:description"
          content="Explore technology, AI, how-to guides, useful apps and websites, English reading stories, tutorials, and informative articles."
        />
        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(collectionJsonLd)}</script>
      </Head>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 20px 100px' }}>
        {/* ── BREADCRUMB ── */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center gap-2 text-xs font-medium text-[#64748b] dark:text-slate-400">
            <li>
              <Link href="/" className="hover:text-[#dc2626] dark:hover:text-red-400 transition-colors">
                Home
              </Link>
            </li>
            <li className="text-slate-400 dark:text-slate-600">/</li>
            <li className="text-[#0f172a] dark:text-slate-200 font-semibold">Sitemap</li>
          </ol>
        </nav>

        {/* ── VIRAL HERO SECTION (CNN Architecture + Modern Tech Discovery) ── */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white p-8 sm:p-12 mb-12 shadow-xl border border-slate-800">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 -mt-16 -mr-16 w-80 h-80 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-16 w-60 h-60 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-wider mb-4">
              <Sparkles size={13} className="text-red-400" />
              Rafvex Knowledge Architecture &amp; Discovery
            </div>

            <h1
              style={{ fontFamily: "'Outfit', sans-serif" }}
              className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.15] text-white mb-4"
            >
              Learn. Explore. Discover.
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-rose-300 to-amber-300">
                Every Single Topic In One Place.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
              A comprehensive, systematically indexed directory inspired by global media standards.
              Explore technology, AI, how-to guides, useful apps, and English reading stories —
              crafted to help you learn something new every day.
            </p>
          </div>

          {/* Bottom Live Stats Bar */}
          <div className="mt-10 pt-6 border-t border-slate-800/80 flex flex-wrap items-center gap-6 sm:gap-10 text-xs text-slate-400">
            <div>
              <span className="text-slate-500 block text-[11px] uppercase tracking-wider font-semibold">
                Indexed Guides
              </span>
              <strong className="text-white text-lg font-extrabold">{stats.total_articles} Articles</strong>
            </div>
            <div className="w-px h-8 bg-slate-800 hidden sm:block" />
            <div>
              <span className="text-slate-500 block text-[11px] uppercase tracking-wider font-semibold">
                Knowledge Categories
              </span>
              <strong className="text-white text-lg font-extrabold">{stats.total_categories} Sections</strong>
            </div>
            <div className="w-px h-8 bg-slate-800 hidden sm:block" />
            <div>
              <span className="text-slate-500 block text-[11px] uppercase tracking-wider font-semibold">
                Latest Content Sync
              </span>
              <strong className="text-white text-lg font-extrabold">{stats.last_updated}</strong>
            </div>
            <div className="w-px h-8 bg-slate-800 hidden sm:block" />
            <div>
              <span className="text-slate-500 block text-[11px] uppercase tracking-wider font-semibold">
                Indexing Standard
              </span>
              <strong className="text-emerald-400 text-lg font-extrabold">Google Search Ready</strong>
            </div>
          </div>
        </div>

        {/* ── 🔥 TRENDING & VIRAL PICKS (High Click-Through & Engagement Shelf) ── */}
        {trending_articles.length > 0 && (
          <div className="mb-14">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-red-100 dark:bg-red-950/40 flex items-center justify-center text-red-600 dark:text-red-400 shadow-xs">
                  <Flame size={18} className="fill-red-500 text-red-600 dark:text-red-400 animate-pulse" />
                </div>
                <div>
                  <h2
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                    className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight"
                  >
                    Trending & Most-Read Guides
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    The most viral discoveries and popular knowledge on Rafvex right now.
                  </p>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-1 text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">
                <TrendingUp size={14} />
                High Reader Interest
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {trending_articles.map((item, idx) => (
                <Link
                  key={item.id}
                  href={`/article/${item.slug}`}
                  className="group relative flex flex-col rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs hover:shadow-xl hover:border-red-200 dark:hover:border-red-900/50 hover:-translate-y-1 transition-all duration-200"
                >
                  {/* Thumbnail if available */}
                  {item.cover_image_url ? (
                    <div className="relative w-full h-36 rounded-xl overflow-hidden mb-3.5 bg-slate-100 dark:bg-slate-800">
                      <img
                        src={item.cover_image_url}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider">
                        #{idx + 1} Trending
                      </span>
                    </div>
                  ) : (
                    <div className="relative w-full h-28 rounded-xl bg-gradient-to-br from-red-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/60 flex items-center justify-center mb-3.5 border border-red-100/50 dark:border-slate-700">
                      <Flame size={24} className="text-red-400" />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 text-[10px] font-bold shadow-xs">
                        #{idx + 1} Trending
                      </span>
                    </div>
                  )}

                  {/* Category & Read Time */}
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-2">
                    {item.category ? (
                      <span className="text-red-600 dark:text-red-400 group-hover:underline">
                        {item.category.name}
                      </span>
                    ) : (
                      <span>Guide</span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      {item.reading_time} min read
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-red-600 dark:group-hover:text-red-400 line-clamp-2 leading-snug mb-2 transition-colors">
                    {item.title}
                  </h3>

                  {/* Excerpt if present */}
                  {item.excerpt && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-3">
                      {item.excerpt}
                    </p>
                  )}

                  {/* Read More footer */}
                  <div className="mt-auto pt-2 flex items-center justify-between text-xs font-semibold text-slate-400 dark:text-slate-500 group-hover:text-red-600 dark:group-hover:text-red-400">
                    <span>Read Guide</span>
                    <ArrowRight
                      size={14}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── SEARCH & TOPIC MATRIX BAR (CNN Directory Controls) ── */}
        <div id="categories-index" className="mb-10 scroll-mt-20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h2
                style={{ fontFamily: "'Outfit', sans-serif" }}
                className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight mb-1"
              >
                Directory by Category & Topics
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Browse our complete knowledge architecture alphabetically and by department.
              </p>
            </div>

            {/* Real-time search filter */}
            <div className="relative w-full md:w-80">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search topics, guides, keywords..."
                className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Interactive Category Filter Pills */}
          <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
            <button
              type="button"
              onClick={() => setSelectedCategoryTab('all')}
              className={`px-3.5 py-1.5 rounded-full font-bold transition-all shrink-0 cursor-pointer ${
                selectedCategoryTab === 'all'
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              All Sections ({stats.total_articles})
            </button>

            {categories.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategoryTab(cat.slug)}
                className={`px-3.5 py-1.5 rounded-full font-bold transition-all shrink-0 cursor-pointer ${
                  selectedCategoryTab === cat.slug
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                {cat.name} ({cat.total_articles})
              </button>
            ))}

            <a
              href="#essential-pages"
              className="px-3.5 py-1.5 rounded-full font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 shrink-0 transition-all"
            >
              Institutional & Legal
            </a>
          </div>
        </div>

        {/* ── CNN-INSPIRED CATEGORIES GRID ── */}
        <div className="space-y-12">
          {filteredCategories.length > 0 ? (
            filteredCategories.map(cat => (
              <section
                key={cat.id}
                id={`cat-${cat.slug}`}
                className="scroll-mt-24 p-6 sm:p-8 rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs hover:shadow-md transition-all duration-200"
              >
                {/* Header: Category Title + Topic Count + Subcategory Pills */}
                <div className="pb-5 border-b border-slate-100 dark:border-slate-800 mb-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <span className="w-3 h-3 rounded-full bg-red-600 ring-4 ring-red-100 dark:ring-red-950/50 shrink-0" />
                      <h3
                        style={{ fontFamily: "'Outfit', sans-serif" }}
                        className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight"
                      >
                        <Link
                          href={`/category/${cat.slug}`}
                          className="hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        >
                          {cat.name}
                        </Link>
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/40">
                        {cat.total_articles} {cat.total_articles === 1 ? 'guide' : 'guides'}
                      </span>
                    </div>

                    <Link
                      href={`/category/${cat.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors shrink-0"
                    >
                      View all in {cat.name}
                      <ArrowRight size={13} />
                    </Link>
                  </div>

                  {cat.description && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl mb-4">
                      {cat.description}
                    </p>
                  )}

                  {/* Subcategory Topic Tags (Pills) */}
                  {cat.subcategories && cat.subcategories.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 pt-2">
                      <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
                        <Hash size={12} />
                        Topics:
                      </span>
                      {cat.subcategories.map(sub => (
                        <Link
                          key={sub.id}
                          href={`/category/${sub.slug}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800/80 hover:bg-red-50 dark:hover:bg-red-950/40 text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 text-xs font-medium border border-slate-200/60 dark:border-slate-700/60 transition-colors"
                        >
                          #{sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Published Articles List in 2-Column Clean Media Layout */}
                {cat.articles.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                    {cat.articles.map(article => (
                      <article
                        key={article.id}
                        className="group flex items-start justify-between gap-3 py-2 border-b border-slate-50 dark:border-slate-800/60 hover:border-red-100 dark:hover:border-slate-700 transition-colors"
                      >
                        <div className="flex items-start gap-2.5 min-w-0">
                          <span className="text-slate-300 dark:text-slate-600 group-hover:text-red-500 font-bold text-xs mt-0.5 select-none transition-colors">
                            •
                          </span>
                          <Link
                            href={`/article/${article.slug}`}
                            className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-1 leading-snug"
                            title={article.title}
                          >
                            {article.title}
                          </Link>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                          {article.reading_time && (
                            <span className="hidden sm:inline-block">
                              {article.reading_time}m
                            </span>
                          )}
                          {article.published_at && (
                            <span>{article.published_at}</span>
                          )}
                          <ArrowRight
                            size={12}
                            className="opacity-0 group-hover:opacity-100 text-red-500 -translate-x-1 group-hover:translate-x-0 transition-all"
                          />
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 dark:text-slate-500 italic py-2">
                    New guides and tutorials for {cat.name} are currently in editorial review.
                  </p>
                )}

                {/* Deep Section Link */}
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400 dark:text-slate-500">
                    Showing top guides in {cat.name}
                  </span>
                  <Link
                    href={`/category/${cat.slug}`}
                    className="font-bold text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 transition-colors inline-flex items-center gap-1"
                  >
                    Browse full archive ({cat.total_articles})
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </section>
            ))
          ) : (
            <div className="p-12 text-center rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <Search size={32} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">No topics or guides found</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
                We couldn't find any articles or sections matching "{searchQuery}".
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategoryTab('all');
                }}
                className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors cursor-pointer"
              >
                Reset Search Filters
              </button>
            </div>
          )}
        </div>

        {/* ── ESSENTIAL INSTITUTIONAL DIRECTORY (Google Trust Signals) ── */}
        <div id="essential-pages" className="mt-16 scroll-mt-20">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300">
              <Shield size={16} />
            </div>
            <div>
              <h2
                style={{ fontFamily: "'Outfit', sans-serif" }}
                className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight"
              >
                Institutional, Legal & Technical Index
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Core publication pages, privacy documentation, and search engine endpoints.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {static_pages.map((page, idx) => (
              <a
                key={idx}
                href={page.url}
                className="group p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      {page.badge}
                    </span>
                    <ExternalLink
                      size={13}
                      className="text-slate-300 dark:text-slate-600 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors"
                    />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors mb-1">
                    {page.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {page.description}
                  </p>
                </div>
                <span className="mt-4 text-[11px] font-mono text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors truncate">
                  {page.url}
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* ── VIRAL COMMUNITY / KNOWLEDGE HUB BANNER ── */}
        <div className="mt-16 rounded-3xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white p-8 sm:p-10 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="max-w-xl text-center sm:text-left">
            <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider mb-2">
              Share The Knowledge
            </span>
            <h3
              style={{ fontFamily: "'Outfit', sans-serif" }}
              className="text-2xl sm:text-3xl font-black tracking-tight mb-2"
            >
              Found Something Interesting?
            </h3>
            <p className="text-sm text-red-100 leading-relaxed">
              Help your friends and colleagues learn something new today. Share our directory or bookmark Rafvex for daily technology discoveries.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-slate-900 text-xs font-bold shadow-md hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
            >
              {copied ? (
                <>
                  <Check size={14} className="text-emerald-600" />
                  Directory Link Copied!
                </>
              ) : (
                <>
                  <Copy size={14} />
                  Copy Share Link
                </>
              )}
            </button>

            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-black/20 hover:bg-black/30 text-white text-xs font-bold border border-white/20 transition-all"
            >
              Back to Home
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
