import React, { useState, useMemo } from 'react';
import { Head, useForm, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
  Folder, FolderTree, Trash2, Edit3, Plus, Search, ExternalLink,
  ChevronDown, ChevronRight, Image as ImageIcon, FileText, CheckCircle2,
  Layers, Sparkles, X, ArrowUpRight, BookOpen
} from 'lucide-react';

interface ArticleItem {
  id: number;
  title: string;
  slug: string;
  cover_image_url?: string | null;
  status: string;
  created_at?: string;
}

interface CategoryItem {
  id: number;
  parent_id: number | null;
  name: string;
  slug: string;
  description: string | null;
  cover_image: string | null;
  articles_count?: number;
  articles?: ArticleItem[];
  parent?: CategoryItem | null;
}

interface CategoriesProps {
  auth: any;
  categories: CategoryItem[];
}

export default function Index({ auth, categories = [] }: CategoriesProps) {
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Record<number, boolean>>({});
  const [imagePreview, setImagePreview] = useState<string>('');
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDeleteCategory = () => {
    if (!categoryToDelete) return;
    setIsDeleting(true);
    router.delete(`/ourcms/categories/${categoryToDelete.id}`, {
      preserveScroll: true,
      onFinish: () => {
        setIsDeleting(false);
        setCategoryToDelete(null);
      },
    });
  };

  // Form for create/update
  const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
    name: '',
    slug: '',
    parent_id: '',
    description: '',
    cover_image: '',
  });

  // Auto-generate slug when name changes (only in create mode or if slug wasn't manually edited)
  const handleNameChange = (name: string) => {
    setData((prev) => {
      const generatedSlug = name
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');

      // If user hasn't typed a custom slug or editing new, auto-sync slug
      if (!editingCategory || prev.slug === '' || prev.slug === editingCategory.slug) {
        return { ...prev, name, slug: generatedSlug };
      }
      return { ...prev, name };
    });
  };

  const startEdit = (cat: CategoryItem) => {
    clearErrors();
    setEditingCategory(cat);
    setImagePreview(cat.cover_image || '');
    setData({
      name: cat.name,
      slug: cat.slug,
      parent_id: cat.parent_id ? String(cat.parent_id) : '',
      description: cat.description || '',
      cover_image: cat.cover_image || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    clearErrors();
    setEditingCategory(null);
    setImagePreview('');
    reset();
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategory) {
      put(`/ourcms/categories/${editingCategory.id}`, {
        onSuccess: () => {
          cancelEdit();
        },
      });
    } else {
      post('/ourcms/categories', {
        onSuccess: () => {
          reset();
          setImagePreview('');
        },
      });
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Filtered categories
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const q = searchQuery.toLowerCase();
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q))
    );
  }, [categories, searchQuery]);

  const topLevelCategories = useMemo(() => {
    return filteredCategories.filter((c) => c.parent_id === null);
  }, [filteredCategories]);

  const totalArticlesCount = useMemo(() => {
    return categories.reduce((sum, c) => sum + (c.articles_count || 0), 0);
  }, [categories]);

  return (
    <AdminLayout auth={auth}>
      <Head title="Categories - Rafvex CMS" />

      {/* ── Page Header ── */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-red-600 bg-red-50 dark:bg-red-950/40 px-2.5 py-1 rounded-md border border-red-200 dark:border-red-900/40">
                Editorial Taxonomy
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-display tracking-tight">
              Categories & Slugs
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Organize your publication into distinct channels, URL slugs, and featured topics.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3">
            <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl px-4 py-2 text-center shadow-xs">
              <div className="text-xs font-semibold text-slate-400 uppercase">Categories</div>
              <div className="text-xl font-bold text-slate-900 dark:text-white font-display">
                {categories.length}
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl px-4 py-2 text-center shadow-xs">
              <div className="text-xs font-semibold text-slate-400 uppercase">Assigned Blogs</div>
              <div className="text-xl font-bold text-red-600 font-display">
                {totalArticlesCount}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ── Left Column: Create / Edit Category Form (Fixed / Sticky in Viewport) ── */}
        <div className="lg:col-span-4 lg:sticky lg:top-[86px] lg:self-start lg:max-h-[calc(100vh-100px)] overflow-y-auto pr-1 z-20">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs transition-colors">
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/50 text-red-600 flex items-center justify-center">
                  {editingCategory ? <Edit3 size={17} /> : <Plus size={17} />}
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 dark:text-white text-base">
                    {editingCategory ? 'Edit Category' : 'Add New Category'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {editingCategory ? `Editing ID #${editingCategory.id}` : 'Create a channel for your stories'}
                  </p>
                </div>
              </div>

              {editingCategory && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg transition-colors"
                >
                  <X size={13} /> Cancel
                </button>
              )}
            </div>

            <form onSubmit={submit} className="space-y-4.5">
              {/* Category Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={data.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Artificial Intelligence"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                  required
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>

              {/* URL Slug */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  URL Slug <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 select-none">/category/</span>
                  <input
                    type="text"
                    value={data.slug}
                    onChange={(e) => setData('slug', e.target.value)}
                    placeholder="artificial-intelligence"
                    className="w-full pl-22 pr-3.5 py-2.5 text-sm font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                    required
                  />
                </div>
                {errors.slug && <p className="text-xs text-red-500 mt-1">{errors.slug}</p>}
                <p className="text-[11px] text-slate-400 mt-1">
                  Unique identifier used in URLs (e.g. rafvex.com/category/{data.slug || 'slug'})
                </p>
              </div>

              {/* Parent Category */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Parent Category
                </label>
                <select
                  value={data.parent_id}
                  onChange={(e) => setData('parent_id', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                >
                  <option value="">None (Top Level Root)</option>
                  {categories
                    .filter((c) => c.parent_id === null && (!editingCategory || c.id !== editingCategory.id))
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} (/category/{c.slug})
                      </option>
                    ))}
                </select>
                {errors.parent_id && <p className="text-xs text-red-500 mt-1">{errors.parent_id}</p>}
              </div>

              {/* Cover Image / Icon URL */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Cover Image URL
                  </label>
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview('');
                        setData('cover_image', '');
                      }}
                      className="text-[11px] text-red-500 hover:underline"
                    >
                      Clear image
                    </button>
                  )}
                </div>
                <input
                  type="url"
                  value={data.cover_image}
                  onChange={(e) => {
                    setData('cover_image', e.target.value);
                    setImagePreview(e.target.value);
                  }}
                  placeholder="https://images.unsplash.com/... or /storage/..."
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                />
                
                {/* Image Live Preview */}
                {imagePreview ? (
                  <div className="mt-2.5 p-2 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-3">
                    <img
                      src={imagePreview}
                      alt="Category preview"
                      className="w-14 h-14 rounded-lg object-cover border border-slate-200 dark:border-slate-700"
                      onError={() => setImagePreview('')}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">
                        Preview active
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">{imagePreview}</p>
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-400">
                    <ImageIcon size={13} /> Shows on category headers and navigation cards.
                  </div>
                )}
                {errors.cover_image && <p className="text-xs text-red-500 mt-1">{errors.cover_image}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Description
                </label>
                <textarea
                  value={data.description}
                  onChange={(e) => setData('description', e.target.value)}
                  rows={3}
                  placeholder="Short editorial summary for readers and search engines..."
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all resize-y"
                />
                {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center gap-2.5">
                <button
                  type="submit"
                  disabled={processing}
                  className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {processing ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : editingCategory ? (
                    <>
                      <CheckCircle2 size={16} /> Save Changes
                    </>
                  ) : (
                    <>
                      <Plus size={16} /> Add Category
                    </>
                  )}
                </button>

                {editingCategory && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="py-3 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* ── Right Column: Categories Explorer & Associated Blogs ── */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Search & Filter bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 transition-colors">
            <div className="relative w-full sm:w-80">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search categories or slugs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 self-start sm:self-center">
              Showing {topLevelCategories.length} primary channel{topLevelCategories.length === 1 ? '' : 's'}
            </div>
          </div>

          {/* Categories List */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs transition-colors">
            <div className="p-4.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderTree size={17} className="text-red-600" />
                <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                  Publication Structure & Associated Blogs
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {categories.length} items total
              </span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {topLevelCategories.map((parent) => {
                const subcategories = categories.filter((c) => c.parent_id === parent.id);
                const isExpanded = !!expandedCategories[parent.id];
                const recentBlogs = parent.articles || [];

                return (
                  <div key={parent.id} className="p-5 hover:bg-slate-50/40 dark:hover:bg-slate-800/20 transition-colors">
                    
                    {/* Top-level Category Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                        {/* Thumbnail Image or Gradient Icon */}
                        <div className="relative shrink-0">
                          {parent.cover_image ? (
                            <img
                              src={parent.cover_image}
                              alt={parent.name}
                              className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shadow-xs"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 text-white flex items-center justify-center shadow-xs">
                              <Folder size={22} />
                            </div>
                          )}
                        </div>

                        {/* Title & Slug */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="font-bold text-base text-slate-900 dark:text-white">
                              {parent.name}
                            </span>
                            
                            {/* URL Slug Badge */}
                            <a
                              href={`/category/${parent.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 font-mono text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/90 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 px-2.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 transition-colors"
                              title="Preview category on website"
                            >
                              <span>/category/{parent.slug}</span>
                              <ArrowUpRight size={12} />
                            </a>

                            {/* Blog Count Pill */}
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded-full border border-red-200/70 dark:border-red-900/40">
                              <FileText size={12} />
                              {parent.articles_count || 0} blogs
                            </span>
                          </div>

                          {parent.description && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                              {parent.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right action buttons */}
                      <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                        {/* Toggle Blogs Drawer */}
                        {recentBlogs.length > 0 && (
                          <button
                            type="button"
                            onClick={() => toggleExpand(parent.id)}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                          >
                            <BookOpen size={13} />
                            <span>{isExpanded ? 'Hide Blogs' : 'View Blogs'}</span>
                            <ChevronDown
                              size={13}
                              className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                            />
                          </button>
                        )}

                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => startEdit(parent)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-red-600 bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/40 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit3 size={13} />
                          <span>Edit</span>
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => setCategoryToDelete(parent)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                          title="Delete category"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* ── Blogs Preview Drawer ── */}
                    {isExpanded && recentBlogs.length > 0 && (
                      <div className="mt-4 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                        <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-200/60 dark:border-slate-700/60">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                            <FileText size={13} /> Recent Blogs in {parent.name}
                          </span>
                          <Link
                            href={`/ourcms/articles?category=${parent.id}`}
                            className="text-xs font-semibold text-red-600 hover:underline flex items-center gap-1"
                          >
                            View all ({parent.articles_count}) →
                          </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                          {recentBlogs.map((art) => (
                            <div
                              key={art.id}
                              className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center gap-3 shadow-2xs"
                            >
                              {art.cover_image_url ? (
                                <img
                                  src={art.cover_image_url}
                                  alt={art.title}
                                  className="w-12 h-12 rounded-md object-cover shrink-0 border border-slate-100 dark:border-slate-800"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center shrink-0">
                                  <FileText size={18} />
                                </div>
                              )}

                              <div className="flex-1 min-w-0">
                                <Link
                                  href={`/ourcms/articles/${art.id}/edit`}
                                  className="font-semibold text-xs text-slate-900 dark:text-white hover:text-red-600 dark:hover:text-red-400 truncate block"
                                >
                                  {art.title}
                                </Link>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="font-mono text-[10px] text-slate-400 truncate">
                                    /{art.slug}
                                  </span>
                                  <span
                                    className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded ${
                                      art.status === 'published'
                                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                    }`}
                                  >
                                    {art.status}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ── Subcategories Tree ── */}
                    {subcategories.length > 0 && (
                      <div className="mt-4 ml-6 sm:ml-10 space-y-2 border-l-2 border-red-200 dark:border-red-950/80 pl-4 sm:pl-6">
                        {subcategories.map((sub) => (
                          <div
                            key={sub.id}
                            className="p-3 bg-slate-50/70 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              {sub.cover_image ? (
                                <img
                                  src={sub.cover_image}
                                  alt={sub.name}
                                  className="w-8 h-8 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0">
                                  <Layers size={15} />
                                </div>
                              )}

                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                                    {sub.name}
                                  </span>
                                  <a
                                    href={`/category/${sub.slug}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-mono text-[11px] text-slate-500 hover:text-red-600 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 flex items-center gap-1"
                                  >
                                    <span>/category/{sub.slug}</span>
                                    <ArrowUpRight size={10} />
                                  </a>
                                  <span className="text-[11px] font-medium text-slate-400">
                                    ({sub.articles_count || 0} blogs)
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                              <button
                                type="button"
                                onClick={() => startEdit(sub)}
                                className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-red-600 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => setCategoryToDelete(sub)}
                                className="text-xs font-semibold text-slate-400 hover:text-red-600 p-1 transition-colors cursor-pointer"
                                title="Delete sub-category"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {topLevelCategories.length === 0 && (
                <div className="p-12 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
                    <Folder size={24} />
                  </div>
                  <h4 className="font-bold text-slate-700 dark:text-slate-200 text-base mb-1">
                    No categories found
                  </h4>
                  <p className="text-sm text-slate-400 max-w-sm mx-auto">
                    {searchQuery
                      ? `No category matching "${searchQuery}". Try a different search.`
                      : 'Get started by adding your first category on the left.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Delete Confirmation Modal */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40">
                <Trash2 size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete Category</h3>
                <p className="text-xs text-slate-400">Remove category from navigation.</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300">
              Are you sure you want to delete <strong className="text-slate-900 dark:text-white">&quot;{categoryToDelete.name}&quot;</strong>?
            </p>

            {categoryToDelete.articles_count && categoryToDelete.articles_count > 0 ? (
              <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 p-2.5 rounded-xl border border-amber-200 dark:border-amber-800/50">
                Note: {categoryToDelete.articles_count} article(s) in this category will be preserved and unlinked.
              </p>
            ) : null}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCategoryToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteCategory}
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
