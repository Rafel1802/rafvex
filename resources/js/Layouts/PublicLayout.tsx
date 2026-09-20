import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, usePage, Head, router } from '@inertiajs/react';
import { 
  Search, X, ArrowRight, ExternalLink, Shield, Compass, BookOpen, 
  Sparkles, Loader2, FileText, Clock, User, LogOut, Bookmark, 
  History, LayoutDashboard, ChevronDown, Bell, Sun, Moon, Headphones, Radio,
  ChevronLeft, ChevronRight, Mail
} from 'lucide-react';
import axios from 'axios';
import SponsoredPopupModal from '@/Components/Public/SponsoredPopupModal';
import AuthModal from '@/Components/Auth/AuthModal';
import NotificationDropdown from '@/Components/Public/NotificationDropdown';
import RealtimeToastBanner from '@/Components/Public/RealtimeToastBanner';
import CookieConsent from '@/Components/Public/CookieConsent';
import { usePusher } from '@/hooks/usePusher';

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return '';
  }
};

/* ── Top Bar Main Links (Matches Image 1) ── */
const MAIN_NAV_LINKS = [
  { label: 'Home', href: '/', slug: '' },
  { label: 'AI Tools', href: '/category/ai-tools', slug: 'ai-tools' },
  { label: 'Phones', href: '/category/android-iphone', slug: 'android-iphone' },
  { label: 'Computing', href: '/category/windows-mac', slug: 'windows-mac' },
  { label: 'Apps', href: '/category/websites-apps', slug: 'websites-apps' },
  { label: 'Security', href: '/category/basic-online-security', slug: 'basic-online-security' },
  { label: 'How-To', href: '/category/troubleshooting', slug: 'troubleshooting' },
  { label: 'Reviews', href: '/category/reviews', slug: 'reviews' },
  { label: 'English', href: '/category/english-reading-stories', slug: 'english-reading-stories' },
];

/* ── Editorial Sub-Header Bar (Popular, News & Sitemap) ── */
const EDITORIAL_TICKER = [
  { label: 'POPULAR GUIDES', href: '/popular' },
  { label: 'TECH DISPATCHES', href: '/news' },
  { label: 'TOPIC DIRECTORY', href: '/sitemap' },
];

