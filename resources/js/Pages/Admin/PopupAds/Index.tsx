import React, { useState, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
  Megaphone,
  Plus,
  Search,
  Eye,
  MousePointerClick,
  Percent,
  Calendar,
  Sparkles,
  ExternalLink,
  Edit3,
  Trash2,
  RotateCcw,
  Video,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  Clock,
  X,
  Play,
  Loader2,
} from 'lucide-react';

interface PopupAdItem {
  id: number;
  title: string;
  subtitle?: string;
  sponsor_name?: string;
  media_type: 'image' | 'video' | 'gif';
  media_url?: string;
  video_url?: string;
  aspect_ratio: 'auto' | 'landscape' | 'portrait' | 'square';
  button_text?: string;
  button_url?: string;
  button_color?: string;
  is_active: boolean;
  delay_seconds: number;
  show_on_pages: 'all' | 'home' | 'articles';
  show_frequency: 'once_per_session' | 'always' | 'once_per_day';
  start_at?: string;
  end_at?: string;
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
  ads: PopupAdItem[];
  stats: {
    total_ads: number;
    active_ads: number;
    total_impressions: number;
    total_clicks: number;
    average_ctr: number;
  };
}

export default function Index({ auth, ads = [], stats }: IndexProps) {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [previewAd, setPreviewAd] = useState<PopupAdItem | null>(null);

  const filteredAds = useMemo(() => {
    return ads.filter((ad) => {
      // Type filter
      if (filterType !== 'all' && ad.media_type !== filterType) {
        return false;
      }

      // Search query
      if (search.trim()) {
        const q = search.toLowerCase();
        const titleMatch = (ad.title || '').toLowerCase().includes(q);
        const sponsorMatch = (ad.sponsor_name || '').toLowerCase().includes(q);
        const subMatch = (ad.subtitle || '').toLowerCase().includes(q);
        if (!titleMatch && !sponsorMatch && !subMatch) return false;
      }

      return true;
    });
  }, [ads, search, filterType]);

  const handleToggle = (id: number) => {
    router.post(
      `/ourcms/popup-ads/${id}/toggle`,
      {},
      { preserveScroll: true }
    );
  };

  const [adToReset, setAdToReset] = useState<any>(null);
  const [isResetting, setIsResetting] = useState(false);

  const confirmResetStats = () => {
    if (!adToReset) return;
    setIsResetting(true);
    router.post(
      `/ourcms/popup-ads/${adToReset.id}/reset-stats`,
      {},
      {
        preserveScroll: true,
        onFinish: () => {
          setIsResetting(false);
          setAdToReset(null);
        },
      }
    );
  };

  const [adToDelete, setAdToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDeleteAd = () => {
    if (!adToDelete) return;
    setIsDeleting(true);
    router.delete(`/ourcms/popup-ads/${adToDelete.id}`, {
      preserveScroll: true,
      onFinish: () => {
        setIsDeleting(false);
        setAdToDelete(null);
      },
    });
  };

  return (
    <AdminLayout auth={auth}>
      <Head title="Pop up ads — Sponsored Customer Ads — Rafvex CMS" />

      <div className="space-y-6 pb-12">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-8 h-8 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center">
                <Megaphone size={18} />
              </span>
              <h1
                style={{ fontFamily: "'Outfit', sans-serif" }}
                className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight"
              >
                Pop up ads
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Manage sponsored customer popup ads, banner media (Image, GIF, Video), scheduling, and click-through analytics.
            </p>
          </div>

          <Link
            href="/ourcms/popup-ads/create"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all duration-200"
          >
            <Plus size={16} />
            <span>New Pop up ad</span>
          </Link>
        </div>

        {/* Quick Analytics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Total Campaigns</span>
              <Megaphone size={16} className="text-blue-500" />
            </div>
            <p
              style={{ fontFamily: "'Outfit', sans-serif" }}
              className="text-2xl font-black text-slate-900 dark:text-white"
            >
              {stats.total_ads}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Active / Live</span>
              <CheckCircle2 size={16} className="text-emerald-500" />
            </div>
            <p
              style={{ fontFamily: "'Outfit', sans-serif" }}
              className="text-2xl font-black text-emerald-600 dark:text-emerald-400"
            >
              {stats.active_ads}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Total Impressions</span>
              <Eye size={16} className="text-indigo-500" />
            </div>
            <p
              style={{ fontFamily: "'Outfit', sans-serif" }}
              className="text-2xl font-black text-slate-900 dark:text-white"
            >
              {stats.total_impressions.toLocaleString()}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Total Clicks</span>
              <MousePointerClick size={16} className="text-red-500" />
            </div>
            <p
              style={{ fontFamily: "'Outfit', sans-serif" }}
              className="text-2xl font-black text-slate-900 dark:text-white"
            >
              {stats.total_clicks.toLocaleString()}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Average CTR</span>
              <Percent size={16} className="text-amber-500" />
            </div>
            <p
              style={{ fontFamily: "'Outfit', sans-serif" }}
              className="text-2xl font-black text-amber-600 dark:text-amber-400"
            >
              {stats.average_ctr}%
            </p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, sponsor name, or description..."
              className="w-full pl-9 pr-8 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-950/40 transition"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-red-500"
            >
              <option value="all">All Formats</option>
              <option value="image">Image (PNG/JPG)</option>
              <option value="gif">Animated GIF</option>
              <option value="video">Video (MP4/WebM)</option>
            </select>
          </div>
        </div>

        {/* Ads List Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs overflow-hidden">
          {filteredAds.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Media &amp; Title</th>
                    <th className="py-3 px-4">Format &amp; Ratio</th>
                    <th className="py-3 px-4">Status &amp; Schedule</th>
                    <th className="py-3 px-4 text-center">Impressions</th>
                    <th className="py-3 px-4 text-center">Clicks</th>
                    <th className="py-3 px-4 text-center">CTR</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {filteredAds.map((ad) => {
                    const isRunning = ad.is_currently_running;
                    const hasMedia = Boolean(ad.media_url || ad.video_url);

                    return (
                      <tr
                        key={ad.id}
                        className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                      >
                        {/* Media & Title */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div
                              onClick={() => setPreviewAd(ad)}
                              className="w-14 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden relative shrink-0 border border-slate-200 dark:border-slate-700 cursor-pointer group"
                              title="Click to preview"
                            >
                              {hasMedia ? (
                                ad.media_type === 'video' ? (
                                  <div className="w-full h-full flex items-center justify-center bg-slate-900 text-white">
                                    <Play size={16} className="fill-white" />
                                  </div>
                                ) : (
                                  <img
                                    src={ad.media_url}
                                    alt={ad.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                  />
                                )
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                  <ImageIcon size={16} />
                                </div>
                              )}
                            </div>

                            <div className="min-w-0 max-w-xs sm:max-w-sm">
                              <p className="font-bold text-slate-900 dark:text-white truncate">
                                {ad.title}
                              </p>
                              {ad.sponsor_name && (
                                <p className="text-[11px] text-red-600 dark:text-red-400 font-semibold flex items-center gap-1">
                                  <Sparkles size={10} /> Sponsor: {ad.sponsor_name}
                                </p>
                              )}
                              {ad.button_url && (
                                <a
                                  href={ad.button_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 truncate block mt-0.5"
                                >
                                  {ad.button_url}
                                </a>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Format & Ratio */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1">
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300 capitalize">
                              {ad.media_type === 'video' ? (
                                <Video size={12} className="text-blue-500" />
                              ) : (
                                <ImageIcon size={12} className="text-indigo-500" />
                              )}
                              {ad.media_type}
                            </span>
                            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                              {ad.aspect_ratio}
                            </span>
                          </div>
                        </td>

                        {/* Status Toggle & Schedule */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              {/* ON/OFF Switch */}
                              <button
                                type="button"
                                onClick={() => handleToggle(ad.id)}
                                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                  ad.is_active ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                                }`}
                                title={ad.is_active ? 'Click to Pause (Turn OFF)' : 'Click to Activate (Turn ON)'}
                              >
                                <span
                                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                    ad.is_active ? 'translate-x-4' : 'translate-x-0'
                                  }`}
                                />
                              </button>

                              <span
                                className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                                  isRunning
                                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                }`}
                              >
                                {ad.status_label}
                              </span>
                            </div>

                            {ad.start_at || ad.end_at ? (
                              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                                <Clock size={10} />
                                {ad.start_at ? new Date(ad.start_at).toLocaleDateString() : 'Now'}
                                {' → '}
                                {ad.end_at ? new Date(ad.end_at).toLocaleDateString() : 'Continuous'}
                              </div>
                            ) : (
                              <p className="text-[10px] text-slate-400">Always Active (Continuous)</p>
                            )}
                          </div>
                        </td>

                        {/* Impressions */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <span className="font-extrabold text-slate-900 dark:text-white">
                            {ad.impressions_count.toLocaleString()}
                          </span>
                        </td>

                        {/* Clicks */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <span className="font-extrabold text-red-600 dark:text-red-400">
                            {ad.clicks_count.toLocaleString()}
                          </span>
                        </td>

                        {/* CTR */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <span className="inline-block px-2 py-0.5 rounded-md font-bold text-xs bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                            {ad.ctr}%
                          </span>
                        </td>

                        {/* Action buttons */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Preview button */}
                            <button
                              type="button"
                              onClick={() => setPreviewAd(ad)}
                              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
                              title="Live Modal Preview"
                            >
                              <Eye size={15} />
                            </button>

                            {/* Edit */}
                            <Link
                              href={`/ourcms/popup-ads/${ad.id}/edit`}
                              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
                              title="Edit Ad"
                            >
                              <Edit3 size={15} />
                            </Link>

                            {/* Reset stats */}
                            <button
                              type="button"
                              onClick={() => setAdToReset(ad)}
                              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                              title="Reset Impressions & Clicks Counter"
                            >
                              <RotateCcw size={14} />
                            </button>

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={() => setAdToDelete(ad)}
                              className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/50 text-slate-400 hover:text-red-600 transition cursor-pointer"
                              title="Delete Ad"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16 px-4">
              <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-950/50 text-red-600 flex items-center justify-center mx-auto mb-3">
                <Megaphone size={24} />
              </div>
              <h3
                style={{ fontFamily: "'Outfit', sans-serif" }}
                className="text-lg font-bold text-slate-900 dark:text-white mb-1"
              >
                No Pop up ads yet
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                Create customer sponsor campaigns with responsive images, animated GIFs, or videos to monetize your publication.
              </p>
              <Link
                href="/ourcms/popup-ads/create"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-sm"
              >
                <Plus size={14} />
                <span>Create First Pop up ad</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ── LIVE PREVIEW MODAL (Inside CMS) ── */}
      {previewAd && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm"
          onClick={() => setPreviewAd(null)}
        >
          <div
            className={`relative w-full ${
              previewAd.aspect_ratio === 'portrait'
                ? 'max-w-md'
                : previewAd.aspect_ratio === 'landscape'
                ? 'max-w-2xl'
                : 'max-w-lg'
            } bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setPreviewAd(null)}
              className="absolute top-3.5 right-3.5 z-20 w-8 h-8 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white flex items-center justify-center backdrop-blur-md transition cursor-pointer"
            >
              <X size={16} />
            </button>

            {/* Media */}
            {(previewAd.media_url || previewAd.video_url) && (
              <div
                className={`w-full overflow-hidden bg-slate-950 relative flex items-center justify-center ${
                  previewAd.aspect_ratio === 'portrait'
                    ? 'aspect-[4/5] max-h-[55vh]'
                    : previewAd.aspect_ratio === 'landscape'
                    ? 'aspect-[16/9] max-h-[46vh]'
                    : 'aspect-square max-h-[46vh]'
                }`}
              >
                {previewAd.media_type === 'video' ? (
                  <video
                    src={previewAd.media_url || previewAd.video_url}
                    autoPlay
                    loop
                    muted
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

                <div className="absolute top-3.5 left-3.5 z-10">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/95 text-red-600 backdrop-blur-md shadow-sm border border-white/60">
                    <Sparkles size={11} className="text-red-600 fill-red-600" />
                    {previewAd.sponsor_name ? `Sponsor: ${previewAd.sponsor_name}` : 'Sponsored'}
                  </span>
                </div>
              </div>
            )}

            {/* Text & Button */}
            <div className="p-6">
              <h3
                style={{ fontFamily: "'Outfit', sans-serif" }}
                className="text-xl font-black text-slate-900 leading-snug"
              >
                {previewAd.title}
              </h3>
              {previewAd.subtitle && (
                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {previewAd.subtitle}
                </p>
              )}

              <div className="mt-5">
                <a
                  href={previewAd.button_url || '#'}
                  target="_blank"
                  rel="noreferrer"
                  style={{ backgroundColor: previewAd.button_color || '#dc2626' }}
                  className="w-full py-3 px-5 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 hover:opacity-95 transition shadow-md"
                >
                  <span>{previewAd.button_text || 'Visit Sponsor'}</span>
                  <ExternalLink size={16} />
                </a>
              </div>

              <p className="text-[11px] text-center text-slate-400 mt-3">
                Live Preview Mode • {previewAd.aspect_ratio.toUpperCase()} format
              </p>
            </div>
          </div>
        </div>
      )}

        {/* Delete Confirmation Modal */}
        {adToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center gap-3 text-red-600">
                <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40">
                  <Trash2 size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete Pop Up Ad</h3>
                  <p className="text-xs text-slate-400">Permanently delete advertisement.</p>
                </div>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-300">
                Are you sure you want to delete <strong className="text-slate-900 dark:text-white">&quot;{adToDelete.title}&quot;</strong>?
              </p>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAdToDelete(null)}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteAd}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-700 active:scale-95 text-white transition-all shadow-xs flex items-center gap-1.5"
                >
                  {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reset Metrics Confirmation Modal */}
        {adToReset && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center gap-3 text-amber-600">
                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40">
                  <RotateCcw size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Reset Ad Metrics</h3>
                  <p className="text-xs text-slate-400">Reset impressions and clicks to zero.</p>
                </div>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-300">
                Reset impressions and click analytics for <strong className="text-slate-900 dark:text-white">&quot;{adToReset.title}&quot;</strong> to 0?
              </p>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAdToReset(null)}
                  disabled={isResetting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmResetStats}
                  disabled={isResetting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-700 active:scale-95 text-white transition-all shadow-xs flex items-center gap-1.5"
                >
                  {isResetting ? 'Resetting...' : 'Confirm Reset'}
                </button>
              </div>
            </div>
          </div>
        )}
      </AdminLayout>
    );
  }
