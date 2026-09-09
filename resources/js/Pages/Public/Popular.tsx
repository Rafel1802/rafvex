import React from 'react';
import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import BookmarkButton from '@/Components/Public/BookmarkButton';
import ReadBadge from '@/Components/Public/ReadBadge';
import { TrendingUp, Eye, Clock, Flame, Award, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

interface PopularProps {
  articles: any[];
}

export default function Popular({ articles = [] }: PopularProps) {
  return (
    <PublicLayout>
      <Head>
        <title>Top 20 Popular & Most-Read Articles — Rafvex</title>
        <meta
          name="description"
          content="Explore the 20 most popular, highly cited, and widely read technical guides, AI research syntheses, and masterclasses on Rafvex."
        />
        <meta property="og:title" content="Top 20 Popular & Most-Read Articles — Rafvex" />
        <meta
          property="og:description"
          content="The most read articles and masterclasses on Rafvex, ranked by readership volume and community engagement."
        />
      </Head>

      <div className="bg-[#fdfcfb] dark:bg-[#0b1120] min-h-screen py-8 sm:py-12 transition-colors duration-200">
        <div style={{ maxWidth: 1320, margin: '0 auto', padding: '0 20px' }}>
          
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-6">
            <Link href="/" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">Home</Link>
            <ChevronRight size={12} className="text-slate-400 dark:text-slate-500" />
            <span className="text-slate-900 dark:text-slate-100 font-bold">Top 20 Popular Articles</span>
          </nav>

          {/* Page Header */}
          <div className="border-b border-slate-200/80 dark:border-slate-800 pb-8 mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/40 border border-red-200/60 dark:border-red-900/40 text-red-600 dark:text-red-400 text-xs font-bold uppercase tracking-wider mb-3 shadow-2xs">
              <Flame size={14} className="animate-bounce text-red-600 dark:text-red-400" />
              <span>Hall of Fame &bull; Live Leaderboard</span>
            </div>
            <h1
              style={{ fontFamily: "'Outfit', sans-serif" }}
              className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-slate-100 tracking-tight mb-4"
            >
              Top 20 Most-Read Masterclasses
            </h1>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed font-normal">
              The highest-volume technical guides, research syntheses, and benchmark studies read by knowledge workers and researchers worldwide. Ranked in real-time by readership engagement.
            </p>
          </div>

          {/* Articles Ranking Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((art, index) => {
              const rank = index + 1;
              const isTop3 = rank <= 3;
              const rankBadgeColor =
                rank === 1
                  ? 'bg-amber-400 text-amber-950 border-amber-300 shadow-md ring-2 ring-amber-400/30'
                  : rank === 2
                  ? 'bg-slate-300 dark:bg-slate-700 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-600 shadow-sm'
                  : rank === 3
                  ? 'bg-amber-700 text-amber-50 border-amber-600 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';

              return (
                <div
                  key={art.id}
                  className="group relative flex flex-col justify-between rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 shadow-xs hover:shadow-xl dark:hover:shadow-slate-950/50 hover:border-red-300 dark:hover:border-red-500/50 transition-all duration-200"
                >
                  {/* Top Header: Rank Number & Category */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span
                          style={{ fontFamily: "'Outfit', sans-serif" }}
                          className={`flex items-center justify-center w-8 h-8 rounded-xl font-black text-sm border ${rankBadgeColor}`}
                        >
                          #{rank < 10 ? `0${rank}` : rank}
                        </span>
                        {isTop3 && (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                            <Award size={13} />
                            {rank === 1 ? 'Top Read' : rank === 2 ? 'Silver' : 'Bronze'}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <ReadBadge articleId={art.id} />
                        <BookmarkButton articleId={art.id} size={15} />
                      </div>
                    </div>

                    {/* Cover Image */}
                    <Link
                      href={`/article/${art.slug}`}
                      prefetch="hover"
                      className="aspect-[16/9] w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 mb-3.5 block relative"
                    >
                      <img
                        src={art.cover_image_url || '/images/default-cover.webp'}
                        alt={art.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </Link>

                    {/* Category & Date */}
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-semibold mb-1.5 uppercase tracking-wider">
                      {art.category && (
                        <span className="text-red-600 dark:text-red-400 truncate max-w-[160px]">
                          {art.category.name}
                        </span>
                      )}
                      <span>&bull;</span>
                      {art.published_at && (
                        <span>{format(new Date(art.published_at), 'MMM d, yyyy')}</span>
                      )}
                    </div>

                    {/* Article Title */}
                    <Link href={`/article/${art.slug}`} prefetch="hover">
                      <h2
                        style={{ fontFamily: "'Outfit', sans-serif" }}
                        className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-2 leading-snug mb-2"
                      >
                        {art.title}
                      </h2>
                    </Link>

                    {/* Excerpt */}
                    {art.excerpt && (
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed mb-4">
                        {art.excerpt}
                      </p>
                    )}
                  </div>

                  {/* Footer Metrics */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                        <Clock size={13} />
                        <span>{art.reading_time || 8} min read</span>
                      </span>
                      {art.views_count > 0 && (
                        <span className="flex items-center gap-1 font-semibold text-slate-600 dark:text-slate-300">
                          <Eye size={13} />
                          <span>{Number(art.views_count).toLocaleString()} views</span>
                        </span>
                      )}
                    </div>
                    <Link
                      href={`/article/${art.slug}`}
                      prefetch="hover"
                      className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-bold inline-flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform"
                    >
                      <span>Read</span>
                      <span>&rarr;</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {articles.length === 0 && (
            <div className="py-20 text-center text-slate-500 dark:text-slate-400">
              <TrendingUp size={40} className="mx-auto mb-3 text-slate-400 dark:text-slate-500" />
              <p className="text-base font-medium">No popular articles found yet.</p>
            </div>
          )}

        </div>
      </div>
    </PublicLayout>
  );
}
