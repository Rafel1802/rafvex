import React, { useState, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/Button';
import {
  UserCheck, Plus, Search, Edit3, Trash2, BookOpen,
  Mail, Sparkles, CheckCircle2, ShieldAlert
} from 'lucide-react';

interface AuthorItem {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
  job_title: string;
  bio: string;
  articles_count: number;
  created_at: string;
}

interface IndexProps {
  auth: any;
  authors: AuthorItem[];
}

export default function Index({ auth, authors = [] }: IndexProps) {
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const filteredAuthors = useMemo(() => {
    if (!search.trim()) return authors;
    const q = search.toLowerCase();
    return authors.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        (a.job_title && a.job_title.toLowerCase().includes(q)) ||
        (a.bio && a.bio.toLowerCase().includes(q)) ||
        (a.email && a.email.toLowerCase().includes(q))
    );
  }, [authors, search]);

  const [authorToDelete, setAuthorToDelete] = useState<any>(null);

  const confirmDeleteAuthor = () => {
    if (!authorToDelete) return;
    setDeletingId(authorToDelete.id);
    router.delete(`/ourcms/authors/${authorToDelete.id}`, {
      onFinish: () => {
        setDeletingId(null);
        setAuthorToDelete(null);
      },
    });
  };

  return (
    <AdminLayout auth={auth}>
      <Head title="Authors & Editorial Team - Rafvex CMS" />

      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-red-600 mb-1">
              <UserCheck size={14} />
              Editorial Staff
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-display">
              Authors &amp; Contributors
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Manage publication authors, assign them when creating blog articles, and update profile images.
            </p>
          </div>

          <Link
            href="/ourcms/authors/create"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-sm shrink-0"
          >
            <Plus size={16} />
            New Author
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Authors</div>
            <div className="text-3xl font-black text-slate-900 dark:text-white font-display">
              {authors.length}
            </div>
          </div>
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Assigned Articles</div>
            <div className="text-3xl font-black text-red-600 font-display">
              {authors.reduce((acc, curr) => acc + (curr.articles_count || 0), 0)}
            </div>
          </div>
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Author Selection</div>
              <div className="text-xs text-slate-600 dark:text-slate-400">Available in Article Editor</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 size={20} />
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <Search size={18} className="text-slate-400 ml-2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search author by name, role, or bio..."
            className="w-full bg-transparent border-0 text-sm focus:outline-none text-slate-900 dark:text-white placeholder:text-slate-400"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 mr-2"
            >
              Clear
            </button>
          )}
        </div>

        {/* Authors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAuthors.map((author) => {
            const initials = author.name
              ? author.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
              : 'AU';

            return (
              <div
                key={author.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xs hover:shadow-md hover:border-red-200 dark:hover:border-red-900/40 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Author Bar */}
                  <div className="flex items-start gap-4 mb-4">
                    {author.avatar ? (
                      <div className="w-14 h-14 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm shrink-0" style={{ backgroundColor: '#ffffff' }}>
                        <img
                          src={author.avatar}
                          alt={author.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 to-rose-600 text-white font-bold text-lg flex items-center justify-center shadow-sm shrink-0">
                        {initials}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug truncate">
                          {author.name}
                        </h3>
                        {author.id === 1 && (
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400">
                            Founder
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                        {author.job_title || 'Author'}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                        <BookOpen size={13} />
                        <span>{author.articles_count} {author.articles_count === 1 ? 'article' : 'articles'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  {author.bio && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed mb-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                      {author.bio}
                    </p>
                  )}
                </div>

                {/* Card Actions */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px]">Joined {author.created_at || 'Recent'}</span>
                  
                  <div className="flex items-center gap-1.5">
                    <Link
                      href={`/ourcms/authors/${author.id}/edit`}
                      className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-red-600 transition-colors"
                      title="Edit Author"
                    >
                      <Edit3 size={15} />
                    </Link>

                    {author.id !== 1 && (
                      <button
                        type="button"
                        onClick={() => setAuthorToDelete(author)}
                        disabled={deletingId === author.id}
                        className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/50 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                        title="Delete Author"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredAuthors.length === 0 && (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
            <UserCheck size={36} className="mx-auto text-slate-400 mb-3" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">No authors found</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">Try a different search query or create a new author.</p>
            <Link
              href="/ourcms/authors/create"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold"
            >
              <Plus size={15} />
              Create First Author
            </Link>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {authorToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40">
                <Trash2 size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete Author</h3>
                <p className="text-xs text-slate-400">Articles will be safely reassigned to Admin.</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300">
              Are you sure you want to remove author <strong className="text-slate-900 dark:text-white">{authorToDelete.name}</strong>?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setAuthorToDelete(null)}
                disabled={Boolean(deletingId)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteAuthor}
                disabled={Boolean(deletingId)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-700 active:scale-95 text-white transition-all shadow-xs flex items-center gap-1.5"
              >
                {deletingId ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
