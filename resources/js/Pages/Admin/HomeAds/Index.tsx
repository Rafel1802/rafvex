import React, { useState, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
  LayoutGrid,
  Plus,
  Search,
  Eye,
  MousePointerClick,
  Percent,
  Sparkles,
  ExternalLink,
  Edit3,
  Trash2,
  RotateCcw,
  Video,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  X,
  Play,
  ArrowUpRight,
  ShieldCheck,
  Loader2,
  AlertTriangle,
} from 'lucide-react';

interface HomeAdItem {
  id: number;
  title: string;
  sponsor_name?: string;
  subtitle?: string;
  media_type: 'image' | 'video' | 'gif';
  media_url?: string;
  video_url?: string;
  link_url?: string;
  aspect_ratio: 'landscape' | 'square' | 'auto';
  badge_text?: string;
  order: number;
  is_active: boolean;
  impressions_count: number;
  clicks_count: number;
  ctr: number;
  status_label: string;
  is_currently_running: boolean;
  notes?: string;
  created_at?: string;
}

interface IndexProps {
  auth: any;
  ads: HomeAdItem[];
  stats: {
    total_ads: number;
    active_ads: number;
    total_impressions: number;
    total_clicks: number;
    average_ctr: number;
  };
}

export default function HomeAdsIndex({ auth, ads = [], stats }: IndexProps) {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [previewAd, setPreviewAd] = useState<HomeAdItem | null>(null);

  const filteredAds = useMemo(() => {
    return ads.filter((ad) => {
      if (filterType !== 'all' && ad.media_type !== filterType) {
        return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        const titleMatch = (ad.title || '').toLowerCase().includes(q);
        const sponsorMatch = (ad.sponsor_name || '').toLowerCase().includes(q);
        const subtitleMatch = (ad.subtitle || '').toLowerCase().includes(q);
        return titleMatch || sponsorMatch || subtitleMatch;
      }
      return true;
    });
  }, [ads, search, filterType]);

  const handleToggle = (id: number) => {
    router.post(`/ourcms/home-ads/${id}/toggle`, {}, {
      preserveScroll: true,
    });
  };

  const [adToDelete, setAdToDelete] = useState<HomeAdItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [adToReset, setAdToReset] = useState<HomeAdItem | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  const confirmDeleteAd = () => {
    if (!adToDelete) return;
    setIsDeleting(true);
    router.delete(`/ourcms/home-ads/${adToDelete.id}`, {
      preserveScroll: true,
      onFinish: () => {
        setIsDeleting(false);
        setAdToDelete(null);
      },
    });
  };

  const confirmResetStats = () => {
    if (!adToReset) return;
    setIsResetting(true);
    router.post(`/ourcms/home-ads/${adToReset.id}/reset-stats`, {}, {
      preserveScroll: true,
      onFinish: () => {
        setIsResetting(false);
        setAdToReset(null);
      },
    });
  };

  return (
    <AdminLayout auth={auth}>
      <Head title="Home Ads Manager — Rafvex CMS" />

      <div className="space-y-6 max-w-7xl mx-auto pb-16">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-600 dark:bg-red-950/40 text-xs font-bold uppercase tracking-wider mb-2 border border-red-100 dark:border-red-900/50">
              <LayoutGrid size={13} />
              Homepage Sidebar &amp; Stream Ads
            </div>
            <h1
              style={{ fontFamily: "'Outfit', sans-serif" }}
              className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight"
            >
              Home Ads
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Manage responsive sponsor ads (images, GIFs, or videos) displayed beneath Editorial Standards on the homepage.
            </p>
          </div>

          <Link
            href="/ourcms/home-ads/create"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Plus size={16} />
            <span>Create Home Ad</span>
          </Link>
        </div>

        {/* Analytics & Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Ads</span>
              <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
                <LayoutGrid size={15} />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">{stats.total_ads}</div>
            <div className="text-xs text-emerald-600 font-semibold mt-1">
              {stats.active_ads} Active Running
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Impressions</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Eye size={15} />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {stats.total_impressions.toLocaleString()}
            </div>
            <div className="text-xs text-slate-400 mt-1">Total homepage views</div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Clicks</span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <MousePointerClick size={15} />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {stats.total_clicks.toLocaleString()}
            </div>
            <div className="text-xs text-slate-400 mt-1">Direct sponsor visits</div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Average CTR</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Percent size={15} />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">{stats.average_ctr}%</div>
            <div className="text-xs text-slate-400 mt-1">Click-through rate</div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <div className="relative w-full sm:w-72">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search ads by title, sponsor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
            {['all', 'image', 'gif', 'video'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors ${
                  filterType === type
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {type === 'all' ? 'All Types' : type.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Ads Cards Grid */}
        {filteredAds.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center mx-auto mb-4">
              <LayoutGrid size={24} />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">No Home Ads Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
              Create your first sponsor ad to feature responsive images, GIFs, or videos in the homepage sidebar.
            </p>
            <Link
              href="/ourcms/home-ads/create"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition"
            >
              <Plus size={14} />
              <span>Create New Ad</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {filteredAds.map((ad) => {
              const isVideo = ad.media_type === 'video';
              const isSquare = ad.aspect_ratio === 'square';

              return (
                <div
                  key={ad.id}
                  className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-md hover:border-red-200 dark:hover:border-red-900/50 transition-all flex flex-col justify-between overflow-hidden"
                >
                  <div>
                    {/* Media Preview Container */}
                    <div className={`relative w-full ${isSquare ? 'aspect-square' : 'aspect-[16/9]'} bg-slate-950 overflow-hidden`}>
                      {isVideo ? (
                        <video
                          src={ad.video_url || ad.media_url}
                          muted
                          loop
                          autoPlay
                          playsInline
                          className="w-full h-full object-cover"
                        />
                      ) : ad.media_url ? (
                        <img
                          src={ad.media_url}
                          alt={ad.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-500">
                          <ImageIcon size={28} />
                        </div>
                      )}

                      {/* Aspect Ratio & Media Badges */}
                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
                        <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider">
                          {ad.badge_text || 'Sponsored'}
                        </span>
                        <span className="px-1.5 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-slate-300 text-[9px] font-semibold uppercase">
                          {ad.aspect_ratio === 'square' ? '1:1 Square' : '16:9 Landscape'}
                        </span>
                      </div>

                      {/* Quick Preview Button */}
                      <button
                        type="button"
                        onClick={() => setPreviewAd(ad)}
                        className="absolute bottom-2.5 right-2.5 w-7 h-7 rounded-lg bg-black/70 hover:bg-black text-white flex items-center justify-center transition-colors cursor-pointer"
                        title="Preview Ad"
                      >
                        <Eye size={13} />
                      </button>
                    </div>

                    {/* Content Details */}
                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                        <span className="truncate max-w-[150px] text-red-600 font-bold">
                          {ad.sponsor_name || 'Sponsored'}
                        </span>
                        <span>Slot #{ad.order || 1}</span>
                      </div>

                      <h3
                        style={{ fontFamily: "'Outfit', sans-serif" }}
                        className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-red-600 transition-colors"
                      >
                        {ad.title}
                      </h3>

                      {ad.subtitle && (
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {ad.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Metrics & Actions Bar */}
                  <div className="p-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
                    {/* Impressions / Clicks / CTR */}
                    <div className="grid grid-cols-3 gap-1 text-center py-1 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
                      <div>
                        <div className="text-[10px] text-slate-400 font-medium">Views</div>
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {ad.impressions_count || 0}
                        </div>
                      </div>
                      <div className="border-x border-slate-100 dark:border-slate-700/60">
                        <div className="text-[10px] text-slate-400 font-medium">Clicks</div>
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {ad.clicks_count || 0}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 font-medium">CTR</div>
                        <div className="text-xs font-bold text-emerald-600">
                          {ad.ctr || 0}%
                        </div>
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={() => handleToggle(ad.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                          ad.is_active
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {ad.is_active ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                        <span>{ad.is_active ? 'Active' : 'Paused'}</span>
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setAdToReset(ad);
                          }}
                          className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition cursor-pointer"
                          title="Reset metrics"
                        >
                          <RotateCcw size={13} />
                        </button>
                        <Link
                          href={`/ourcms/home-ads/${ad.id}/edit`}
                          className="w-7 h-7 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center justify-center transition"
                          title="Edit Ad"
                        >
                          <Edit3 size={13} />
                        </Link>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setAdToDelete(ad);
                          }}
                          className="w-7 h-7 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center justify-center transition cursor-pointer"
                          title="Delete Ad"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal: Live Homepage Sidebar Preview */}
        {previewAd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-red-600" />
                  Homepage Sidebar Preview
                </span>
                <button
                  type="button"
                  onClick={() => setPreviewAd(null)}
                  className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:white flex items-center justify-center transition cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="p-6 bg-slate-50 dark:bg-slate-950">
                {/* Simulated Homepage Sidebar Card */}
                <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 text-[10px] font-extrabold uppercase tracking-wider">
                      {previewAd.badge_text || 'Sponsored'}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {previewAd.sponsor_name}
                    </span>
                  </div>

                  <div className={`rounded-xl overflow-hidden bg-slate-900 ${previewAd.aspect_ratio === 'square' ? 'aspect-square' : 'aspect-[16/9]'}`}>
                    {previewAd.media_type === 'video' ? (
                      <video
                        src={previewAd.video_url || previewAd.media_url}
                        muted
                        loop
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src={previewAd.media_url}
                        alt={previewAd.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                      {previewAd.title}
                    </h4>
                    {previewAd.subtitle && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        {previewAd.subtitle}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">rafvex.com partner</span>
                    <a
                      href={previewAd.link_url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-bold text-red-600 hover:text-red-700"
                    >
                      Visit Sponsor <ArrowUpRight size={13} />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Verify Delete Confirmation */}
        {adToDelete && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150"
            onClick={(e) => {
              if (e.target === e.currentTarget && !isDeleting) {
                setAdToDelete(null);
              }
            }}
          >
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 text-red-600">
                  <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-600 shrink-0">
                    <Trash2 size={22} />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
                      Delete Home Ad
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Confirm permanent removal
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => !isDeleting && setAdToDelete(null)}
                  disabled={isDeleting}
                  className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center justify-center transition cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1.5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-red-600">
                  {adToDelete.sponsor_name || 'Sponsored'} • Slot #{adToDelete.order || 1}
                </div>
                <div className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2">
                  {adToDelete.title}
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Are you sure you want to delete this home ad? It will be permanently removed from your homepage sidebar. This action cannot be undone.
              </p>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setAdToDelete(null)}
                  disabled={isDeleting}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteAd}
                  disabled={isDeleting}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 active:scale-95 text-white transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 size={13} />
                      <span>Confirm Delete</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Reset Metrics Confirmation */}
        {adToReset && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150"
            onClick={(e) => {
              if (e.target === e.currentTarget && !isResetting) {
                setAdToReset(null);
              }
            }}
          >
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 text-amber-600">
                  <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 shrink-0">
                    <RotateCcw size={22} />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
                      Reset Ad Metrics
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Reset impressions and clicks to zero
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => !isResetting && setAdToReset(null)}
                  disabled={isResetting}
                  className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center justify-center transition cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                <div className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2">
                  {adToReset.title}
                </div>
                <div className="text-xs text-slate-500">
                  Current views: <strong className="text-slate-800 dark:text-slate-200">{adToReset.impressions_count}</strong> • Current clicks: <strong className="text-slate-800 dark:text-slate-200">{adToReset.clicks_count}</strong>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Are you sure you want to reset impressions and click metrics for this ad? All counters will be reset to 0.
              </p>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setAdToReset(null)}
                  disabled={isResetting}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmResetStats}
                  disabled={isResetting}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 active:scale-95 text-white transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isResetting ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span>Resetting...</span>
                    </>
                  ) : (
                    <>
                      <RotateCcw size={13} />
                      <span>Confirm Reset</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}
