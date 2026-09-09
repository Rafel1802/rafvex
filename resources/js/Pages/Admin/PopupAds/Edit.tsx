import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
  ArrowLeft,
  Upload,
  Video,
  Image as ImageIcon,
  Sparkles,
  ExternalLink,
  Calendar,
  Clock,
  Trash2,
  RotateCcw,
  Eye,
  Smartphone,
  Monitor,
} from 'lucide-react';

const COLOR_PRESETS = [
  { name: 'Rafvex Red', value: '#dc2626' },
  { name: 'Emerald Green', value: '#059669' },
  { name: 'Indigo Blue', value: '#4f46e5' },
  { name: 'Amber Gold', value: '#d97706' },
  { name: 'Charcoal Black', value: '#0f172a' },
];

export default function Edit({ auth, popupAd }: { auth: any; popupAd: any }) {
  // Format datetime-local string helper
  const formatDatetimeForInput = (dtStr?: string) => {
    if (!dtStr) return '';
    try {
      const d = new Date(dtStr);
      return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
    } catch {
      return '';
    }
  };

  const { data, setData, post, processing, errors } = useForm({
    _method: 'PUT',
    title: popupAd.title || '',
    subtitle: popupAd.subtitle || '',
    sponsor_name: popupAd.sponsor_name || '',
    media_type: popupAd.media_type || 'image',
    media_file: null as File | null,
    media_url: popupAd.media_url || '',
    video_url: popupAd.video_url || '',
    aspect_ratio: popupAd.aspect_ratio || 'landscape',
    button_text: popupAd.button_text || 'Visit Sponsor',
    button_url: popupAd.button_url || '',
    button_color: popupAd.button_color || '#dc2626',
    is_active: Boolean(popupAd.is_active),
    delay_seconds: popupAd.delay_seconds ?? 3,
    show_on_pages: popupAd.show_on_pages || 'all',
    show_frequency: popupAd.show_frequency || 'once_per_session',
    start_at: formatDatetimeForInput(popupAd.start_at),
    end_at: formatDatetimeForInput(popupAd.end_at),
    notes: popupAd.notes || '',
  });

  const [previewMediaUrl, setPreviewMediaUrl] = useState<string>(popupAd.media_url || '');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setData('media_file', file);
      setPreviewMediaUrl(URL.createObjectURL(file));

      if (file.type.includes('gif')) {
        setData('media_type', 'gif');
      } else if (file.type.includes('video')) {
        setData('media_type', 'video');
      } else {
        setData('media_type', 'image');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(`/ourcms/popup-ads/${popupAd.id}`, {
      forceFormData: true,
    });
  };

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDelete = () => {
    setIsDeleting(true);
    router.delete(`/ourcms/popup-ads/${popupAd.id}`, {
      onFinish: () => setIsDeleting(false),
    });
  };

  const effectiveMediaUrl = previewMediaUrl || data.media_url || data.video_url;

  return (
    <AdminLayout auth={auth}>
      <Head title={`Edit Pop up ad — ${popupAd.title} — Rafvex CMS`} />

      <div className="space-y-6 max-w-7xl mx-auto pb-16">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/ourcms/popup-ads"
              className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:text-red-600 transition"
            >
              <ArrowLeft size={16} />
            </Link>
            <div>
              <h1
                style={{ fontFamily: "'Outfit', sans-serif" }}
                className="text-2xl font-black text-slate-900 dark:text-white tracking-tight"
              >
                Edit Pop up ad
              </h1>
              <p className="text-xs text-slate-500">
                Update media, sponsor information, button links, or campaign schedule.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-600 hover:bg-red-100 text-xs font-bold transition cursor-pointer"
          >
            <Trash2 size={14} />
            <span>Delete Ad</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Form Fields (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Sponsor & Content Details */}
            <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4">
              <h2
                style={{ fontFamily: "'Outfit', sans-serif" }}
                className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2"
              >
                <Sparkles size={16} className="text-red-600" />
                <span>Campaign &amp; Sponsor Info</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                    Sponsor / Client Name
                  </label>
                  <input
                    type="text"
                    value={data.sponsor_name}
                    onChange={(e) => setData('sponsor_name', e.target.value)}
                    placeholder="e.g. Acme Cloud, TechGear"
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-red-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                    Campaign Title / Headline <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={data.title}
                    onChange={(e) => setData('title', e.target.value)}
                    placeholder="e.g. Exclusive 50% Off For Rafvex Readers"
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-red-500 transition"
                  />
                  {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  Subtitle / Promo Description
                </label>
                <textarea
                  rows={2}
                  value={data.subtitle}
                  onChange={(e) => setData('subtitle', e.target.value)}
                  placeholder="e.g. Discover high-performance tools designed for creative pros. Use code RAFVEX at checkout."
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-red-500 transition"
                />
              </div>
            </div>

            {/* 2. Media Upload & Format */}
            <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4">
              <h2
                style={{ fontFamily: "'Outfit', sans-serif" }}
                className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2"
              >
                <ImageIcon size={16} className="text-blue-500" />
                <span>Media &amp; Banner Asset</span>
              </h2>

              {/* Media Type Buttons */}
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { type: 'image', label: 'Image (PNG/JPG)', icon: ImageIcon },
                  { type: 'gif', label: 'Animated GIF', icon: Sparkles },
                  { type: 'video', label: 'Video (MP4/WebM)', icon: Video },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = data.media_type === item.type;
                  return (
                    <button
                      key={item.type}
                      type="button"
                      onClick={() => setData('media_type', item.type as any)}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                        isSelected
                          ? 'border-red-600 bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <Icon size={14} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* File Upload Box */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  Replace Media File (Optional)
                </label>
                <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-5 text-center hover:border-red-400 dark:hover:border-red-500 transition cursor-pointer bg-slate-50/50 dark:bg-slate-800/40">
                  <input
                    type="file"
                    id="media-upload-edit"
                    accept="image/*,video/*,.gif,.webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label htmlFor="media-upload-edit" className="cursor-pointer flex flex-col items-center">
                    <div className="w-10 h-10 rounded-2xl bg-red-50 dark:bg-red-950/50 text-red-600 flex items-center justify-center mb-2">
                      <Upload size={18} />
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Click to choose replacement file
                    </span>
                    <span className="text-[11px] text-slate-400 mt-1">
                      Leave empty to keep existing media file
                    </span>
                    {data.media_file && (
                      <span className="mt-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full">
                        New file selected: {data.media_file.name}
                      </span>
                    )}
                  </label>
                </div>
              </div>

              {/* Or Media URL */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  Direct Media / Video Stream URL
                </label>
                <input
                  type="url"
                  value={data.media_url}
                  onChange={(e) => {
                    setData('media_url', e.target.value);
                    setPreviewMediaUrl(e.target.value);
                  }}
                  placeholder="https://example.com/ad-banner.mp4 or https://cdn.com/banner.gif"
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Aspect Ratio Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  Modal Aspect Ratio Layout
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'landscape', label: 'Landscape (16:9)' },
                    { id: 'portrait', label: 'Portrait (4:5 / 9:16)' },
                    { id: 'square', label: 'Square (1:1)' },
                    { id: 'auto', label: 'Auto Detect' },
                  ].map((ratio) => (
                    <button
                      key={ratio.id}
                      type="button"
                      onClick={() => setData('aspect_ratio', ratio.id as any)}
                      className={`py-2 px-2 text-center rounded-xl border text-[11px] font-bold transition cursor-pointer ${
                        data.aspect_ratio === ratio.id
                          ? 'border-red-600 bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {ratio.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. Call-To-Action Button */}
            <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4">
              <h2
                style={{ fontFamily: "'Outfit', sans-serif" }}
                className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2"
              >
                <ExternalLink size={16} className="text-emerald-500" />
                <span>Call-to-Action (CTA) Button</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                    Button Text
                  </label>
                  <input
                    type="text"
                    value={data.button_text}
                    onChange={(e) => setData('button_text', e.target.value)}
                    placeholder="Visit Sponsor, Claim Deal, Learn More..."
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                    Button Destination URL
                  </label>
                  <input
                    type="url"
                    value={data.button_url}
                    onChange={(e) => setData('button_url', e.target.value)}
                    placeholder="https://sponsor.com/rafvex-promo"
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Button Color Preset Picker */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  Button Accent Color
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => setData('button_color', preset.value)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition cursor-pointer ${
                        data.button_color === preset.value
                          ? 'border-slate-900 dark:border-white shadow-xs ring-2 ring-slate-400'
                          : 'border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full inline-block"
                        style={{ backgroundColor: preset.value }}
                      />
                      <span className="text-slate-700 dark:text-slate-200">{preset.name}</span>
                    </button>
                  ))}

                  <input
                    type="color"
                    value={data.button_color}
                    onChange={(e) => setData('button_color', e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300"
                    title="Choose custom color"
                  />
                </div>
              </div>
            </div>

            {/* 4. Scheduling & Display Settings */}
            <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4">
              <h2
                style={{ fontFamily: "'Outfit', sans-serif" }}
                className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2"
              >
                <Calendar size={16} className="text-amber-500" />
                <span>Scheduling &amp; Target Display</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                    Start Date &amp; Time (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={data.start_at}
                    onChange={(e) => setData('start_at', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                    End Date &amp; Time (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={data.end_at}
                    onChange={(e) => setData('end_at', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                    Delay Before Popup (Seconds)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={60}
                    value={data.delay_seconds}
                    onChange={(e) => setData('delay_seconds', parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                    Show Frequency
                  </label>
                  <select
                    value={data.show_frequency}
                    onChange={(e) => setData('show_frequency', e.target.value as any)}
                    className="w-full px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="once_per_session">Once per visit session</option>
                    <option value="always">Always on every page view</option>
                    <option value="once_per_day">Once every 24 hours</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                    Target Pages
                  </label>
                  <select
                    value={data.show_on_pages}
                    onChange={(e) => setData('show_on_pages', e.target.value as any)}
                    className="w-full px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="all">All Pages</option>
                    <option value="home">Home Page Only</option>
                    <option value="articles">Article Pages Only</option>
                  </select>
                </div>
              </div>

              {/* Status Switch (ON / OFF) */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Active Status (ON / OFF)</p>
                  <p className="text-[11px] text-slate-400">
                    When turned ON, this ad will appear to public visitors according to your schedule.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setData('is_active', !data.is_active)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    data.is_active ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      data.is_active ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={processing}
                className="px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold shadow-lg hover:shadow-xl transition-all cursor-pointer disabled:opacity-50"
              >
                {processing ? 'Saving Changes...' : 'Save & Update Pop up ad'}
              </button>

              <Link
                href="/ourcms/popup-ads"
                className="px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-bold transition"
              >
                Cancel
              </Link>
            </div>
          </div>

          {/* Right Column: Live Interactive Preview (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="sticky top-20 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
                <div className="flex items-center gap-2">
                  <Eye size={15} className="text-red-600" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                    Live Real-Time Preview
                  </span>
                </div>

                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('desktop')}
                    className={`p-1.5 rounded-lg text-xs transition ${
                      previewDevice === 'desktop'
                        ? 'bg-white dark:bg-slate-700 text-red-600 shadow-xs'
                        : 'text-slate-400'
                    }`}
                    title="Desktop preview"
                  >
                    <Monitor size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('mobile')}
                    className={`p-1.5 rounded-lg text-xs transition ${
                      previewDevice === 'mobile'
                        ? 'bg-white dark:bg-slate-700 text-red-600 shadow-xs'
                        : 'text-slate-400'
                    }`}
                    title="Mobile preview"
                  >
                    <Smartphone size={14} />
                  </button>
                </div>
              </div>

              {/* Mock Viewport */}
              <div className="p-4 bg-slate-950/80 rounded-2xl flex items-center justify-center min-h-[380px]">
                <div
                  className={`relative w-full ${
                    previewDevice === 'mobile'
                      ? 'max-w-[280px]'
                      : data.aspect_ratio === 'portrait'
                      ? 'max-w-xs'
                      : data.aspect_ratio === 'landscape'
                      ? 'max-w-sm'
                      : 'max-w-xs'
                  } bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 transform transition-all duration-300`}
                >
                  {/* Close button */}
                  <div className="absolute top-2.5 right-2.5 z-20 w-6 h-6 rounded-full bg-slate-900/60 text-white flex items-center justify-center text-xs">
                    ✕
                  </div>

                  {/* Media */}
                  {effectiveMediaUrl ? (
                    <div
                      className={`w-full overflow-hidden bg-slate-950 relative flex items-center justify-center ${
                        data.aspect_ratio === 'portrait'
                          ? 'aspect-[4/5] max-h-48'
                          : data.aspect_ratio === 'landscape'
                          ? 'aspect-[16/9] max-h-40'
                          : 'aspect-square max-h-40'
                      }`}
                    >
                      {data.media_type === 'video' ? (
                        <video
                          src={effectiveMediaUrl}
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img
                          src={effectiveMediaUrl}
                          alt="preview"
                          className="w-full h-full object-cover"
                        />
                      )}

                      <div className="absolute top-2.5 left-2.5 z-10">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-white/95 text-red-600 shadow-xs">
                          <Sparkles size={10} className="text-red-600 fill-red-600" />
                          {data.sponsor_name ? `Sponsor: ${data.sponsor_name}` : 'Sponsored'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-[16/9] w-full bg-slate-100 flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                      <ImageIcon size={22} className="mb-1 text-slate-300" />
                      <span className="text-[10px]">Media will preview here</span>
                    </div>
                  )}

                  {/* Text & Button */}
                  <div className="p-4">
                    <h4
                      style={{ fontFamily: "'Outfit', sans-serif" }}
                      className="text-base font-black text-slate-900 leading-tight line-clamp-2"
                    >
                      {data.title || 'Your Eye-Catching Title Goes Here'}
                    </h4>
                    {data.subtitle && (
                      <p className="mt-1 text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                        {data.subtitle}
                      </p>
                    )}

                    <div className="mt-3">
                      <div
                        style={{ backgroundColor: data.button_color || '#dc2626' }}
                        className="w-full py-2 px-3 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <span>{data.button_text || 'Visit Sponsor'}</span>
                        <ExternalLink size={12} />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[9px] text-slate-400 mt-2">
                      <span>Don't show again today</span>
                      <span>Dismiss</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
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
              Are you sure you want to permanently delete <strong className="text-slate-900 dark:text-white">&quot;{popupAd.title}&quot;</strong>?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-700 active:scale-95 text-white transition-all shadow-xs flex items-center gap-1.5"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
