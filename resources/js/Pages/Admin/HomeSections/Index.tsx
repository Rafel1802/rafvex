import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
  Sliders,
  Sparkles,
  Search,
  Check,
  X,
  Save,
  Layers,
  Flame,
  Wrench,
  BookOpen,
  FolderOpen,
  Clock,
  ArrowRight,
  Eye,
  CheckCircle2,
} from 'lucide-react';

interface ArticleItem {
  id: number;
  title: string;
  slug: string;
  category_id?: number;
  cover_image_url?: string | null;
  published_at?: string | null;
  category?: { id: number; name: string; slug: string } | null;
}

interface CategoryItem {
  id: number;
  name: string;
  slug: string;
  children?: CategoryItem[];
}

interface SectionsConfig {
  hero: {
    enabled: boolean;
    badge: string;
    title: string;
    subtitle: string;
    lead_id: number | null;
    featured_ids: number[];
  };
  trending: {
    enabled: boolean;
    title: string;
    subtitle: string;
    mode: 'auto' | 'manual';
    article_ids: number[];
  };
  spotlight: {
    enabled: boolean;
    title: string;
    subtitle: string;
    category_id: number | null;
    category_slug: string;
    mode: 'category' | 'manual';
    main_id: number | null;
    sub_ids: number[];
  };
  troubleshooting: {
    enabled: boolean;
    title: string;
    subtitle: string;
    category_id: number | null;
    category_slug: string;
    mode: 'category' | 'manual';
    article_ids: number[];
  };
  reading_stories: {
    enabled: boolean;
    title: string;
    subtitle: string;
    category_id: number | null;
    category_slug: string;
    mode: 'category' | 'manual';
    article_ids: number[];
  };
  directory: {
    enabled: boolean;
    title: string;
    subtitle: string;
  };
  latest: {
    enabled: boolean;
    title: string;
    subtitle: string;
    limit: number;
  };
}

interface Props {
  auth: any;
  sections: SectionsConfig;
  categories: CategoryItem[];
  hydratedArticles: Record<string | number, ArticleItem>;
  recentArticles: ArticleItem[];
}

type PickerTarget =
  | { section: 'hero_lead' }
  | { section: 'hero_featured'; index: number }
  | { section: 'trending'; index: number }
  | { section: 'spotlight_main' }
  | { section: 'spotlight_sub'; index: number }
  | { section: 'troubleshooting'; index: number }
  | { section: 'reading_stories'; index: number };

