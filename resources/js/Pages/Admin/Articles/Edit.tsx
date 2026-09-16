import React, { useState, useMemo } from 'react';
import { Head, useForm, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/Button';
import { Input } from '@/Components/ui/Input';
import TiptapEditor, { uploadAllBase64ImagesInHtml } from '@/Components/Editor/TiptapEditor';
import CategorySelect from '@/Components/ui/CategorySelect';
import VideoEmbed from '@/Components/VideoEmbed';
import { ArrowLeft, ExternalLink, Trash2, Calendar, Clock, CheckCircle2, UserCheck, Video, Save, Globe, Image as ImageIcon, Plus, FileText, AlertCircle } from 'lucide-react';
import axios from 'axios';

// UTF-8 safe Base64 encoder to avoid LiteSpeed/Hostinger WAF false positives on rich text
const encodeSafeBase64 = (str: string): string => {
  if (!str) return '';
  try {
    return window.btoa(
      encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => {
        return String.fromCharCode(parseInt(p1, 16));
      })
    );
  } catch (e) {
    try {
      return window.btoa(unescape(encodeURIComponent(str)));
    } catch {
      return '';
    }
  }
};

function formatForDateTimeLocal(dateStr?: string | null): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return '';
  }
}

export default function Edit({ auth, article, categories = [], authors = [], playlists = [] }: any) {
  const [imagePreview, setImagePreview] = useState(article?.cover_image_url || '');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isOptimizingMedia, setIsOptimizingMedia] = useState(false);
  const [playlistList, setPlaylistList] = useState<any[]>(playlists);
  const [newPlaylistTitle, setNewPlaylistTitle] = useState('');
  const [showNewPlaylistInput, setShowNewPlaylistInput] = useState(false);
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);
  const [actionType, setActionType] = useState<'draft' | 'published' | 'scheduled'>(article?.status || 'draft');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [breakingMode, setBreakingMode] = useState<'forever' | 'until_date'>(
    article?.breaking_until ? 'until_date' : 'forever'
  );

  const handleDeleteArticle = () => {
    setIsDeleting(true);
    router.delete(`/ourcms/articles/${article.id}`, {
      onFinish: () => setIsDeleting(false),
    });
  };

  // Format initial scheduled_at for datetime-local input (YYYY-MM-DDTHH:MM)
  const initialScheduledAt = useMemo(() => {
    if (!article?.scheduled_at) return '';
    try {
      const d = new Date(article.scheduled_at);
      return !isNaN(d.getTime()) ? new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '';
    } catch {
      return '';
    }
  }, [article?.scheduled_at]);

  const initialEditorContent = useMemo(() => {
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

  const { data, setData, put, processing, errors, transform } = useForm({
    title: article?.title || '',
    slug: article?.slug || '',
    category_id: article?.category_id || '',
    user_id: article?.user_id ? String(article.user_id) : '',
    status: article?.status || 'draft',
    scheduled_at: initialScheduledAt,
    is_breaking: Boolean(article?.is_breaking),
    breaking_until: article?.breaking_until ? formatForDateTimeLocal(article.breaking_until) : '',
    cover_image_url: article?.cover_image_url || '',
    cover_image_alt: article?.cover_image_alt || '',
    content: article?.content || '',
    content_raw: article?.content_raw || '',
    excerpt: article?.excerpt || '',
    video_url: article?.video_url || '',
    meta_title: article?.meta_title || '',
    meta_description: article?.meta_description || '',
    playlist_id: article?.playlist_id ? String(article.playlist_id) : '',
    playlist_order: article?.playlist_order ?? 0,
  });

  const handleCreatePlaylist = async () => {
    if (!newPlaylistTitle.trim()) return;
    setIsCreatingPlaylist(true);
    try {
      const res = await axios.post('/ourcms/playlists', { title: newPlaylistTitle.trim() });
      if (res.data?.playlist) {
        setPlaylistList((prev) => [...prev, res.data.playlist]);
        setData('playlist_id', String(res.data.playlist.id));
        setNewPlaylistTitle('');
        setShowNewPlaylistInput(false);
      }
    } catch (e) {
      console.error('Failed to create playlist', e);
    } finally {
      setIsCreatingPlaylist(false);
    }
  };

  const submit = async (e?: React.FormEvent, targetStatus?: 'draft' | 'published' | 'scheduled') => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    if (!article?.id) return;

    const finalStatus = targetStatus || data.status;
    setActionType(finalStatus);
    setErrorMessage(null);

    let contentToSubmit = data.content || '';
    let contentRawToSubmit = data.content_raw || '';

    if (contentToSubmit && contentToSubmit.includes('data:image/')) {
      setIsOptimizingMedia(true);
      try {
        const result = await uploadAllBase64ImagesInHtml(contentToSubmit, contentRawToSubmit);
        contentToSubmit = result.html;
        contentRawToSubmit = result.rawJson || '';
        setData((prev: any) => ({
          ...prev,
          content: result.html,
          content_raw: result.rawJson || '',
        }));
      } catch (err) {
        console.error('Image pre-save optimization error:', err);
      } finally {
        setIsOptimizingMedia(false);
      }
    }

    const contentB64 = encodeSafeBase64(contentToSubmit);
    const contentRawB64 = encodeSafeBase64(contentRawToSubmit);

    transform((d: any) => ({
      ...d,
      content: '', // Empty in network payload to prevent WAF keyword scanning
      content_b64: contentB64,
      content_raw: '',
      content_raw_b64: contentRawB64,
      category_id: d.category_id && d.category_id !== '0' ? d.category_id : null,
      playlist_id: d.playlist_id && d.playlist_id !== '0' ? d.playlist_id : null,
      scheduled_at: d.scheduled_at ? d.scheduled_at : null,
      video_url: d.video_url ? d.video_url : null,
      breaking_until: d.is_breaking && d.breaking_until ? d.breaking_until : null,
      status: finalStatus,
    }));

    put(`/ourcms/articles/${article.id}`, {
      onError: (errs) => {
        const firstErr = Object.values(errs)[0];
        setErrorMessage(typeof firstErr === 'string' ? firstErr : 'Validation failed. Please review required fields.');
      },
      onFinish: () => setIsOptimizingMedia(false),
    });
  };

  return (
    <AdminLayout auth={auth}>
      <Head title={`Edit: ${article.title} - Rafvex`} />
      
      <form onSubmit={(e) => submit(e)}>
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
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            >
              <ExternalLink size={14} /> Preview
            </a>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => submit(undefined, 'draft')}
              isLoading={(processing && actionType === 'draft') || isOptimizingMedia}
              disabled={processing || isOptimizingMedia}
            >
              <FileText size={14} className="mr-1.5" />
              Save Draft
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => submit(undefined, data.status === 'scheduled' ? 'scheduled' : (data.status === 'draft' ? 'published' : data.status))}
              isLoading={(processing && actionType !== 'draft') || isOptimizingMedia}
              disabled={processing || isOptimizingMedia}
            >
              <Save size={14} className="mr-1.5" />
              {data.status === 'draft' ? 'Publish' : 'Update'}
            </Button>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-sm flex items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0 text-red-500" />
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-red-500 hover:text-red-700 dark:hover:text-red-300 text-xs font-bold uppercase tracking-wider"
            >
              Dismiss
            </button>
          </div>
        )}

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
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 shadow-xs transition-colors h-10"
              >
                <ExternalLink size={15} /> Preview
              </a>
              <Button
                type="button"
                variant="secondary"
                onClick={() => submit(undefined, 'draft')}
                isLoading={(processing && actionType === 'draft') || isOptimizingMedia}
                disabled={processing || isOptimizingMedia}
                className="shadow-xs text-xs font-semibold px-4 h-10 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <FileText size={15} className="mr-1.5 text-slate-500 dark:text-slate-400" />
                {(processing && actionType === 'draft') ? 'Saving Draft...' : 'Save as Draft'}
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={() => submit(undefined, data.status === 'scheduled' ? 'scheduled' : (data.status === 'draft' ? 'published' : data.status))}
                isLoading={(processing && actionType !== 'draft') || isOptimizingMedia}
                disabled={processing || isOptimizingMedia}
                className="shadow-xs text-xs font-semibold px-5 h-10 bg-red-600 hover:bg-red-700 text-white"
              >
                {data.status === 'scheduled' ? (
                  <>
                    <Clock size={15} className="mr-1.5" />
                    {(processing && actionType === 'scheduled') ? 'Scheduling...' : 'Schedule Post'}
                  </>
                ) : data.status === 'draft' ? (
                  <>
                    <Globe size={15} className="mr-1.5" />
                    {(processing && actionType === 'published') ? 'Publishing...' : 'Publish Article'}
                  </>
                ) : (
                  <>
                    <Save size={15} className="mr-1.5" />
                    {processing ? 'Saving...' : 'Save Changes'}
                  </>
                )}
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

                {/* Breaking Blog/Article Alert Toggle & Duration */}
                <div className={`p-4 rounded-xl border transition-all ${
                  data.is_breaking 
                    ? 'bg-red-50/40 dark:bg-red-950/20 border-red-200 dark:border-red-900/60 shadow-xs' 
                    : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-2.5 w-2.5 relative">
                        {data.is_breaking && (
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                        )}
                        <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${data.is_breaking ? 'bg-red-600' : 'bg-slate-300 dark:bg-slate-600'}`}></span>
                      </span>
                      <div>
                        <span className="text-xs font-bold text-red-700 dark:text-red-400 block uppercase tracking-wider">
                          Breaking Alert
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                          Slides in homepage breaking ticker
                        </span>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={data.is_breaking}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setData((prev: any) => ({
                            ...prev,
                            is_breaking: checked,
                            breaking_until: checked ? prev.breaking_until : '',
                          }));
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-600"></div>
                    </label>
                  </div>

                  {data.is_breaking && (
                    <div className="mt-3 pt-3 border-t border-red-100 dark:border-red-900/40 space-y-2.5 animate-in fade-in duration-200">
                      <div className="grid grid-cols-2 gap-1.5 text-xs">
                        <button
                          type="button"
                          onClick={() => {
                            setBreakingMode('forever');
                            setData('breaking_until', '');
                          }}
                          className={`px-2.5 py-1.5 rounded-lg border text-left font-medium cursor-pointer transition-all ${
                            breakingMode === 'forever' || !data.breaking_until
                              ? 'border-red-500 bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 font-bold shadow-2xs'
                              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          ● Always
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setBreakingMode('until_date');
                            if (!data.breaking_until) {
                              const d = new Date(Date.now() + 24 * 60 * 60 * 1000);
                              const pad = (n: number) => String(n).padStart(2, '0');
                              setData('breaking_until', `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`);
                            }
                          }}
                          className={`px-2.5 py-1.5 rounded-lg border text-left font-medium cursor-pointer transition-all ${
                            breakingMode === 'until_date' && Boolean(data.breaking_until)
                              ? 'border-red-500 bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 font-bold shadow-2xs'
                              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          📅 Until Date
                        </button>
                      </div>

                      {(breakingMode === 'until_date' || Boolean(data.breaking_until)) && (
                        <div className="space-y-1.5 pt-1">
                          <input
                            type="datetime-local"
                            value={data.breaking_until}
                            onChange={(e) => {
                              setData('breaking_until', e.target.value);
                              if (e.target.value) setBreakingMode('until_date');
                            }}
                            className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                          />
                          <div className="flex flex-wrap gap-1">
                            {[
                              { label: '+6h', hours: 6 },
                              { label: '+24h', hours: 24 },
                              { label: '+3d', hours: 72 },
                              { label: '+7d', hours: 168 },
                            ].map((preset) => (
                              <button
                                key={preset.label}
                                type="button"
                                onClick={() => {
                                  const d = new Date(Date.now() + preset.hours * 60 * 60 * 1000);
                                  const pad = (n: number) => String(n).padStart(2, '0');
                                  setBreakingMode('until_date');
                                  setData('breaking_until', `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`);
                                }}
                                className="px-2 py-0.5 rounded text-[10px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-red-600 cursor-pointer"
                              >
                                {preset.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

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

                {/* Playlist / Series Selector */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Playlist / Series
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowNewPlaylistInput(!showNewPlaylistInput)}
                      className="text-[11px] font-bold text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 flex items-center gap-0.5 cursor-pointer"
                    >
                      <Plus size={12} /> {showNewPlaylistInput ? 'Cancel' : 'New Playlist'}
                    </button>
                  </div>

                  {showNewPlaylistInput && (
                    <div className="mb-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-red-200 dark:border-red-900/40 space-y-2">
                      <input
                        type="text"
                        placeholder="Playlist title (e.g. AI Masterclass)..."
                        value={newPlaylistTitle}
                        onChange={(e) => setNewPlaylistTitle(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleCreatePlaylist();
                          }
                        }}
                      />
                      <Button
                        type="button"
                        size="sm"
                        isLoading={isCreatingPlaylist}
                        disabled={!newPlaylistTitle.trim() || isCreatingPlaylist}
                        onClick={handleCreatePlaylist}
                        className="w-full text-xs py-1"
                      >
                        Create & Select
                      </Button>
                    </div>
                  )}

                  <select
                    value={data.playlist_id}
                    onChange={(e) => setData('playlist_id', e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-900 dark:text-white"
                  >
                    <option value="">None (Standalone Article)</option>
                    {playlistList.map((pl: any) => (
                      <option key={pl.id} value={pl.id}>
                        📚 {pl.title}
                      </option>
                    ))}
                  </select>

                  {Boolean(data.playlist_id) && (
                    <div className="mt-2 flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 text-xs">
                      <span className="font-semibold text-slate-600 dark:text-slate-400">Chapter / Order:</span>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min="0"
                          value={data.playlist_order}
                          onChange={(e) => setData('playlist_order', Number(e.target.value))}
                          className="w-16 rounded border border-slate-300 dark:border-slate-600 px-2 py-1 text-xs text-center bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                        />
                        <span className="text-[10px] text-slate-400">#</span>
                      </div>
                    </div>
                  )}
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
