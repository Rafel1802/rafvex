import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
  Pin,
  Star,
  Flame,
  Sparkles,
  Wrench,
  BookOpen,
  Zap,
  Search,
  X,
  Save,
  ArrowUpRight,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  FolderOpen,
  Clock,
  Layers,
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
    mode: 'auto' | 'manual';
    lead_id: number | null;
    featured_ids: number[];
    sub_featured_ids?: number[];
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

interface AutoDetectedConfig {
  hero_lead?: ArticleItem | null;
  hero_featured?: ArticleItem[];
  hero_sub?: ArticleItem[];
  trending?: ArticleItem[];
  spotlight_main?: ArticleItem | null;
  spotlight_sub?: ArticleItem[];
  troubleshooting?: ArticleItem[];
  reading_stories?: ArticleItem[];
}

interface Props {
  auth: any;
  sections: SectionsConfig;
  categories: CategoryItem[];
  hydratedArticles: Record<string | number, ArticleItem>;
  recentArticles: ArticleItem[];
  autoDetected?: AutoDetectedConfig;
}

type PickerTarget =
  | { section: 'hero_lead' }
  | { section: 'hero_featured'; index: number }
  | { section: 'hero_sub_featured'; index: number }
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
  autoDetected = {},
}: Props) {
  // Normalize initialSections to ensure all keys and sub_featured_ids exist
  const normalizedSections: SectionsConfig = {
    ...initialSections,
    hero: {
      mode: 'auto',
      sub_featured_ids: [],
      ...initialSections?.hero,
    },
    trending: {
      mode: 'auto',
      article_ids: [],
      ...initialSections?.trending,
    },
    spotlight: {
      mode: 'category',
      category_slug: 'ai-tools',
      sub_ids: [],
      ...initialSections?.spotlight,
    },
    troubleshooting: {
      mode: 'category',
      category_slug: 'troubleshooting',
      article_ids: [],
      ...initialSections?.troubleshooting,
    },
    reading_stories: {
      mode: 'category',
      category_slug: 'english-reading-stories',
      article_ids: [],
      ...initialSections?.reading_stories,
    },
    directory: {
      enabled: true,
      title: 'Explore All Publishing Departments',
      subtitle: 'Rafvex organizes knowledge across dedicated focus channels. Find exactly what you need with verified depth.',
      ...initialSections?.directory,
    },
    latest: {
      enabled: true,
      title: 'Latest Published Stories',
      subtitle: 'Fresh knowledge, breakdowns, and verified guides released by our editorial desk',
      limit: 10,
      ...initialSections?.latest,
    },
  };

  const [sections, setSections] = useState<SectionsConfig>(normalizedSections);
  const [articlesMap, setArticlesMap] = useState<Record<string | number, ArticleItem>>(() => {
    const initialMap = { ...hydratedArticles };
    // Also index auto-detected articles
    if (autoDetected.hero_lead?.id) initialMap[autoDetected.hero_lead.id] = autoDetected.hero_lead;
    if (autoDetected.spotlight_main?.id) initialMap[autoDetected.spotlight_main.id] = autoDetected.spotlight_main;
    const listGroups = [
      autoDetected.hero_featured,
      autoDetected.hero_sub,
      autoDetected.trending,
      autoDetected.spotlight_sub,
      autoDetected.troubleshooting,
      autoDetected.reading_stories,
    ];
    listGroups.forEach((group) => {
      group?.forEach((item) => {
        if (item?.id) initialMap[item.id] = item;
      });
    });
    return initialMap;
  });

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'hero' | 'trending' | 'spotlight' | 'troubleshooting' | 'reading' | 'latest'>('all');

  // Picker modal state
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<PickerTarget | null>(null);
  const [pickerCategory, setPickerCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ArticleItem[]>([]);
  const [searching, setSearching] = useState(false);

  // Live search & category filter debounce
  useEffect(() => {
    if (!pickerOpen) {
      setSearchQuery('');
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const params = new URLSearchParams();
        if (searchQuery.trim()) {
          params.append('q', searchQuery.trim());
        }
        if (pickerCategory && pickerCategory !== 'all') {
          params.append('category_slug', pickerCategory);
        }
        const res = await fetch(`/ourcms/home-sections/search?${params.toString()}`);
        const data = await res.json();
        setSearchResults(data.results || []);
      } catch (e) {
        console.error('Search error:', e);
      } finally {
        setSearching(false);
      }
    }, 180);

    return () => clearTimeout(timer);
  }, [searchQuery, pickerCategory, pickerOpen]);

  const openPicker = (target: PickerTarget) => {
    setPickerTarget(target);
    setSearchQuery('');
    setSearchResults([]);

    // Pre-select category based on section
    let defaultCat = 'all';
    if (target.section === 'spotlight_main' || target.section === 'spotlight_sub') {
      defaultCat = sections.spotlight.category_slug || 'ai-tools';
    } else if (target.section === 'troubleshooting') {
      defaultCat = sections.troubleshooting.category_slug || 'troubleshooting';
    } else if (target.section === 'reading_stories') {
      defaultCat = sections.reading_stories.category_slug || 'english-reading-stories';
    }
    setPickerCategory(defaultCat);
    setPickerOpen(true);
  };

  const getTargetLabel = (target: PickerTarget | null) => {
    if (!target) return '';
    if (target.section === 'hero_lead') return 'Hero Lead Story';
    if (target.section === 'hero_featured') return `Top Featured Slot #${target.index + 1}`;
    if (target.section === 'hero_sub_featured') return `Sub-Featured Slot #${target.index + 1}`;
    if (target.section === 'trending') return `Trending Slot #${target.index + 1}`;
    if (target.section === 'spotlight_main') return 'AI Spotlight Main Story';
    if (target.section === 'spotlight_sub') return `AI Spotlight Sub #${target.index + 1}`;
    if (target.section === 'troubleshooting') return `How-To Guide #${target.index + 1}`;
    if (target.section === 'reading_stories') return `Reading Story #${target.index + 1}`;
    return '';
  };

  const selectArticle = (article: ArticleItem) => {
    if (!pickerTarget) return;

    // Cache article into local map for instant preview rendering
    setArticlesMap((prev) => ({ ...prev, [article.id]: article }));

    setSections((prev) => {
      const next = JSON.parse(JSON.stringify(prev));

      if (pickerTarget.section === 'hero_lead') {
        next.hero.lead_id = article.id;
        next.hero.mode = 'manual';
      } else if (pickerTarget.section === 'hero_featured') {
        const f = [...(next.hero.featured_ids || [])];
        f[pickerTarget.index] = article.id;
        next.hero.featured_ids = f;
        next.hero.mode = 'manual';
      } else if (pickerTarget.section === 'hero_sub_featured') {
        const sf = [...(next.hero.sub_featured_ids || [])];
        sf[pickerTarget.index] = article.id;
        next.hero.sub_featured_ids = sf;
        next.hero.mode = 'manual';
      } else if (pickerTarget.section === 'trending') {
        const t = [...(next.trending.article_ids || [])];
        t[pickerTarget.index] = article.id;
        next.trending.article_ids = t;
        next.trending.mode = 'manual';
      } else if (pickerTarget.section === 'spotlight_main') {
        next.spotlight.main_id = article.id;
        next.spotlight.mode = 'manual';
      } else if (pickerTarget.section === 'spotlight_sub') {
        const s = [...(next.spotlight.sub_ids || [])];
        s[pickerTarget.index] = article.id;
        next.spotlight.sub_ids = s;
        next.spotlight.mode = 'manual';
      } else if (pickerTarget.section === 'troubleshooting') {
        const tb = [...(next.troubleshooting.article_ids || [])];
        tb[pickerTarget.index] = article.id;
        next.troubleshooting.article_ids = tb;
        next.troubleshooting.mode = 'manual';
      } else if (pickerTarget.section === 'reading_stories') {
        const rs = [...(next.reading_stories.article_ids || [])];
        rs[pickerTarget.index] = article.id;
        next.reading_stories.article_ids = rs;
        next.reading_stories.mode = 'manual';
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
      } else if (target.section === 'hero_sub_featured') {
        const sf = [...(next.hero.sub_featured_ids || [])];
        sf.splice(target.index, 1);
        next.hero.sub_featured_ids = sf;
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
    setSaveSuccess(false);
    router.post('/ourcms/home-sections', { sections }, {
      preserveScroll: true,
      onSuccess: () => {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      },
      onFinish: () => setSaving(false),
    });
  };

  /* ──────────────────────────────────────────────────────────────────────────
     VISUAL CARD RENDERERS (Matching Pinned Stories UI)
     ────────────────────────────────────────────────────────────────────────── */

  // 1. Large Cinematic Hero Card (Left 8-cols Hero Slot)
  const renderLeadHeroCard = (
    articleId: number | null | undefined,
    onPick: () => void,
    onClear: () => void,
    defaultBadgeText: string = 'Top Story',
    isAutoMode: boolean = false
  ) => {
    const article = articleId ? articlesMap[articleId] : null;

    if (!article) {
      return (
        <div
          onClick={onPick}
          className="rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-red-500 dark:hover:border-red-500 bg-slate-50 dark:bg-slate-800/40 p-10 text-center cursor-pointer transition flex flex-col items-center justify-center min-h-[340px] group"
        >
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center mb-3 group-hover:scale-110 transition">
            <Pin className="w-6 h-6 rotate-45" />
          </div>
          <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
            No Lead Story Pinned
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1 mb-4">
            Click below to choose an exact article to pin here.
          </p>
          <span className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-red-600 hover:bg-red-700 text-white shadow transition">
            <Search className="w-3.5 h-3.5" />
            Select Lead Hero Story
          </span>
        </div>
      );
    }

    return (
      <div className="relative group rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-950 min-h-[340px] flex flex-col justify-end p-6 shadow-sm">
        {article.cover_image_url ? (
          <img
            src={article.cover_image_url}
            alt={article.title}
            className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-70 transition duration-300"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent" />

        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-block px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-md bg-red-600 text-white">
                {article.category?.name || defaultBadgeText}
              </span>
              <span className="text-xs text-slate-300 font-mono">
                ID: #{article.id}
              </span>
            </div>
            {isAutoMode && (
              <span className="text-[11px] font-semibold text-amber-300 bg-amber-950/70 px-2 py-0.5 rounded border border-amber-500/30">
                ⚡ Auto-Detected
              </span>
            )}
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-white leading-tight line-clamp-2">
            {article.title}
          </h3>
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-300">
              {article.published_at ? new Date(article.published_at).toLocaleDateString() : 'Published'}
            </span>
            <button
              type="button"
              onClick={onPick}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-white/90 hover:bg-white text-slate-900 transition shadow cursor-pointer"
            >
              {isAutoMode ? 'Pin / Override Lead' : 'Change Article'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // 2. Stacked Top Featured Card (Right 4-cols Hero Slot)
  const renderTopFeaturedCard = (
    idx: number,
    articleId: number | null | undefined,
    onPick: () => void,
    onClear: () => void,
    label?: string,
    isAutoMode: boolean = false
  ) => {
    const article = articleId ? articlesMap[articleId] : null;

    return (
      <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-slate-50/60 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700 transition flex flex-col justify-between shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            {label || `Slot #${idx + 1}`}
          </span>
          {!isAutoMode && article && (
            <button
              type="button"
              onClick={onClear}
              className="text-[11px] text-rose-500 hover:text-rose-600 font-medium cursor-pointer"
            >
              Clear
            </button>
          )}
          {isAutoMode && (
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-500/20">
              ⚡ Auto
            </span>
          )}
        </div>

        {article ? (
          <div className="flex gap-3 items-start">
            {article.cover_image_url ? (
              <img
                src={article.cover_image_url}
                alt={article.title}
                className="w-18 h-18 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-700 shadow-xs"
              />
            ) : (
              <div className="w-18 h-18 rounded-xl bg-slate-200 dark:bg-slate-700 shrink-0 flex items-center justify-center text-slate-400 text-xs font-semibold">
                No Img
              </div>
            )}
            <div className="flex-1 min-w-0">
              <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 mb-1">
                {article.category?.name || 'Story'}
              </span>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug">
                {article.title}
              </h4>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[10px] text-slate-400 font-mono">ID #{article.id}</span>
                <button
                  type="button"
                  onClick={onPick}
                  className="text-[11px] text-red-600 dark:text-red-400 font-bold hover:underline cursor-pointer"
                >
                  {isAutoMode ? 'Pin / Override' : 'Change Article'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div
            onClick={onPick}
            className="py-6 text-center cursor-pointer border border-dashed border-slate-300 dark:border-slate-700 rounded-xl hover:border-red-500 transition group"
          >
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 group-hover:text-red-600 dark:group-hover:text-red-400">
              + Pin Article to {label || `Slot #${idx + 1}`}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              (Currently using default featured)
            </p>
          </div>
        )}
      </div>
    );
  };

  // 3. 4-Card Grid Card (Matching Image Trending Layout)
  const renderGridCard = (
    idx: number,
    articleId: number | null | undefined,
    onPick: () => void,
    onClear: () => void,
    badgeText: string,
    badgeColorClass: string = 'bg-rose-600',
    defaultSubText: string = '(Default: highest views / newest)',
    isAutoMode: boolean = false
  ) => {
    const article = articleId ? articlesMap[articleId] : null;

    return (
      <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-slate-50/60 dark:bg-slate-800/30 hover:border-slate-300 dark:hover:border-slate-700 transition flex flex-col justify-between shadow-xs">
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md text-white ${badgeColorClass}`}>
              {badgeText}
            </span>
            {!isAutoMode && article && (
              <button
                type="button"
                onClick={onClear}
                className="text-xs text-rose-500 hover:text-rose-600 font-semibold cursor-pointer"
              >
                Clear
              </button>
            )}
            {isAutoMode && (
              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-1.5 py-0.5 rounded border border-amber-500/20">
                ⚡ Auto
              </span>
            )}
          </div>

          {article ? (
            <div className="space-y-2">
              {article.cover_image_url ? (
                <img
                  src={article.cover_image_url}
                  alt={article.title}
                  className="w-full h-28 sm:h-32 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                />
              ) : (
                <div className="w-full h-28 sm:h-32 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-400 text-xs font-semibold">
                  No Cover Image
                </div>
              )}
              <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                {article.category?.name || 'Category'}
              </span>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug">
                {article.title}
              </h4>
            </div>
          ) : (
            <div
              onClick={onPick}
              className="py-12 text-center cursor-pointer border border-dashed border-slate-300 dark:border-slate-700 rounded-xl hover:border-red-500 transition group"
            >
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 group-hover:text-red-600 dark:group-hover:text-red-400">
                + Pin {badgeText}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                {defaultSubText}
              </p>
            </div>
          )}
        </div>

        {article && (
          <div className="pt-3 mt-3 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-mono text-[11px]">ID #{article.id}</span>
            <button
              type="button"
              onClick={onPick}
              className="text-red-600 dark:text-red-400 font-bold hover:underline cursor-pointer"
            >
              {isAutoMode ? 'Pin / Override' : 'Change Article'}
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <AdminLayout auth={auth}>
      <Head title="Home Sections &amp; Pinned Stories — Rafvex CMS" />

      <div className="space-y-6 max-w-7xl mx-auto pb-20">
        
        {/* Top Header Matching Pinned Stories */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-600/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center font-bold">
                <Pin className="w-5 h-5 rotate-45" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                  Homepage Sections &amp; Pinned Stories
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Control all 5 homepage sections: switch between Auto-detect and custom visual Card Pinning.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            >
              <ArrowUpRight className="w-3.5 h-3.5 text-red-500" />
              Live Site
            </a>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-500/20 hover:from-red-700 hover:to-rose-700 disabled:opacity-50 transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Save Success Banner */}
        {saveSuccess && (
          <div className="p-4 rounded-xl flex items-center gap-3 text-sm font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 animate-in fade-in duration-200">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <span>Homepage sections &amp; pinned stories updated and cache cleared successfully!</span>
          </div>
        )}

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: 'All 5 Homepage Sections' },
            { id: 'hero', label: '1. Rafvex — Learn. Explore. Discover.' },
            { id: 'trending', label: '2. Trending on Rafvex' },
            { id: 'spotlight', label: '3. Artificial Intelligence & Tools' },
            { id: 'troubleshooting', label: '4. How-To & Troubleshooting' },
            { id: 'reading', label: '5. English Reading Stories' },
            { id: 'latest', label: '6. Latest Stream & Directory' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 1: HERO (Top Featured Stories)
           ═══════════════════════════════════════════════════════════════════ */}
        {(activeTab === 'all' || activeTab === 'hero') && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center">
                  <Star className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Top Featured Stories (Top Section on Homepage)
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Consists of 1 Lead Story (Hero card) + 2 Top Featured Stories on the right + 2 Sub-Featured spotlight cards under Lead.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400">
                  5 Slots Available
                </span>
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
                    {sections.hero.enabled ? 'Section Active' : 'Section Hidden'}
                  </span>
                </label>
              </div>
            </div>

            {/* Title & Subtitle */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Section Title
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
                  Section Subtitle
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

            {/* Mode Toggle: Auto-detect vs Pin Manually */}
            <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                  <input
                    type="radio"
                    name="hero_mode"
                    checked={sections.hero.mode === 'auto'}
                    onChange={() =>
                      setSections((p) => ({
                        ...p,
                        hero: { ...p.hero, mode: 'auto' },
                      }))
                    }
                    className="text-red-600 focus:ring-red-500"
                  />
                  <span className="flex items-center gap-1.5">
                    <Zap size={14} className="text-amber-500" />
                    Auto-detect (Automatically feature newest published articles)
                  </span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                  <input
                    type="radio"
                    name="hero_mode"
                    checked={sections.hero.mode === 'manual'}
                    onChange={() =>
                      setSections((p) => ({
                        ...p,
                        hero: { ...p.hero, mode: 'manual' },
                      }))
                    }
                    className="text-red-600 focus:ring-red-500"
                  />
                  <span className="flex items-center gap-1.5">
                    <Pin size={14} className="text-red-500" />
                    Pin Manually (Pick exact blogs for each hero slot)
                  </span>
                </label>
              </div>

              {sections.hero.mode === 'auto' ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs flex items-center gap-2 font-medium">
                    <Zap size={15} className="shrink-0 text-amber-500" />
                    <span>
                      <strong>Auto-Detect Active:</strong> The hero section automatically displays the newest published stories from your database (1 Lead + 2 Featured + 2 Sub-Featured). Click <strong>Pin / Override</strong> on any card to pin a specific article.
                    </span>
                  </div>

                  <div className="space-y-6 pt-1">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      <div className="lg:col-span-8 space-y-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                          Auto-Detected Lead Story (Live Preview)
                        </span>
                        {renderLeadHeroCard(
                          autoDetected.hero_lead?.id,
                          () => openPicker({ section: 'hero_lead' }),
                          () => {},
                          'Auto Lead Story',
                          true
                        )}
                      </div>

                      <div className="lg:col-span-4 space-y-4">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                          Top Featured Slots 2 &amp; 3 (Live Preview)
                        </span>
                        {[0, 1].map((fIdx) =>
                          renderGridCard(
                            fIdx,
                            autoDetected.hero_featured?.[fIdx]?.id,
                            () => openPicker({ section: 'hero_featured', index: fIdx }),
                            () => {},
                            `#${fIdx + 1} Top Featured`,
                            'bg-red-600',
                            '(Auto: newest published)',
                            true
                          )
                        )}
                      </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                        Sub-Featured Slots 4 &amp; 5 (Live Preview)
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[0, 1].map((sfIdx) =>
                          renderGridCard(
                            sfIdx,
                            autoDetected.hero_sub?.[sfIdx]?.id,
                            () => openPicker({ section: 'hero_sub_featured', index: sfIdx }),
                            () => {},
                            `#${sfIdx + 1} Sub-Featured`,
                            'bg-red-500',
                            '(Auto: newest published)',
                            true
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Slot 1: Main Lead Hero Story (8 cols) */}
                    <div className="lg:col-span-8 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-red-500"></span>
                          Slot 1: Main Lead Hero Story (Large)
                        </span>
                        {sections.hero.lead_id && (
                          <button
                            type="button"
                            onClick={() => clearSlot({ section: 'hero_lead' })}
                            className="text-xs text-rose-600 hover:text-rose-700 font-medium cursor-pointer"
                          >
                            Clear Slot (Use Default)
                          </button>
                        )}
                      </div>

                      {renderLeadHeroCard(
                        sections.hero.lead_id,
                        () => openPicker({ section: 'hero_lead' }),
                        () => clearSlot({ section: 'hero_lead' })
                      )}
                    </div>

                    {/* Slots 2 & 3: Secondary Top Featured Stories (4 cols) */}
                    <div className="lg:col-span-4 space-y-4">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                        Slots 2 &amp; 3: Top Featured (Right Cards)
                      </span>

                      {[0, 1].map((fIdx) =>
                        renderGridCard(
                          fIdx,
                          sections.hero.featured_ids?.[fIdx],
                          () => openPicker({ section: 'hero_featured', index: fIdx }),
                          () => clearSlot({ section: 'hero_featured', index: fIdx }),
                          `#${fIdx + 1} Top Featured`,
                          'bg-red-600',
                          '(Default: newest published)'
                        )
                      )}
                    </div>
                  </div>

                  {/* Slots 4 & 5: Sub-Featured Stories (Under Lead Story) */}
                  <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-500"></span>
                      Slots 4 &amp; 5: Sub-Featured Stories (Under Lead Story)
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[0, 1].map((sfIdx) =>
                        renderGridCard(
                          sfIdx,
                          sections.hero.sub_featured_ids?.[sfIdx],
                          () => openPicker({ section: 'hero_sub_featured', index: sfIdx }),
                          () => clearSlot({ section: 'hero_sub_featured', index: sfIdx }),
                          `#${sfIdx + 1} Sub-Featured`,
                          'bg-red-500',
                          '(Default: newest published)'
                        )
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 2: TRENDING ON RAFVEX (4 Cards)
           ═══════════════════════════════════════════════════════════════════ */}
        {(activeTab === 'all' || activeTab === 'trending') && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <Flame className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Trending on Rafvex (4 Cards)
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Custom pin up to 4 articles in the Trending on Rafvex grid section.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400">
                  4 Slots Available
                </span>
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
                    {sections.trending.enabled ? 'Section Active' : 'Section Hidden'}
                  </span>
                </label>
              </div>
            </div>

            {/* Title & Subtitle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Section Title
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
                  Section Subtitle
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

            {/* Mode Toggle */}
            <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
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
                  <span className="flex items-center gap-1.5">
                    <Flame size={14} className="text-red-500" />
                    Auto-detect (Rank dynamically by highest views_count)
                  </span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
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
                  <span className="flex items-center gap-1.5">
                    <Pin size={14} className="text-red-500" />
                    Pin Manually (Choose exact 4 trending articles)
                  </span>
                </label>
              </div>

              {sections.trending.mode === 'auto' ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2 font-medium">
                    <Flame size={15} className="shrink-0 text-rose-500" />
                    <span>
                      <strong>Auto-Detect Active:</strong> The trending section automatically features the top 4 most-viewed articles on Rafvex. Click <strong>Pin / Override</strong> on any card to pin a specific article.
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
                    {[0, 1, 2, 3].map((tIdx) =>
                      renderGridCard(
                        tIdx,
                        autoDetected.trending?.[tIdx]?.id,
                        () => openPicker({ section: 'trending', index: tIdx }),
                        () => {},
                        `#${tIdx + 1} Trending`,
                        'bg-rose-600',
                        '(Auto: highest views)',
                        true
                      )
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-3 border-t border-slate-200 dark:border-slate-800">
                  {[0, 1, 2, 3].map((tIdx) =>
                    renderGridCard(
                      tIdx,
                      sections.trending.article_ids?.[tIdx],
                      () => openPicker({ section: 'trending', index: tIdx }),
                      () => clearSlot({ section: 'trending', index: tIdx }),
                      `#${tIdx + 1} Trending`,
                      'bg-rose-600',
                      '(Default: highest views)'
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 3: ARTIFICIAL INTELLIGENCE & DIGITAL TOOLS (Category Spotlight)
           ═══════════════════════════════════════════════════════════════════ */}
        {(activeTab === 'all' || activeTab === 'spotlight') && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Artificial Intelligence &amp; Digital Tools (1 Main + 4 Sub Cards)
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Featured spotlight section: 1 large main article on the left + 4 sub-articles on the right.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400">
                  5 Slots Available
                </span>
                <label className="flex items-center gap-2 cursor-pointer">
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
                    {sections.spotlight.enabled ? 'Section Active' : 'Section Hidden'}
                  </span>
                </label>
              </div>
            </div>

            {/* Title, Subtitle, & Category Selector */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
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
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
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
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Source Category
                </label>
                <select
                  value={sections.spotlight.category_slug || 'ai-tools'}
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
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
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

            {/* Mode Toggle */}
            <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
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
                  <span className="flex items-center gap-1.5">
                    <Zap size={14} className="text-amber-500" />
                    Auto-detect (Auto-pull newest 1 main + 4 sub articles from category)
                  </span>
                </label>
                <label className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
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
                  <span className="flex items-center gap-1.5">
                    <Pin size={14} className="text-red-500" />
                    Pin Manually (Pick exact 1 main + 4 sub-articles)
                  </span>
                </label>
              </div>

              {sections.spotlight.mode === 'category' ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-700 dark:text-purple-400 text-xs flex items-center gap-2 font-medium">
                    <Sparkles size={15} className="shrink-0 text-purple-500" />
                    <span>
                      <strong>Auto-Detect Active:</strong> Automatically features the freshest articles published under "{sections.spotlight.category_slug}". Click <strong>Pin / Override</strong> on any card to customize slots.
                    </span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-1">
                    {/* Main Spotlight Auto Preview */}
                    <div className="lg:col-span-6 space-y-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                        Main Feature (Live Preview)
                      </span>
                      {renderLeadHeroCard(
                        autoDetected.spotlight_main?.id,
                        () => openPicker({ section: 'spotlight_main' }),
                        () => {},
                        'Auto AI Spotlight',
                        true
                      )}
                    </div>

                    {/* 4 Sub-Articles Auto Preview */}
                    <div className="lg:col-span-6 space-y-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                        4 Sub-Articles (Live Preview)
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[0, 1, 2, 3].map((sIdx) =>
                          renderGridCard(
                            sIdx,
                            autoDetected.spotlight_sub?.[sIdx]?.id,
                            () => openPicker({ section: 'spotlight_sub', index: sIdx }),
                            () => {},
                            `#${sIdx + 1} AI Sub`,
                            'bg-purple-600',
                            '(Auto: newest AI tools)',
                            true
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-3 border-t border-slate-200 dark:border-slate-800">
                  {/* Main Spotlight Article (6 cols) */}
                  <div className="lg:col-span-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                        Main Spotlight Feature (Large)
                      </span>
                      {sections.spotlight.main_id && (
                        <button
                          type="button"
                          onClick={() => clearSlot({ section: 'spotlight_main' })}
                          className="text-xs text-rose-600 hover:text-rose-700 font-medium cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    {renderLeadHeroCard(
                      sections.spotlight.main_id,
                      () => openPicker({ section: 'spotlight_main' }),
                      () => clearSlot({ section: 'spotlight_main' }),
                      'AI Spotlight'
                    )}
                  </div>

                  {/* 4 Sub-Articles (6 cols: 2x2 grid) */}
                  <div className="lg:col-span-6 space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                      4 Sub-Articles
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[0, 1, 2, 3].map((sIdx) =>
                        renderGridCard(
                          sIdx,
                          sections.spotlight.sub_ids?.[sIdx],
                          () => openPicker({ section: 'spotlight_sub', index: sIdx }),
                          () => clearSlot({ section: 'spotlight_sub', index: sIdx }),
                          `#${sIdx + 1} AI Sub`,
                          'bg-purple-600',
                          '(Default: newest AI tools)'
                        )
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 4: HOW-TO GUIDES & TECH TROUBLESHOOTING (4 Cards)
           ═══════════════════════════════════════════════════════════════════ */}
        {(activeTab === 'all' || activeTab === 'troubleshooting') && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    How-To Guides &amp; Tech Troubleshooting (4 Cards)
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Practical diagnostic solutions, operating systems, and device fixes.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400">
                  4 Slots Available
                </span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sections.troubleshooting.enabled}
                    onChange={(e) =>
                      setSections((p) => ({
                        ...p,
                        troubleshooting: { ...p.troubleshooting, enabled: e.target.checked },
                      }))
                    }
                    className="rounded text-red-600 focus:ring-red-500 h-4 w-4"
                  />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {sections.troubleshooting.enabled ? 'Section Active' : 'Section Hidden'}
                  </span>
                </label>
              </div>
            </div>

            {/* Title, Subtitle, & Category Selector */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Section Title
                </label>
                <input
                  type="text"
                  value={sections.troubleshooting.title}
                  onChange={(e) =>
                    setSections((p) => ({
                      ...p,
                      troubleshooting: { ...p.troubleshooting, title: e.target.value },
                    }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Section Subtitle
                </label>
                <input
                  type="text"
                  value={sections.troubleshooting.subtitle}
                  onChange={(e) =>
                    setSections((p) => ({
                      ...p,
                      troubleshooting: { ...p.troubleshooting, subtitle: e.target.value },
                    }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Source Category
                </label>
                <select
                  value={sections.troubleshooting.category_slug || 'troubleshooting'}
                  onChange={(e) => {
                    const selSlug = e.target.value;
                    const catObj = categories.find((c) => c.slug === selSlug);
                    setSections((p) => ({
                      ...p,
                      troubleshooting: {
                        ...p.troubleshooting,
                        category_slug: selSlug,
                        category_id: catObj ? catObj.id : null,
                      },
                    }));
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="troubleshooting">Troubleshooting &amp; How-To</option>
                  <option value="windows-mac">Windows &amp; Mac</option>
                  <option value="android-iphone">Android &amp; iPhone</option>
                  <option value="basic-online-security">Online Security</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.slug}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Mode Toggle */}
            <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                  <input
                    type="radio"
                    name="tb_mode"
                    checked={sections.troubleshooting.mode === 'category'}
                    onChange={() =>
                      setSections((p) => ({
                        ...p,
                        troubleshooting: { ...p.troubleshooting, mode: 'category' },
                      }))
                    }
                    className="text-red-600 focus:ring-red-500"
                  />
                  <span className="flex items-center gap-1.5">
                    <Zap size={14} className="text-amber-500" />
                    Auto-detect (Auto-pull 4 newest guides from category)
                  </span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                  <input
                    type="radio"
                    name="tb_mode"
                    checked={sections.troubleshooting.mode === 'manual'}
                    onChange={() =>
                      setSections((p) => ({
                        ...p,
                        troubleshooting: { ...p.troubleshooting, mode: 'manual' },
                      }))
                    }
                    className="text-red-600 focus:ring-red-500"
                  />
                  <span className="flex items-center gap-1.5">
                    <Pin size={14} className="text-red-500" />
                    Pin Manually (Pick 4 specific troubleshooting guides)
                  </span>
                </label>
              </div>

              {sections.troubleshooting.mode === 'category' ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-400 text-xs flex items-center gap-2 font-medium">
                    <Wrench size={15} className="shrink-0 text-blue-500" />
                    <span>
                      <strong>Auto-Detect Active:</strong> Automatically features the 4 latest guides published under "{sections.troubleshooting.category_slug}". Click <strong>Pin / Override</strong> on any card to pin a specific guide.
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
                    {[0, 1, 2, 3].map((tbIdx) =>
                      renderGridCard(
                        tbIdx,
                        autoDetected.troubleshooting?.[tbIdx]?.id,
                        () => openPicker({ section: 'troubleshooting', index: tbIdx }),
                        () => {},
                        `#${tbIdx + 1} Guide`,
                        'bg-blue-600',
                        '(Auto: latest guides)',
                        true
                      )
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-3 border-t border-slate-200 dark:border-slate-800">
                  {[0, 1, 2, 3].map((tbIdx) =>
                    renderGridCard(
                      tbIdx,
                      sections.troubleshooting.article_ids?.[tbIdx],
                      () => openPicker({ section: 'troubleshooting', index: tbIdx }),
                      () => clearSlot({ section: 'troubleshooting', index: tbIdx }),
                      `#${tbIdx + 1} Guide`,
                      'bg-blue-600',
                      '(Default: latest guides)'
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 5: ENGLISH READING STORIES & DAILY DISCOVERY (4 Cards)
           ═══════════════════════════════════════════════════════════════════ */}
        {(activeTab === 'all' || activeTab === 'reading') && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    English Reading Stories &amp; Daily Discovery (4 Cards)
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Inspiring stories, curated essays, and rich language designed to empower English learning.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                  4 Slots Available
                </span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sections.reading_stories.enabled}
                    onChange={(e) =>
                      setSections((p) => ({
                        ...p,
                        reading_stories: { ...p.reading_stories, enabled: e.target.checked },
                      }))
                    }
                    className="rounded text-red-600 focus:ring-red-500 h-4 w-4"
                  />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {sections.reading_stories.enabled ? 'Section Active' : 'Section Hidden'}
                  </span>
                </label>
              </div>
            </div>

            {/* Title, Subtitle, & Category Selector */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Section Title
                </label>
                <input
                  type="text"
                  value={sections.reading_stories.title}
                  onChange={(e) =>
                    setSections((p) => ({
                      ...p,
                      reading_stories: { ...p.reading_stories, title: e.target.value },
                    }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Section Subtitle
                </label>
                <input
                  type="text"
                  value={sections.reading_stories.subtitle}
                  onChange={(e) =>
                    setSections((p) => ({
                      ...p,
                      reading_stories: { ...p.reading_stories, subtitle: e.target.value },
                    }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Source Category
                </label>
                <select
                  value={sections.reading_stories.category_slug || 'english-reading-stories'}
                  onChange={(e) => {
                    const selSlug = e.target.value;
                    const catObj = categories.find((c) => c.slug === selSlug);
                    setSections((p) => ({
                      ...p,
                      reading_stories: {
                        ...p.reading_stories,
                        category_slug: selSlug,
                        category_id: catObj ? catObj.id : null,
                      },
                    }));
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="english-reading-stories">English Reading Stories</option>
                  <option value="short-stories">Short Stories</option>
                  <option value="inspirational-stories">Inspirational Stories</option>
                  <option value="vocabulary-life">Vocabulary &amp; Life</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.slug}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Mode Toggle */}
            <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                  <input
                    type="radio"
                    name="reading_mode"
                    checked={sections.reading_stories.mode === 'category'}
                    onChange={() =>
                      setSections((p) => ({
                        ...p,
                        reading_stories: { ...p.reading_stories, mode: 'category' },
                      }))
                    }
                    className="text-red-600 focus:ring-red-500"
                  />
                  <span className="flex items-center gap-1.5">
                    <Zap size={14} className="text-amber-500" />
                    Auto-detect (Auto-pull 4 newest stories from category)
                  </span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                  <input
                    type="radio"
                    name="reading_mode"
                    checked={sections.reading_stories.mode === 'manual'}
                    onChange={() =>
                      setSections((p) => ({
                        ...p,
                        reading_stories: { ...p.reading_stories, mode: 'manual' },
                      }))
                    }
                    className="text-red-600 focus:ring-red-500"
                  />
                  <span className="flex items-center gap-1.5">
                    <Pin size={14} className="text-red-500" />
                    Pin Manually (Pick 4 specific stories)
                  </span>
                </label>
              </div>

              {sections.reading_stories.mode === 'category' ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs flex items-center gap-2 font-medium">
                    <BookOpen size={15} className="shrink-0 text-emerald-500" />
                    <span>
                      <strong>Auto-Detect Active:</strong> Automatically features the 4 latest stories published under "{sections.reading_stories.category_slug}". Click <strong>Pin / Override</strong> on any card to pin a specific story.
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
                    {[0, 1, 2, 3].map((rsIdx) =>
                      renderGridCard(
                        rsIdx,
                        autoDetected.reading_stories?.[rsIdx]?.id,
                        () => openPicker({ section: 'reading_stories', index: rsIdx }),
                        () => {},
                        `#${rsIdx + 1} Story`,
                        'bg-emerald-600',
                        '(Auto: latest reading stories)',
                        true
                      )
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-3 border-t border-slate-200 dark:border-slate-800">
                  {[0, 1, 2, 3].map((rsIdx) =>
                    renderGridCard(
                      rsIdx,
                      sections.reading_stories.article_ids?.[rsIdx],
                      () => openPicker({ section: 'reading_stories', index: rsIdx }),
                      () => clearSlot({ section: 'reading_stories', index: rsIdx }),
                      `#${rsIdx + 1} Story`,
                      'bg-emerald-600',
                      '(Default: latest reading stories)'
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 6 & 7: DIRECTORY & LATEST STORIES
           ═══════════════════════════════════════════════════════════════════ */}
        {(activeTab === 'all' || activeTab === 'latest') && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Directory Section Config */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
                    <FolderOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Explore All Publishing Departments
                    </h3>
                    <p className="text-[11px] text-slate-500">Categories index grid</p>
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sections.directory.enabled}
                    onChange={(e) =>
                      setSections((p) => ({
                        ...p,
                        directory: { ...p.directory, enabled: e.target.checked },
                      }))
                    }
                    className="rounded text-red-600 focus:ring-red-500 h-4 w-4"
                  />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {sections.directory.enabled ? 'Active' : 'Hidden'}
                  </span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Directory Header Title
                </label>
                <input
                  type="text"
                  value={sections.directory.title}
                  onChange={(e) =>
                    setSections((p) => ({
                      ...p,
                      directory: { ...p.directory, title: e.target.value },
                    }))
                  }
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Directory Subtitle
                </label>
                <input
                  type="text"
                  value={sections.directory.subtitle}
                  onChange={(e) =>
                    setSections((p) => ({
                      ...p,
                      directory: { ...p.directory, subtitle: e.target.value },
                    }))
                  }
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Latest Published Stories */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Latest Published Stories
                    </h3>
                    <p className="text-[11px] text-slate-500">Chronological articles stream</p>
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sections.latest.enabled}
                    onChange={(e) =>
                      setSections((p) => ({
                        ...p,
                        latest: { ...p.latest, enabled: e.target.checked },
                      }))
                    }
                    className="rounded text-red-600 focus:ring-red-500 h-4 w-4"
                  />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {sections.latest.enabled ? 'Active' : 'Hidden'}
                  </span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Section Title
                  </label>
                  <input
                    type="text"
                    value={sections.latest.title}
                    onChange={(e) =>
                      setSections((p) => ({
                        ...p,
                        latest: { ...p.latest, title: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Display Limit (Articles)
                  </label>
                  <select
                    value={sections.latest.limit || 10}
                    onChange={(e) =>
                      setSections((p) => ({
                        ...p,
                        latest: { ...p.latest, limit: parseInt(e.target.value) || 10 },
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value={6}>6 Articles</option>
                    <option value={8}>8 Articles</option>
                    <option value={10}>10 Articles (Recommended)</option>
                    <option value={12}>12 Articles</option>
                    <option value={15}>15 Articles</option>
                    <option value={20}>20 Articles</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Section Subtitle
                </label>
                <input
                  type="text"
                  value={sections.latest.subtitle}
                  onChange={(e) =>
                    setSections((p) => ({
                      ...p,
                      latest: { ...p.latest, subtitle: e.target.value },
                    }))
                  }
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <p className="text-[11px] text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl">
                ⚡ <strong>Real-time Chronological Stream:</strong> Automatically delivers the true latest published articles from all departments in reverse chronological order.
              </p>
            </div>

          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            MODAL: ARTICLE PICKER WITH CATEGORY FILTER & CARD PREVIEWS
           ═══════════════════════════════════════════════════════════════════ */}
        {pickerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 sm:p-5">
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-5xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
              
              {/* Modal Header */}
              <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                    <Pin size={18} className="rotate-45" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3
                        style={{ fontFamily: "'Outfit', sans-serif" }}
                        className="text-base sm:text-lg font-bold text-slate-900 dark:text-white"
                      >
                        Select &amp; Pin Article for Homepage
                      </h3>
                      {pickerTarget && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/40">
                          {getTargetLabel(pickerTarget)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Filter articles by category or search by keywords. Click any preview card to select it.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPickerOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition cursor-pointer shrink-0"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Category Filter & Search Bar */}
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950 space-y-3">
                {/* Search input + Category Selector */}
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <div className="relative flex-1">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      autoFocus
                      placeholder="Search articles by title, keywords, or slug..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-9 py-2.5 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-red-500"
                    />
                    {searching ? (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : searchQuery ? (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        <X size={13} />
                      </button>
                    ) : null}
                  </div>

                  {/* Category Dropdown */}
                  <select
                    value={pickerCategory}
                    onChange={(e) => setPickerCategory(e.target.value)}
                    className="sm:w-56 px-3 py-2.5 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.slug}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category Pill Bar (Horizontal Scroll) */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
                  <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider shrink-0 mr-1">
                    Category:
                  </span>
                  <button
                    type="button"
                    onClick={() => setPickerCategory('all')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer shrink-0 ${
                      pickerCategory === 'all'
                        ? 'bg-red-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-400'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((cat) => {
                    const isActive = pickerCategory === cat.slug;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setPickerCategory(cat.slug)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer shrink-0 ${
                          isActive
                            ? 'bg-red-600 text-white shadow-xs'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-400'
                        }`}
                      >
                        {cat.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Preview Cards Grid */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5">
                {(() => {
                  const displayList = searchResults.length > 0 
                    ? searchResults 
                    : (searchQuery.trim().length === 0 && pickerCategory === 'all' ? recentArticles : searchResults);

                  if (searching && displayList.length === 0) {
                    return (
                      <div className="py-20 text-center flex flex-col items-center justify-center">
                        <div className="w-8 h-8 border-3 border-red-600 border-t-transparent rounded-full animate-spin mb-3" />
                        <p className="text-xs text-slate-500">Loading articles with preview...</p>
                      </div>
                    );
                  }

                  if (displayList.length === 0) {
                    return (
                      <div className="py-16 text-center flex flex-col items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mb-3">
                          <FolderOpen size={20} />
                        </div>
                        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                          No articles found
                        </h4>
                        <p className="text-xs text-slate-500 max-w-sm mt-1">
                          No published articles matched your category or search query. Try clicking "All Categories" or clearing the search box.
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {displayList.map((art) => (
                        <div
                          key={art.id}
                          onClick={() => selectArticle(art)}
                          className="border border-slate-200 dark:border-slate-800 hover:border-red-500 dark:hover:border-red-500 rounded-2xl p-3.5 bg-white dark:bg-slate-800/40 hover:bg-red-50/20 dark:hover:bg-red-950/10 hover:shadow-lg transition flex flex-col justify-between cursor-pointer group"
                        >
                          <div>
                            {/* Card Image */}
                            <div className="w-full h-32 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700 mb-2.5 border border-slate-100 dark:border-slate-700/60 shadow-xs relative">
                              {art.cover_image_url ? (
                                <img
                                  src={art.cover_image_url}
                                  alt={art.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-400">
                                  Rafvex
                                </div>
                              )}
                            </div>

                            {/* Category Badge Pill */}
                            <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 mb-1.5">
                              {art.category?.name || 'Article'}
                            </span>

                            {/* Title */}
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-red-600 transition line-clamp-2 leading-snug">
                              {art.title}
                            </h4>
                          </div>

                          {/* Card Footer: ID and Select Action */}
                          <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs">
                            <span className="text-slate-400 font-mono text-[11px]">ID #{art.id}</span>
                            <span className="text-red-600 dark:text-red-400 font-bold group-hover:underline flex items-center gap-1">
                              Select Article
                              <ArrowRight size={13} className="group-hover:translate-x-0.5 transition" />
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}
