import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Pin, Sparkles, Search, Check, X, AlertCircle, Save,
  Terminal, Flame, Star, Layers, Calendar, ArrowUpRight
} from 'lucide-react';

interface ArticleItem {
  id: number;
  title: string;
  slug: string;
  cover_image_url?: string | null;
  published_at?: string | null;
  category?: { id: number; name: string; slug: string } | null;
}

interface Props {
  auth?: {
    user: any;
  };
  pinned?: {
    lead_id: number | null;
    featured_ids: number[];
    trending_ids: number[];
  };
  leadArticle?: ArticleItem | null;
  featuredArticles?: ArticleItem[];
  trendingArticles?: ArticleItem[];
  recentArticles?: ArticleItem[];
}

type SlotTarget = 
  | { type: 'lead' }
  | { type: 'featured'; index: number }
  | { type: 'trending'; index: number };

export default function PinnedStoriesIndex({
  auth,
  pinned = { lead_id: null, featured_ids: [], trending_ids: [] },
  leadArticle = null,
  featuredArticles = [],
  trendingArticles = [],
  recentArticles = [],
}: Props) {
  const safeFeatured = Array.isArray(featuredArticles) ? featuredArticles : [];
  const safeTrending = Array.isArray(trendingArticles) ? trendingArticles : [];
  const safeRecent = Array.isArray(recentArticles) ? recentArticles : [];

  // State for selections
  const [currentLead, setCurrentLead] = useState<ArticleItem | null>(leadArticle || null);
  const [currentFeatured, setCurrentFeatured] = useState<(ArticleItem | null)[]>([
    safeFeatured[0] || null,
    safeFeatured[1] || null,
  ]);
  const [currentTrending, setCurrentTrending] = useState<(ArticleItem | null)[]>([
    safeTrending[0] || null,
    safeTrending[1] || null,
    safeTrending[2] || null,
    safeTrending[3] || null,
  ]);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Picker modal state
  const [pickerOpen, setPickerOpen] = useState(false);
  const [activeSlot, setActiveSlot] = useState<SlotTarget | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ArticleItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [showCliModal, setShowCliModal] = useState(false);

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
        const res = await fetch(`/ourcms/pinned/search?q=${encodeURIComponent(searchQuery.trim())}`);
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

  const openPicker = (target: SlotTarget) => {
    setActiveSlot(target);
    setSearchQuery('');
    setSearchResults([]);
    setPickerOpen(true);
  };

  const selectArticleForSlot = (article: ArticleItem) => {
    if (!activeSlot) return;

    if (activeSlot.type === 'lead') {
      setCurrentLead(article);
    } else if (activeSlot.type === 'featured') {
      setCurrentFeatured(prev => {
        const next = [...prev];
        next[activeSlot.index] = article;
        return next;
      });
    } else if (activeSlot.type === 'trending') {
      setCurrentTrending(prev => {
        const next = [...prev];
        next[activeSlot.index] = article;
        return next;
      });
    }

    setPickerOpen(false);
    setActiveSlot(null);
  };

  const removeSlot = (target: SlotTarget) => {
    if (target.type === 'lead') {
      setCurrentLead(null);
    } else if (target.type === 'featured') {
      setCurrentFeatured(prev => {
        const next = [...prev];
        next[target.index] = null;
        return next;
      });
    } else if (target.type === 'trending') {
      setCurrentTrending(prev => {
        const next = [...prev];
        next[target.index] = null;
        return next;
      });
    }
  };


  const handleSave = () => {
    setSaving(true);
    setMessage(null);

    const payload = {
      lead_id: currentLead ? currentLead.id : null,
      featured_ids: currentFeatured.filter(Boolean).map(a => a!.id),
      trending_ids: currentTrending.filter(Boolean).map(a => a!.id),
    };

    router.post('/ourcms/pinned', payload, {
      preserveScroll: true,
      onSuccess: () => {
        setSaving(false);
        setMessage({ type: 'success', text: 'Pinned stories updated and cache cleared successfully!' });
        setTimeout(() => setMessage(null), 4000);
      },
      onError: (err) => {
        setSaving(false);
        setMessage({ type: 'error', text: Object.values(err)[0] as string || 'Failed to save pinned stories.' });
      },
    });
  };

  return (
    <AdminLayout auth={auth || { user: { name: 'Admin', email: '', avatar: null } }}>
      <Head title="Pinned Stories — Rafvex CMS" />

      <div className="space-y-8 pb-16 max-w-7xl mx-auto">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-600/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center font-bold">
                <Pin className="w-5 h-5 rotate-45" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                  Homepage Pinned Stories
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Select which stories to pin to the Top Featured hero and Trending on Rafvex sections.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setShowCliModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            >
              <Terminal className="w-3.5 h-3.5 text-red-500" />
              SSH / CLI Reference
            </button>



            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-500/20 hover:from-red-700 hover:to-rose-700 disabled:opacity-50 transition"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Message Banner */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${
                message.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
              }`}
            >
              {message.type === 'success' ? (
                <Check className="w-5 h-5 text-emerald-500 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              )}
              <span>{message.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SECTION 1: TOP FEATURED STORIES (HERO) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center">
                <Star className="w-4 h-4 fill-current" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Top Featured Stories (Top Section on Homepage)
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Consists of 1 Lead Story (Hero card) + 2 Top Featured Stories on the right.
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400">
              3 Slots Available
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Slot 1: Main Lead Hero Story (8 cols) */}
            <div className="lg:col-span-8 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  Slot 1: Main Lead Hero Story (Large)
                </span>
                {currentLead && (
                  <button
                    type="button"
                    onClick={() => removeSlot({ type: 'lead' })}
                    className="text-xs text-rose-600 hover:text-rose-700 font-medium"
                  >
                    Clear Slot (Use Default)
                  </button>
                )}
              </div>

              {currentLead ? (
                <div className="relative group rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-950 min-h-[340px] flex flex-col justify-end p-6">
                  {currentLead.cover_image_url ? (
                    <img
                      src={currentLead.cover_image_url}
                      alt={currentLead.title}
                      className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-70 transition duration-300"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                  <div className="relative z-10 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="inline-block px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-md bg-red-600 text-white">
                        {currentLead.category?.name || 'Story'}
                      </span>
                      <span className="text-xs text-slate-300">
                        ID: #{currentLead.id}
                      </span>
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-white leading-tight">
                      {currentLead.title}
                    </h3>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs text-slate-300">
                        {currentLead.published_at ? new Date(currentLead.published_at).toLocaleDateString() : 'Published'}
                      </span>
                      <button
                        type="button"
                        onClick={() => openPicker({ type: 'lead' })}
                        className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-white/90 hover:bg-white text-slate-900 transition"
                      >
                        Change Article
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => openPicker({ type: 'lead' })}
                  className="rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-red-500 dark:hover:border-red-500 bg-slate-50 dark:bg-slate-800/40 p-12 text-center cursor-pointer transition flex flex-col items-center justify-center min-h-[340px] group"
                >
                  <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center mb-3 group-hover:scale-110 transition">
                    <Pin className="w-6 h-6 rotate-45" />
                  </div>
                  <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
                    No Lead Story Pinned
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1 mb-4">
                    The homepage is currently displaying the latest featured article by default. Click below to choose an exact article to pin here.
                  </p>
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-red-600 hover:bg-red-700 text-white shadow transition">
                    <Search className="w-3.5 h-3.5" />
                    Select Lead Hero Story
                  </span>
                </div>
              )}
            </div>

            {/* Slots 2 & 3: Secondary Top Featured Stories (4 cols) */}
            <div className="lg:col-span-4 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                Slots 2 & 3: Top Featured (Right Cards)
              </span>

              {[0, 1].map((idx) => {
                const article = currentFeatured[idx];
                return (
                  <div
                    key={idx}
                    className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-800/30 hover:border-slate-300 dark:hover:border-slate-700 transition"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                        Top Featured Slot #{idx + 1}
                      </span>
                      {article && (
                        <button
                          type="button"
                          onClick={() => removeSlot({ type: 'featured', index: idx })}
                          className="text-[11px] text-rose-500 hover:text-rose-600 font-medium"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    {article ? (
                      <div className="flex gap-3 items-start">
                        {article.cover_image_url ? (
                          <img
                            src={article.cover_image_url}
                            alt={article.title}
                            className="w-16 h-16 rounded-lg object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-slate-200 dark:bg-slate-700 shrink-0 flex items-center justify-center text-slate-400 text-xs">
                            No Img
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <span className="inline-block text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 mb-1">
                            {article.category?.name || 'Story'}
                          </span>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug">
                            {article.title}
                          </h4>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-[10px] text-slate-400">ID #{article.id}</span>
                            <button
                              type="button"
                              onClick={() => openPicker({ type: 'featured', index: idx })}
                              className="text-[11px] text-red-600 dark:text-red-400 font-semibold hover:underline"
                            >
                              Change
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => openPicker({ type: 'featured', index: idx })}
                        className="py-6 text-center cursor-pointer border border-dashed border-slate-300 dark:border-slate-700 rounded-lg hover:border-red-500 transition group"
                      >
                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 group-hover:text-red-600 dark:group-hover:text-red-400">
                          + Pin Article to Slot #{idx + 1}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          (Currently using default featured)
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* SECTION 2: TRENDING ON RAFVEX (4 SLOTS) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
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
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400">
              4 Slots Available
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[0, 1, 2, 3].map((idx) => {
              const article = currentTrending[idx];
              return (
                <div
                  key={idx}
                  className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-800/30 hover:border-slate-300 dark:hover:border-slate-700 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-rose-600 text-white">
                        #{idx + 1} Trending
                      </span>
                      {article && (
                        <button
                          type="button"
                          onClick={() => removeSlot({ type: 'trending', index: idx })}
                          className="text-[11px] text-rose-500 hover:text-rose-600 font-medium"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    {article ? (
                      <div className="space-y-2">
                        {article.cover_image_url ? (
                          <img
                            src={article.cover_image_url}
                            alt={article.title}
                            className="w-full h-28 rounded-lg object-cover border border-slate-200 dark:border-slate-700"
                          />
                        ) : (
                          <div className="w-full h-28 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-400 text-xs">
                            No Cover Image
                          </div>
                        )}
                        <span className="inline-block text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          {article.category?.name || 'Category'}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug">
                          {article.title}
                        </h4>
                      </div>
                    ) : (
                      <div
                        onClick={() => openPicker({ type: 'trending', index: idx })}
                        className="py-12 text-center cursor-pointer border border-dashed border-slate-300 dark:border-slate-700 rounded-lg hover:border-rose-500 transition group"
                      >
                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 group-hover:text-rose-600 dark:group-hover:text-rose-400">
                          + Pin #{idx + 1} Trending
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1">
                          (Default: highest views)
                        </p>
                      </div>
                    )}
                  </div>

                  {article && (
                    <div className="pt-3 mt-3 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">ID #{article.id}</span>
                      <button
                        type="button"
                        onClick={() => openPicker({ type: 'trending', index: idx })}
                        className="text-rose-600 dark:text-rose-400 font-semibold hover:underline"
                      >
                        Change Article
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ARTICLE PICKER MODAL */}
      <AnimatePresence>
        {pickerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Select Article to Pin
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Search by title or choose from recent published articles.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPickerOpen(false)}
                  className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Search Box */}
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search articles by title, keyword, or category..."
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                    autoFocus
                  />
                  {searching && (
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                      Searching...
                    </span>
                  )}
                </div>
              </div>

              {/* Articles List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2 divide-y divide-slate-100 dark:divide-slate-800">
                {searchResults.length > 0 ? (
                  searchResults.map((article) => (
                    <div
                      key={article.id}
                      onClick={() => selectArticleForSlot(article)}
                      className="pt-2 first:pt-0 flex items-center gap-3 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer transition"
                    >
                      {article.cover_image_url ? (
                        <img
                          src={article.cover_image_url}
                          alt={article.title}
                          className="w-14 h-14 rounded-lg object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-lg bg-slate-200 dark:bg-slate-700 shrink-0 flex items-center justify-center text-xs text-slate-400">
                          No Img
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400">
                            {article.category?.name || 'General'}
                          </span>
                          <span className="text-[11px] text-slate-400">ID #{article.id}</span>
                        </div>
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-1">
                          {article.title}
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          {article.published_at ? new Date(article.published_at).toLocaleDateString() : 'Published'}
                        </p>
                      </div>
                      <span className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 shrink-0">
                        Select
                      </span>
                    </div>
                  ))
                ) : searchQuery.trim().length > 0 && !searching ? (
                  <div className="py-12 text-center text-slate-500 dark:text-slate-400 text-sm">
                    No articles found matching "{searchQuery}".
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                      Recently Published Articles
                    </p>
                    <div className="space-y-2">
                      {safeRecent.map((article) => (
                        <div
                          key={article.id}
                          onClick={() => selectArticleForSlot(article)}
                          className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer transition"
                        >
                          {article.cover_image_url ? (
                            <img
                              src={article.cover_image_url}
                              alt={article.title}
                              className="w-14 h-14 rounded-lg object-cover shrink-0"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-lg bg-slate-200 dark:bg-slate-700 shrink-0 flex items-center justify-center text-xs text-slate-400">
                              No Img
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400">
                                {article.category?.name || 'General'}
                              </span>
                              <span className="text-[11px] text-slate-400">ID #{article.id}</span>
                            </div>
                            <h4 className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-1">
                              {article.title}
                            </h4>
                            <p className="text-[11px] text-slate-400">
                              {article.published_at ? new Date(article.published_at).toLocaleDateString() : 'Published'}
                            </p>
                          </div>
                          <span className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 shrink-0">
                            Select
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SSH / CLI REFERENCE MODAL */}
      <AnimatePresence>
        {showCliModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-base">
                  <Terminal className="w-5 h-5 text-red-500" />
                  SSH / CLI Pinning Reference
                </div>
                <button
                  type="button"
                  onClick={() => setShowCliModal(false)}
                  className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                You can manage pinned stories directly in your SSH terminal at any time using either the interactive CLI or one-line commands:
              </p>

              <div className="space-y-2 text-xs font-mono">
                <div className="p-3 rounded-lg bg-slate-950 text-emerald-400 border border-slate-800">
                  <span className="text-slate-500"># Interactive menu with live search and pinning</span>
                  <br />
                  php pin_stories.php
                </div>
                <div className="p-3 rounded-lg bg-slate-950 text-emerald-400 border border-slate-800">
                  <span className="text-slate-500"># Show currently pinned stories</span>
                  <br />
                  php pin_stories.php --show
                </div>
                <div className="p-3 rounded-lg bg-slate-950 text-emerald-400 border border-slate-800">
                  <span className="text-slate-500"># Search articles by keyword</span>
                  <br />
                  php pin_stories.php --search="keyword"
                </div>
                <div className="p-3 rounded-lg bg-slate-950 text-emerald-400 border border-slate-800">
                  <span className="text-slate-500"># Pin slots directly via IDs</span>
                  <br />
                  php pin_stories.php --lead=17 --featured=8,12 --trending=1,5,9,14
                </div>
                <div className="p-3 rounded-lg bg-slate-950 text-emerald-400 border border-slate-800">
                  <span className="text-slate-500"># Reset all slots back to automatic defaults</span>
                  <br />
                  php pin_stories.php --reset
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowCliModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
