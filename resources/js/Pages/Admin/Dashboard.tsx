import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
  FileText, CheckCircle, Clock, FolderOpen, Plus, ExternalLink,
  MessageSquare, Eye, Sparkles, Globe, Edit, ArrowRight, User, AlertCircle
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

const STATUS_BADGE: Record<string, { bg: string; text: string; border: string }> = {
  published: { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' },
  draft:     { bg: '#f8fafc', text: '#64748b', border: '#e2e8f0' },
  review:    { bg: '#fffbeb', text: '#d97706', border: '#fde68a' },
  scheduled: { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' },
};

export default function Dashboard({ auth, stats, recentArticles, recentComments, recentActivity }: any) {
  const s = stats ?? {};
  const user = auth?.user;
  const firstName = user?.name ? String(user.name).split(' ').filter(Boolean)[0] || 'Admin' : 'Admin';

  const safeArticles = Array.isArray(recentArticles)
    ? recentArticles
    : (recentArticles && typeof recentArticles === 'object' && Array.isArray((recentArticles as any).data))
      ? (recentArticles as any).data
      : (recentArticles && typeof recentArticles === 'object')
        ? Object.values(recentArticles)
        : [];

  const safeComments = Array.isArray(recentComments)
    ? recentComments
    : (recentComments && typeof recentComments === 'object' && Array.isArray((recentComments as any).data))
      ? (recentComments as any).data
      : (recentComments && typeof recentComments === 'object')
        ? Object.values(recentComments)
        : [];

  const safeFormatDistance = (dateStr: any) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '';
      return `${formatDistanceToNow(d)} ago`;
    } catch (e) {
      return '';
    }
  };

  const safeFormatDate = (dateStr: any) => {
    if (!dateStr) return 'Draft';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return 'Draft';
      return format(d, 'MMM d, yyyy');
    } catch (e) {
      return 'Draft';
    }
  };

  const STAT_CARDS = [
    {
      label: 'Total Articles',
      value: s.total_articles ?? 0,
      subtext: `${s.published ?? 0} published online`,
      icon: FileText,
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      shadow: 'rgba(16, 185, 129, 0.25)',
      textColor: '#059669',
    },
    {
      label: 'Live Published',
      value: s.published ?? 0,
      subtext: `${Math.round(((s.published || 0) / Math.max(s.total_articles || 1, 1)) * 100)}% of all stories`,
      icon: CheckCircle,
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      shadow: 'rgba(59, 130, 246, 0.25)',
      textColor: '#1d4ed8',
    },
    {
      label: 'Comments',
      value: s.total_comments ?? 0,
      subtext: (Number(s.pending_comments) > 0) ? `${s.pending_comments} pending review` : 'All comments active',
      icon: MessageSquare,
      gradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
      shadow: 'rgba(249, 115, 22, 0.25)',
      textColor: '#ea580c',
      badge: (Number(s.pending_comments) > 0) ? `${s.pending_comments} new` : null,
    },
    {
      label: 'Categories',
      value: s.categories ?? 0,
      subtext: `${s.drafts ?? 0} drafts in progress`,
      icon: FolderOpen,
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
      shadow: 'rgba(139, 92, 246, 0.25)',
      textColor: '#6d28d9',
    },
  ];

  return (
    <AdminLayout auth={auth}>
      <Head title="Dashboard — CMS" />

      {/* ── TOP GREETING BANNER (Rafvex Brand Red Gradient) ── */}
      <div
        style={{
          borderRadius: 16,
          background: 'linear-gradient(135deg, #7f1d1d 0%, #b91c1c 45%, #dc2626 80%, #ef4444 100%)',
          padding: '28px 32px',
          color: '#ffffff',
          marginBottom: 28,
          boxShadow: '0 10px 30px rgba(185, 28, 28, 0.28)',
          position: 'relative',
          overflow: 'hidden'
        }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        {/* Decorative background glow circles */}
        <div style={{
          position: 'absolute', right: -40, top: -40, width: 220, height: 220,
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute', left: '40%', bottom: -60, width: 180, height: 180,
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 580 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 20, background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)', marginBottom: 12 }}>
            <Sparkles size={13} color="#fde047" />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#fef08a' }}>
              Editorial CMS
            </span>
          </div>
          <h1 style={{ fontSize: 'clamp(22px, 3vw, 28px)', fontWeight: 800, margin: '0 0 8px', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            Welcome back, {firstName}! 👋
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.9)', margin: 0, lineHeight: 1.5 }}>
            Here's what's happening on your publication today. You have <strong style={{ color: '#fff' }}>{s.total_articles ?? 0} articles</strong> published across <strong style={{ color: '#fff' }}>{s.categories ?? 0} categories</strong>.
          </p>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative', zIndex: 1, flexWrap: 'wrap' }}>
          <Link
            href="/ourcms/articles/create"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 text-red-600 dark:text-white dark:border dark:border-slate-700 font-bold text-xs sm:text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all no-underline"
          >
            <Plus size={16} className="text-red-600 dark:text-red-400" /> Write New Article
          </Link>

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '11px 18px',
              borderRadius: 10, background: 'rgba(255,255,255,0.15)', color: '#ffffff',
              border: '1px solid rgba(255,255,255,0.3)', textDecoration: 'none',
              fontSize: 13.5, fontWeight: 600, backdropFilter: 'blur(8px)', transition: 'all 0.15s'
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.25)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
          >
            <Globe size={15} /> View Site
          </a>
        </div>
      </div>

      {/* ── 4 VIBRANT STAT CARDS (Gleek + Super Finti Inspired) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {STAT_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              style={{
                background: card.gradient,
                borderRadius: 16,
                padding: '22px 20px',
                color: '#ffffff',
                boxShadow: `0 8px 24px ${card.shadow}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'relative',
                overflow: 'hidden',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = `0 12px 28px ${card.shadow}`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = `0 8px 24px ${card.shadow}`;
              }}
            >
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.85)', margin: '0 0 6px' }}>
                  {card.label}
                </p>
                <p style={{ fontSize: 32, fontWeight: 800, margin: '0 0 6px', lineHeight: 1, letterSpacing: '-0.02em' }}>
                  {card.value}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>
                    {card.subtext}
                  </span>
                </div>
              </div>

              {/* Circular Icon Holder */}
              <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-900/90 flex items-center justify-center shadow-md shrink-0 border border-white/20 dark:border-slate-700/50">
                <Icon size={24} color={card.textColor} />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── TWO-COLUMN MAIN SECTION ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">

        {/* ── LEFT: RECENT ARTICLES TABLE (2 Cols) ── */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
            {/* Table Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <h2 className="text-base font-bold text-slate-900 dark:text-white m-0">Recent Articles</h2>
                <span className="text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full">
                  {recentArticles?.length || 0}
                </span>
              </div>
              <Link
                href="/ourcms/articles"
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 no-underline flex items-center gap-1 transition-colors"
              >
                View all <ArrowRight size={14} />
              </Link>
            </div>

            {/* Table Content */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-5">Article</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {safeArticles.map((article: any) => {
                    return (
                      <tr
                        key={article.id}
                        className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        {/* Title & Cover */}
                        <td className="py-3.5 px-5 max-w-[260px]">
                          <div className="flex items-center gap-3">
                            {article.cover_image_url ? (
                              <img
                                src={article.cover_image_url}
                                alt={article.title}
                                className="w-11 h-8 rounded-lg object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                              />
                            ) : (
                              <div className="w-11 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
                                <FileText size={15} className="text-slate-400 dark:text-slate-500" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-900 dark:text-white m-0 truncate text-xs sm:text-sm">
                                {article.title}
                              </p>
                              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 truncate font-mono">
                                /{article.slug}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200/60 dark:border-slate-700/60">
                            {article.category?.name || 'General'}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-md capitalize border ${
                            article.status === 'published' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800/70' :
                            article.status === 'scheduled' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800/70' :
                            article.status === 'review' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800/70' :
                            'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                          }`}>
                            {article.status}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="py-3.5 px-4 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {safeFormatDate(article.published_at)}
                        </td>

                        {/* Action buttons */}
                        <td className="py-3.5 px-5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              href={`/ourcms/articles/${article.id}/edit`}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white dark:hover:border-indigo-600 text-xs font-semibold no-underline transition-all"
                            >
                              <Edit size={12} /> Edit
                            </Link>

                            <a
                              href={`/article/${article.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Preview on live site"
                              className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white no-underline transition-all"
                            >
                              <ExternalLink size={13} />
                            </a>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {safeArticles.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-10 px-5 text-center text-slate-400 dark:text-slate-500 text-xs sm:text-sm">
                        No articles published yet. <Link href="/ourcms/articles/create" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">Create your first article →</Link>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ── RIGHT: COMMENTS MODERATION & QUICK TOOLS (1 Col) ── */}
        <div className="flex flex-col gap-6">

          {/* Recent Comments Widget */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-5 transition-colors">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <MessageSquare size={17} className="text-orange-500" />
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white m-0">Latest Comments</h3>
              </div>
              <Link href="/ourcms/comments" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 no-underline transition-colors">
                Moderate →
              </Link>
            </div>

            <div className="flex flex-col gap-3">
              {safeComments.slice(0, 4).map((comment: any) => (
                <div
                  key={comment.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-700/60 flex flex-col gap-1.5 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0">
                        <User size={13} className="text-slate-600 dark:text-slate-300" />
                      </div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[130px]">{comment.author_name}</span>
                    </div>
                    {comment.created_at && (
                      <span className="text-[10.5px] text-slate-400 dark:text-slate-500 shrink-0">
                        {safeFormatDistance(comment.created_at)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 m-0 line-clamp-2 leading-relaxed">
                    "{comment.content}"
                  </p>
                  {comment.article && (
                    <span className="text-[10.5px] text-indigo-600 dark:text-indigo-400 truncate">
                      on: {comment.article.title}
                    </span>
                  )}
                </div>
              ))}

              {safeComments.length === 0 && (
                <div className="text-center py-6 px-3 text-slate-400 dark:text-slate-500 text-xs">
                  No reader comments yet.
                </div>
              )}
            </div>
          </div>

          {/* Quick Shortcuts Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-5 transition-colors">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-3.5 mt-0">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2.5">
              <Link
                href="/ourcms/articles/create"
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-indigo-300 dark:hover:border-indigo-600 no-underline flex flex-col gap-1.5 transition-all group"
              >
                <Plus size={18} className="text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">New Article</span>
              </Link>

              <Link
                href="/ourcms/categories"
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-purple-300 dark:hover:border-purple-600 no-underline flex flex-col gap-1.5 transition-all group"
              >
                <FolderOpen size={18} className="text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Categories</span>
              </Link>

              <Link
                href="/ourcms/media"
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-emerald-300 dark:hover:border-emerald-600 no-underline flex flex-col gap-1.5 transition-all group"
              >
                <FileText size={18} className="text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Media Library</span>
              </Link>

              <Link
                href="/ourcms/settings"
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-orange-300 dark:hover:border-orange-600 no-underline flex flex-col gap-1.5 transition-all group"
              >
                <Globe size={18} className="text-orange-500 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Site Settings</span>
              </Link>
            </div>
          </div>

        </div>

      </div>
    </AdminLayout>
  );
}
