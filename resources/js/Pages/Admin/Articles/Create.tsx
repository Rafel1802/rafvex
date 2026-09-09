import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/Button';
import { Input } from '@/Components/ui/Input';
import TiptapEditor from '@/Components/Editor/TiptapEditor';
import CategorySelect from '@/Components/ui/CategorySelect';
import VideoEmbed from '@/Components/VideoEmbed';
import { ArrowLeft, Image as ImageIcon, Globe, Calendar, Clock, CheckCircle2, UserCheck, Video, Save } from 'lucide-react';

export default function Create({ auth, categories = [], authors = [] }: any) {
  const [imagePreview, setImagePreview] = useState('');

  const { data, setData, post, processing, errors, transform } = useForm({
    title: '',
    slug: '',
    category_id: '',
    user_id: auth?.user?.id ? String(auth.user.id) : (authors[0]?.id ? String(authors[0].id) : ''),
    status: 'draft',
    scheduled_at: '',
    cover_image_url: '',
    cover_image_alt: '',
    content: '',
    content_raw: '',
    excerpt: '',
    video_url: '',
    meta_title: '',
    meta_description: '',
  });

  const handleTitleChange = (val: string) => {
    setData((prev) => {
      const autoSlug = val
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      // If user hasn't typed a custom slug, auto-update slug
      if (!prev.slug || prev.slug === autoSlug.slice(0, prev.slug.length)) {
        return { ...prev, title: val, slug: autoSlug };
      }
      return { ...prev, title: val };
    });
  };

  const handleSave = (targetStatus?: 'draft' | 'published' | 'scheduled') => {
    const finalStatus = targetStatus || data.status;
    transform((d) => ({
      ...d,
      status: finalStatus,
    }));
    post('/ourcms/articles');
  };

  return (
    <AdminLayout auth={auth}>
      <Head title="New Article - Rafvex" />
      
      <div>
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/ourcms/articles"
              className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
              title="Back to Articles"
            >
              <ArrowLeft size={16} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-display">New Article</h1>
              <p className="text-xs text-slate-500 mt-0.5">Write and publish an editorial post</p>
            </div>
          </div>

          <div className="flex lg:hidden items-center gap-2">
            <Button
              type="button"
              onClick={() => handleSave()}
              isLoading={processing}
            >
              <Save size={15} className="mr-1.5" /> Save
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Main Editorial Content (Left 2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title Input */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Article Title
              </label>
              <Input
                type="text"
                value={data.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                error={errors.title}
                placeholder="Write an engaging headline..."
                className="text-xl sm:text-2xl font-bold border-0 border-b-2 rounded-none border-slate-200 focus:ring-0 focus:border-red-500 bg-transparent px-0 shadow-none dark:border-slate-800 dark:focus:border-red-500"
              />

              {/* URL Slug Preview */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <Globe size={14} className="text-slate-400 shrink-0" />
                <span className="text-xs text-slate-400 select-none font-mono">rafvex.com/article/</span>
                <input
                  type="text"
                  value={data.slug}
                  onChange={(e) => setData('slug', e.target.value)}
                  placeholder="custom-article-slug"
                  className="flex-1 text-xs font-mono py-1 px-2 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>
              {errors.slug && <p className="text-xs text-red-500 mt-1">{errors.slug}</p>}
            </div>

            {/* Editor */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                Article Body
              </label>
              <TiptapEditor 
                content={data.content}
                onChangeRaw={(json) => setData('content_raw', json)}
                onChangeHtml={(html) => setData('content', html)}
              />
              {errors.content && <p className="mt-1 text-sm text-red-500">{errors.content}</p>}
            </div>
          </div>

          {/* Settings Sidebar (Right 1 col) - Sticky on desktop */}
          <div className="space-y-6 lg:sticky lg:top-[80px] lg:self-start lg:max-h-[calc(100vh-95px)] lg:overflow-y-auto pr-1 pb-6 [scrollbar-width:thin]">
            {/* Action Button: always pinned at the top of the right column on desktop */}
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

            {/* Publishing Status & Schedule */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span>Publishing Status</span>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize
                  ${data.status === 'published' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : ''}
                  ${data.status === 'scheduled' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400' : ''}
                  ${data.status === 'draft' ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' : ''}
                `}>
                  {data.status === 'published' ? 'Public' : data.status}
                </span>
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
                    <option value="draft">Draft</option>
                    <option value="published">Public (Published)</option>
                    <option value="scheduled">Scheduled</option>
                  </select>
                </div>

                {data.status === 'scheduled' && (
                  <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 space-y-2 animate-in fade-in duration-200">
                    <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 text-xs font-bold">
                      <Clock size={14} /> Schedule Date & Time to Post
                    </div>
                    <input
                      type="datetime-local"
                      value={data.scheduled_at}
                      onChange={(e) => setData('scheduled_at', e.target.value)}
                      className="w-full rounded-lg border border-amber-300 dark:border-amber-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white"
                    />
                    <p className="text-[11px] text-amber-700 dark:text-amber-400">
                      The article will automatically become public at this scheduled time.
                    </p>
                    {errors.scheduled_at && <p className="text-xs text-red-500">{errors.scheduled_at}</p>}
                  </div>
                )}
              </div>
            </div>

            {/* Author Selector */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <UserCheck size={16} className="text-red-600" />
                  <span>Article Author</span>
                </h3>
                <Link
                  href="/ourcms/authors/create"
                  className="text-[11px] font-bold text-red-600 hover:text-red-700 hover:underline"
                >
                  + New Author
                </Link>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Assign Author
                </label>
                <select
                  value={data.user_id}
                  onChange={(e) => setData('user_id', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-900 dark:text-white"
                >
                  {authors.map((a: any) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.job_title || 'Author'})
                    </option>
                  ))}
                </select>

                {(() => {
                  const currentAuthor = authors.find((a: any) => String(a.id) === String(data.user_id));
                  if (!currentAuthor) return null;
                  return (
                    <div className="flex items-center gap-2.5 mt-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
                      {currentAuthor.avatar ? (
                        <img
                          src={currentAuthor.avatar}
                          alt={currentAuthor.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                          {currentAuthor.name?.charAt(0) || 'A'}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {currentAuthor.name}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {currentAuthor.job_title || 'Author'}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Category & Excerpt */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                Classification & Category
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <CategorySelect
                    categories={categories}
                    value={data.category_id}
                    onChange={(val) => setData('category_id', String(val))}
                    error={errors.category_id}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Short Excerpt
                  </label>
                  <textarea
                    value={data.excerpt}
                    onChange={(e) => setData('excerpt', e.target.value)}
                    rows={3}
                    placeholder="Brief summary shown on homepage cards and article header..."
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-900 dark:text-white resize-y placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>

            {/* Featured Image */}
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
                    Image Alt Description
                  </label>
                  <input
                    type="text"
                    value={data.cover_image_alt}
                    onChange={(e) => setData('cover_image_alt', e.target.value)}
                    placeholder="e.g. Modern laptop on desk"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-900 dark:text-white placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>

            {/* Video Attachment */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-2 pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span>Attached Video (Optional)</span>
                <Video size={16} className="text-red-500" />
              </h3>
              <p className="text-[11px] text-slate-500 mb-3">
                YouTube or Facebook video URL. When provided, an interactive video player is displayed at the top of the blog article.
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

            {/* SEO Metadata */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                SEO & Social Meta
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Meta Title
                  </label>
                  <Input
                    type="text"
                    value={data.meta_title}
                    onChange={(e) => setData('meta_title', e.target.value)}
                    placeholder={data.title || 'Page meta title...'}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Meta Description
                  </label>
                  <textarea
                    value={data.meta_description}
                    onChange={(e) => setData('meta_description', e.target.value)}
                    rows={3}
                    placeholder="Search engine snippet (recommended 150-160 characters)..."
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-900 dark:text-white resize-y placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
