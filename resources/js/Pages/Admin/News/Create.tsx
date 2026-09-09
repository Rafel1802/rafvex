import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/Button';
import { Input } from '@/Components/ui/Input';
import TiptapEditor from '@/Components/Editor/TiptapEditor';
import VideoEmbed from '@/Components/VideoEmbed';
import { ArrowLeft, Save, Radio, Video, Image as ImageIcon, Globe, CheckCircle2 } from 'lucide-react';

export default function Create({ auth }: any) {
  const [imagePreview, setImagePreview] = useState('');

  const { data, setData, post, processing, errors, transform } = useForm({
    title: '',
    slug: '',
    summary: '',
    content: '',
    content_raw: '',
    cover_image_url: '',
    cover_image_alt: '',
    video_url: '',
    source: 'Rafvex News Wire',
    source_url: '',
    is_breaking: false,
    status: 'published',
  });

  const handleTitleChange = (val: string) => {
    setData((prev) => {
      const autoSlug = val
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      if (!prev.slug || prev.slug === autoSlug.slice(0, prev.slug.length)) {
        return { ...prev, title: val, slug: autoSlug };
      }
      return { ...prev, title: val };
    });
  };

  const handleSave = (targetStatus?: 'draft' | 'published') => {
    const finalStatus = targetStatus || data.status;
    transform((d) => ({
      ...d,
      status: finalStatus,
    }));
    post('/ourcms/news');
  };

  return (
    <AdminLayout auth={auth}>
      <Head title="Post News Dispatch - Rafvex CMS" />

      <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="max-w-7xl mx-auto space-y-6">
        {/* Top Sticky Action Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <Link
              href="/ourcms/news"
              className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
              title="Back to Newsroom"
            >
              <ArrowLeft size={16} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-display">
                Post News Dispatch
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Publish real-time tech updates, breaking alerts, and video dispatches
              </p>
            </div>
          </div>

          <div className="flex lg:hidden items-center gap-2.5">
            <Button
              type="button"
              onClick={() => handleSave()}
              isLoading={processing}
            >
              <Save size={15} className="mr-1.5" /> Save
            </Button>
          </div>
        </div>

        {/* 2-Column Editorial Grid (Same layout as blog articles) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Main Editorial Content (Left 2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Title & Slug */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Headline / News Title *
              </label>
              <Input
                type="text"
                value={data.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                error={errors.title}
                placeholder="e.g. OpenAI Unveils Next-Gen Reasoning Engine with Hybrid Architecture"
                className="text-xl sm:text-2xl font-bold border-0 border-b-2 rounded-none border-slate-200 focus:ring-0 focus:border-red-500 bg-transparent px-0 shadow-none dark:border-slate-800 dark:focus:border-red-500"
              />

              {/* URL Slug Preview */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <Globe size={14} className="text-slate-400 shrink-0" />
                <span className="text-xs text-slate-400 select-none font-mono">rafvex.com/news/</span>
                <input
                  type="text"
                  value={data.slug}
                  onChange={(e) => setData('slug', e.target.value)}
                  placeholder="auto-generated-slug"
                  className="flex-1 text-xs font-mono py-1 px-2 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>
              {errors.slug && <p className="text-xs text-red-500 mt-1">{errors.slug}</p>}
            </div>

            {/* Key Dispatch Takeaways (Summary Kicker Box) */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Executive Dispatch Summary (Key Bullet Takeaway)
              </label>
              <textarea
                value={data.summary}
                onChange={(e) => setData('summary', e.target.value)}
                rows={3}
                placeholder="A concise, high-impact overview of what broke and why it matters to engineers & tech readers..."
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-900 dark:text-white resize-y placeholder:text-slate-400"
              />
              <p className="text-[11px] text-slate-400 mt-1">Displayed as the highlight briefing card at the top of the news piece.</p>
              {errors.summary && <p className="text-xs text-red-500 mt-1">{errors.summary}</p>}
            </div>

            {/* Full Story Content with WYSIWYG Tiptap Editor (Allows Images, Formatted Text, Quotes) */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Full Dispatch Story Content *
                </label>
                <span className="text-[11px] text-slate-400">
                  Visual Editor: Use the toolbar to insert images, headings, and quotes.
                </span>
              </div>
              <TiptapEditor 
                content=""
                onChangeRaw={(json) => setData('content_raw', json)}
                onChangeHtml={(html) => setData('content', html)}
              />
              {errors.content && <p className="mt-1 text-sm text-red-500">{errors.content}</p>}
            </div>

          </div>

          {/* Right Sidebar (Settings, Media, Status - 1 col) - Sticky on desktop */}
          <div className="space-y-6 lg:sticky lg:top-[80px] lg:self-start lg:max-h-[calc(100vh-95px)] lg:overflow-y-auto pr-1 pb-6 [scrollbar-width:thin]">
            {/* Action Button: always pinned on desktop */}
            <div className="sticky top-0 z-10 hidden lg:flex items-center justify-end gap-2 py-2 bg-slate-50/90 dark:bg-[#0b1120]/90 backdrop-blur-md -mt-2">
              <Button
                type="button"
                onClick={() => handleSave()}
                isLoading={processing}
                className="shadow-xs"
              >
                <Save size={15} className="mr-1.5" /> Save
              </Button>
            </div>
            
            {/* 1. Publishing & Status */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                Publishing Status
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Status
                  </label>
                  <select
                    value={data.status}
                    onChange={(e) => setData('status', e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-900 dark:text-white"
                  >
                    <option value="published">Public (Live Immediately)</option>
                    <option value="draft">Draft (Unpublished)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 2. Breaking News Alert Toggle */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
                  </span>
                  <div>
                    <span className="text-xs font-bold text-red-700 dark:text-red-400 block uppercase tracking-wider">
                      Breaking News Alert
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Streams on the red wire banner
                    </span>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.is_breaking}
                    onChange={(e) => setData('is_breaking', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                </label>
              </div>
            </div>

            {/* 3. Featured Cover Photo */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span>Featured Cover Image</span>
                <ImageIcon size={16} className="text-slate-400" />
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={data.cover_image_url}
                    onChange={(e) => {
                      setData('cover_image_url', e.target.value);
                      setImagePreview(e.target.value);
                    }}
                    placeholder="https://images.unsplash.com/... or /storage/..."
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-900 dark:text-white placeholder:text-slate-400"
                  />
                </div>

                {imagePreview && (
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                    <img
                      src={imagePreview}
                      alt="Cover preview"
                      className="w-full h-36 object-cover"
                      onError={() => setImagePreview('')}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview('');
                        setData('cover_image_url', '');
                      }}
                      className="absolute top-2 right-2 p-1 rounded-md bg-black/60 text-white hover:bg-black text-xs"
                    >
                      Remove
                    </button>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Image Caption / Alt Description
                  </label>
                  <input
                    type="text"
                    value={data.cover_image_alt}
                    onChange={(e) => setData('cover_image_alt', e.target.value)}
                    placeholder="e.g. Data center server rack processing neural workloads"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-900 dark:text-white placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>

            {/* 4. Video Attachment (Optional) */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-2 pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span>Attached Video (Optional)</span>
                <Video size={16} className="text-red-500" />
              </h3>
              <p className="text-[11px] text-slate-500 mb-3">
                YouTube or Facebook video broadcast URL. When provided, an interactive video player is displayed.
              </p>
              <Input
                type="url"
                value={data.video_url}
                onChange={(e) => setData('video_url', e.target.value)}
                placeholder="https://www.youtube.com/watch?v=... or https://fb.watch/..."
              />
              {errors.video_url && <p className="text-xs text-red-500 mt-1">{errors.video_url}</p>}
              {data.video_url && (
                <div className="mt-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Live Player Preview</p>
                  <VideoEmbed url={data.video_url} title="Video Preview" />
                </div>
              )}
            </div>

            {/* 5. Wire Source & Citation Link */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                Wire Source & Citation
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Bureau / Source Attribution
                  </label>
                  <input
                    type="text"
                    value={data.source}
                    onChange={(e) => setData('source', e.target.value)}
                    placeholder="e.g. Reuters Tech Wire, Bloomberg, AP"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-900 dark:text-white placeholder:text-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Original Source URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={data.source_url}
                    onChange={(e) => setData('source_url', e.target.value)}
                    placeholder="https://reuters.com/..."
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-900 dark:text-white placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      </form>
    </AdminLayout>
  );
}