export default function PublicLayout({ children, auth }: any) {
  const { props, url } = usePage<any>();
  const site = props.site ?? {};
  const siteName = site.name ?? 'Rafvex';
  const siteLogo = site.logo ?? null;
  const megaMenuCategories = props.mega_menu_categories ?? [];
  const isHomePage = url === '/' || url === '' || url.startsWith('/?');
  const activeBreakingNews = props.active_breaking_news ?? null;

  // Normalize breaking items from props (news and blogs)
  const rawBreakingItems: any[] = Array.isArray(props.breaking_items)
    ? props.breaking_items
    : props.active_breaking_news
      ? (Array.isArray(props.active_breaking_news) ? props.active_breaking_news : [props.active_breaking_news])
      : [];

  // Filter only items with a valid non-empty title string
  const breakingItems = rawBreakingItems.filter(
    (item) => item && typeof item === 'object' && typeof item.title === 'string' && item.title.trim().length > 0
  );

  const [breakingIndex, setBreakingIndex] = useState(0);
  const [isTickerPaused, setIsTickerPaused] = useState(false);

  // Automatically slide through breaking stories every 4.5 seconds if multiple items exist
  useEffect(() => {
    if (breakingItems.length <= 1 || isTickerPaused) return;
    const timer = setInterval(() => {
      setBreakingIndex((prev) => (prev + 1) % breakingItems.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [breakingItems.length, isTickerPaused]);

  const currentBreaking = breakingItems.length > 0 ? breakingItems[breakingIndex % breakingItems.length] : null;

  const [scrolled, setScrolled] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [activeNavDropdown, setActiveNavDropdown] = useState<string | null>(null);
  const dropdownTimeoutRef = useRef<any>(null);

  const handleNavMouseEnter = (slug: string) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
      dropdownTimeoutRef.current = null;
    }
    if (slug) {
      setActiveNavDropdown(slug);
    } else {
      setActiveNavDropdown(null);
    }
  };

  const handleNavMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveNavDropdown(null);
    }, 180);
  };

  const getCategoryData = (slug: string) => {
    if (!slug) return null;
    return megaMenuCategories.find(
      (c: any) =>
        c.slug === slug ||
        (slug === 'troubleshooting' && (c.slug === 'troubleshooting-how-to' || c.slug === 'troubleshooting')) ||
        (slug === 'english-reading-stories' && (c.slug === 'english-reading-stories' || c.slug.includes('english')))
    );
  };

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchTotal, setSearchTotal] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [searchActiveIndex, setSearchActiveIndex] = useState(-1);
  const [menuSearch, setMenuSearch] = useState('');

  // Public Theme State (Default Light, Persistent Dark via localStorage 'rafvex_public_theme')
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('rafvex_public_theme') || localStorage.getItem('rafvex_theme');
      const initialDark = savedTheme === 'dark';
      if (initialDark) {
        setTheme('dark');
        document.documentElement.classList.add('dark');
        document.documentElement.style.backgroundColor = '#0b1120';
      } else {
        setTheme('light');
        document.documentElement.classList.remove('dark');
        document.documentElement.style.backgroundColor = '';
      }
    } catch (e) {}

    const handleThemeEvent = (e: any) => {
      const newTheme = e.detail?.theme;
      if (newTheme === 'dark' || newTheme === 'light') {
        setTheme(newTheme);
      }
    };
    window.addEventListener('rafvex-public-theme-changed', handleThemeEvent);
    return () => window.removeEventListener('rafvex-public-theme-changed', handleThemeEvent);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    try {
      localStorage.setItem('rafvex_public_theme', nextTheme);
      localStorage.setItem('rafvex_theme', nextTheme);
      if (nextTheme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.style.backgroundColor = '#0b1120';
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.style.backgroundColor = '';
      }
      window.dispatchEvent(new CustomEvent('rafvex-public-theme-changed', { detail: { theme: nextTheme } }));
    } catch (e) {}
  };

  const isDark = theme === 'dark';

  // Authentication & Notification State
  const currentUser = props.auth?.user;
  const isStaffUser = Boolean(
    currentUser?.is_staff ||
    currentUser?.roles?.some((r: string) => ['Super Admin', 'Administrator', 'Editor', 'Writer', 'Author'].includes(r))
  );
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Pusher Real-time Notifications
  const { activeToast, dismissToast, unreadCountIncrement, resetUnreadIncrement } = usePusher(currentUser?.id);

  // Push Notifications: Only initialize for authenticated users (signed in or newly created account)
  useEffect(() => {
    if (currentUser?.id && typeof (window as any).initPusherBeams === 'function') {
      const role = isStaffUser ? 'admin' : 'member';
      (window as any).initPusherBeams(role, currentUser.id);
    }
  }, [currentUser?.id, isStaffUser]);

  const searchRef = useRef<HTMLInputElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);
  const menuSearchRef = useRef<HTMLInputElement>(null);

  // Close user dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Listen for global open-auth events from cards or comment forms
  useEffect(() => {
    const handleOpenAuth = (e: any) => {
      setAuthModalMode(e.detail?.mode || 'login');
      setAuthModalOpen(true);
    };
    window.addEventListener('rafvex:open-auth', handleOpenAuth);
    return () => window.removeEventListener('rafvex:open-auth', handleOpenAuth);
  }, []);

  const handleLogout = async () => {
    try {
      if ((window as any).beamsClient && typeof (window as any).beamsClient.clearDeviceInterests === 'function') {
        try {
          await (window as any).beamsClient.clearDeviceInterests();
        } catch (e) {}
      }
      await axios.post('/auth/logout');
      setUserMenuOpen(false);
      router.reload();
    } catch (e) {
      window.location.href = '/';
    }
  };

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const isOver = window.scrollY > 20;
          setScrolled((prev) => (prev !== isOver ? isOver : prev));
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [searchOpen]);

  useEffect(() => {
    if (megaMenuOpen && menuSearchRef.current) {
      setTimeout(() => menuSearchRef.current?.focus(), 50);
    }
  }, [megaMenuOpen]);

  useEffect(() => {
    document.body.style.overflow = searchOpen || megaMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [searchOpen, megaMenuOpen]);

  // Global ESC key listener to automatically close mega menu, search, user dropdown, auth modal, and nav dropdowns
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Esc' || e.keyCode === 27) {
        setMegaMenuOpen(false);
        setSearchOpen(false);
        setUserMenuOpen(false);
        setActiveNavDropdown(null);
        setAuthModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);



  const closeSearchModal = () => {
    setSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
    setSearchTotal(0);
    setIsSearching(false);
    setSearchActiveIndex(-1);
  };

  // Close search modal on Escape key globally
  useEffect(() => {
    if (!searchOpen) return;
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeSearchModal();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [searchOpen]);

  // Live search debounced fetch
  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) {
      setSearchResults([]);
      setSearchTotal(0);
      setIsSearching(false);
      setSearchActiveIndex(-1);
      return;
    }

    setIsSearching(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      fetch(`/api/search/live?q=${encodeURIComponent(q)}`, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
      })
        .then(res => res.json())
        .then(data => {
          setSearchResults(data.results || []);
          setSearchTotal(data.total || (data.results ? data.results.length : 0));
          setIsSearching(false);
          setSearchActiveIndex(-1);
        })
        .catch(err => {
          if (err.name !== 'AbortError') {
            setIsSearching(false);
          }
        });
    }, 200);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchActiveIndex >= 0 && searchResults[searchActiveIndex]) {
      const slug = searchResults[searchActiveIndex].slug;
      closeSearchModal();
      window.location.href = `/article/${slug}`;
      return;
    }
    if (searchQuery.trim().length >= 2) {
      const q = searchQuery.trim();
      closeSearchModal();
      window.location.href = `/search?q=${encodeURIComponent(q)}`;
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (searchResults.length > 0) {
        setSearchActiveIndex(prev => {
          const next = prev < searchResults.length - 1 ? prev + 1 : 0;
          const container = resultsContainerRef.current;
          if (container && container.children[next]) {
            (container.children[next] as HTMLElement).scrollIntoView({ block: 'nearest' });
          }
          return next;
        });
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (searchResults.length > 0) {
        setSearchActiveIndex(prev => {
          const next = prev > 0 ? prev - 1 : searchResults.length - 1;
          const container = resultsContainerRef.current;
          if (container && container.children[next]) {
            (container.children[next] as HTMLElement).scrollIntoView({ block: 'nearest' });
          }
          return next;
        });
      }
    } else if (e.key === 'Escape') {
      closeSearchModal();
    }
  };

  const handleMenuSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (menuSearch.trim().length >= 2) {
      window.location.href = `/search?q=${encodeURIComponent(menuSearch.trim())}`;
    }
  };

  // Safely extract megaMenuCategories regardless of whether Inertia passed an Array, Object, or null
  const rawMegaMenuCategories = useMemo(() => {
    const raw = props.mega_menu_categories;
    if (Array.isArray(raw)) return raw;
    if (raw && typeof raw === 'object') return Object.values(raw);
    return [];
  }, [props.mega_menu_categories]);

  // Filter categories for the mega menu based on search query, ensuring empty subcategories are hidden
  const displayMegaCategories = useMemo(() => {
    return rawMegaMenuCategories
      .map((cat: any) => {
        if (!cat) return null;
        const rawSubs = cat.subcategories;
        const subList = Array.isArray(rawSubs) 
          ? rawSubs 
          : (rawSubs && typeof rawSubs === 'object') 
            ? Object.values(rawSubs) 
            : [];

        // Exclude subcategories that have 0 articles
        const validSubcats = subList.filter((s: any) => s && (s.count === undefined || s.count > 0));

        if (!menuSearch.trim()) {
          return {
            ...cat,
            subcategories: validSubcats,
          };
        }

        const q = menuSearch.toLowerCase().trim();
        const catMatch = (cat.name || '').toLowerCase().includes(q) || ((cat.description || '').toLowerCase().includes(q));
        const matchedSubs = validSubcats.filter((s: any) => (s?.name || '').toLowerCase().includes(q));

        if (catMatch || matchedSubs.length > 0) {
          return {
            ...cat,
            subcategories: catMatch ? validSubcats : matchedSubs,
          };
        }
        return null;
      })
      .filter(Boolean);
  }, [rawMegaMenuCategories, menuSearch]);

  return (
    <div className="min-h-screen flex flex-col bg-[#fdfcfb] dark:bg-[#0b1120] text-[#141414] dark:text-slate-100 transition-colors duration-200">
      <Head>
        <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png?v=2" head-key="favicon-48" />
        <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png?v=2" head-key="favicon-96" />
        <link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png?v=2" head-key="favicon-192" />
        <link rel="icon" type="image/png" sizes="512x512" href="/android-chrome-512x512.png?v=2" head-key="favicon-512" />
        <link rel="icon" href="/favicon.ico?v=2" sizes="48x48 32x32 16x16" head-key="favicon-ico" />
        <link rel="shortcut icon" href="/favicon.ico?v=2" head-key="favicon-shortcut" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=2" head-key="apple-touch-icon" />
      </Head>
      
      {/* ── STICKY HEADER ── */}
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 dark:bg-[#0b1120]/95 border-b border-slate-200 dark:border-slate-800 shadow-xs backdrop-blur-md'
            : 'bg-white/90 dark:bg-[#0b1120]/90 border-b border-slate-200/80 dark:border-slate-800/80 backdrop-blur-sm'
        }`}
      >
        {/* Main Header Bar */}
        <div className="w-full max-w-[1320px] mx-auto px-2.5 sm:px-5">
          <div className="flex items-center justify-between min-h-[58px] sm:min-h-[68px] py-1">
            
            {/* Left: Menu Button + Brand Logo */}
            <div className="flex items-center gap-2 sm:gap-3.5 shrink-0">
              {/* Publication Directory Menu Button (Left of Logo) */}
              <div className="relative group/menu-btn shrink-0">
                <button
                  type="button"
                  onClick={() => setMegaMenuOpen(!megaMenuOpen)}
                  aria-label="View more categories"
                  className="group flex flex-col justify-center items-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-red-400 dark:hover:border-red-500 transition-all cursor-pointer shadow-2xs shrink-0"
                >
                  <span className="w-4 sm:w-5 h-[2px] sm:h-[2.5px] rounded-full bg-slate-800 dark:bg-slate-200 group-hover:bg-red-600 transition-colors mb-[3.5px] sm:mb-[4.5px]" />
                  <span className="w-3 sm:w-3.5 self-start ml-2 sm:ml-2.5 h-[2px] sm:h-[2.5px] rounded-full bg-slate-800 dark:bg-slate-200 group-hover:bg-red-600 transition-colors mb-[3.5px] sm:mb-[4.5px]" />
                  <span className="w-4 sm:w-5 h-[2px] sm:h-[2.5px] rounded-full bg-slate-800 dark:bg-slate-200 group-hover:bg-red-600 transition-colors" />
                </button>

                {/* Tooltip on Hover */}
                {!megaMenuOpen && (
                  <div className="pointer-events-none absolute left-0 top-full mt-2 z-30 whitespace-nowrap rounded-lg bg-slate-900/95 dark:bg-slate-800/95 border border-slate-700/50 px-2.5 py-1 text-xs font-semibold text-white shadow-xl opacity-0 scale-95 transition-all duration-150 group-hover/menu-btn:opacity-100 group-hover/menu-btn:scale-100 hidden sm:block">
                    View more categories
                    <div className="absolute -top-1 left-4 w-2 h-2 rotate-45 bg-slate-900/95 dark:bg-slate-800/95 border-t border-l border-slate-700/50" />
                  </div>
                )}
              </div>

              {/* Logo */}
              <Link href="/" className="flex items-center gap-2" style={{ textDecoration: 'none' }}>
                {siteLogo ? (
                  <img
                    src={siteLogo}
                    alt={siteName}
                    className="h-7 sm:h-9 md:h-11 max-h-12 w-auto max-w-[125px] sm:max-w-[180px] md:max-w-[220px] object-contain block hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <img
                      src="/favicon.png"
                      alt={siteName}
                      className="w-7 h-7 sm:w-8 sm:h-8 object-contain block"
                    />
                    <span
                      style={{
                        fontFamily: "'Outfit', sans-serif",
                        fontWeight: 800,
                        letterSpacing: '-0.03em',
                      }}
                      className="text-lg sm:text-xl md:text-2xl text-slate-900 dark:text-white"
                    >
                      {siteName}
                    </span>
                  </div>
                )}
              </Link>
            </div>

            {/* Desktop Navigation Links with Category Dropdown on Hover (Image 3) */}
            <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 text-[13.5px] font-medium text-slate-700 dark:text-slate-200">
              {MAIN_NAV_LINKS.map(link => {
                const isActive = link.href === '/'
                  ? (url === '/' || url === '')
                  : (url === link.href || url.startsWith(link.href + '/'));
                const catData = getCategoryData(link.slug);
                const hasSubcategories = catData && catData.subcategories && catData.subcategories.length > 0;

                return (
                  <div
                    key={link.href}
                    className="relative"
                    onMouseEnter={() => handleNavMouseEnter(link.slug)}
                    onMouseLeave={handleNavMouseLeave}
                  >
                    <Link
                      href={link.href}
                      prefetch="hover"
                      className={`group/navlink flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                        isActive
                          ? 'bg-red-600 text-white font-bold shadow-xs shadow-red-600/30'
                          : 'hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-medium'
                      }`}
                    >
                      <span>{link.label}</span>
                      {hasSubcategories && (
                        <ChevronDown
                          size={11}
                          className={`transition-transform duration-150 ${
                            isActive
                              ? 'text-white/90'
                              : 'text-slate-400 dark:text-slate-500 group-hover/navlink:text-red-600 dark:group-hover/navlink:text-red-400'
                          } ${
                            activeNavDropdown === link.slug ? 'rotate-180' : ''
                          }`}
                        />
                      )}
                    </Link>

                    {/* Hover Dropdown Mega Card */}
                    {hasSubcategories && activeNavDropdown === link.slug && (
                      <div
                        className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50 min-w-[320px] max-w-sm sm:min-w-[360px]"
                        onMouseEnter={() => handleNavMouseEnter(link.slug)}
                        onMouseLeave={handleNavMouseLeave}
                      >
                        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 p-4">
                          <div className="pb-3 mb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <div>
                              <h4 style={{ fontFamily: "'Outfit', sans-serif" }} className="text-sm font-bold text-slate-900 dark:text-white">
                                {catData.name}
                              </h4>
                              {catData.description && (
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                                  {catData.description}
                                </p>
                              )}
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded-full border border-red-100 dark:border-red-900/40">
                              {catData.total_articles || catData.subcategories.reduce((acc: number, s: any) => acc + (s.count || 0), 0)} Stories
                            </span>
                          </div>

                          {/* Subcategories Grid */}
                          <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
                            {catData.subcategories.map((sub: any) => (
                              <Link
                                key={sub.id || sub.slug}
                                href={`/category/${sub.slug}`}
                                prefetch="hover"
                                onClick={() => setActiveNavDropdown(null)}
                                className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 text-xs text-slate-700 dark:text-slate-200 hover:text-red-600 dark:hover:text-red-400 transition-colors group"
                              >
                                <span className="font-semibold">{sub.name}</span>
                                <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 group-hover:text-red-600 dark:group-hover:text-red-400 font-medium">
                                  {sub.count ? `${sub.count} articles` : 'Explore →'}
                                </span>
                              </Link>
                            ))}
                          </div>

                          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800">
                            <Link
                              href={link.href}
                              prefetch="hover"
                              onClick={() => setActiveNavDropdown(null)}
                              className="w-full py-1.5 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 dark:hover:text-red-400 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                            >
                              <span>View All {catData.name} Articles</span>
                              <span>&rarr;</span>
                            </Link>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>

            {/* Actions: Search, Theme Toggle, Notifications, User Profile & Directory */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Search Button */}
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                aria-label="Open search"
                className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-red-400 dark:hover:border-red-500 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 transition-all cursor-pointer shadow-2xs"
                title="Search Articles & Guides"
              >
                <Search size={16} />
              </button>

              {/* Theme Toggle Button (Dark / Light Mode) */}
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-amber-400 dark:hover:border-amber-400 text-slate-600 dark:text-amber-400 hover:text-amber-500 transition-all cursor-pointer shadow-2xs group"
              >
                {isDark ? (
                  <Sun size={17} className="text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
                ) : (
                  <Moon size={17} className="text-slate-600 group-hover:-rotate-12 transition-transform duration-300" />
                )}
              </button>

              {/* Authenticated User: Notification Bell & Profile Dropdown */}
              {currentUser ? (
                <div className="flex items-center gap-2">
                  {/* Real-time Notification Dropdown */}
                  <NotificationDropdown
                    initialUnreadCount={currentUser.unread_notifications_count || 0}
                    unreadCountIncrement={unreadCountIncrement}
                    onResetIncrement={resetUnreadIncrement}
                  />

                  {/* Profile Dropdown Menu */}
                  <div className="relative" ref={userMenuRef}>
                    <button
                      type="button"
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-1.5 p-1 pr-2 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer shadow-2xs"
                      title={currentUser.name}
                    >
                      <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                        {currentUser.avatar ? (
                          <img
                            src={currentUser.avatar}
                            alt={currentUser.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xs font-black text-red-600 dark:text-red-400">
                            {currentUser.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <ChevronDown size={14} className="text-slate-400 dark:text-slate-500 hidden sm:block" />
                    </button>

                    {/* Dropdown Card */}
                    {userMenuOpen && (
                      <div
                        style={{ width: 240 }}
                        className="absolute right-0 mt-2 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150 p-2"
                      >
                        {/* User Identity Header */}
                        <div className="p-2.5 border-b border-slate-100 dark:border-slate-800 mb-1">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {currentUser.name}
                          </p>
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                            {currentUser.email}
                          </p>
                        </div>

                        {/* Navigation Links */}
                        <div className="space-y-0.5 text-xs">
                          <Link
                            href="/my/profile"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50/50 dark:hover:bg-slate-800 transition-colors font-semibold"
                          >
                            <User size={15} />
                            <span>My Profile &amp; Settings</span>
                          </Link>

                          <Link
                            href="/my/profile"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50/50 dark:hover:bg-slate-800 transition-colors font-semibold"
                          >
                            <Bookmark size={15} />
                            <span>Saved Articles</span>
                          </Link>

                          <Link
                            href="/my/profile"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50/50 dark:hover:bg-slate-800 transition-colors font-semibold"
                          >
                            <History size={15} />
                            <span>Reading History</span>
                          </Link>

                          {/* Theme toggle row in dropdown */}
                          <button
                            type="button"
                            onClick={toggleTheme}
                            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50/50 dark:hover:bg-slate-800 transition-colors font-semibold text-xs cursor-pointer"
                          >
                            <div className="flex items-center gap-2.5">
                              {isDark ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-slate-500" />}
                              <span>Theme</span>
                            </div>
                            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
                              {isDark ? 'Dark Mode' : 'Light Mode'}
                            </span>
                          </button>
                        </div>

                        {/* Sign Out Button */}
                        <div className="border-t border-slate-100 dark:border-slate-800 mt-1 pt-1">
                          <button
                            type="button"
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50/50 dark:hover:bg-slate-800 transition-colors font-semibold text-xs cursor-pointer"
                          >
                            <LogOut size={15} />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Guest: Sign In Button */
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalMode('login');
                    setAuthModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-slate-900 hover:bg-red-600 text-white font-bold text-xs sm:text-sm transition-all shadow-xs cursor-pointer"
                  title="Sign In or Register"
                >
                  <User size={15} />
                  <span className="hidden sm:inline">Sign In</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── EDITORIAL SUB-HEADER (PODCAST | POPULAR | NEWS | [SLIDING BREAKING TICKER]) ── ONLY ON HOME PAGE */}
        {isHomePage && (
          <div className="border-t border-slate-200/70 dark:border-slate-800/70 bg-white/80 dark:bg-[#0b1120]/80 backdrop-blur-xs transition-colors">
            <div style={{ maxWidth: 1320, margin: '0 auto', padding: '0 20px' }}>
              <div className="flex items-center justify-between gap-4 h-10 min-w-0">
                <div className="flex items-center gap-5 sm:gap-7 min-w-0 flex-1 overflow-hidden">
                  {/* PODCAST, POPULAR & NEWS */}
                  <div className="flex items-center gap-5 sm:gap-7 shrink-0">
                    {EDITORIAL_TICKER.map((item, idx) => {
                      const IconComp = (item as any).icon;
                      return (
                        <Link
                          key={idx}
                          href={item.href}
                          prefetch="hover"
                          className="inline-flex items-center gap-1.5 text-xs font-black tracking-wider text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 transition-colors uppercase relative py-2 shrink-0"
                        >
                          {IconComp && <IconComp size={13} className="text-red-600 dark:text-red-400 shrink-0" />}
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>

                  {/* Sliding Breaking News/Blogs Ticker */}
                  {currentBreaking && (
                    <div 
                      className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1 overflow-hidden"
                      onMouseEnter={() => setIsTickerPaused(true)}
                      onMouseLeave={() => setIsTickerPaused(false)}
                    >
                      {/* Vertical Divider */}
                      <span className="h-3.5 w-px bg-slate-300 dark:bg-slate-700 shrink-0" aria-hidden="true" />

                      {/* Clickable Sliding Breaking News/Blog Link */}
                      <Link
                        key={`${currentBreaking.type || 'news'}-${currentBreaking.id || currentBreaking.slug}-${breakingIndex % breakingItems.length}`}
                        href={currentBreaking.url || (currentBreaking.type === 'article' ? `/article/${currentBreaking.slug}` : `/news/${currentBreaking.slug}`)}
                        prefetch="hover"
                        className="group flex items-center gap-2.5 min-w-0 py-1 overflow-hidden text-inherit no-underline animate-in fade-in slide-in-from-bottom-2 duration-300 transition-all"
                        title={`${currentBreaking.badge || 'Breaking'}: ${currentBreaking.title}`}
                      >
                        {/* Red Pulsing Badge */}
                        <span className="inline-flex items-center gap-1.5 shrink-0 px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-black tracking-wider uppercase shadow-xs select-none">
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-80" />
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
                          </span>
                          {currentBreaking.badge || 'BREAKING'}
                        </span>

                        {/* Title with hover color transition and truncate */}
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-red-600 dark:group-hover:text-red-400 group-hover:underline underline-offset-2 transition-colors truncate">
                          {currentBreaking.title}
                        </span>

                        {/* Interactive Arrow Indicator */}
                        <ArrowRight size={12} className="shrink-0 text-red-500 opacity-80 group-hover:translate-x-0.5 transition-transform hidden sm:inline-block" />
                      </Link>

                      {/* Sliding controls / indicator if more than 1 item */}
                      {breakingItems.length > 1 && (
                        <div className="hidden md:flex items-center gap-1 shrink-0 text-[10px] font-bold text-slate-400 dark:text-slate-500 select-none">
                          <span>{(breakingIndex % breakingItems.length) + 1}/{breakingItems.length}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setBreakingIndex((prev) => (prev - 1 + breakingItems.length) % breakingItems.length);
                            }}
                            className="p-0.5 hover:text-red-600 dark:hover:text-red-400 cursor-pointer transition-colors"
                            aria-label="Previous breaking story"
                          >
                            <ChevronLeft size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setBreakingIndex((prev) => (prev + 1) % breakingItems.length);
                            }}
                            className="p-0.5 hover:text-red-600 dark:hover:text-red-400 cursor-pointer transition-colors"
                            aria-label="Next breaking story"
                          >
                            <ChevronRight size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ── CNN-STYLE EXPANDED MEGA MENU DRAWER (Matches Image 3) ── */}
      {megaMenuOpen && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setMegaMenuOpen(false)}
        >
          <div
            className="w-full bg-white dark:bg-[#0b1120] border-b border-slate-200 dark:border-slate-800 shadow-2xl transition-all duration-300 max-h-[92vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Top Toolbar: Directory Title, Quick Search & Close button on the right */}
            <div className="border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/70 sticky top-0 z-20 backdrop-blur-md">
              <div style={{ maxWidth: 1320, margin: '0 auto', padding: '14px 24px' }}>
                <div className="flex items-center justify-between gap-4">
                  {/* Left: Directory Title */}
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                    <span className="text-xs font-extrabold tracking-tight text-slate-800 dark:text-slate-100 uppercase">
                      Rafvex Complete Directory
                    </span>
                  </div>

                  {/* Middle: Mega Menu Instant Filter */}
                  <form onSubmit={handleMenuSearch} className="relative w-full max-w-xs hidden sm:block">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      ref={menuSearchRef}
                      type="text"
                      value={menuSearch}
                      onChange={e => setMenuSearch(e.target.value)}
                      placeholder="Filter categories & topics..."
                      className="w-full pl-9 pr-8 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all"
                    />
                    {menuSearch && (
                      <button
                        type="button"
                        onClick={() => setMenuSearch('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                      >
                        ✕
                      </button>
                    )}
                  </form>

                  {/* Right: Theme Toggle & Close Button */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={toggleTheme}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer shadow-xs"
                      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    >
                      {isDark ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} className="text-slate-500" />}
                      <span className="hidden sm:inline">{isDark ? 'Light' : 'Dark'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMegaMenuOpen(false)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 dark:hover:text-red-400 hover:border-red-300 dark:hover:border-red-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer shadow-xs shrink-0"
                      title="Close Directory (Esc)"
                    >
                      <X size={15} />
                      <span>Close</span>
                      <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-600">
                        ESC
                      </kbd>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Categorized Multi-Column Grid */}
            <div style={{ maxWidth: 1320, margin: '0 auto', padding: '36px 24px 48px' }}>
              {/* Member Account Quick Access Bar */}
              <div className="mb-8 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
                {currentUser ? (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0">
                      {currentUser.avatar ? (
                        <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-bold text-red-600">{currentUser.name.charAt(0)}</span>
                      )}
                    </div>
                    <div>
                      <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 block">{currentUser.name}</span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">{currentUser.email}</span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 block">Join Rafvex Members</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">Save bookmarks, track read articles and get instant updates.</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  {currentUser ? (
                    <>
                      <Link
                        href="/my/profile"
                        onClick={() => setMegaMenuOpen(false)}
                        className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 hover:border-red-500 dark:hover:border-red-500 transition-colors"
                      >
                        My Profile
                      </Link>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setMegaMenuOpen(false);
                          setAuthModalMode('login');
                          setAuthModalOpen(true);
                        }}
                        className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-black dark:hover:bg-slate-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                      >
                        Sign In
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMegaMenuOpen(false);
                          setAuthModalMode('register');
                          setAuthModalOpen(true);
                        }}
                        className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                      >
                        Create Free Account
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-8 gap-y-10">
                {displayMegaCategories.map((cat: any) => (
                  <div key={cat.id} className="space-y-3">
                    {/* Category Title */}
                    <div className="pb-1.5 border-b border-slate-100 dark:border-slate-800">
                      <Link
                        href={`/category/${cat.slug}`}
                        onClick={() => setMegaMenuOpen(false)}
                        style={{ fontFamily: "'Outfit', sans-serif" }}
                        className="text-sm font-extrabold text-slate-900 dark:text-slate-100 hover:text-red-600 dark:hover:text-red-400 transition-colors block truncate"
                      >
                        {cat.name}
                      </Link>
                    </div>

                    {/* Subcategories */}
                    <ul className="space-y-1.5">
                      {cat.subcategories && cat.subcategories.length > 0 ? (
                        <>
                          {cat.subcategories.slice(0, 8).map((sub: any) => (
                            <li key={sub.id}>
                              <Link
                                href={`/category/${sub.slug}`}
                                onClick={() => setMegaMenuOpen(false)}
                                className="text-xs text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors block py-0.5 truncate"
                              >
                                {sub.name}
                              </Link>
                            </li>
                          ))}
                          {cat.subcategories.length > 8 && (
                            <li>
                              <Link
                                href={`/category/${cat.slug}`}
                                onClick={() => setMegaMenuOpen(false)}
                                className="text-[11px] font-semibold text-red-600 dark:text-red-400 hover:underline inline-block pt-1"
                              >
                                + {cat.subcategories.length - 8} more →
                              </Link>
                            </li>
                          )}
                        </>
                      ) : (
                        <li>
                          <Link
                            href={`/category/${cat.slug}`}
                            onClick={() => setMegaMenuOpen(false)}
                            className="text-[11px] text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 italic"
                          >
                            Explore all guides →
                          </Link>
                        </li>
                      )}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Bottom Quick Links & Institutional Index */}
              <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
                <div className="flex flex-wrap items-center gap-4 text-slate-600 dark:text-slate-400 font-semibold">
                  <span className="text-slate-400 dark:text-slate-500 uppercase text-[10px] tracking-wider font-extrabold">Institutional:</span>
                  <Link href="/about" onClick={() => setMegaMenuOpen(false)} className="hover:text-red-600 dark:hover:text-red-400">
                    About Rafvex
                  </Link>
                  <Link href="/contact" onClick={() => setMegaMenuOpen(false)} className="hover:text-red-600 dark:hover:text-red-400">
                    Contact & Editorial Inquiries
                  </Link>
                  <Link href="/privacy-policy" onClick={() => setMegaMenuOpen(false)} className="hover:text-red-600 dark:hover:text-red-400">
                    Privacy Policy
                  </Link>
                  <Link href="/terms-of-service" onClick={() => setMegaMenuOpen(false)} className="hover:text-red-600 dark:hover:text-red-400">
                    Terms of Service
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── SEARCH OVERLAY ── */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md p-4 flex items-start justify-center pt-16 sm:pt-20 animate-in fade-in duration-200"
          onClick={closeSearchModal}
        >
          <div
            className="max-w-2xl w-full bg-white dark:bg-[#0f172a] rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-100 dark:border-slate-800 transition-all flex flex-col max-h-[85vh]"
            onClick={e => e.stopPropagation()}
          >
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search size={22} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  ref={searchRef}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="Search articles, AI tools, how-to guides, reading stories..."
                  className="w-full pl-12 pr-12 py-3.5 text-base rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 focus:bg-white dark:focus:bg-slate-800 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all text-slate-900 dark:text-slate-100 font-medium"
                />
                {isSearching ? (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500">
                    <Loader2 size={20} className="animate-spin" />
                  </div>
                ) : searchQuery ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSearchResults([]);
                      setSearchTotal(0);
                      searchRef.current?.focus();
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    aria-label="Clear search"
                  >
                    <X size={18} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={closeSearchModal}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    aria-label="Close search"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            </form>

            {/* Live Search Results Dropdown */}
            {searchQuery.trim().length >= 2 && (
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex-1 overflow-hidden flex flex-col">
                {isSearching && searchResults.length === 0 ? (
                  <div className="py-4 px-2 space-y-3">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="flex items-center gap-3.5 animate-pulse p-2.5 rounded-2xl">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3.5 bg-slate-200/80 dark:bg-slate-700 rounded w-3/4" />
                          <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded w-1/3" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : searchResults.length > 0 ? (
                  <>
                    <div className="px-2 pb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      <span>Matching Articles ({searchResults.length})</span>
                      <span className="text-[11px] normal-case font-normal text-slate-400 dark:text-slate-500 hidden sm:inline">
                        Use ↑↓ to navigate · Enter to open
                      </span>
                    </div>

                    {/* Visible 5 results container with vertical scroll for more */}
                    <div
                      ref={resultsContainerRef}
                      className="max-h-[365px] overflow-y-auto space-y-1 pr-1.5 custom-dropdown-scroll"
                      style={{ overscrollBehavior: 'contain' }}
                    >
                      {searchResults.map((article: any, idx: number) => (
                        <Link
                          key={article.id}
                          href={`/article/${article.slug}`}
                          onClick={closeSearchModal}
                          onMouseEnter={() => setSearchActiveIndex(idx)}
                          className={`group flex items-center gap-3.5 p-2.5 rounded-2xl transition-all duration-150 text-inherit no-underline ${
                            searchActiveIndex === idx
                              ? 'bg-red-50/90 dark:bg-red-950/40 ring-1 ring-red-200 dark:ring-red-900/50 shadow-sm'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                          }`}
                        >
                          {/* Article Thumbnail */}
                          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-200/70 dark:border-slate-700 flex items-center justify-center">
                            {article.cover_image_url ? (
                              <img
                                src={article.cover_image_url}
                                alt={article.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={(e: any) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            ) : (
                              <FileText size={20} className="text-slate-400 group-hover:text-red-500 transition-colors" />
                            )}
                          </div>

                          {/* Content Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              {article.category?.name && (
                                <span className="inline-block text-[10px] font-bold tracking-wider uppercase text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/60 px-1.5 py-0.5 rounded">
                                  {article.category.name}
                                </span>
                              )}
                              {article.reading_time && (
                                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                                  <Clock size={10} /> {article.reading_time} min read
                                </span>
                              )}
                              {article.published_at && (
                                <span className="text-[11px] text-slate-400 hidden sm:inline">
                                  · {formatDate(article.published_at)}
                                </span>
                              )}
                            </div>
                            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-red-600 dark:group-hover:text-red-400 line-clamp-1 transition-colors">
                              {article.title}
                            </h4>
                            {article.excerpt && (
                              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                                {article.excerpt}
                              </p>
                            )}
                          </div>

                          {/* Action Arrow */}
                          <div className="shrink-0 pl-1">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                              searchActiveIndex === idx
                                ? 'bg-red-600 text-white shadow-sm'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-red-600 group-hover:text-white'
                            }`}>
                              <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>

                    {/* Dropdown Footer */}
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs px-2 shrink-0">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">
                        Showing {searchResults.length} {searchResults.length === 1 ? 'article' : 'articles'}
                        {searchResults.length >= 5 ? ' · scroll to see more ↓' : ''}
                      </span>
                      <Link
                        href={`/search?q=${encodeURIComponent(searchQuery.trim())}`}
                        onClick={closeSearchModal}
                        className="inline-flex items-center gap-1.5 font-semibold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 group py-1"
                      >
                        <span>View all search results</span>
                        <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </>
                ) : !isSearching ? (
                  <div className="py-8 text-center px-4">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                      <Search size={22} />
                    </div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">No articles found</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                      We couldn't find any articles matching "<span className="text-slate-700 dark:text-slate-300 font-medium">{searchQuery}</span>". Try different keywords or press Enter to search everything.
                    </p>
                  </div>
                ) : null}
              </div>
            )}

            {/* Popular quick searches when input is short / empty */}
            {searchQuery.trim().length < 2 && (
              <div className="mt-4 flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
                <span>Press Enter to search · Esc to close</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-400 dark:text-slate-500">Popular:</span>
                  <button
                    type="button"
                    onClick={() => setSearchQuery('AI')}
                    className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-slate-700 hover:text-red-600 dark:hover:text-red-400 text-slate-600 dark:text-slate-300 transition-colors"
                  >
                    AI Tools
                  </button>
                  <button
                    type="button"
                    onClick={() => setSearchQuery('iPhone')}
                    className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-slate-700 hover:text-red-600 dark:hover:text-red-400 text-slate-600 dark:text-slate-300 transition-colors"
                  >
                    iPhone
                  </button>
                  <button
                    type="button"
                    onClick={() => setSearchQuery('Windows')}
                    className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-slate-700 hover:text-red-600 dark:hover:text-red-400 text-slate-600 dark:text-slate-300 transition-colors"
                  >
                    Windows
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 w-full">{children}</main>

      {/* ── COMPREHENSIVE EDITORIAL FOOTER (More Menus - Matches Image 4 Requirements) ── */}
      <footer className="mt-20 border-t border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#070b14] relative transition-colors">
        <div className="h-1 w-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-500" />

        {/* Dense 5-Column Navigation Grid */}
        <div style={{ maxWidth: 1320, margin: '0 auto', padding: '60px 24px 36px' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10">
            
            {/* Column 1: Brand & Founder Identity (2 cols on lg) */}
            <div className="lg:col-span-2 space-y-4">
              <Link href="/" className="inline-block" style={{ textDecoration: 'none' }}>
                {siteLogo ? (
                  <img
                    src={siteLogo}
                    alt={siteName}
                    style={{ height: 50, width: 'auto', maxHeight: 54 }}
                    className="hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="flex items-center gap-2.5">
                    <img
                      src="/favicon.png"
                      alt={siteName}
                      className="w-9 h-9 object-contain"
                    />
                    <span className="font-display font-extrabold text-2xl text-slate-900 dark:text-white tracking-tight">
                      {siteName}
                    </span>
                  </div>
                )}
              </Link>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm">
                Rafvex is an editorial knowledge-sharing platform featuring technology, AI, practical how-to guides, curated apps, websites, and English reading stories created to help you learn something new every day.
              </p>

              {/* 4 Social Media Channels: Facebook, Instagram, YouTube, X */}
              <div className="pt-3 flex items-center gap-2.5">
                {/* X (Twitter) */}
                <a
                  href={site.twitter_handle ? `https://x.com/${site.twitter_handle.replace('@', '')}` : (site.twitter_url || 'https://x.com/rafvex')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:text-white hover:bg-black hover:border-black transition-all shadow-2xs"
                  title="Follow us on X (Twitter)"
                >
                  <span className="font-bold text-xs">𝕏</span>
                </a>

                {/* Facebook */}
                <a
                  href={site.facebook_url || 'https://facebook.com/rafvex'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:text-white hover:bg-[#1877F2] hover:border-[#1877F2] transition-all shadow-2xs"
                  title="Follow us on Facebook"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>

                {/* Instagram (IG) */}
                <a
                  href={site.instagram_url || 'https://instagram.com/rafvex'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:text-white hover:bg-gradient-to-tr hover:from-amber-500 hover:via-rose-500 hover:to-purple-600 hover:border-transparent transition-all shadow-2xs"
                  title="Follow us on Instagram"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>

                {/* YouTube */}
                <a
                  href={site.youtube_url || 'https://youtube.com/@rafvex'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:text-white hover:bg-red-600 hover:border-red-600 transition-all shadow-2xs"
                  title="Subscribe on YouTube"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Column 2: Explore Categories */}
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-red-600 dark:text-red-400 mb-4">
                Explore Categories
              </p>
              <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
                <li><Link href="/category/ai-tools" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">AI Tools &amp; Models</Link></li>
                <li><Link href="/category/android-iphone" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">Android &amp; iPhone</Link></li>
                <li><Link href="/category/windows-mac" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">Windows &amp; Mac</Link></li>
                <li><Link href="/category/websites-apps" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">Websites &amp; Software</Link></li>
                <li><Link href="/category/technology" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">Technology Trends</Link></li>
              </ul>
            </div>

            {/* Column 3: Guides & Security */}
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-red-600 dark:text-red-400 mb-4">
                Guides &amp; Security
              </p>
              <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
                <li><Link href="/category/troubleshooting" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">Troubleshooting Fixes</Link></li>
                <li><Link href="/category/basic-online-security" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">Online Security &amp; VPNs</Link></li>
                <li><Link href="/category/ai-for-students-work" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">AI for Students &amp; Work</Link></li>
                <li><Link href="/category/tips-tricks" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">Tips &amp; Productivity</Link></li>
                <li><Link href="/category/reviews" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">Tech Reviews &amp; Tests</Link></li>
              </ul>
            </div>

            {/* Column 4: English Stories & Discovery */}
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-red-600 dark:text-red-400 mb-4">
                English &amp; Stories
              </p>
              <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
                <li><Link href="/category/english-reading-stories" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">English Reading Stories</Link></li>
                <li><Link href="/category/ai-for-students-work" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">AI for Students &amp; Learning</Link></li>
                <li><Link href="/popular" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">Popular Tutorials</Link></li>
                <li><Link href="/search" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">Search All Knowledge</Link></li>
              </ul>
            </div>

            {/* Column 5: Publication & Trust */}
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-red-600 dark:text-red-400 mb-4">
                About &amp; Trust
              </p>
              <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
                <li><Link href="/about" className="hover:text-red-600 dark:hover:text-red-400 transition-colors font-semibold">About Rafvex</Link></li>
                <li><Link href="/sitemap" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">Sitemap</Link></li>
                <li><Link href="/contact" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">Contact Us</Link></li>
                <li><Link href="/privacy-policy" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms-of-service" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">Terms of Service</Link></li>
                <li><Link href="/disclaimer" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">Disclaimer</Link></li>
                <li className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <a href="mailto:rafvexofficial@gmail.com" className="hover:text-red-600 dark:hover:text-red-400 transition-colors flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    <Mail size={12} className="shrink-0 text-red-500" />
                    <span>rafvexofficial@gmail.com</span>
                  </a>
                </li>
              </ul>
            </div>

          </div>

          {/* Copyright & Disclaimer Bar */}
          <div className="border-t border-slate-100 dark:border-slate-800/80 mt-12 pt-6 flex items-center justify-center text-xs text-slate-400 dark:text-slate-500 text-center">
            <p>© 2026 Rafvex. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Sponsored Customer Popup Ad */}
      <SponsoredPopupModal />

      {/* Global Public Member Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultMode={authModalMode}
      />

      {/* Real-time Pusher Notification Toast Banner */}
      <RealtimeToastBanner
        toast={activeToast}
        onDismiss={dismissToast}
      />

      {/* Google AdSense & GDPR Cookie Consent Banner */}
      <CookieConsent />
    </div>
  );
}
