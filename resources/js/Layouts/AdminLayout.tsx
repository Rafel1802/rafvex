import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import {
  LayoutDashboard, FileText, FolderOpen, Image as ImageIcon, Settings, LogOut,
  ChevronDown, ChevronRight, ChevronLeft, MessageSquare, Plus, Globe, Search, Bell,
  Menu, X, User, ExternalLink, ShieldCheck, Check, TriangleAlert,
  Sun, Moon, Users, Pin, UserCheck, Mail, Megaphone, Contact, Radio,
  LayoutGrid, Sliders
} from 'lucide-react';

const CMS_NAV = [
  {
    category: 'EDITORIAL & CONTENT',
    items: [
      { name: 'Dashboard', icon: LayoutDashboard, href: '/ourcms/dashboard' },
      { name: 'Articles', icon: FileText, href: '/ourcms/articles' },
      { name: 'New Article', icon: Plus, href: '/ourcms/articles/create' },
      { name: 'Newsroom', icon: Radio, href: '/ourcms/news' },
      { name: 'Post News', icon: Plus, href: '/ourcms/news/create' },
      { name: 'Categories', icon: FolderOpen, href: '/ourcms/categories' },
      { name: 'Media Library', icon: ImageIcon, href: '/ourcms/media' },
      { name: 'Authors', icon: UserCheck, href: '/ourcms/authors' },
      { name: 'Pinned Stories', icon: Pin, href: '/ourcms/pinned' },
      { name: 'Home Sections', icon: Sliders, href: '/ourcms/home-sections' },
      { name: 'Home Ads', icon: LayoutGrid, href: '/ourcms/home-ads' },
      { name: 'Pop up ads', icon: Megaphone, href: '/ourcms/popup-ads' },
      { name: 'Messages', icon: Mail, href: '/ourcms/messages' },
      { name: 'Comments', icon: MessageSquare, href: '/ourcms/comments' },
    ],
  },
  {
    category: 'SETTINGS & SYSTEM',
    items: [
      { name: 'Profile', icon: User, href: '/ourcms/profile' },
      { name: 'Reader Accounts', icon: Contact, href: '/ourcms/customers' },
      { name: 'CMS Staff & Admins', icon: Users, href: '/ourcms/users' },
      { name: 'Security & Logs', icon: ShieldCheck, href: '/ourcms/security' },
      { name: 'Site Settings', icon: Settings, href: '/ourcms/settings' },
      { name: 'Maintenance', icon: TriangleAlert, href: '/ourcms/maintenance' },
    ],
  },
];

interface AdminLayoutProps {
  children: React.ReactNode;
  auth: {
    user: {
      id?: number;
      name: string;
      email: string;
      avatar: string | null;
      roles?: string[];
    };
  };
}

// Persistent sidebar scroll memory across unmounts/remounts and navigations
let memorySidebarScroll = 0;
let isRestoringSidebar = false;
let scrollRestoreTimeout: any = null;

if (typeof window !== 'undefined') {
  try {
    const saved = sessionStorage.getItem('rafvex_admin_sidebar_scroll');
    if (saved && !isNaN(Number(saved))) {
      memorySidebarScroll = Number(saved);
    }
  } catch (e) {}
}

