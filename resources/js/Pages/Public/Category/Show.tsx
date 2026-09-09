import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import {
  Clock,
  ArrowRight,
  Compass,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Flame,
  Sparkles,
  Smartphone,
  Laptop,
  HelpCircle,
  BookOpen,
  Shield,
  Headphones,
  Bot,
  Layers,
  Tag,
  SlidersHorizontal,
  User,
} from 'lucide-react';
import { format } from 'date-fns';

interface CategoryItem {
  id: number;
  name: string;
  slug: string;
  description?: string;
  articles_count?: number;
}

interface ArticleItem {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  cover_image_url?: string;
  published_at?: string;
  reading_time?: number;
  category_id?: number;
  category?: {
    id: number;
    name: string;
    slug: string;
  };
  author?: {
    id: number;
    name: string;
    avatar_url?: string;
  };
  tags?: Array<{ id: number; name: string; slug: string }>;
}

interface ShowProps {
  auth: any;
  category: any;
  parentCategory?: any;
  subcategories: CategoryItem[];
  articles: ArticleItem[] | { data: ArticleItem[]; total?: number; links?: any[] };
  initialSubcat?: string;
}

// Smart icon selector for subcategories based on keywords
function getSubcategoryIcon(name: string, slug: string) {
  const text = `${name} ${slug}`.toLowerCase();
  if (text.includes('chatgpt') || text.includes('gpt') || text.includes('gemini') || text.includes('bot')) return Bot;
  if (text.includes('ai') || text.includes('prompt') || text.includes('spark')) return Sparkles;
  if (text.includes('phone') || text.includes('android') || text.includes('iphone') || text.includes('mobile')) return Smartphone;
  if (text.includes('windows') || text.includes('mac') || text.includes('pc') || text.includes('laptop') || text.includes('computing')) return Laptop;
  if (text.includes('security') || text.includes('password') || text.includes('privacy') || text.includes('auth')) return Shield;
  if (text.includes('story') || text.includes('english') || text.includes('read') || text.includes('book') || text.includes('words')) return BookOpen;
  if (text.includes('review') || text.includes('gadget') || text.includes('hardware') || text.includes('headphone')) return Headphones;
  if (text.includes('troubleshoot') || text.includes('how-to') || text.includes('fix') || text.includes('tips')) return HelpCircle;
  return Layers;
}

