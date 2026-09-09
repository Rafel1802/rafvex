import React, { useState } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import { MessageSquare, CornerDownRight, User, Send, X, CornerUpLeft } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface CommentItem {
  id: number;
  author_name: string;
  author_email?: string;
  content: string;
  created_at: string;
  approved_by?: any;
  replies?: CommentItem[];
}

interface CommentsProps {
  articleId: number;
  comments?: CommentItem[];
}

// Sub-component for individual Comment Form (defined OUTSIDE so it is NEVER unmounted on keystroke)
interface FormProps {
  articleId: number;
  parentId?: number | null;
  autoFocus?: boolean;
  currentUser?: any;
  onCancel?: () => void;
  onSuccess?: () => void;
}

function CommentInputBox({
  articleId,
  parentId = null,
  autoFocus = false,
  currentUser,
  onCancel,
  onSuccess,
}: FormProps) {
  const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
    author_name: currentUser?.name || '',
    author_email: currentUser?.email || '',
    content: '',
    parent_id: parentId,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.content.trim()) return;

    post(`/article/${articleId}/comments`, {
      preserveScroll: true,
      onSuccess: () => {
        reset('content');
        if (onSuccess) onSuccess();
      },
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm relative z-10"
      onClick={(e) => e.stopPropagation()}
    >
      {/* If logged in, show commenting badge */}
      {currentUser ? (
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
            {currentUser.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Commenting as <strong className="text-slate-900 dark:text-white font-bold">{currentUser.name}</strong>
          </span>
        </div>
      ) : (
        /* Unauthenticated Guest Details */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Your Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Alex Morgan"
              value={data.author_name}
              onChange={(e) => setData('author_name', e.target.value)}
              className="w-full px-3.5 py-2.5 text-base sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-colors"
            />
            {errors.author_name && (
              <p className="text-xs text-red-500 mt-1 font-medium">{errors.author_name}</p>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Your Email *
            </label>
            <input
              type="email"
              required
              placeholder="alex@example.com"
              value={data.author_email}
              onChange={(e) => setData('author_email', e.target.value)}
              className="w-full px-3.5 py-2.5 text-base sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-colors"
            />
            {errors.author_email && (
              <p className="text-xs text-red-500 mt-1 font-medium">{errors.author_email}</p>
            )}
          </div>
        </div>
      )}

      {/* Comment Content Area */}
      <div className="relative">
        <textarea
          required
          rows={3}
          autoFocus={autoFocus}
          placeholder={parentId ? "Write a polite and constructive reply..." : "Share your perspective, research notes, or questions..."}
          value={data.content}
          onChange={(e) => setData('content', e.target.value)}
          className="w-full p-3.5 text-base sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-colors resize-y min-h-[90px]"
        />
        {errors.content && (
          <p className="text-xs text-red-500 mt-1 font-medium">{errors.content}</p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-2 mt-3 pt-2">
        {parentId !== null && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-3.5 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
        )}

        <button
          type="submit"
          disabled={processing || !data.content.trim()}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-xs transition-all cursor-pointer tracking-wide"
        >
          <Send size={13} />
          <span>{processing ? 'Posting...' : parentId ? 'Post Reply' : 'Post Comment'}</span>
        </button>
      </div>
    </form>
  );
}

export default function Comments({ articleId, comments = [] }: CommentsProps) {
  const { props } = usePage<any>();
  const currentUser = props.auth?.user;
  const [replyingTo, setReplyingTo] = useState<number | null>(null);

  const totalComments = comments.reduce(
    (acc, c) => acc + 1 + (c.replies?.length || 0),
    0
  );

  return (
    <div className="relative isolate z-10 w-full" onClick={(e) => e.stopPropagation()}>
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center">
            <MessageSquare size={18} />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-xl sm:text-2xl font-['Outfit'] tracking-tight">
              Discussion & Insights
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {totalComments} {totalComments === 1 ? 'comment' : 'comments'} from readers
            </p>
          </div>
        </div>
      </div>

      {/* Main Comment Box (Top Level) */}
      <div className="mb-8">
        <CommentInputBox
          articleId={articleId}
          currentUser={currentUser}
          onSuccess={() => setReplyingTo(null)}
        />
      </div>

      {/* Comments List */}
      {comments.length === 0 ? (
        <div className="p-8 sm:p-10 text-center rounded-2xl bg-slate-50/70 dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-800">
          <div className="w-11 h-11 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-2.5 text-slate-400">
            <MessageSquare size={20} />
          </div>
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">No comments yet</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Be the first to share your thoughts, ask a technical question, or provide feedback on this guide!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 shadow-2xs transition-colors"
            >
              {/* Comment Header */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 font-bold text-xs uppercase border border-slate-200/60 dark:border-slate-700">
                  {comment.author_name ? comment.author_name.charAt(0) : <User size={15} />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-1 mb-1.5">
                    <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                      {comment.author_name}
                    </span>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500">
                      {formatDistanceToNow(new Date(comment.created_at))} ago
                    </span>
                  </div>

                  {/* Comment Body */}
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap break-words mb-3 font-normal">
                    {comment.content}
                  </p>

                  {/* Reply Button */}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 dark:text-red-400 transition-colors cursor-pointer py-1"
                    >
                      <CornerUpLeft size={13} />
                      <span>{replyingTo === comment.id ? 'Cancel Reply' : 'Reply'}</span>
                    </button>
                  </div>

                  {/* Inline Reply Form */}
                  {replyingTo === comment.id && (
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <CommentInputBox
                        articleId={articleId}
                        parentId={comment.id}
                        autoFocus
                        currentUser={currentUser}
                        onCancel={() => setReplyingTo(null)}
                        onSuccess={() => setReplyingTo(null)}
                      />
                    </div>
                  )}

                  {/* Nested Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-4 pt-3 space-y-3 border-t border-slate-100/80 dark:border-slate-800/80">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="flex items-start gap-2.5 pl-2 sm:pl-4 border-l-2 border-red-200 dark:border-red-950/60">
                          <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 font-bold text-[11px] uppercase mt-0.5">
                            {reply.author_name ? reply.author_name.charAt(0) : <User size={13} />}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5 mb-1">
                              <span className="font-bold text-xs text-slate-900 dark:text-white">
                                {reply.author_name}
                              </span>
                              {reply.approved_by && (
                                <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 bg-red-600 text-white rounded">
                                  Author
                                </span>
                              )}
                              <span className="text-[10px] text-slate-400">
                                • {formatDistanceToNow(new Date(reply.created_at))} ago
                              </span>
                            </div>

                            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap break-words">
                              {reply.content}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
