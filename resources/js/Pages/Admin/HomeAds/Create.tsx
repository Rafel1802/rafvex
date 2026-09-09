import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
  LayoutGrid,
  ArrowLeft,
  Upload,
  Video,
  Image as ImageIcon,
  Sparkles,
  ExternalLink,
  Check,
  Eye,
  Smartphone,
  Monitor,
  ShieldCheck,
  ArrowUpRight,
} from 'lucide-react';

export default function CreateHomeAd({ auth }: { auth: any }) {
  const { data, setData, post, processing, errors } = useForm({
    title: '',
    sponsor_name: '',
    subtitle: '',
    media_type: 'image',
    media_file: null as File | null,
    media_url: '',
    video_url: '',
    link_url: '',
    aspect_ratio: 'landscape',
    badge_text: 'Sponsored',
    order: 1,
    is_active: true,
    notes: '',
  });

  const [previewMediaUrl, setPreviewMediaUrl] = useState<string>('');
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
    post('/ourcms/home-ads', {
      forceFormData: true,
    });
  };

  const currentMediaUrl = previewMediaUrl || data.media_url || data.video_url;

  return (
    <AdminLayout auth={auth}>
      <Head title="Create Home Ad — Rafvex CMS" />

      <div className="space-y-6 max-w-7xl mx-auto pb-16">
        
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link
            href="/ourcms/home-ads"
            className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:text-red-600 transition"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1
              style={{ fontFamily: "'Outfit', sans-serif" }}
              className="text-2xl font-black text-slate-900 dark:text-white tracking-tight"
            >
              Create Home Ad
            </h1>
            <p className="text-xs text-slate-500">
              Add a responsive sponsor ad (image, GIF, or video) to display below Editorial Standards on the homepage.
            </p>
          </div>
        </div>

        {/* Form & Live Preview Grid */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: Configuration Inputs (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Sponsor & Headline */}
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
                    placeholder="e.g. CloudScale, PromptLab, Acme Tech"
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-red-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                    Badge Label
                  </label>
                  <input
                    type="text"
                    value={data.badge_text}
                    onChange={(e) => setData('badge_text', e.target.value)}
                    placeholder="e.g. Sponsored, Featured Partner"
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-red-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  Ad Headline / Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={data.title}
                  onChange={(e) => setData('title', e.target.value)}
                  placeholder="e.g. NextGen Cloud Clusters & Dedicated GPU Scaling"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-red-500 transition"
                />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  Subtitle / Promo Description
                </label>
                <textarea
                  rows={2}
                  value={data.subtitle}
                  onChange={(e) => setData('subtitle', e.target.value)}
                  placeholder="e.g. Deploy bare-metal NVIDIA H100 servers with instant provisioning and 99.99% uptime."
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-red-500 transition"
                />
              </div>
            </div>

            {/* Media & Creative Asset */}
            <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4">
              <h2
                style={{ fontFamily: "'Outfit', sans-serif" }}
                className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2"
              >
                <ImageIcon size={16} className="text-blue-500" />
                <span>Media &amp; Banner Asset (Image, GIF, Video)</span>
              </h2>

              {/* Media Type Selector */}
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { type: 'image', label: 'Image (PNG/JPG/WebP)', icon: ImageIcon },
                  { type: 'gif', label: 'Animated GIF', icon: Sparkles },
                  { type: 'video', label: 'Video (MP4)', icon: Video },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = data.media_type === item.type;
                  return (
                    <button
                      key={item.type}
                      type="button"
                      onClick={() => setData('media_type', item.type)}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-xs font-bold transition cursor-pointer ${
                        isSelected
                          ? 'border-red-500 bg-red-50/50 dark:bg-red-950/40 text-red-600'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <Icon size={18} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Aspect Ratio Selector (Landscape vs Square) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  Aspect Ratio
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setData('aspect_ratio', 'landscape')}
                    className={`p-3 rounded-xl border flex items-center justify-between text-xs font-bold transition cursor-pointer ${
                      data.aspect_ratio === 'landscape'
                        ? 'border-red-500 bg-red-50/50 dark:bg-red-950/40 text-red-600'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <span>Landscape (16:9)</span>
                    <span className="text-[10px] text-slate-400">1920x1080</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setData('aspect_ratio', 'square')}
                    className={`p-3 rounded-xl border flex items-center justify-between text-xs font-bold transition cursor-pointer ${
                      data.aspect_ratio === 'square'
                        ? 'border-red-500 bg-red-50/50 dark:bg-red-950/40 text-red-600'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <span>Square (1:1)</span>
                    <span className="text-[10px] text-slate-400">1080x1080</span>
                  </button>
                </div>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  Upload Media File
                </label>
                <label className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-red-400 dark:hover:border-red-500 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition bg-slate-50/50 dark:bg-slate-800/50">
                  <Upload size={24} className="text-slate-400" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    {data.media_file ? data.media_file.name : 'Click to select image, GIF, or MP4 video'}
                  </span>
                  <span className="text-[11px] text-slate-400">PNG, JPG, WebP, GIF, or MP4 up to 50MB</span>
                  <input
                    type="file"
                    accept="image/*,video/mp4,video/webm"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              {/* URL input fallback */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  Or Paste External Media / Video URL
                </label>
                <input
                  type="url"
                  value={data.media_url}
                  onChange={(e) => {
                    setData('media_url', e.target.value);
                    setPreviewMediaUrl('');
                  }}
                  placeholder="https://example.com/ad-creative.jpg or https://example.com/video.mp4"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-red-500 transition"
                />
              </div>
            </div>

            {/* Click Destination & Ordering */}
            <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4">
              <h2
                style={{ fontFamily: "'Outfit', sans-serif" }}
                className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2"
              >
                <ExternalLink size={16} className="text-emerald-500" />
                <span>Link Destination &amp; Order</span>
              </h2>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  Destination URL (When Clicked)
                </label>
                <input
                  type="url"
                  value={data.link_url}
                  onChange={(e) => setData('link_url', e.target.value)}
                  placeholder="https://sponsorwebsite.com/offer"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-red-500 transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                    Order Priority (1 = First Slot)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={data.order}
                    onChange={(e) => setData('order', parseInt(e.target.value) || 1)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-red-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                    Status
                  </label>
                  <label className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={data.is_active}
                      onChange={(e) => setData('is_active', e.target.checked)}
                      className="rounded text-red-600 focus:ring-red-500 h-4 w-4"
                    />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      {data.is_active ? 'Active (Displaying on Homepage)' : 'Paused (Hidden)'}
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Link
                href="/ourcms/home-ads"
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs sm:text-sm font-bold transition"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={processing}
                className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-2"
              >
                <Check size={16} />
                <span>{processing ? 'Saving Ad...' : 'Publish Home Ad'}</span>
              </button>
            </div>

          </div>

          {/* Right: Live Interactive Preview (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="sticky top-6">
              
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Eye size={14} className="text-red-600" />
                  Live Sidebar Widget Preview
                </span>
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('desktop')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition ${
                      previewDevice === 'desktop'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                        : 'text-slate-400'
                    }`}
                  >
                    <Monitor size={12} className="inline mr-1" /> Desktop
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('mobile')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition ${
                      previewDevice === 'mobile'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                        : 'text-slate-400'
                    }`}
                  >
                    <Smartphone size={12} className="inline mr-1" /> Mobile
                  </button>
                </div>
              </div>

              {/* Simulated Container */}
              <div className={`mx-auto transition-all ${previewDevice === 'mobile' ? 'max-w-[320px]' : 'w-full'}`}>
                <div className="p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md space-y-3">
                  
                  {/* Top Badge */}
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 text-[10px] font-extrabold uppercase tracking-wider">
                      {data.badge_text || 'Sponsored'}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {data.sponsor_name || 'Our Sponsor'}
                    </span>
                  </div>

                  {/* Media Asset Preview */}
                  <div
                    className={`w-full ${
                      data.aspect_ratio === 'square' ? 'aspect-square' : 'aspect-[16/9]'
                    } rounded-xl overflow-hidden bg-slate-950 relative flex items-center justify-center`}
                  >
                    {data.media_type === 'video' ? (
                      currentMediaUrl ? (
                        <video
                          src={currentMediaUrl}
                          muted
                          loop
                          autoPlay
                          playsInline
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center p-4 text-slate-400">
                          <Video size={24} className="mx-auto mb-1 opacity-50" />
                          <span className="text-xs">Video Preview</span>
                        </div>
                      )
                    ) : currentMediaUrl ? (
                      <img
                        src={currentMediaUrl}
                        alt={data.title || 'Ad creative'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-4 text-slate-400">
                        <ImageIcon size={24} className="mx-auto mb-1 opacity-50" />
                        <span className="text-xs">Media Preview</span>
                      </div>
                    )}
                  </div>

                  {/* Text details */}
                  <div>
                    <h4
                      style={{ fontFamily: "'Outfit', sans-serif" }}
                      className="text-sm font-bold text-slate-900 dark:text-white leading-snug mb-1"
                    >
                      {data.title || 'Your Sponsor Ad Headline Here'}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {data.subtitle || 'Short descriptive promotional copy to inspire readers and click through.'}
                    </p>
                  </div>

                  {/* Link action */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400 text-[11px] font-medium">rafvex.com sponsor</span>
                    <span className="inline-flex items-center gap-1 font-bold text-red-600">
                      Visit Sponsor <ArrowUpRight size={13} />
                    </span>
                  </div>

                </div>

                <div className="mt-3 text-center text-[11px] text-slate-400">
                  This ad will appear in the right sidebar below Editorial Standards.
                </div>
              </div>

            </div>
          </div>

        </form>

      </div>
    </AdminLayout>
  );
}
