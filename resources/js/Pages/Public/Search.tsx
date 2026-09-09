import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { Search, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function SearchPage({ auth, query, results }: any) {
  const [q, setQ] = useState(query ?? '');

  return (
    <PublicLayout auth={auth}>
      <Head title={`Search: ${query} — Rafvex`} />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        {/* Search bar */}
        <form action="/search" method="GET" className="mb-8">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
            <input
              type="text"
              name="q"
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Search articles, guides, tech topics..."
              autoFocus
              className="w-full pl-12 pr-4 py-3.5 text-sm sm:text-base rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-red-500 dark:focus:border-red-500 transition-all shadow-xs"
            />
          </div>
        </form>

        {query && (
          <>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6">
              {results.length > 0
                ? <><strong className="text-slate-900 dark:text-slate-100">{results.length}</strong> results for "<strong className="text-slate-900 dark:text-slate-100">{query}</strong>"</>
                : <>No results for "<strong className="text-slate-900 dark:text-slate-100">{query}</strong>"</>
              }
            </p>

            <div className="flex flex-col gap-6">
              {results.map((article: any) => (
                <Link
                  key={article.id}
                  href={`/article/${article.slug}`}
                  className="group flex flex-col sm:flex-row gap-4 sm:gap-5 pb-6 border-b border-slate-200/80 dark:border-slate-800 text-inherit transition-all"
                >
                  {article.cover_image_url && (
                    <div className="w-full sm:w-[150px] h-[180px] sm:h-[100px] rounded-xl shrink-0 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <img
                        src={article.cover_image_url}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    {article.category && (
                      <span className="text-[10px] sm:text-[11px] font-extrabold tracking-wider uppercase text-red-600 dark:text-red-400 block mb-1">
                        {article.category.name}
                      </span>
                    )}
                    <h2
                      style={{ fontFamily: "'Outfit', sans-serif" }}
                      className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-2 leading-snug mb-1.5"
                    >
                      {article.title}
                    </h2>
                    {article.excerpt && (
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed mb-3">
                        {article.excerpt}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
                      {article.published_at && <span>{format(new Date(article.published_at), 'MMM d, yyyy')}</span>}
                      {article.reading_time && (
                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          {article.reading_time} min read
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {results.length === 0 && (
              <div className="text-center py-16 text-slate-500 dark:text-slate-400">
                <p className="text-sm sm:text-base mb-3">Try a different search term or browse our categories.</p>
                <Link href="/" className="text-red-600 dark:text-red-400 hover:underline text-sm font-semibold">
                  ← Back to home
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </PublicLayout>
  );
}
