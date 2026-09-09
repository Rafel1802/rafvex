import React, { useState } from 'react';
import { Head, useForm, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/Button';
import { Input } from '@/Components/ui/Input';
import TiptapEditor from '@/Components/Editor/TiptapEditor';
import CategorySelect from '@/Components/ui/CategorySelect';
import VideoEmbed from '@/Components/VideoEmbed';
import { Trash2, ExternalLink, Clock, Calendar, ArrowLeft, Image as ImageIcon, Globe, Check, UserCheck, Video, Save } from 'lucide-react';

export default function Edit({ auth, article, categories = [], authors = [] }: any) {
  const [imagePreview, setImagePreview] = useState(article?.cover_image_url || '');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteArticle = () => {
    setIsDeleting(true);
    router.delete(`/ourcms/articles/${article.id}`, {
      onFinish: () => setIsDeleting(false),
    });
  };

  const initialScheduledAt = React.useMemo(() => {
    if (!article?.scheduled_at) return '';
    try {
      const d = new Date(article.scheduled_at);
      return !isNaN(d.getTime()) ? d.toISOString().slice(0, 16) : '';
    } catch {
      return '';
    }
  }, [article?.scheduled_at]);

  const initialEditorContent = React.useMemo(() => {
    if (article?.content_raw && typeof article.content_raw === 'string' && article.content_raw.trim().startsWith('{')) {
      try {
        const parsed = JSON.parse(article.content_raw);
        if (parsed && typeof parsed === 'object') {
          return parsed;
        }
      } catch {
        // Fall back to HTML
      }
    }
    return article?.content || article?.content_raw || '';
  }, [article?.content, article?.content_raw]);

  const { data, setData, put, processing, errors } = useForm({
    title: article?.title || '',
    slug: article?.slug || '',
    category_id: article?.category_id || '',
    user_id: article?.user_id ? String(article.user_id) : '',
    status: article?.status || 'draft',
    scheduled_at: initialScheduledAt,
    cover_image_url: article?.cover_image_url || '',
    cover_image_alt: article?.cover_image_alt || '',
    content: article?.content || '',
    content_raw: article?.content_raw || '',
    excerpt: article?.excerpt || '',
    video_url: article?.video_url || '',
    meta_title: article?.meta_title || '',
    meta_description: article?.meta_description || '',
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (article?.id) {
      put(`/ourcms/articles/${article.id}`);
    }
  };

  return (
    <AdminLayout auth={auth}>
      <Head title={`Edit: ${article.title} - Rafvex`} />
      
      <form onSubmit={submit}>
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
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-display">Edit Article</h1>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize
                  ${data.status === 'published' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' : ''}
                  ${data.status === 'scheduled' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800' : ''}
                  ${data.status === 'draft' ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700' : ''}
                `}>
                  {data.status === 'published' ? 'Public' : data.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">ID #{article.id} • Created {new Date(article.created_at).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="flex lg:hidden items-center gap-2">
            <a
              href={`/article/${article.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            >
              <ExternalLink size={15} /> Preview
            </a>
            <Button type="submit" isLoading={processing}>
              <Save size={15} className="mr-1.5" /> Save Changes
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Main Editorial Content (Left 2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Article Title
              </label>
              <Input
                type="text"
                value={data.title}
                onChange={(e) => setData('title', e.target.value)}
                error={errors.title}
                placeholder="Article Title"
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
                  className="flex-1 text-xs font-mono py-1 px-2 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>
              {errors.slug && <p className="text-xs text-red-500 mt-1">{errors.slug}</p>}
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                Article Body
              </label>
              <TiptapEditor 
                content={initialEditorContent}
                onChangeRaw={(json) => setData('content_raw', json)}
                onChangeHtml={(html) => setData('content', html)}
              />
              {errors.content && <p className="mt-1 text-sm text-red-500">{errors.content}</p>}
            </div>
          </div>

          {/* Settings Sidebar (Right 1 col) - Sticky on desktop */}
          <div className="space-y-6 lg:sticky lg:top-[80px] lg:self-start lg:max-h-[calc(100vh-95px)] lg:overflow-y-auto pr-1 pb-6 [scrollbar-width:thin]">
            {/* Action Buttons: always pinned at the top of the right column on desktop */}
            <div className="sticky top-0 z-10 hidden lg:flex items-center justify-end gap-2 py-2 bg-slate-50/90 dark:bg-[#0b1120]/90 backdrop-blur-md -mt-2">
              <a
                href={`/article/${article.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 shadow-xs transition-colors"
              >
                <ExternalLink size={15} /> Preview
              </a>
              <Button type="submit" isLoading={processing} className="shadow-xs">
                <Save size={15} className="mr-1.5" /> Save Changes
              </Button>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                Publishing
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

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Author
                    </label>
                    <Link
                      href="/ourcms/authors/create"
                      className="text-[11px] font-bold text-red-600 hover:text-red-700 hover:underline"
                    >
                      + New Author
                    </Link>
                  </div>
                  <select
                    value={data.user_id}
                    onChange={(e) => setData('user_id', e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-900 dark:text-white mb-2"
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
                      <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 mb-3">
                        {currentAuthor.avatar ? (
                          <img
                            src={currentAuthor.avatar}
                            alt={currentAuthor.name}
                            className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-red-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                            {currentAuthor.name?.charAt(0) || 'A'}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {currentAuthor.name}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Category
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
                    Excerpt
                  </label>
                  <textarea
                    value={data.excerpt}
                    onChange={(e) => setData('excerpt', e.target.value)}
                    rows={3}
                    placeholder="Short summary..."
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-900 dark:text-white resize-y placeholder:text-slate-400"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 flex items-center gap-2">
                  <Clock size={13} /> Revisions count: {article.revision_count || 0}
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

            {/* Danger Zone */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-900/40 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Trash2 size={14} /> Move to Trash
              </button>
            </div>

          </div>
        </div>
      </form>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40">
                <Trash2 size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Move Article to Trash</h3>
                <p className="text-xs text-slate-400">This action moves the article to trash.</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300">
              Are you sure you want to move <strong className="text-slate-900 dark:text-white">&quot;{article.title}&quot;</strong> to trash?
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
                onClick={handleDeleteArticle}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-700 active:scale-95 text-white transition-all shadow-xs flex items-center gap-1.5"
              >
                {isDeleting ? 'Moving to Trash...' : 'Confirm Move to Trash'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
