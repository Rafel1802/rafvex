import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/Button';
import { 
  Plus, Edit, Trash2, ExternalLink, FileText, Folder, FolderX, Search, X, 
  ChevronLeft, ChevronRight, CornerDownRight, Filter, Layers, CheckCircle2
} from 'lucide-react';
import { format } from 'date-fns';

export default function Index({ auth, articles, categories = [], uncategorizedCount = 0, filters = {} }: any) {
  const [articleToDelete, setArticleToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState(filters.search || '');
  const categoryScrollRef = useRef<HTMLDivElement>(null);

  // Sync searchQuery when filters.search prop changes
  useEffect(() => {
    setSearchQuery(filters.search || '');
  }, [filters.search]);

  // Auto search on type (debounced 350ms - no need to press enter)
  const isSearchFirst = useRef(true);
  useEffect(() => {
    if (isSearchFirst.current) {
      isSearchFirst.current = false;
      return;
    }
    const timer = setTimeout(() => {
      handleFilterChange({ search: searchQuery });
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoryScrollRef.current) {
      const offset = direction === 'left' ? -260 : 260;
      categoryScrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const handleFilterChange = (updates: { category?: string; subcategory?: string; status?: string; search?: string }) => {
    const currentCategory = updates.category !== undefined ? updates.category : filters.category;
    const currentSubcategory = updates.subcategory !== undefined ? updates.subcategory : filters.subcategory;
    const currentStatus = updates.status !== undefined ? updates.status : filters.status;
    const currentSearch = updates.search !== undefined ? updates.search : searchQuery;

    const query: Record<string, string> = {};
    if (currentCategory && currentCategory !== 'all') query.category = currentCategory;
    if (currentSubcategory && currentSubcategory !== 'all') query.subcategory = currentSubcategory;
    if (currentStatus && currentStatus !== 'all') query.status = currentStatus;
    if (currentSearch && currentSearch.trim()) query.search = currentSearch.trim();

    router.get('/ourcms/articles', query, {
      preserveState: true,
      preserveScroll: true,
      replace: true,
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleFilterChange({ search: searchQuery });
  };

  const resetAllFilters = () => {
    setSearchQuery('');
    router.get('/ourcms/articles', {}, {
      preserveState: true,
      preserveScroll: true,
      replace: true,
    });
  };

  const hasActiveFilters = Boolean(
    (filters.category && filters.category !== 'all') ||
    (filters.subcategory && filters.subcategory !== 'all') ||
    (filters.status && filters.status !== 'all') ||
    Boolean(filters.search)
  );

  const activeCategoryObj = useMemo(() => {
    if (!filters.category || filters.category === 'all') return null;
    if (filters.category === 'uncategorized') {
      return { id: 'uncategorized', name: 'Uncategorized' };
    }
    return categories.find((c: any) => String(c.id) === String(filters.category)) || null;
  }, [categories, filters.category]);

  const confirmDelete = () => {
    if (!articleToDelete) return;
    setIsDeleting(true);
    router.delete(`/ourcms/articles/${articleToDelete.id}`, {
      preserveScroll: true,
      onFinish: () => {
        setIsDeleting(false);
        setArticleToDelete(null);
      },
    });
  };

  return (
    <AdminLayout auth={auth}>
      <Head title="Articles - Rafvex CMS" />
      
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-display">Articles</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your publication stories, categories, URL slugs, and featured media.
          </p>
        </div>
        <Link href="/ourcms/articles/create">
          <Button className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-xs">
            <Plus size={16} /> New Article
          </Button>
        </Link>
      </div>

      {/* ── Enhanced Filter Section (Slide Left/Right & Dropdown) ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs mb-6 space-y-3.5">
        
        {/* Top Controls: Search + Direct Dropdowns + Status + Reset */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
            
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[200px] max-w-sm">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search articles by headline..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    handleFilterChange({ search: undefined });
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  title="Clear search"
                >
                  <X size={12} />
                </button>
              )}
            </form>

            {/* Dropdown 1: Category & Subcategory Picker */}
            <div className="relative">
              <select
                value={
                  filters.subcategory && filters.subcategory !== 'all'
                    ? `sub:${filters.subcategory}`
                    : filters.category && filters.category !== 'all'
                    ? `cat:${filters.category}`
                    : 'all'
                }
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'all') {
                    handleFilterChange({ category: undefined, subcategory: undefined });
                  } else if (val.startsWith('cat:')) {
                    handleFilterChange({ category: val.replace('cat:', ''), subcategory: undefined });
                  } else if (val.startsWith('sub:')) {
                    handleFilterChange({ subcategory: val.replace('sub:', '') });
                  }
                }}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
              >
                <option value="all">📂 All Categories</option>
                <option value="cat:uncategorized">
                  📁 Uncategorized {uncategorizedCount > 0 ? `(${uncategorizedCount})` : ''}
                </option>
                {categories.map((cat: any) => (
                  <React.Fragment key={cat.id}>
                    <option value={`cat:${cat.id}`}>📁 {cat.name} (All)</option>
                    {cat.children && cat.children.map((sub: any) => (
                      <option key={sub.id} value={`sub:${sub.id}`}>
                        &nbsp;&nbsp;&nbsp;&nbsp;↳ {sub.name}
                      </option>
                    ))}
                  </React.Fragment>
                ))}
              </select>
            </div>

            {/* Dropdown 2: Status Picker */}
            <div className="relative">
              <select
                value={filters.status || 'all'}
                onChange={(e) => handleFilterChange({ status: e.target.value === 'all' ? undefined : e.target.value })}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </div>
          </div>

          {/* Right stats & clear */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
              {articles.total !== undefined ? articles.total : articles.data.length} articles
            </span>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors cursor-pointer"
              >
                <X size={13} /> Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* ── Slide Left / Right Categories Bar ── */}
        <div className="relative flex items-center pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
          {/* Left Arrow Button */}
          <button
            type="button"
            onClick={() => scrollCategories('left')}
            className="hidden sm:flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 mr-2 shrink-0 transition-colors shadow-xs"
            title="Slide categories left"
          >
            <ChevronLeft size={15} />
          </button>

          {/* Horizontally scrollable category pills */}
          <div
            ref={categoryScrollRef}
            className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth flex-1 py-1"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {/* All Categories Pill */}
            <button
              type="button"
              onClick={() => handleFilterChange({ category: undefined, subcategory: undefined })}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                (!filters.category || filters.category === 'all') && (!filters.subcategory || filters.subcategory === 'all')
                  ? 'bg-red-600 text-white shadow-xs font-bold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Folder size={13} />
              <span>All Categories</span>
            </button>

            {/* Uncategorized Pill */}
            <button
              type="button"
              onClick={() => {
                if (filters.category === 'uncategorized') {
                  handleFilterChange({ category: undefined, subcategory: undefined });
                } else {
                  handleFilterChange({ category: 'uncategorized', subcategory: undefined });
                }
              }}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                filters.category === 'uncategorized'
                  ? 'bg-red-600 text-white shadow-xs font-bold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <FolderX size={13} />
              <span>Uncategorized</span>
              {uncategorizedCount > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  filters.category === 'uncategorized'
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}>
                  {uncategorizedCount}
                </span>
              )}
            </button>

            {/* Each Parent Category Pill */}
            {categories.map((cat: any) => {
              const isSelected = String(filters.category) === String(cat.id);
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    if (isSelected) {
                      // Toggle off if already selected
                      handleFilterChange({ category: undefined, subcategory: undefined });
                    } else {
                      handleFilterChange({ category: String(cat.id), subcategory: undefined });
                    }
                  }}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-red-600 text-white shadow-xs font-bold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>{cat.name}</span>
                  {cat.children && cat.children.length > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                    }`}>
                      {cat.children.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Arrow Button */}
          <button
            type="button"
            onClick={() => scrollCategories('right')}
            className="hidden sm:flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 ml-2 shrink-0 transition-colors shadow-xs"
            title="Slide categories right"
          >
            <ChevronRight size={15} />
          </button>
        </div>

        {/* ── Subcategories Pill Row (Shown when active category has subcategories) ── */}
        {activeCategoryObj && activeCategoryObj.children && activeCategoryObj.children.length > 0 && (
          <div className="flex items-center gap-2 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 overflow-x-auto pb-1 text-xs animate-in fade-in slide-in-from-top-1 duration-150">
            <span className="text-slate-400 font-semibold shrink-0 flex items-center gap-1 pl-1">
              <CornerDownRight size={13} className="text-red-500" />
              Subcategories:
            </span>
            <button
              type="button"
              onClick={() => handleFilterChange({ subcategory: undefined })}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                !filters.subcategory || filters.subcategory === 'all'
                  ? 'bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400 border border-red-200 dark:border-red-900 font-bold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              All in {activeCategoryObj.name}
            </button>
            {activeCategoryObj.children.map((sub: any) => {
              const isSubSelected = String(filters.subcategory) === String(sub.id);
              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => {
                    if (isSubSelected) {
                      handleFilterChange({ subcategory: undefined });
                    } else {
                      handleFilterChange({ subcategory: String(sub.id) });
                    }
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isSubSelected
                      ? 'bg-red-600 text-white shadow-xs font-bold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {sub.name}
                </button>
              );
            })}
          </div>
        )}

      </div>

      {/* ── Articles Table ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4">Story & Slug</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Author</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {articles.data.map((article: any) => (
                <tr key={article.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  {/* Image + Title + Slug */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3.5">
                      {article.cover_image_url ? (
                        <img
                          src={article.cover_image_url}
                          alt={article.title}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
                          <FileText size={18} />
                        </div>
                      )}

                      <div className="min-w-0">
                        <Link
                          href={`/ourcms/articles/${article.id}/edit`}
                          className="font-bold text-slate-900 dark:text-white hover:text-red-600 dark:hover:text-red-400 line-clamp-1 text-sm transition-colors"
                        >
                          {article.title}
                        </Link>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-xs font-mono text-slate-400 line-clamp-1">
                            /article/{article.slug}
                          </span>
                          <a
                            href={`/article/${article.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-400 hover:text-red-600 transition-colors"
                            title="Preview article"
                          >
                            <ExternalLink size={12} />
                          </a>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold capitalize
                      ${article.status === 'published' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' : ''}
                      ${article.status === 'draft' ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700' : ''}
                      ${article.status === 'scheduled' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800' : ''}
                      ${article.status === 'review' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800' : ''}
                    `}>
                      {article.status}
                    </span>
                  </td>

                  {/* Category & Subcategory Badge */}
                  <td className="px-6 py-4">
                    {article.category ? (
                      <div className="flex flex-col items-start gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            if (article.category.parent_id) {
                              handleFilterChange({ category: String(article.category.parent_id), subcategory: String(article.category.id) });
                            } else {
                              handleFilterChange({ category: String(article.category.id), subcategory: undefined });
                            }
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 transition-colors border border-slate-200/60 dark:border-slate-700/60 cursor-pointer"
                          title="Filter by this category"
                        >
                          <Folder size={12} className="text-red-500" />
                          <span>{article.category.name}</span>
                        </button>
                        {article.category.parent && (
                          <span className="text-[10px] text-slate-400 pl-1 font-medium">
                            in {article.category.parent.name}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Uncategorized</span>
                    )}
                  </td>

                  {/* Author */}
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300 text-xs">
                    {article.author?.name || 'Admin'}
                  </td>

                  {/* Date */}
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400 whitespace-nowrap text-xs">
                    {article.published_at ? format(new Date(article.published_at), 'MMM d, yyyy') : '-'}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right space-x-1.5 whitespace-nowrap">
                    <Link href={`/ourcms/articles/${article.id}/edit`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600 dark:hover:text-red-400">
                        <Edit size={15} />
                      </Button>
                    </Link>
                    <button
                      type="button"
                      onClick={() => setArticleToDelete(article)}
                      className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 dark:hover:text-red-400 transition-colors cursor-pointer"
                      title="Move to Trash"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
              
              {articles.data.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                    <p className="font-semibold text-sm">No articles found.</p>
                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={resetAllFilters}
                        className="mt-2 text-xs text-red-600 hover:underline font-bold"
                      >
                        Reset filters to see all articles
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {articles.links && articles.links.length > 3 && (
        <div className="mt-6 flex justify-center gap-1.5">
          {articles.links.map((link: any, i: number) => (
            <Link
              key={i}
              href={link.url || '#'}
              dangerouslySetInnerHTML={{ __html: link.label }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors
                ${link.active ? 'bg-red-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'}
                ${!link.url ? 'opacity-40 cursor-not-allowed' : ''}
              `}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {articleToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40">
                <Trash2 size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Move Article to Trash</h3>
                <p className="text-xs text-slate-400">This article will be moved to trash.</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300">
              Are you sure you want to delete <strong className="text-slate-900 dark:text-white">&quot;{articleToDelete.title}&quot;</strong>?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setArticleToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-700 active:scale-95 text-white transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                {isDeleting ? 'Moving to Trash...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