export default function AdminLayout({ children, auth }: AdminLayoutProps) {
  const { props, url } = usePage<any>();
  const flash = props.flash ?? {};
  const site = props.site ?? {};
  const siteName = site.name ?? 'Rafvex';
  const siteLogo = site.logo ?? null;
  const user = auth?.user || props.auth?.user;
  const userAvatar = user?.avatar || (user as any)?.google_avatar || null;

  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ left: number; top: number; text: string } | null>(null);
  const [dismissedFlash, setDismissedFlash] = useState(false);

  useEffect(() => {
    setDismissedFlash(false);
  }, [flash?.message, flash?.error]);

  useEffect(() => {
    if (user?.id && typeof (window as any).initPusherBeams === 'function') {
      (window as any).initPusherBeams('admin', user.id);
    }
  }, [user?.id]);

  const showTooltip = (e: React.MouseEvent, text: string) => {
    if (isCollapsed) {
      const rect = e.currentTarget.getBoundingClientRect();
      setTooltipPos({
        left: rect.right + 12,
        top: rect.top + rect.height / 2,
        text,
      });
      setHoveredNav(text);
    }
  };

  const hideTooltip = () => {
    setTooltipPos(null);
    setHoveredNav(null);
  };
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [headerSearch, setHeaderSearch] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('rafvex_admin_theme');
      if (saved) return saved === 'dark' ? 'dark' : 'light';
      if (document.documentElement.classList.contains('dark')) return 'dark';
    }
    return 'light';
  });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const sidebarNavRef = useRef<HTMLDivElement>(null);

  const saveSidebarScroll = () => {
    if (sidebarNavRef.current) {
      const top = sidebarNavRef.current.scrollTop;
      memorySidebarScroll = top;
      try {
        sessionStorage.setItem('rafvex_admin_sidebar_scroll', String(top));
      } catch (e) {}
    }
  };

  const restoreSidebarScroll = (forceActiveIntoView = false) => {
    const navEl = sidebarNavRef.current;
    if (!navEl) return;

    isRestoringSidebar = true;

    let target = memorySidebarScroll;
    if (target <= 0) {
      try {
        const saved = sessionStorage.getItem('rafvex_admin_sidebar_scroll');
        if (saved !== null && !isNaN(Number(saved))) {
          target = Number(saved);
          memorySidebarScroll = target;
        }
      } catch (e) {}
    }

    if (target > 0) {
      navEl.scrollTop = target;
    } else if (forceActiveIntoView) {
      const activeEl = navEl.querySelector<HTMLElement>('[data-active-nav="true"]');
      if (activeEl) {
        const navRect = navEl.getBoundingClientRect();
        const elRect = activeEl.getBoundingClientRect();
        if (elRect.top < navRect.top || elRect.bottom > navRect.bottom) {
          activeEl.scrollIntoView({ block: 'nearest', behavior: 'auto' });
        }
      }
    }

    clearTimeout(scrollRestoreTimeout);
    scrollRestoreTimeout = setTimeout(() => {
      if (sidebarNavRef.current && target > 0) {
        sidebarNavRef.current.scrollTop = target;
      }
      isRestoringSidebar = false;
    }, 250);
  };

  useLayoutEffect(() => {
    restoreSidebarScroll();
    const raf = requestAnimationFrame(() => restoreSidebarScroll());
    const t1 = setTimeout(() => restoreSidebarScroll(), 50);
    const t2 = setTimeout(() => restoreSidebarScroll(), 150);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [url]);

  useEffect(() => {
    if (sidebarOpen) {
      const t = setTimeout(() => restoreSidebarScroll(true), 60);
      return () => clearTimeout(t);
    }
  }, [sidebarOpen]);

  useEffect(() => {
    const unregisterStart = router.on('start', () => {
      saveSidebarScroll();
      isRestoringSidebar = true;
    });
    const unregisterFinish = router.on('finish', () => {
      restoreSidebarScroll();
      setTimeout(() => restoreSidebarScroll(), 60);
    });
    const unregisterNavigate = router.on('navigate', () => {
      restoreSidebarScroll();
      setTimeout(() => restoreSidebarScroll(), 60);
    });
    return () => {
      unregisterStart();
      unregisterFinish();
      unregisterNavigate();
    };
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('rafvex_admin_theme') || 'light';
    if (saved === 'dark') {
      setTheme('dark');
      document.documentElement.classList.add('dark');
      document.documentElement.style.backgroundColor = '#0b1120';
    } else {
      setTheme('light');
      document.documentElement.classList.remove('dark');
      document.documentElement.style.backgroundColor = '#f8fafc';
    }

    const savedCollapsed = localStorage.getItem('rafvex_sidebar_collapsed');
    if (savedCollapsed === 'true') {
      setIsCollapsed(true);
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    try {
      localStorage.setItem('rafvex_admin_theme', next);
      if (next === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.style.backgroundColor = '#0b1120';
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.style.backgroundColor = '#f8fafc';
      }
    } catch (e) {}
  };

  const toggleCollapse = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('rafvex_sidebar_collapsed', String(next));
      return next;
    });
  };

  const isDark = theme === 'dark';

  const isActive = (href: string) => {
    if (href === '/ourcms/dashboard') {
      return currentPath === '/ourcms/dashboard' || currentPath === '/ourcms';
    }
    if (href === '/ourcms/articles/create') {
      return currentPath === '/ourcms/articles/create';
    }
    if (href === '/ourcms/articles') {
      return currentPath === '/ourcms/articles' || (currentPath.startsWith('/ourcms/articles/') && !currentPath.includes('/create'));
    }
    if (href === '/ourcms/users') {
      return currentPath.startsWith('/ourcms/users');
    }
    if (href === '/ourcms/authors') {
      return currentPath.startsWith('/ourcms/authors');
    }
    if (href === '/ourcms/messages') {
      return currentPath.startsWith('/ourcms/messages');
    }
    if (href === '/ourcms/home-sections') {
      return currentPath.startsWith('/ourcms/home-sections');
    }
    if (href === '/ourcms/home-ads') {
      return currentPath.startsWith('/ourcms/home-ads');
    }
    if (href === '/ourcms/profile') {
      return currentPath.startsWith('/ourcms/profile');
    }
    if (href === '/ourcms/popup-ads') {
      return currentPath.startsWith('/ourcms/popup-ads');
    }
    return currentPath.startsWith(href);
  };

  // Close dropdown on click outside & handle Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' || event.key === 'Esc' || event.keyCode === 27) {
        setProfileDropdownOpen(false);
        setSidebarOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Auto search as you type in header search bar (debounced 350ms)
  const isHeaderSearchFirst = useRef(true);
  useEffect(() => {
    if (isHeaderSearchFirst.current) {
      isHeaderSearchFirst.current = false;
      if (typeof window !== 'undefined') {
        const p = new URLSearchParams(window.location.search).get('search');
        if (p) setHeaderSearch(p);
      }
      return;
    }

    const timer = setTimeout(() => {
      const q = headerSearch.trim();
      const path = typeof window !== 'undefined' ? window.location.pathname : '';
      const onArticles = path.startsWith('/ourcms/articles');

      if (onArticles) {
        const params = typeof window !== 'undefined'
          ? Object.fromEntries(new URLSearchParams(window.location.search).entries())
          : {};

        if (q) {
          params.search = q;
        } else {
          delete params.search;
        }
        delete params.page;

        router.get('/ourcms/articles', params, {
          preserveState: true,
          preserveScroll: true,
          replace: true,
        });
      } else if (q) {
        router.visit(`/ourcms/articles?search=${encodeURIComponent(q)}`, {
          preserveState: true,
          preserveScroll: true,
          replace: true,
        });
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [headerSearch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = headerSearch.trim();
    const path = typeof window !== 'undefined' ? window.location.pathname : '';
    const onArticles = path.startsWith('/ourcms/articles');

    if (onArticles) {
      const params = typeof window !== 'undefined'
        ? Object.fromEntries(new URLSearchParams(window.location.search).entries())
        : {};
      if (q) {
        params.search = q;
      } else {
        delete params.search;
      }
      delete params.page;
      router.get('/ourcms/articles', params, {
        preserveState: true,
        preserveScroll: true,
        replace: true,
      });
    } else if (q) {
      router.visit(`/ourcms/articles?search=${encodeURIComponent(q)}`, {
        preserveState: true,
        preserveScroll: true,
        replace: true,
      });
    }
  };

  const userInitials = user?.name
    ? String(user.name).split(' ').filter(Boolean).map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'AD'
    : 'AD';

  const firstName = user?.name ? String(user.name).split(' ').filter(Boolean)[0] || 'Admin' : 'Admin';

  const sidebarWidth = isCollapsed ? 74 : 260;

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      fontFamily: "'Inter', system-ui, sans-serif",
      background: isDark ? '#0b1120' : '#f8fafc',
      color: isDark ? '#f8fafc' : '#1e293b',
    }}>
      <Head>
        <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
        <link rel="icon" type="image/png" sizes="144x144" href="/favicon-144x144.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png" />
        <link rel="icon" type="image/png" sizes="576x576" href="/favicon.png" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      </Head>
      
      {/* ── Mobile Overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden animate-fade-in"
          style={{ background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── SIDEBAR (Collapsible, Scrollable, Hover Tooltips) ── */}
      <aside
        style={{
          width: sidebarWidth,
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          background: isDark ? '#0f172a' : '#ffffff',
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 50,
          borderRight: `1px solid ${isDark ? '#1e293b' : '#eef0f5'}`,
          boxShadow: isDark ? '4px 0 24px rgba(0,0,0,0.35)' : '4px 0 24px rgba(0,0,0,0.02)',
          transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1), transform 0.25s ease, background 0.2s ease, border-color 0.2s ease',
        }}
        className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* Floating Toggle Button on Border (Hide / Show like Image 4) */}
        <button
          type="button"
          onClick={toggleCollapse}
          className="hidden md:flex items-center justify-center group"
          style={{
            position: 'absolute',
            right: -13,
            top: 22,
            width: 26,
            height: 26,
            borderRadius: '50%',
            background: isDark ? '#1e293b' : '#ffffff',
            border: `1.5px solid ${isDark ? '#334155' : '#e2e8f0'}`,
            color: isDark ? '#f8fafc' : '#475569',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
            cursor: 'pointer',
            zIndex: 60,
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = '#dc2626';
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = isDark ? '#334155' : '#e2e8f0';
            e.currentTarget.style.transform = 'scale(1)';
          }}
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* Brand Header */}
        <div style={{
          height: isCollapsed ? 70 : 84,
          minHeight: isCollapsed ? 70 : 84,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: isCollapsed ? '10px 8px' : '12px 20px',
          borderBottom: `1px solid ${isDark ? '#1e293b' : '#f1f3f7'}`,
          flexShrink: 0
        }}>
          <Link
            href="/ourcms/dashboard"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
              background: 'transparent',
              width: '100%',
              height: '100%',
            }}
            title={isCollapsed ? 'Dashboard' : siteName}
            onMouseEnter={e => showTooltip(e, 'Dashboard')}
            onMouseLeave={hideTooltip}
            onClick={hideTooltip}
          >
            {siteLogo ? (
              <img
                src={siteLogo}
                alt={siteName}
                style={{
                  height: isCollapsed ? 36 : 52,
                  maxHeight: isCollapsed ? 40 : 58,
                  width: 'auto',
                  maxWidth: isCollapsed ? 40 : 180,
                  objectFit: 'contain',
                  display: 'block',
                  transition: 'transform 0.2s ease',
                }}
                className="hover:scale-105"
              />
            ) : (
              <img
                src="/favicon.png"
                alt={siteName}
                style={{
                  width: isCollapsed ? 34 : 40,
                  height: isCollapsed ? 34 : 40,
                  objectFit: 'contain',
                  display: 'block',
                }}
              />
            )}
          </Link>
        </div>

        {/* Scrollable Navigation Menu (with custom scrollbar) */}
        <div
          ref={sidebarNavRef}
          id="admin-sidebar-nav"
          style={{
            flex: 1,
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain',
            padding: isCollapsed ? '18px 10px' : '20px 14px',
            scrollbarWidth: 'thin',
            scrollbarColor: isDark ? '#334155 transparent' : '#cbd5e1 transparent'
          }}
          className="custom-admin-scroll"
          onScroll={(e) => {
            hideTooltip();
            if (isRestoringSidebar) return;
            const top = e.currentTarget.scrollTop;
            memorySidebarScroll = top;
            try {
              sessionStorage.setItem('rafvex_admin_sidebar_scroll', String(top));
            } catch (err) {}
          }}
        >
          {CMS_NAV.map((group, gi) => (
            <div key={gi} style={{ marginBottom: isCollapsed ? 16 : 22 }}>
              {!isCollapsed ? (
                <p style={{
                  fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                  color: isDark ? '#64748b' : '#94a3b8', padding: '0 12px 8px', margin: 0
                }}>
                  {group.category}
                </p>
              ) : (
                gi > 0 && <div style={{ height: 1, background: isDark ? '#1e293b' : '#f1f5f9', margin: '12px 6px' }} />
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {group.items.map(item => {
                  const active = isActive(item.href);
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.href}
                      style={{ position: 'relative' }}
                      data-active-nav={active ? 'true' : 'false'}
                    >
                      <Link
                        href={item.href}
                        prefetch="hover"
                        title={isCollapsed ? item.name : undefined}
                        onClick={() => {
                          hideTooltip();
                          saveSidebarScroll();
                          isRestoringSidebar = true;
                          if (typeof window !== 'undefined' && window.innerWidth < 768) {
                            setSidebarOpen(false);
                          }
                        }}
                        onMouseEnter={e => showTooltip(e, item.name)}
                        onMouseLeave={hideTooltip}
                        className={`cms-nav-item ${active ? 'is-active' : 'is-inactive'} ${isCollapsed ? 'is-collapsed' : ''}`}
                        style={{
                          justifyContent: isCollapsed ? 'center' : 'space-between',
                          padding: isCollapsed ? '10px 0' : '10px 14px',
                          fontWeight: active ? 600 : 500,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div
                            className="cms-nav-icon-box"
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 9,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Icon size={17} />
                          </div>
                          {!isCollapsed && <span style={{ transition: 'color 0.18s ease' }}>{item.name}</span>}
                        </div>

                        {!isCollapsed && (
                          active ? (
                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#dc2626' }} />
                          ) : (
                            <ChevronRight size={14} className="cms-nav-chevron" />
                          )
                        )}
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Footer Profile Avatar */}
        <div style={{
          padding: isCollapsed ? '14px 0' : '14px 18px',
          borderTop: `1px solid ${isDark ? '#1e293b' : '#f1f3f7'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'flex-start',
          flexShrink: 0
        }}>
          <Link
            href="/ourcms/users"
            title={isCollapsed ? (user?.name || 'Account Settings') : undefined}
            onMouseEnter={e => showTooltip(e, user?.name || 'Account Settings')}
            onMouseLeave={hideTooltip}
            onClick={() => {
              hideTooltip();
              saveSidebarScroll();
              isRestoringSidebar = true;
              if (typeof window !== 'undefined' && window.innerWidth < 768) {
                setSidebarOpen(false);
              }
            }}
            className="group"
            style={{
              display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none',
              color: isDark ? '#94a3b8' : '#64748b', transition: 'color 0.15s'
            }}
          >
            <div
              style={{
                width: 34, height: 34, borderRadius: '50%',
                background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(220, 38, 38, 0.25)', color: '#fff',
                fontWeight: 700, fontSize: 12, flexShrink: 0,
                transition: 'transform 0.18s ease'
              }}
              className="group-hover:scale-105"
            >
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span>{userInitials}</span>
              )}
            </div>
            {!isCollapsed && (
              <div style={{ minWidth: 0 }}>
                <p
                  className="group-hover:text-red-600 dark:group-hover:text-red-400"
                  style={{
                    margin: 0, fontSize: 12, fontWeight: 600,
                    color: isDark ? '#e2e8f0' : '#1e293b', lineHeight: 1.2,
                    transition: 'color 0.15s ease'
                  }}
                >
                  {user?.name}
                </p>
                <p style={{ margin: '2px 0 0', fontSize: 10, color: isDark ? '#64748b' : '#94a3b8' }}>Account & Profile</p>
              </div>
            )}
          </Link>
        </div>
      </aside>

      {/* ── Fixed Tooltip Portal for Collapsed Sidebar (Escapes scroll overflow) ── */}
      {isCollapsed && tooltipPos && (
        <div
          style={{
            position: 'fixed',
            left: tooltipPos.left,
            top: tooltipPos.top,
            transform: 'translateY(-50%)',
            background: isDark ? '#020617' : '#0f172a',
            color: '#ffffff',
            fontSize: 12.5,
            fontWeight: 600,
            padding: '6px 12px',
            borderRadius: 8,
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.4)',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            border: `1px solid ${isDark ? '#334155' : '#1e293b'}`,
            letterSpacing: '0.01em',
            animation: 'fadeIn 0.12s ease-out',
          }}
        >
          <span>{tooltipPos.text}</span>
          <div
            style={{
              position: 'absolute',
              left: -5,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 0,
              height: 0,
              borderTop: '5px solid transparent',
              borderBottom: '5px solid transparent',
              borderRight: `5px solid ${isDark ? '#020617' : '#0f172a'}`,
            }}
          />
        </div>
      )}

      {/* ── MAIN CONTENT WRAPPER ── */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          marginLeft: typeof window !== 'undefined' && window.innerWidth >= 768 ? sidebarWidth : 0,
          transition: 'margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
        className={isCollapsed ? 'md:ml-[74px]' : 'md:ml-[260px]'}
      >


        {/* ── TOP HEADER ── */}
        <header
          style={{
            height: 70,
            background: isDark ? '#0f172a' : '#ffffff',
            borderBottom: `1px solid ${isDark ? '#1e293b' : '#eef0f5'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            position: 'sticky',
            top: 0,
            zIndex: 30,
            boxShadow: isDark ? '0 2px 12px rgba(0,0,0,0.3)' : '0 2px 12px rgba(0,0,0,0.015)',
            transition: 'background 0.2s ease, border-color 0.2s ease'
          }}
        >
          {/* Left: Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1, maxWidth: 460 }}>

            {/* Modern Search Input */}
            <form onSubmit={handleSearchSubmit} style={{ width: '100%' }}>
              <div style={{ position: 'relative', width: '100%' }}>
                <Search
                  size={16}
                  style={{
                    position: 'absolute', left: 14, top: '50%',
                    transform: 'translateY(-50%)', color: isDark ? '#64748b' : '#94a3b8'
                  }}
                />
                <input
                  type="text"
                  placeholder="Search articles, guides, categories..."
                  value={headerSearch}
                  onChange={e => setHeaderSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: headerSearch ? '9px 34px 9px 38px' : '9px 14px 9px 38px',
                    fontSize: 13,
                    borderRadius: 20,
                    border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                    background: isDark ? '#1e293b' : '#f8fafc',
                    color: isDark ? '#f8fafc' : '#0f172a',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box'
                  }}
                  onFocus={e => {
                    e.currentTarget.style.borderColor = '#dc2626';
                    e.currentTarget.style.background = isDark ? '#172033' : '#ffffff';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(220, 38, 38, 0.12)';
                  }}
                  onBlur={e => {
                    e.currentTarget.style.borderColor = isDark ? '#334155' : '#e2e8f0';
                    e.currentTarget.style.background = isDark ? '#1e293b' : '#f8fafc';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
                {headerSearch && (
                  <button
                    type="button"
                    onClick={() => {
                      setHeaderSearch('');
                    }}
                    title="Clear search"
                    style={{
                      position: 'absolute',
                      right: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: isDark ? '#94a3b8' : '#64748b',
                      cursor: 'pointer',
                      padding: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Right: Theme Toggle, Notifications & Profile Widget */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            
            {/* Theme Toggle Button (Light / Dark) */}
            <button
              type="button"
              onClick={toggleTheme}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle theme mode"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                padding: '7px 12px',
                borderRadius: 9,
                background: isDark ? '#1e293b' : '#f8fafc',
                border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                color: isDark ? '#fbbf24' : '#475569',
                cursor: 'pointer',
                fontSize: 12.5,
                fontWeight: 600,
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#dc2626';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = isDark ? '#334155' : '#e2e8f0';
              }}
            >
              {isDark ? (
                <>
                  <Sun size={15} />
                  <span className="hidden sm:inline" style={{ color: '#f8fafc', fontSize: 12 }}>Light</span>
                </>
              ) : (
                <>
                  <Moon size={15} />
                  <span className="hidden sm:inline" style={{ fontSize: 12 }}>Dark</span>
                </>
              )}
            </button>

            {/* View site link (desktop) */}
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-2"
              style={{
                fontSize: 12.5, fontWeight: 500,
                color: isDark ? '#cbd5e1' : '#475569',
                padding: '7px 12px', borderRadius: 9,
                background: isDark ? '#1e293b' : '#f8fafc',
                border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                textDecoration: 'none', transition: 'all 0.15s'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#dc2626';
                e.currentTarget.style.color = '#dc2626';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = isDark ? '#334155' : '#e2e8f0';
                e.currentTarget.style.color = isDark ? '#cbd5e1' : '#475569';
              }}
            >
              <Globe size={14} color="#dc2626" />
              <span>Live Site</span>
            </a>

            {/* Notification Bell */}
            <Link
              href="/ourcms/comments"
              title="Recent Comments"
              style={{
                width: 38, height: 38, borderRadius: 9, display: 'flex', alignItems: 'center',
                justifyContent: 'center',
                background: isDark ? '#1e293b' : '#f8fafc',
                border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                color: isDark ? '#cbd5e1' : '#64748b',
                cursor: 'pointer', position: 'relative', textDecoration: 'none'
              }}
            >
              <Bell size={17} />
              <span style={{
                position: 'absolute', top: 9, right: 9, width: 7, height: 7,
                borderRadius: '50%', background: '#ef4444', border: `2px solid ${isDark ? '#0f172a' : '#ffffff'}`
              }} />
            </Link>

            {/* Vertical Divider */}
            <div style={{ width: 1, height: 24, background: isDark ? '#1e293b' : '#e2e8f0' }} />

            {/* ── USER PROFILE WIDGET ── */}
            <div style={{ position: 'relative' }} ref={dropdownRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '4px 6px 4px 4px', borderRadius: 24,
                  background: profileDropdownOpen ? (isDark ? '#1e293b' : '#f1f5f9') : 'transparent',
                  border: 'none', cursor: 'pointer', transition: 'background 0.15s'
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: 38, height: 38, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                  overflow: 'hidden', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', boxShadow: '0 2px 8px rgba(220, 38, 38, 0.25)',
                  flexShrink: 0
                }}>
                  {userAvatar ? (
                    <img src={userAvatar} alt={user?.name || 'Admin'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ color: '#ffffff', fontWeight: 700, fontSize: 13 }}>{userInitials}</span>
                  )}
                </div>

                {/* Name & Role (desktop) */}
                <div className="hidden sm:flex flex-col text-left" style={{ lineHeight: 1.2 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: isDark ? '#f8fafc' : '#0f172a' }}>
                    Hi, {firstName}
                  </span>
                  <span style={{ fontSize: 11, color: isDark ? '#94a3b8' : '#64748b', textTransform: 'capitalize' }}>
                    {(user as any)?.primary_role || user?.roles?.[0] || 'Administrator'}
                  </span>
                </div>

                <ChevronDown size={14} color={isDark ? '#94a3b8' : '#64748b'} style={{ transform: profileDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>

              {/* ── PROFILE DROPDOWN MENU ── */}
              {profileDropdownOpen && (
                <div
                  style={{
                    position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                    width: 230,
                    backgroundColor: isDark ? '#1e293b' : '#ffffff',
                    borderRadius: 12,
                    boxShadow: isDark ? '0 12px 36px rgba(0, 0, 0, 0.5)' : '0 12px 36px rgba(15, 23, 42, 0.16), 0 2px 8px rgba(15, 23, 42, 0.08)',
                    border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                    padding: '6px', zIndex: 9999
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderBottom: `1px solid ${isDark ? '#334155' : '#f1f5f9'}` }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                      overflow: 'hidden', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', flexShrink: 0
                    }}>
                      {userAvatar ? (
                        <img src={userAvatar} alt={user?.name || 'Admin'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ color: '#ffffff', fontWeight: 700, fontSize: 12 }}>{userInitials}</span>
                      )}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p style={{ fontSize: 13.5, fontWeight: 700, color: isDark ? '#f8fafc' : '#0f172a', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {user?.name || 'Admin'}
                      </p>
                      <p style={{ fontSize: 11.5, color: isDark ? '#94a3b8' : '#64748b', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {user?.email || 'admin@rafvex.com'}
                      </p>
                    </div>
                  </div>

                  <div style={{ padding: '4px 0' }}>
                    <button
                      type="button"
                      onClick={() => { toggleTheme(); setProfileDropdownOpen(false); }}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '8px 12px', borderRadius: 8, fontSize: 13, color: isDark ? '#e2e8f0' : '#334155',
                        background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
                        transition: 'background 0.15s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = isDark ? '#334155' : '#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {isDark ? <Sun size={15} color="#fbbf24" /> : <Moon size={15} color="#6366f1" />}
                        <span>Mode</span>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 600, color: isDark ? '#fbbf24' : '#64748b' }}>
                        {isDark ? 'Dark Mode' : 'Light Mode'}
                      </span>
                    </button>

                    <Link
                      href="/ourcms/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
                        borderRadius: 8, fontSize: 13, color: isDark ? '#e2e8f0' : '#334155', textDecoration: 'none',
                        transition: 'background 0.15s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = isDark ? '#334155' : '#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <User size={15} color={isDark ? '#94a3b8' : '#64748b'} /> Profile
                    </Link>

                    <Link
                      href="/ourcms/users"
                      onClick={() => setProfileDropdownOpen(false)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
                        borderRadius: 8, fontSize: 13, color: isDark ? '#e2e8f0' : '#334155', textDecoration: 'none',
                        transition: 'background 0.15s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = isDark ? '#334155' : '#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <Users size={15} color={isDark ? '#94a3b8' : '#64748b'} /> CMS Staff & Admins
                    </Link>

                    <Link
                      href="/ourcms/settings"
                      onClick={() => setProfileDropdownOpen(false)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
                        borderRadius: 8, fontSize: 13, color: isDark ? '#e2e8f0' : '#334155', textDecoration: 'none',
                        transition: 'background 0.15s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = isDark ? '#334155' : '#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <Settings size={15} color={isDark ? '#94a3b8' : '#64748b'} /> Site Settings
                    </Link>
                  </div>

                  <Link
                    href="/ourcms/comments"
                    onClick={() => setProfileDropdownOpen(false)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
                      borderRadius: 8, fontSize: 13, color: isDark ? '#e2e8f0' : '#334155', textDecoration: 'none', transition: 'background 0.15s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = isDark ? '#334155' : '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <MessageSquare size={15} color={isDark ? '#94a3b8' : '#64748b'} /> Moderate Comments
                  </Link>

                  <a
                    href="/"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setProfileDropdownOpen(false)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
                      borderRadius: 8, fontSize: 13, color: isDark ? '#e2e8f0' : '#334155', textDecoration: 'none', transition: 'background 0.15s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = isDark ? '#334155' : '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <ExternalLink size={15} color={isDark ? '#94a3b8' : '#64748b'} /> View Public Site
                  </a>

                  <div style={{ height: 1, background: isDark ? '#334155' : '#f1f5f9', margin: '4px 0' }} />

                  {/* Logout Button */}
                  <Link
                    href="/ourcms/logout"
                    method="post"
                    as="button"
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                      padding: '8px 12px', borderRadius: 8, fontSize: 13, color: '#ef4444',
                      background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
                      transition: 'background 0.15s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <LogOut size={15} /> Sign Out
                  </Link>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* Flash Notifications Banner */}
        {flash?.message && !dismissedFlash && (
          <div className="mx-6 mt-4 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center text-emerald-700 dark:text-emerald-300 shrink-0">
                <Check size={14} />
              </span>
              <span>{flash.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setDismissedFlash(true)}
              className="p-1 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 transition-colors cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        )}
        {flash?.error && !dismissedFlash && (
          <div className="mx-6 mt-4 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-300 text-xs font-semibold flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-lg bg-rose-100 dark:bg-rose-900/60 flex items-center justify-center text-rose-700 dark:text-rose-300 shrink-0">
                <TriangleAlert size={14} />
              </span>
              <span>{flash.error}</span>
            </div>
            <button
              type="button"
              onClick={() => setDismissedFlash(true)}
              className="p-1 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Content Body */}
        <main style={{ flex: 1, padding: '24px' }}>
          {children}
        </main>
      </div>

    </div>
  );
}

