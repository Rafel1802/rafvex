import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/Button';
import { Plus, Edit, Trash2, ExternalLink, Radio, Video, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function Index({ auth, news, filters }: any) {
  const [newsToDelete, setNewsToDelete] = React.useState<any>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const toggleBreaking = (id: number) => {
    router.post(`/ourcms/news/${id}/toggle-breaking`, {}, { preserveScroll: true });
  };

  const confirmDelete = () => {
    if (!newsToDelete) return;
    setIsDeleting(true);
    router.delete(`/ourcms/news/${newsToDelete.id}`, {
      preserveScroll: true,
      onFinish: () => {
        setIsDeleting(false);
        setNewsToDelete(null);
      },
    });
  };

  return (
    <AdminLayout auth={auth}>
      <Head title="Newsroom - Rafvex CMS" />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Radio size={18} className="text-red-600 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-red-600">Wire Service &bull; Dispatches</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-display">Newsroom</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Post and manage breaking news, fast-reading tech developments, and video broadcasts.
          </p>
        </div>
        <Link href="/ourcms/news/create">
          <Button className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-xs">
            <Plus size={16} /> Post News Dispatch
          </Button>
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4">Story &amp; Slug</th>
                <th className="px-6 py-4">Breaking</th>
                <th className="px-6 py-4">Media</th>
                <th className="px-6 py-4">Source</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Published</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {news.data.map((item: any) => (
                <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  {/* Image + Title + Slug */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3.5">
                      {item.cover_image_url ? (
                        <img
                          src={item.cover_image_url}
                          alt={item.title}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                          onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
                          <Radio size={18} />
                        </div>
                      )}

                      <div className="min-w-0">
                        <Link
                          href={`/ourcms/news/${item.id}/edit`}
                          className="font-bold text-slate-900 dark:text-white hover:text-red-600 dark:hover:text-red-400 line-clamp-1 text-sm transition-colors"
                        >
                          {item.title}
                        </Link>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-xs font-mono text-slate-400 line-clamp-1">
                            /news/{item.slug}
                          </span>
                          <a
                            href={`/news/${item.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-400 hover:text-red-600 transition-colors"
                            title="Preview on site"
                          >
                            <ExternalLink size={12} />
                          </a>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Breaking Toggle */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => toggleBreaking(item.id)}
                      className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        item.is_breaking
                          ? 'bg-red-600 text-white shadow-xs animate-pulse'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      {item.is_breaking ? '● BREAKING' : 'Standard'}
                    </button>
                  </td>

                  {/* Media (Video / Image) */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.video_url ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 text-xs font-bold">
                        <Video size={12} />
                        <span>Video</span>
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">Photo only</span>
                    )}
                  </td>

                  {/* Source */}
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-600 dark:text-slate-300 font-medium">
                    {item.source || 'Wire Service'}
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                        item.status === 'published'
                          ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50'
                          : 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200/50'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>

                  {/* Published Date */}
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
                    {item.published_at ? format(new Date(item.published_at), 'MMM d, yyyy') : 'Draft'}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/ourcms/news/${item.id}/edit`}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Edit news dispatch"
                      >
                        <Edit size={16} />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setNewsToDelete(item)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                        title="Delete dispatch"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {news.data.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    No news dispatches found. Click &quot;Post News Dispatch&quot; to publish your first story.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {news.links && news.links.length > 3 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-1.5">
            {news.links.map((link: any, idx: number) => (
              <Link
                key={idx}
                href={link.url || '#'}
                preserveScroll
                dangerouslySetInnerHTML={{ __html: link.label }}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors ${
                  link.active
                    ? 'bg-red-600 text-white border-red-600'
                    : link.url
                    ? 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                    : 'bg-slate-50 dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-slate-800 cursor-not-allowed'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {newsToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40">
                <Trash2 size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete News Dispatch</h3>
                <p className="text-xs text-slate-400">This story will be removed from the newsroom.</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300">
              Are you sure you want to delete <strong className="text-slate-900 dark:text-white">&quot;{newsToDelete.title}&quot;</strong>?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setNewsToDelete(null)}
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
