import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/Button';
import { ListMusic, Plus, Edit2, Trash2, BookOpen, ExternalLink, X, Check } from 'lucide-react';

interface Playlist {
  id: number;
  title: string;
  slug: string;
  description?: string | null;
  cover_image_url?: string | null;
  articles_count?: number;
  created_at: string;
}

export default function PlaylistsIndex({ auth, playlists = [] }: { auth: any; playlists: Playlist[] }) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);

  const { data, setData, post, put, processing, reset, errors } = useForm({
    title: '',
    description: '',
    cover_image_url: '',
  });

  const handleOpenCreate = () => {
    reset();
    setEditingPlaylist(null);
    setIsCreating(true);
  };

  const handleOpenEdit = (pl: Playlist) => {
    setEditingPlaylist(pl);
    setData({
      title: pl.title,
      description: pl.description || '',
      cover_image_url: pl.cover_image_url || '',
    });
    setIsCreating(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPlaylist) {
      put(`/ourcms/playlists/${editingPlaylist.id}`, {
        onSuccess: () => {
          setIsCreating(false);
          setEditingPlaylist(null);
          reset();
        },
      });
    } else {
      post('/ourcms/playlists', {
        onSuccess: () => {
          setIsCreating(false);
          reset();
        },
      });
    }
  };

  const handleDelete = (id: number, title: string) => {
    if (confirm(`Are you sure you want to delete the playlist "${title}"? Articles in this playlist will remain safe as standalone articles.`)) {
      router.delete(`/ourcms/playlists/${id}`);
    }
  };

  return (
    <AdminLayout auth={auth}>
      <Head title="Playlists & Series — CMS" />

      <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5 tracking-tight">
              <ListMusic className="text-red-600 dark:text-red-500" size={26} />
              Blog Playlists & Series
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Curate multi-chapter article series that appear as cohesive reading playlists inside articles.
            </p>
          </div>
          <Button onClick={handleOpenCreate} className="shadow-xs shrink-0">
            <Plus size={16} className="mr-1.5" />
            New Playlist
          </Button>
        </div>

        {/* Modal / Create Drawer */}
        {isCreating && (
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/50 shadow-md animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                {editingPlaylist ? 'Edit Playlist' : 'Create New Playlist / Series'}
              </h3>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Playlist Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mastering Artificial Intelligence in 2026"
                  value={data.title}
                  onChange={(e) => setData('title', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief description of what this series covers..."
                  value={data.description}
                  onChange={(e) => setData('description', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <Button type="submit" isLoading={processing} disabled={processing || !data.title.trim()}>
                  <Check size={14} className="mr-1" />
                  {editingPlaylist ? 'Save Changes' : 'Create Playlist'}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Playlists Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {playlists.map((pl) => (
            <div
              key={pl.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400 border border-red-200/60 dark:border-red-900/40">
                    <BookOpen size={12} />
                    {pl.articles_count ?? 0} Chapters
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(pl)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="Edit"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(pl.id, pl.title)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug">
                  {pl.title}
                </h3>
                {pl.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {pl.description}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 font-mono">
                Slug: <span className="text-slate-600 dark:text-slate-300 font-semibold">{pl.slug}</span>
              </div>
            </div>
          ))}

          {playlists.length === 0 && (
            <div className="col-span-full text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-8">
              <ListMusic size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No playlists yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
                Group related articles into chapters and playlists. They will appear sequentially in single blog reading views.
              </p>
              <Button onClick={handleOpenCreate} size="sm">
                <Plus size={14} className="mr-1" /> Create First Playlist
              </Button>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
