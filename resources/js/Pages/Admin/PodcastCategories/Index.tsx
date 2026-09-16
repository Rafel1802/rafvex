import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/Button';
import { FolderOpen, Plus, Edit2, Trash2, Headphones, X, Check, Eye, EyeOff } from 'lucide-react';

interface PodcastCategory {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  cover_image_url?: string | null;
  sort_order: number;
  is_active: boolean;
  podcasts_count?: number;
}

export default function PodcastCategoriesIndex({ auth, categories = [] }: { auth: any; categories: PodcastCategory[] }) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingCategory, setEditingCategory] = useState<PodcastCategory | null>(null);

  const { data, setData, post, put, processing, reset, errors } = useForm({
    name: '',
    slug: '',
    description: '',
    cover_image_url: '',
    sort_order: 0,
    is_active: true,
  });

  const handleOpenCreate = () => {
    reset();
    setEditingCategory(null);
    setIsCreating(true);
  };

  const handleOpenEdit = (cat: PodcastCategory) => {
    setEditingCategory(cat);
    setData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      cover_image_url: cat.cover_image_url || '',
      sort_order: cat.sort_order ?? 0,
      is_active: Boolean(cat.is_active),
    });
    setIsCreating(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategory) {
      put(`/ourcms/podcast-categories/${editingCategory.id}`, {
        onSuccess: () => {
          setIsCreating(false);
          setEditingCategory(null);
          reset();
        },
      });
    } else {
      post('/ourcms/podcast-categories', {
        onSuccess: () => {
          setIsCreating(false);
          reset();
        },
      });
    }
  };

  const handleDelete = (id: number, name: string) => {
    if (confirm(`Are you sure you want to delete the category "${name}"? Existing episodes in this category will become unassigned.`)) {
      router.delete(`/ourcms/podcast-categories/${id}`);
    }
  };

  return (
    <AdminLayout auth={auth}>
      <Head title="Podcast Categories — CMS" />

      <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5 tracking-tight">
              <FolderOpen className="text-red-600 dark:text-red-500" size={26} />
              Podcast Categories
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Organize podcast episodes into curated channels. The public hub shows 5 episodes for each category.
            </p>
          </div>
          <Button onClick={handleOpenCreate} className="shadow-xs shrink-0">
            <Plus size={16} className="mr-1.5" />
            New Category
          </Button>
        </div>

        {/* Create/Edit Form Card */}
        {isCreating && (
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/50 shadow-md animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                {editingCategory ? 'Edit Podcast Category' : 'Create Podcast Category'}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Category Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AI & Tech Talks"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Slug (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="ai-tech-talks"
                    value={data.slug}
                    onChange={(e) => setData('slug', e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Short description of episodes in this category..."
                  value={data.description}
                  onChange={(e) => setData('description', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Cover Image URL (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={data.cover_image_url}
                    onChange={(e) => setData('cover_image_url', e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div className="flex items-center gap-4 pt-6">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Sort Order:
                    </label>
                    <input
                      type="number"
                      value={data.sort_order}
                      onChange={(e) => setData('sort_order', Number(e.target.value))}
                      className="w-20 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-sm text-center text-slate-900 dark:text-white"
                    />
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={data.is_active}
                      onChange={(e) => setData('is_active', e.target.checked)}
                      className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
                    />
                    <span>Active on site</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <Button type="submit" isLoading={processing} disabled={processing || !data.name.trim()}>
                  <Check size={14} className="mr-1" />
                  {editingCategory ? 'Save Changes' : 'Create Category'}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400 border border-red-200/60 dark:border-red-900/40">
                    <Headphones size={12} />
                    {cat.podcasts_count ?? 0} Episodes
                  </span>

                  <div className="flex items-center gap-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      cat.is_active
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                      {cat.is_active ? 'Active' : 'Hidden'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(cat)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="Edit"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(cat.id, cat.name)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug">
                  {cat.name}
                </h3>
                {cat.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>Slug: {cat.slug}</span>
                <span>Order: {cat.sort_order}</span>
              </div>
            </div>
          ))}

          {categories.length === 0 && (
            <div className="col-span-full text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-8">
              <FolderOpen size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No podcast categories yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
                Create categories to group podcast episodes. The public podcasts hub will showcase 5 episodes per category.
              </p>
              <Button onClick={handleOpenCreate} size="sm">
                <Plus size={14} className="mr-1" /> Create First Category
              </Button>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