export default function HomeSectionsIndex({
  auth,
  sections: initialSections,
  categories = [],
  hydratedArticles = {},
  recentArticles = [],
}: Props) {
  const [sections, setSections] = useState<SectionsConfig>(initialSections);
  const [articlesMap, setArticlesMap] = useState<Record<string | number, ArticleItem>>(hydratedArticles);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'spotlight' | 'hero' | 'trending' | 'curated'>('all');

  // Picker modal state
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<PickerTarget | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ArticleItem[]>([]);
  const [searching, setSearching] = useState(false);

  // Live search debounce
  useEffect(() => {
    if (!pickerOpen) {
      setSearchQuery('');
      setSearchResults([]);
      return;
    }
    if (searchQuery.trim().length === 0) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/ourcms/home-sections/search?q=${encodeURIComponent(searchQuery.trim())}`);
        const data = await res.json();
        setSearchResults(data.results || []);
      } catch (e) {
        console.error('Search error:', e);
      } finally {
        setSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery, pickerOpen]);

  const openPicker = (target: PickerTarget) => {
    setPickerTarget(target);
    setSearchQuery('');
    setSearchResults([]);
    setPickerOpen(true);
  };

  const selectArticle = (article: ArticleItem) => {
    if (!pickerTarget) return;

    // Cache article into local map for instant preview rendering
    setArticlesMap((prev) => ({ ...prev, [article.id]: article }));

    setSections((prev) => {
      const next = JSON.parse(JSON.stringify(prev));

      if (pickerTarget.section === 'hero_lead') {
        next.hero.lead_id = article.id;
      } else if (pickerTarget.section === 'hero_featured') {
        const f = [...(next.hero.featured_ids || [])];
        f[pickerTarget.index] = article.id;
        next.hero.featured_ids = f;
      } else if (pickerTarget.section === 'trending') {
        const t = [...(next.trending.article_ids || [])];
        t[pickerTarget.index] = article.id;
        next.trending.article_ids = t;
      } else if (pickerTarget.section === 'spotlight_main') {
        next.spotlight.main_id = article.id;
      } else if (pickerTarget.section === 'spotlight_sub') {
        const s = [...(next.spotlight.sub_ids || [])];
        s[pickerTarget.index] = article.id;
        next.spotlight.sub_ids = s;
      } else if (pickerTarget.section === 'troubleshooting') {
        const tb = [...(next.troubleshooting.article_ids || [])];
        tb[pickerTarget.index] = article.id;
        next.troubleshooting.article_ids = tb;
      } else if (pickerTarget.section === 'reading_stories') {
        const rs = [...(next.reading_stories.article_ids || [])];
        rs[pickerTarget.index] = article.id;
        next.reading_stories.article_ids = rs;
      }

      return next;
    });

    setPickerOpen(false);
    setPickerTarget(null);
  };

  const clearSlot = (target: PickerTarget) => {
    setSections((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      if (target.section === 'hero_lead') {
        next.hero.lead_id = null;
      } else if (target.section === 'hero_featured') {
        const f = [...(next.hero.featured_ids || [])];
        f.splice(target.index, 1);
        next.hero.featured_ids = f;
      } else if (target.section === 'trending') {
        const t = [...(next.trending.article_ids || [])];
        t.splice(target.index, 1);
        next.trending.article_ids = t;
      } else if (target.section === 'spotlight_main') {
        next.spotlight.main_id = null;
      } else if (target.section === 'spotlight_sub') {
        const s = [...(next.spotlight.sub_ids || [])];
        s.splice(target.index, 1);
        next.spotlight.sub_ids = s;
      } else if (target.section === 'troubleshooting') {
        const tb = [...(next.troubleshooting.article_ids || [])];
        tb.splice(target.index, 1);
        next.troubleshooting.article_ids = tb;
      } else if (target.section === 'reading_stories') {
        const rs = [...(next.reading_stories.article_ids || [])];
        rs.splice(target.index, 1);
        next.reading_stories.article_ids = rs;
      }
      return next;
    });
  };

  const handleSave = () => {
    setSaving(true);
    router.post('/ourcms/home-sections', { sections }, {
      preserveScroll: true,
      onFinish: () => setSaving(false),
    });
  };

  // Helper to render an article slot card
  const renderArticleSlot = (
    label: string,
    articleId: number | null | undefined,
    onPick: () => void,
    onClear: () => void
  ) => {
    const article = articleId ? articlesMap[articleId] : null;

    if (!article) {
      return (
        <div className="p-4 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-red-400 dark:hover:border-red-500 transition flex flex-col items-center justify-center text-center gap-1.5 min-h-[110px] bg-slate-50/50 dark:bg-slate-900/40">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</span>
          <button
            type="button"
            onClick={onPick}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-red-600 hover:border-red-300 shadow-2xs transition cursor-pointer"
          >
            <Search size={12} />
            <span>Select Blog</span>
          </button>
        </div>
      );
    }

    return (
      <div className="group relative p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 shadow-2xs hover:shadow-md transition flex items-center gap-3">
        <div className="w-16 h-12 rounded-lg bg-slate-100 dark:bg-slate-700 overflow-hidden shrink-0">
          {article.cover_image_url ? (
            <img src={article.cover_image_url} alt={article.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[9px] font-bold text-slate-400">
              Rafvex
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-red-600 block truncate">
            {label} {article.category && `• ${article.category.name}`}
          </span>
          <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
            {article.title}
          </h4>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={onPick}
            className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center transition cursor-pointer"
            title="Change Blog"
          >
            <Search size={12} />
          </button>
          <button
            type="button"
            onClick={onClear}
            className="w-7 h-7 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 flex items-center justify-center transition cursor-pointer"
            title="Remove from slot"
          >
            <X size={12} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <AdminLayout auth={auth}>
      <Head title="Home Sections Manager — Rafvex CMS" />

      <div className="space-y-6 max-w-7xl mx-auto pb-20">
        
        {/* Top Sticky Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-50 text-red-600 dark:bg-red-950/40 text-[11px] font-bold uppercase tracking-wider mb-1 border border-red-100 dark:border-red-900/50">
              <Sliders size={12} />
              Homepage Layout &amp; Editorial Architecture
            </div>
            <h1
              style={{ fontFamily: "'Outfit', sans-serif" }}
              className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight"
            >
              Home Sections Manager
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Control all sections on the home page: switch categories, change titles, select featured blogs, or toggle visibility.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold transition"
            >
              <Eye size={14} />
              <span>View Live Home</span>
            </a>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold shadow-xs transition cursor-pointer"
            >
              {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={16} />}
              <span>{saving ? 'Saving...' : 'Save All Sections'}</span>
            </button>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { id: 'all', label: 'All Sections' },
            { id: 'spotlight', label: 'Category Spotlight (Image 2)' },
            { id: 'hero', label: 'Hero & Featured' },
            { id: 'trending', label: 'Trending' },
            { id: 'curated', label: 'Troubleshooting & Stories' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── SECTION 3: PRIMARY CATEGORY SPOTLIGHT SHOWCASE (1 MAIN + 4 SUB IMAGES) ── */}
        {(activeTab === 'all' || activeTab === 'spotlight') && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-red-200/80 dark:border-red-950/60 shadow-md p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 dark:bg-red-950/50 flex items-center justify-center font-black">
                  3
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2
                      style={{ fontFamily: "'Outfit', sans-serif" }}
                      className="text-lg font-bold text-slate-900 dark:text-white"
                    >
                      Category Spotlight Showcase (1 Main + 4 Sub-Articles)
                    </h2>
                    <span className="px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 text-[10px] font-extrabold uppercase">
                      Highlighted Feature
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Controls the featured category split showcase on the homepage (Image 2). You can change to any category, change title, or pick specific blogs.
                  </p>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={sections.spotlight.enabled}
                  onChange={(e) =>
                    setSections((p) => ({
                      ...p,
                      spotlight: { ...p.spotlight, enabled: e.target.checked },
                    }))
                  }
                  className="rounded text-red-600 focus:ring-red-500 h-4 w-4"
                />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {sections.spotlight.enabled ? 'Section Enabled' : 'Section Hidden'}
                </span>
              </label>
            </div>

            {/* Custom Titles & Category Selector */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Section Title
                </label>
                <input
                  type="text"
                  value={sections.spotlight.title}
                  onChange={(e) =>
                    setSections((p) => ({
                      ...p,
                      spotlight: { ...p.spotlight, title: e.target.value },
                    }))
                  }
                  placeholder="e.g. Artificial Intelligence & Digital Tools"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Section Subtitle
                </label>
                <input
                  type="text"
                  value={sections.spotlight.subtitle}
                  onChange={(e) =>
                    setSections((p) => ({
                      ...p,
                      spotlight: { ...p.spotlight, subtitle: e.target.value },
                    }))
                  }
                  placeholder="e.g. Generative models, prompt engineering..."
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Source Category
                </label>
                <select
                  value={sections.spotlight.category_slug || ''}
                  onChange={(e) => {
                    const selSlug = e.target.value;
                    const catObj = categories.find((c) => c.slug === selSlug);
                    setSections((p) => ({
                      ...p,
                      spotlight: {
                        ...p.spotlight,
                        category_slug: selSlug,
                        category_id: catObj ? catObj.id : null,
                      },
                    }));
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:border-red-500"
                >
                  <option value="ai-tools">Artificial Intelligence (AI Tools)</option>
                  <option value="android-iphone">Phones &amp; Mobile (Android / iPhone)</option>
                  <option value="windows-mac">Computing (Windows &amp; Mac)</option>
                  <option value="troubleshooting">How-To &amp; Troubleshooting</option>
                  <option value="reviews">Hardware &amp; Gadget Reviews</option>
                  <option value="basic-online-security">Security &amp; Privacy</option>
                  <option value="websites-apps">Websites &amp; Software Apps</option>
                  <option value="english-reading-stories">English Reading Stories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.slug}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Selection Mode: Automatic Category vs Manual 1 Main + 4 Sub */}
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="radio"
                    name="spotlight_mode"
                    checked={sections.spotlight.mode === 'category'}
                    onChange={() =>
                      setSections((p) => ({
                        ...p,
                        spotlight: { ...p.spotlight, mode: 'category' },
                      }))
                    }
                    className="text-red-600 focus:ring-red-500"
                  />
                  <span>Auto-pull latest 1 main + 4 sub articles from chosen category</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="radio"
                    name="spotlight_mode"
                    checked={sections.spotlight.mode === 'manual'}
                    onChange={() =>
                      setSections((p) => ({
                        ...p,
                        spotlight: { ...p.spotlight, mode: 'manual' },
                      }))
                    }
                    className="text-red-600 focus:ring-red-500"
                  />
                  <span>Select specific custom blogs (1 main + 4 sub)</span>
                </label>
              </div>

              {/* If Manual: Display slots */}
              {sections.spotlight.mode === 'manual' && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                    Configure 1 Main + 4 Sub-Articles Slots
                  </span>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    {/* Left: 1 Main Spotlight Slot */}
                    <div className="lg:col-span-6 space-y-2">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        1. Main Featured Spotlight Card
                      </span>
                      {renderArticleSlot(
                        'Main Spotlight Blog',
                        sections.spotlight.main_id,
                        () => openPicker({ section: 'spotlight_main' }),
                        () => clearSlot({ section: 'spotlight_main' })
                      )}
                    </div>

                    {/* Right: 4 Sub-Article Slots */}
                    <div className="lg:col-span-6 space-y-2">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        2. 4 Sub-Article Cards (Image 2)
                      </span>
                      <div className="space-y-2">
                        {[0, 1, 2, 3].map((subIdx) =>
                          renderArticleSlot(
                            `Sub Article #${subIdx + 1}`,
                            sections.spotlight.sub_ids?.[subIdx],
                            () => openPicker({ section: 'spotlight_sub', index: subIdx }),
                            () => clearSlot({ section: 'spotlight_sub', index: subIdx })
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── SECTION 1: HERO & FEATURED STORIES ── */}
        {(activeTab === 'all' || activeTab === 'hero') && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xs p-6 space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center font-black">
                  1
                </div>
                <div>
                  <h2
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                    className="text-base font-bold text-slate-900 dark:text-white"
                  >
                    Hero Welcome Header &amp; Top Featured Stories
                  </h2>
                  <p className="text-xs text-slate-500">
                    Lead story and 2 secondary featured cards above the topic pills.
                  </p>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sections.hero.enabled}
                  onChange={(e) =>
                    setSections((p) => ({
                      ...p,
                      hero: { ...p.hero, enabled: e.target.checked },
                    }))
                  }
                  className="rounded text-red-600 focus:ring-red-500 h-4 w-4"
                />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {sections.hero.enabled ? 'Enabled' : 'Hidden'}
                </span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Hero Title
                </label>
                <input
                  type="text"
                  value={sections.hero.title}
                  onChange={(e) =>
                    setSections((p) => ({
                      ...p,
                      hero: { ...p.hero, title: e.target.value },
                    }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Hero Subtitle
                </label>
                <input
                  type="text"
                  value={sections.hero.subtitle}
                  onChange={(e) =>
                    setSections((p) => ({
                      ...p,
                      hero: { ...p.hero, subtitle: e.target.value },
                    }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-2">
              <div className="lg:col-span-6 space-y-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Lead Hero Story</span>
                {renderArticleSlot(
                  'Lead Story',
                  sections.hero.lead_id,
                  () => openPicker({ section: 'hero_lead' }),
                  () => clearSlot({ section: 'hero_lead' })
                )}
              </div>
              <div className="lg:col-span-6 space-y-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">2 Secondary Featured Stories</span>
                <div className="space-y-2">
                  {[0, 1].map((fIdx) =>
                    renderArticleSlot(
                      `Featured #${fIdx + 1}`,
                      sections.hero.featured_ids?.[fIdx],
                      () => openPicker({ section: 'hero_featured', index: fIdx }),
                      () => clearSlot({ section: 'hero_featured', index: fIdx })
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── SECTION 2: TRENDING ON RAFVEX ── */}
        {(activeTab === 'all' || activeTab === 'trending') && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xs p-6 space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center font-black">
                  2
                </div>
                <div>
                  <h2
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                    className="text-base font-bold text-slate-900 dark:text-white"
                  >
                    Trending on Rafvex (Numbered 1-4)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Shows 4 high-velocity stories. Choose automatic ranking by views or manually pick 4 blogs.
                  </p>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sections.trending.enabled}
                  onChange={(e) =>
                    setSections((p) => ({
                      ...p,
                      trending: { ...p.trending, enabled: e.target.checked },
                    }))
                  }
                  className="rounded text-red-600 focus:ring-red-500 h-4 w-4"
                />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {sections.trending.enabled ? 'Enabled' : 'Hidden'}
                </span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={sections.trending.title}
                  onChange={(e) =>
                    setSections((p) => ({
                      ...p,
                      trending: { ...p.trending, title: e.target.value },
                    }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={sections.trending.subtitle}
                  onChange={(e) =>
                    setSections((p) => ({
                      ...p,
                      trending: { ...p.trending, subtitle: e.target.value },
                    }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="radio"
                    name="trending_mode"
                    checked={sections.trending.mode === 'auto'}
                    onChange={() =>
                      setSections((p) => ({
                        ...p,
                        trending: { ...p.trending, mode: 'auto' },
                      }))
                    }
                    className="text-red-600 focus:ring-red-500"
                  />
                  <span>Automatic (Rank by highest article views_count)</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="radio"
                    name="trending_mode"
                    checked={sections.trending.mode === 'manual'}
                    onChange={() =>
                      setSections((p) => ({
                        ...p,
                        trending: { ...p.trending, mode: 'manual' },
                      }))
                    }
                    className="text-red-600 focus:ring-red-500"
                  />
                  <span>Manual selection (Pick 4 specific blogs)</span>
                </label>
              </div>

              {sections.trending.mode === 'manual' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                  {[0, 1, 2, 3].map((tIdx) =>
                    renderArticleSlot(
                      `Trending #${tIdx + 1}`,
                      sections.trending.article_ids?.[tIdx],
                      () => openPicker({ section: 'trending', index: tIdx }),
                      () => clearSlot({ section: 'trending', index: tIdx })
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── SECTION 4 & 5: TROUBLESHOOTING & READING STORIES ── */}
        {(activeTab === 'all' || activeTab === 'curated') && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Troubleshooting */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xs p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Wrench size={18} className="text-red-600" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Tech Troubleshooting (4 Items)</h3>
                </div>
                <label className="flex items-center gap-1.5 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={sections.troubleshooting.enabled}
                    onChange={(e) =>
                      setSections((p) => ({
                        ...p,
                        troubleshooting: { ...p.troubleshooting, enabled: e.target.checked },
                      }))
                    }
                    className="rounded text-red-600"
                  />
                  <span>Active</span>
                </label>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Title</label>
                <input
                  type="text"
                  value={sections.troubleshooting.title}
                  onChange={(e) =>
                    setSections((p) => ({
                      ...p,
                      troubleshooting: { ...p.troubleshooting, title: e.target.value },
                    }))
                  }
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Subtitle</label>
                <input
                  type="text"
                  value={sections.troubleshooting.subtitle}
                  onChange={(e) =>
                    setSections((p) => ({
                      ...p,
                      troubleshooting: { ...p.troubleshooting, subtitle: e.target.value },
                    }))
                  }
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>
            </div>

            {/* Reading Stories */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xs p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <BookOpen size={18} className="text-amber-500" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">English Reading Stories (4 Items)</h3>
                </div>
                <label className="flex items-center gap-1.5 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={sections.reading_stories.enabled}
                    onChange={(e) =>
                      setSections((p) => ({
                        ...p,
                        reading_stories: { ...p.reading_stories, enabled: e.target.checked },
                      }))
                    }
                    className="rounded text-red-600"
                  />
                  <span>Active</span>
                </label>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Title</label>
                <input
                  type="text"
                  value={sections.reading_stories.title}
                  onChange={(e) =>
                    setSections((p) => ({
                      ...p,
                      reading_stories: { ...p.reading_stories, title: e.target.value },
                    }))
                  }
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Subtitle</label>
                <input
                  type="text"
                  value={sections.reading_stories.subtitle}
                  onChange={(e) =>
                    setSections((p) => ({
                      ...p,
                      reading_stories: { ...p.reading_stories, subtitle: e.target.value },
                    }))
                  }
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>
            </div>
          </div>
        )}

        {/* Modal: Article Picker */}
        {pickerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
              
              {/* Modal Header */}
              <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                    className="text-base font-bold text-slate-900 dark:text-white"
                  >
                    Select Blog for Homepage Slot
                  </h3>
                  <p className="text-xs text-slate-500">
                    Search published articles or choose from recent publications.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPickerOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Search Bar */}
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                <div className="relative">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    autoFocus
                    placeholder="Search by article title, category, keywords..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-red-500"
                  />
                  {searching && (
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
              </div>

              {/* Results List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {(searchResults.length > 0 ? searchResults : recentArticles).map((art) => (
                  <button
                    key={art.id}
                    type="button"
                    onClick={() => selectArticle(art)}
                    className="w-full text-left p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800/60 hover:border-red-400 hover:bg-red-50/40 dark:hover:bg-red-950/20 transition flex items-center gap-3 cursor-pointer group"
                  >
                    <div className="w-16 h-12 rounded-lg bg-slate-100 dark:bg-slate-700 overflow-hidden shrink-0">
                      {art.cover_image_url ? (
                        <img src={art.cover_image_url} alt={art.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[9px] font-bold text-slate-400">
                          Rafvex
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      {art.category && (
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-red-600 block mb-0.5">
                          {art.category.name}
                        </span>
                      )}
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-red-600 transition truncate">
                        {art.title}
                      </h4>
                    </div>
                    <ArrowRight size={14} className="text-slate-300 group-hover:text-red-600 group-hover:translate-x-0.5 transition shrink-0" />
                  </button>
                ))}
              </div>

            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}
