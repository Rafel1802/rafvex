import React from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { format, formatDistanceToNow } from 'date-fns';
import { MessageSquare, Trash2, CheckCircle, ShieldAlert, Reply, User, ExternalLink } from 'lucide-react';

export default function Index({ auth, comments, filters }: any) {
  const { post, data, setData, processing, reset } = useForm({
    content: ''
  });
  const [replyingTo, setReplyingTo] = React.useState<number | null>(null);
  const [commentToDelete, setCommentToDelete] = React.useState<any>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const updateStatus = (id: number, status: string) => {
    router.put(`/ourcms/comments/${id}`, { status }, {
      preserveScroll: true,
    });
  };

  const confirmDelete = () => {
    if (!commentToDelete) return;
    setIsDeleting(true);
    router.delete(`/ourcms/comments/${commentToDelete.id}`, {
      preserveScroll: true,
      onFinish: () => {
        setIsDeleting(false);
        setCommentToDelete(null);
      },
    });
  };

  const submitReply = (e: React.FormEvent, commentId: number) => {
    e.preventDefault();
    post(`/ourcms/comments/${commentId}/reply`, {
      preserveScroll: true,
      onSuccess: () => {
        reset();
        setReplyingTo(null);
      }
    });
  };

  return (
    <AdminLayout auth={auth}>
      <Head title="Manage Comments — CMS" />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <MessageSquare className="text-indigo-600 dark:text-indigo-400" size={24} />
            Comments Moderation
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Review reader comments, approve submissions, and reply directly.</p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          {['all', 'pending', 'approved', 'spam'].map(status => {
            const active = (filters.status === status) || (!filters.status && status === 'all');
            return (
              <Link
                key={status}
                href={`/ourcms/comments?status=${status}`}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  active
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {status}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Comments List Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        {comments.data.length === 0 ? (
          <div className="p-16 text-center text-slate-400 dark:text-slate-500">
            <MessageSquare size={36} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
            <p className="font-semibold text-slate-600 dark:text-slate-300">No comments found</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Reader responses to your articles will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {comments.data.map((comment: any) => (
              <div key={comment.id} className="p-6 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Comment Header */}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs shrink-0">
                        {comment.author_name ? comment.author_name.slice(0, 2).toUpperCase() : 'U'}
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white text-sm">{comment.author_name}</span>
                      <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">{comment.author_email}</span>
                      
                      {comment.status === 'pending' && (
                        <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 px-2 py-0.5 rounded-md uppercase">
                          Pending
                        </span>
                      )}
                      {comment.status === 'spam' && (
                        <span className="text-[11px] font-bold text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 px-2 py-0.5 rounded-md uppercase">
                          Spam
                        </span>
                      )}
                      {comment.status === 'approved' && (
                        <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 rounded-md uppercase">
                          Approved
                        </span>
                      )}

                      <span className="text-xs text-slate-400 dark:text-slate-500 ml-auto">
                        {(() => {
                          try {
                            const d = new Date(comment.created_at);
                            return isNaN(d.getTime()) ? '' : `${formatDistanceToNow(d)} ago`;
                          } catch (e) {
                            return '';
                          }
                        })()}
                      </span>
                    </div>

                    {/* Article Context */}
                    {comment.article && (
                      <div className="mb-3 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <span>On story:</span>
                        <a
                          href={`/article/${comment.article.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 hover:underline flex items-center gap-1"
                        >
                          {comment.article.title}
                          <ExternalLink size={11} />
                        </a>
                      </div>
                    )}

                    {/* Content */}
                    <p className="text-slate-700 dark:text-slate-200 text-sm leading-relaxed whitespace-pre-wrap bg-slate-50/80 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-100 dark:border-slate-700/60">
                      {comment.content}
                    </p>

                    {/* Reply Form */}
                    {replyingTo === comment.id && (
                      <form onSubmit={(e) => submitReply(e, comment.id)} className="mt-4 p-4 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
                        <p className="text-xs font-bold text-indigo-900 dark:text-indigo-300 mb-2">Reply as Administrator:</p>
                        <textarea
                          value={data.content}
                          onChange={e => setData('content', e.target.value)}
                          placeholder="Type your official reply..."
                          className="w-full bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800/80 rounded-lg p-3 text-slate-900 dark:text-white text-sm focus:border-indigo-600 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950/50 outline-none"
                          rows={3}
                          required
                          autoFocus
                        />
                        <div className="flex justify-end gap-2 mt-3">
                          <button
                            type="button"
                            onClick={() => setReplyingTo(null)}
                            className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={processing}
                            className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm disabled:opacity-50"
                          >
                            {processing ? 'Posting...' : 'Send Reply'}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>

                  {/* Actions Column */}
                  <div className="flex sm:flex-col items-center gap-1.5 shrink-0 self-end sm:self-start">
                    {comment.status !== 'approved' && (
                      <button
                        onClick={() => updateStatus(comment.id, 'approved')}
                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-400 rounded-lg transition-colors"
                        title="Approve Comment"
                      >
                        <CheckCircle size={18} />
                      </button>
                    )}
                    {comment.status !== 'spam' && (
                      <button
                        onClick={() => updateStatus(comment.id, 'spam')}
                        className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 dark:hover:text-amber-400 rounded-lg transition-colors"
                        title="Mark as Spam"
                      >
                        <ShieldAlert size={18} />
                      </button>
                    )}
                    <button
                      onClick={() => setReplyingTo(comment.id)}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-400 rounded-lg transition-colors"
                      title="Reply"
                    >
                      <Reply size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setCommentToDelete(comment)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 dark:hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                      title="Delete Comment"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {comments.links && comments.links.length > 3 && (
        <div className="mt-6 flex justify-center gap-1.5">
          {comments.links.map((link: any, i: number) => (
            <Link
              key={i}
              href={link.url || '#'}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                link.active
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
              } ${!link.url ? 'opacity-40 cursor-not-allowed' : ''}`}
              dangerouslySetInnerHTML={{ __html: link.label }}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {commentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40">
                <Trash2 size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete Comment</h3>
                <p className="text-xs text-slate-400">This comment will be permanently removed.</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300">
              Are you sure you want to delete the comment by <strong className="text-slate-900 dark:text-white">{commentToDelete.author_name}</strong>?
            </p>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 italic max-h-28 overflow-y-auto">
              &quot;{commentToDelete.content}&quot;
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCommentToDelete(null)}
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
