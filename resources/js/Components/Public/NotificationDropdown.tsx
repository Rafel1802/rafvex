import React, { useState, useEffect, useRef } from 'react';
import { Link, router } from '@inertiajs/react';
import { Bell, CheckCheck, MessageSquare, Sparkles, Flame, ExternalLink, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import axios from 'axios';

interface NotificationItem {
  id: number;
  type: string;
  title: string;
  message: string;
  link?: string;
  read_at: string | null;
  created_at: string;
}

interface Props {
  initialUnreadCount?: number;
  unreadCountIncrement?: number;
  onResetIncrement?: () => void;
}

export default function NotificationDropdown({
  initialUnreadCount = 0,
  unreadCountIncrement = 0,
  onResetIncrement,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUnreadCount(initialUnreadCount + unreadCountIncrement);
  }, [initialUnreadCount, unreadCountIncrement]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/notifications');
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unread_count || 0);
      if (onResetIncrement) onResetIncrement();
    } catch (e) {
      console.error('Failed to load notifications:', e);
    } finally {
      setLoading(false);
    }
  };

  const toggleDropdown = () => {
    if (!isOpen) {
      fetchNotifications();
    }
    setIsOpen(!isOpen);
  };

  const markAsRead = async (id: number, link?: string) => {
    try {
      await axios.post(`/api/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (e) {}

    if (link) {
      setIsOpen(false);
      router.visit(link);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.post('/api/notifications/read-all');
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read_at: new Date().toISOString() }))
      );
      setUnreadCount(0);
      if (onResetIncrement) onResetIncrement();
    } catch (e) {}
  };

  const getIcon = (type: string) => {
    if (type === 'new_article') {
      return <Flame size={15} className="text-red-500" />;
    }
    return <MessageSquare size={15} className="text-amber-500" />;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={toggleDropdown}
        aria-label="Open notifications"
        className="relative flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-red-400 dark:hover:border-red-500 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 transition-all cursor-pointer shadow-2xs"
        title="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-black text-white shadow-xs animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-40 sm:hidden animate-in fade-in duration-150"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Dropdown / Modal Panel */}
      {isOpen && (
        <div
          className="fixed inset-x-3 top-16 max-h-[82vh] sm:max-h-[480px] sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 sm:w-[360px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden z-50 flex flex-col animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-850 shrink-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">Notifications</span>
              {unreadCount > 0 && (
                <span className="bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full border border-red-200 dark:border-red-900/40">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="text-[11px] font-bold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 flex items-center gap-1 cursor-pointer"
                >
                  <CheckCheck size={13} />
                  <span className="hidden xs:inline">Mark all read</span>
                </button>
              )}

              {/* Close Button on Mobile */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="sm:hidden p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
                aria-label="Close notifications"
              >
                <X size={17} />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80 overscroll-contain">
            {loading && notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-xs">
                <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400 dark:text-slate-500">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-2 text-slate-400 dark:text-slate-500">
                  <Bell size={18} />
                </div>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">You're all caught up!</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">No new notifications right now.</p>
              </div>
            ) : (
              notifications.map((notif) => {
                const isUnread = !notif.read_at;
                return (
                  <div
                    key={notif.id}
                    onClick={() => markAsRead(notif.id, notif.link)}
                    className={`p-3.5 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer ${
                      isUnread ? 'bg-red-50/40 dark:bg-red-950/20' : ''
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 mt-0.5 border border-slate-200/50 dark:border-slate-700/50">
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <p className={`text-xs leading-snug truncate ${isUnread ? 'font-bold text-slate-900 dark:text-slate-100' : 'font-medium text-slate-700 dark:text-slate-300'}`}>
                          {notif.title}
                        </p>
                        {isUnread && (
                          <span className="w-2 h-2 rounded-full bg-red-600 shrink-0" />
                        )}
                      </div>
                      <p className="text-[11.5px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {notif.message}
                      </p>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">
                        {formatDistanceToNow(new Date(notif.created_at))} ago
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 border-t border-slate-100 dark:border-slate-800 text-center bg-slate-50/60 dark:bg-slate-850/80 shrink-0">
            <Link
              href="/my/profile"
              onClick={() => setIsOpen(false)}
              className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            >
              View all activity in My Profile →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
