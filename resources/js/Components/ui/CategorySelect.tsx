import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Search, X, Check, Folder, Layers } from 'lucide-react';

interface Category {
  id: number | string;
  name: string;
  slug?: string;
  parent_id?: number | string | null;
  children?: Category[];
}

interface CategorySelectProps {
  categories: Category[];
  value: number | string;
  onChange: (id: string | number) => void;
  error?: string;
  placeholder?: string;
  className?: string;
}

export default function CategorySelect({
  categories = [],
  value,
  onChange,
  error,
  placeholder = 'Select Category...',
  className = '',
}: CategorySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchTerm('');
    }
  }, [isOpen]);

  // Build hierarchical structure: Parent -> Children
  const { safeCategories, groupedCategories, categoryMap } = useMemo(() => {
    const uniqueMap = new Map<string, Category>();
    const flatten = (cats: any[]) => {
      if (!Array.isArray(cats)) return;
      cats.forEach((c) => {
        if (!c || c.id === undefined || c.id === null) return;
        const idKey = String(c.id);
        if (!uniqueMap.has(idKey)) {
          uniqueMap.set(idKey, c);
        }
        if (Array.isArray(c.children) && c.children.length > 0) {
          flatten(c.children);
        }
      });
    };

    const rawList = Array.isArray(categories)
      ? categories
      : (categories && typeof categories === 'object')
      ? Object.values(categories)
      : [];
    flatten(rawList);

    const safeList = Array.from(uniqueMap.values());

    const map = new Map<string, Category>();
    safeList.forEach((c) => {
      const strId = String(c.id);
      map.set(strId, c);
      if (c.slug) {
        map.set(String(c.slug), c);
      }
    });

    const parents: Category[] = [];
    const orphanChildren: Category[] = [];

    safeList.forEach((c) => {
      if (!c.parent_id || c.parent_id === '0' || c.parent_id === 0) {
        parents.push({ ...c, children: [] });
      }
    });

    safeList.forEach((c) => {
      if (c.parent_id && c.parent_id !== '0' && c.parent_id !== 0) {
        const parent = parents.find((p) => String(p.id) === String(c.parent_id));
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(c);
        } else {
          orphanChildren.push(c);
        }
      }
    });

    // If there are top-level parents with children or standalone, group them
    const groups: { parent: Category; children: Category[] }[] = [];

    parents.forEach((p) => {
      groups.push({
        parent: p,
        children: p.children || [],
      });
    });

    if (orphanChildren.length > 0) {
      groups.push({
        parent: { id: 'other', name: 'Other Categories', parent_id: null },
        children: orphanChildren,
      });
    }

    return { safeCategories: safeList, groupedCategories: groups, categoryMap: map };
  }, [categories]);

  // Filter groups based on search term
  const filteredGroups = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return groupedCategories;

    return groupedCategories
      .map((group) => {
        const parentMatches = group.parent.name.toLowerCase().includes(term);
        const matchingChildren = group.children.filter((child) =>
          child.name.toLowerCase().includes(term)
        );

        if (parentMatches) {
          return group;
        }

        if (matchingChildren.length > 0) {
          return {
            ...group,
            children: matchingChildren,
          };
        }

        return null;
      })
      .filter((g): g is { parent: Category; children: Category[] } => g !== null);
  }, [groupedCategories, searchTerm]);

  // Selected item display: robustly match string, number, or object value
  const selectedCategory = useMemo(() => {
    if (value === '' || value === null || value === undefined) return null;
    const valStr = typeof value === 'object' && value !== null
      ? String((value as any).id ?? '').trim()
      : String(value).trim();
    if (!valStr) return null;

    if (categoryMap.has(valStr)) {
      return categoryMap.get(valStr) || null;
    }

    return (
      safeCategories.find(
        (c) => String(c.id) === valStr || (c.slug && String(c.slug) === valStr)
      ) || null
    );
  }, [value, categoryMap, safeCategories]);

  const selectedParent = useMemo(() => {
    if (!selectedCategory?.parent_id) return null;
    const pId = String(selectedCategory.parent_id);
    if (categoryMap.has(pId)) {
      return categoryMap.get(pId) || null;
    }
    return safeCategories.find((c) => String(c.id) === pId) || null;
  }, [selectedCategory, categoryMap, safeCategories]);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl border text-sm text-left transition-all ${
          error
            ? 'border-red-500 ring-1 ring-red-500 bg-red-50/20 dark:bg-red-950/20'
            : isOpen
            ? 'border-red-500 ring-2 ring-red-500/20 bg-white dark:bg-slate-900'
            : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-600'
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          <Layers
            size={16}
            className={selectedCategory ? 'text-red-500 shrink-0' : 'text-slate-400 shrink-0'}
          />
          {selectedCategory ? (
            <div className="truncate flex items-center gap-1.5">
              {selectedParent && (
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium shrink-0">
                  {selectedParent.name} &gt;
                </span>
              )}
              <span className="font-semibold text-slate-900 dark:text-white truncate">
                {selectedCategory.name}
              </span>
            </div>
          ) : (value !== '' && value !== null && value !== undefined) ? (
            <span className="font-semibold text-slate-900 dark:text-white truncate">
              Category #{String(value)}
            </span>
          ) : (
            <span className="text-slate-400 truncate">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {(value !== '' && value !== null && value !== undefined) && (
            <span
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onChange('');
              }}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title="Clear selection"
            >
              <X size={14} />
            </span>
          )}
          <ChevronDown
            size={16}
            className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
          {/* Search Input Bar */}
          <div className="p-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search categories (e.g. AI, iPhone, Windows)..."
                className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Categories List */}
          <div className="max-h-72 overflow-y-auto p-1.5 space-y-2 custom-admin-scroll divide-y divide-slate-100 dark:divide-slate-800/60">
            {filteredGroups.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No categories match <span className="font-semibold text-slate-600 dark:text-slate-300">"{searchTerm}"</span>
              </div>
            ) : (
              filteredGroups.map((group) => {
                const isParentSelected = String(value) === String(group.parent.id);
                return (
                  <div key={group.parent.id} className="pt-2 first:pt-0">
                    {/* Channel / Main Header */}
                    <div
                      onClick={() => {
                        onChange(group.parent.id);
                        setIsOpen(false);
                      }}
                      className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                        isParentSelected
                          ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-bold'
                          : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/70 font-bold'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Folder
                          size={14}
                          className={
                            isParentSelected
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-slate-400 group-hover:text-red-500'
                          }
                        />
                        <span className="tracking-wide uppercase text-[11px]">
                          {group.parent.name}
                        </span>
                      </div>
                      {isParentSelected && <Check size={14} className="text-red-600 dark:text-red-400" />}
                    </div>

                    {/* Subcategories (Indented with bullet) */}
                    {group.children.length > 0 && (
                      <div className="ml-3 pl-3 border-l-2 border-slate-100 dark:border-slate-800 my-1 space-y-0.5">
                        {group.children.map((child) => {
                          const isChildSelected = String(value) === String(child.id);
                          return (
                            <button
                              key={child.id}
                              type="button"
                              onClick={() => {
                                onChange(child.id);
                                setIsOpen(false);
                              }}
                              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-left transition-colors ${
                                isChildSelected
                                  ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-semibold'
                                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <span className="text-slate-300 dark:text-slate-600 text-base leading-none">
                                  •
                                </span>
                                <span className="truncate">{child.name}</span>
                              </div>
                              {isChildSelected && (
                                <Check size={14} className="text-red-600 dark:text-red-400 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