function ArticleCard({ article }: { article: ArticleItem }) {
  return (
    <Link
      href={`/article/${article.slug}`}
      className="group flex flex-col h-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-red-300 dark:hover:border-red-500/50 hover:shadow-lg dark:hover:shadow-slate-950/50 transition-all duration-300 overflow-hidden"
    >
      {/* Thumbnail */}
      <div className="aspect-[16/9] w-full overflow-hidden bg-slate-100 dark:bg-slate-800 relative">
        {article.cover_image_url ? (
          <img
            src={article.cover_image_url}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-linear-to-br from-slate-100 via-slate-50 to-slate-200 dark:from-slate-800 dark:via-slate-800/80 dark:to-slate-900 flex items-center justify-center">
            <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              No Image
            </span>
          </div>
        )}

        {/* Category badge */}
        {article.category && (
          <div className="absolute top-3 left-3">
            <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/95 dark:bg-slate-900/95 text-red-600 dark:text-red-400 backdrop-blur-xs shadow-xs border border-white/60 dark:border-slate-700">
              {article.category.name}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3
          style={{ fontFamily: "'Outfit', sans-serif" }}
          className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-2 leading-snug mb-2.5"
        >
          {article.title}
        </h3>

        {article.excerpt && (
          <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed mb-4 flex-1">
            {article.excerpt}
          </p>
        )}

        {/* Metadata footer */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 mt-auto flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
          <div className="flex items-center gap-2">
            {article.author ? (
              <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200 font-semibold">
                <User size={12} className="text-slate-400" />
                {article.author.name}
              </span>
            ) : null}
            {article.published_at && (
              <span>{format(new Date(article.published_at), 'MMM d, yyyy')}</span>
            )}
          </div>

          {article.reading_time ? (
            <span className="flex items-center gap-1 text-slate-400 dark:text-slate-400">
              <Clock size={11} /> {article.reading_time} min
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

export default function Show({
  auth,
  category,
  parentCategory,
  subcategories = [],
  articles,
  initialSubcat = 'all',
}: ShowProps) {
  // Use parent category if available, fallback to category
  const mainCategory = parentCategory || category;

  // Extract article items regardless of array or paginator
  const rawArticles = useMemo(() => {
    if (Array.isArray(articles)) return articles;
    if (articles && Array.isArray((articles as any).data)) return (articles as any).data;
    return [];
  }, [articles]);

  // Current subcategory selection state
  const [selectedSubcat, setSelectedSubcat] = useState<string>(initialSubcat || 'all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Scroll ref for horizontal channels bar
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Sync scroll indicator buttons
  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [subcategories]);

  const scrollChannels = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const offset = direction === 'left' ? -220 : 220;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
      setTimeout(checkScroll, 200);
    }
  };

  // Find active subcategory object
  const activeSubcategory = useMemo(() => {
    if (selectedSubcat === 'all') return null;
    return subcategories.find(
      (s) => s.slug === selectedSubcat || String(s.id) === String(selectedSubcat)
    ) || null;
  }, [selectedSubcat, subcategories]);

  // Subcategory click handler: filters in the SAME page without reload, updates URL silently
  const handleSelectSubcategory = (slug: string) => {
    setSelectedSubcat(slug);

    // Update browser URL silently without reload
    const currentPath = `/category/${mainCategory.slug}`;
    const newUrl = slug === 'all' ? currentPath : `${currentPath}?sub=${slug}`;
    window.history.replaceState({ subcat: slug }, '', newUrl);
  };

  // Filter articles based on active subcategory AND in-page search query
  const filteredArticles = useMemo(() => {
    return rawArticles.filter((article) => {
      // 1. Subcategory filter
      if (selectedSubcat !== 'all') {
        const matchesSubcat =
          article.category?.slug === selectedSubcat ||
          article.category_id === activeSubcategory?.id ||
          String(article.category_id) === String(selectedSubcat) ||
          (activeSubcategory && article.category?.name?.toLowerCase() === activeSubcategory.name.toLowerCase());

        if (!matchesSubcat) return false;
      }

      // 2. Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const titleMatch = (article.title || '').toLowerCase().includes(q);
        const excerptMatch = (article.excerpt || '').toLowerCase().includes(q);
        const categoryMatch = (article.category?.name || '').toLowerCase().includes(q);
        const authorMatch = (article.author?.name || '').toLowerCase().includes(q);

        if (!titleMatch && !excerptMatch && !categoryMatch && !authorMatch) {
          return false;
        }
      }

      return true;
    });
  }, [rawArticles, selectedSubcat, searchQuery, activeSubcategory]);

  const pageTitle = activeSubcategory
    ? `${activeSubcategory.name} — ${mainCategory.name} — Rafvex`
    : `${category.meta_title || mainCategory.name} — Rafvex`;

  const pageDescription =
    activeSubcategory?.description ||
    mainCategory.meta_description ||
    mainCategory.description ||
    `Browse all ${mainCategory.name} guides, tutorials, and articles on Rafvex.`;

  return (
    <PublicLayout auth={auth}>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
      </Head>

      {/* ── Category Hero Header ── */}
      <div className="bg-linear-to-b from-slate-50/80 via-white to-slate-50/50 dark:from-[#0b1120] dark:via-[#0f172a] dark:to-[#0b1120] border-b border-slate-200/80 dark:border-slate-800 pt-10 pb-8 px-4 sm:px-6">
        <div style={{ maxWidth: 1280 }} className="mx-auto">
          {/* Topic Badge & Title */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p className="text-[11px] font-extrabold tracking-wider uppercase text-red-600 dark:text-red-400 mb-1.5 flex items-center gap-1.5">
                <Compass size={13} className="text-red-600 dark:text-red-400" /> Topic
              </p>
              <h1
                style={{ fontFamily: "'Outfit', sans-serif" }}
                className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-tight"
              >
                {activeSubcategory ? activeSubcategory.name : mainCategory.name}
              </h1>
              {activeSubcategory?.description || mainCategory.description ? (
                <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base max-w-2xl mt-2 leading-relaxed">
                  {activeSubcategory?.description || mainCategory.description}
                </p>
              ) : null}
            </div>

            {/* Quick stats indicator */}
            <div className="shrink-0 flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-transparent dark:border-slate-700">
                <Flame size={12} className="text-red-600 dark:text-red-400" />
                {filteredArticles.length}{' '}
                {filteredArticles.length === 1 ? 'article' : 'articles'}
                {selectedSubcat !== 'all' || searchQuery ? ' found' : ''}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Subcategory Channels Bar + In-Page Search ── */}
      <div className="sticky top-0 z-20 bg-white/95 dark:bg-[#0b1120]/95 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800 shadow-2xs">
        <div style={{ maxWidth: 1280 }} className="mx-auto px-4 sm:px-6 py-3">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Scrollable Subcategory Channels (Image 2 style) */}
            <div className="relative flex-1 min-w-0 flex items-center">
              {/* Left scroll arrow */}
              {canScrollLeft && (
                <button
                  type="button"
                  onClick={() => scrollChannels('left')}
                  className="hidden sm:flex absolute left-0 z-10 w-7 h-7 rounded-full bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-700 shadow-sm items-center justify-center text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition -ml-2 cursor-pointer"
                  aria-label="Scroll left"
                >
                  <ChevronLeft size={16} />
                </button>
              )}

              {/* Pills Container */}
              <div
                ref={scrollRef}
                onScroll={checkScroll}
                className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1 w-full"
              >
                {/* Channels label */}
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mr-1 shrink-0 flex items-center gap-1">
                  <Compass size={13} className="text-red-600 dark:text-red-400" /> Channels:
                </span>

                {/* All Stories Pill */}
                <button
                  type="button"
                  onClick={() => handleSelectSubcategory('all')}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer shadow-2xs ${
                    selectedSubcat === 'all'
                      ? 'bg-red-600 text-white border border-red-600 shadow-xs'
                      : 'bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-red-300 dark:hover:border-red-500/50 hover:bg-red-50/60 dark:hover:bg-red-950/40 hover:text-red-600 dark:hover:text-red-400'
                  }`}
                >
                  <Flame
                    size={12}
                    className={selectedSubcat === 'all' ? 'text-white' : 'text-slate-400 dark:text-slate-400'}
                  />
                  <span>All Stories</span>
                  <span
                    className={`ml-1 text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      selectedSubcat === 'all'
                        ? 'bg-red-700 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {rawArticles.length}
                  </span>
                </button>

                {/* Subcategory Pills */}
                {subcategories.map((sub) => {
                  const isSelected = selectedSubcat === sub.slug || selectedSubcat === String(sub.id);
                  const Icon = getSubcategoryIcon(sub.name, sub.slug);
                  const count = sub.articles_count ?? 0;

                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => handleSelectSubcategory(sub.slug)}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer shadow-2xs ${
                        isSelected
                          ? 'bg-red-600 text-white border border-red-600 shadow-xs'
                          : 'bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-red-300 dark:hover:border-red-500/50 hover:bg-red-50/60 dark:hover:bg-red-950/40 hover:text-red-600 dark:hover:text-red-400'
                      }`}
                    >
                      <Icon
                        size={12}
                        className={isSelected ? 'text-white' : 'text-slate-400 dark:text-slate-400'}
                      />
                      <span>{sub.name}</span>
                      {count > 0 && (
                        <span
                          className={`ml-1 text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                            isSelected
                              ? 'bg-red-700 text-white'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Right scroll arrow */}
              {canScrollRight && (
                <button
                  type="button"
                  onClick={() => scrollChannels('right')}
                  className="hidden sm:flex absolute right-0 z-10 w-7 h-7 rounded-full bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-700 shadow-sm items-center justify-center text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition -mr-2 cursor-pointer"
                  aria-label="Scroll right"
                >
                  <ChevronRight size={16} />
                </button>
              )}
            </div>

            {/* In-Page Real-Time Search Bar */}
            <div className="relative w-full lg:w-72 shrink-0">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search in ${mainCategory.name}...`}
                className="w-full pl-8.5 pr-8 py-1.5 text-xs sm:text-[13px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full focus:outline-none focus:border-red-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-950 text-slate-800 dark:text-slate-100 transition placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 w-4 h-4 flex items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
                  title="Clear search"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content Area ── */}
      <main style={{ maxWidth: 1280 }} className="mx-auto px-4 sm:px-6 py-8 sm:py-10 flex-1 w-full">
        {/* Filter Summary Banner (when filtered by subcategory or query) */}
        {(selectedSubcat !== 'all' || searchQuery) && (
          <div className="mb-6 pb-3 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800 dark:text-slate-200">Active filter:</span>
              {selectedSubcat !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/50 font-semibold">
                  <Tag size={10} /> {activeSubcategory?.name || selectedSubcat}
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold">
                  <Search size={10} /> "{searchQuery}"
                </span>
              )}
              <span className="text-slate-400 dark:text-slate-500 ml-1">
                ({filteredArticles.length} matching)
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                handleSelectSubcategory('all');
                setSearchQuery('');
              }}
              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-semibold hover:underline cursor-pointer"
            >
              Reset all filters
            </button>
          </div>
        )}

        {/* Articles Grid */}
        {filteredArticles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16 px-4 max-w-md mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-500 dark:text-red-400 border border-red-100 dark:border-red-900/40 flex items-center justify-center mx-auto mb-4">
              <Search size={24} />
            </div>
            <h3
              style={{ fontFamily: "'Outfit', sans-serif" }}
              className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2"
            >
              No articles found
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
              {searchQuery
                ? `No articles match your search "${searchQuery}" in ${
                    activeSubcategory ? activeSubcategory.name : mainCategory.name
                  }.`
                : `There are currently no published articles in this topic.`}
            </p>
            <div className="flex items-center justify-center gap-3">
              {(selectedSubcat !== 'all' || searchQuery) && (
                <button
                  type="button"
                  onClick={() => {
                    handleSelectSubcategory('all');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  Show All {mainCategory.name} Articles
                </button>
              )}
              <Link
                href="/"
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition"
              >
                Back to Home
              </Link>
            </div>
          </div>
        )}
      </main>
    </PublicLayout>
  );
}
