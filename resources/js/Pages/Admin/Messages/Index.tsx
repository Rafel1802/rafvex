import React, { useState, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/Button';
import {
  Mail, Search, Trash2, CheckCircle2, Clock, Check,
  AlertCircle, MessageSquare, ArrowRight, User
} from 'lucide-react';

interface MessageItem {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  ip_address: string | null;
  created_at: string;
}

interface MessagesProps {
  auth: any;
  messages: {
    data: MessageItem[];
    total: number;
    current_page: number;
    last_page: number;
  };
  unreadCount: number;
  filters: {
    search?: string;
    status?: string;
  };
}

export default function Index({ auth, messages, unreadCount = 0, filters = {} }: MessagesProps) {
  const [search, setSearch] = useState(filters.search || '');
  const [selectedMessage, setSelectedMessage] = useState<MessageItem | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get('/ourcms/messages', { search, status: filters.status }, { preserveState: true });
  };

  const handleStatusFilter = (status: string) => {
    router.get('/ourcms/messages', { search, status }, { preserveState: true });
  };

  const markAsRead = (msg: MessageItem) => {
    if (!msg.is_read) {
      router.post(`/ourcms/messages/${msg.id}/read`, {}, {
        preserveScroll: true,
        onSuccess: () => {
          msg.is_read = true;
        }
      });
    }
    setSelectedMessage(msg);
  };

  const markAllRead = () => {
    router.post('/ourcms/messages/read-all', {}, { preserveScroll: true });
  };

  const [messageToDelete, setMessageToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDeleteMessage = () => {
    if (!messageToDelete) return;
    setIsDeleting(true);
    router.delete(`/ourcms/messages/${messageToDelete.id}`, {
      preserveScroll: true,
      onSuccess: () => {
        if (selectedMessage?.id === messageToDelete.id) {
          setSelectedMessage(null);
        }
      },
      onFinish: () => {
        setIsDeleting(false);
        setMessageToDelete(null);
      }
    });
  };

  return (
    <AdminLayout auth={auth}>
      <Head title="Editorial Messages & Inquiries - Rafvex CMS" />

      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-red-600 mb-1">
              <Mail size={14} />
              Reader &amp; Editorial Desk
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-display">
              Editorial Messages &amp; Inquiries
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Messages and inquiry submissions received through the public Contact page.
            </p>
          </div>

          {unreadCount > 0 && (
            <Button
              onClick={markAllRead}
              variant="outline"
              className="text-xs font-bold"
            >
              <CheckCircle2 size={15} className="mr-1.5 text-emerald-600" />
              Mark All as Read ({unreadCount})
            </Button>
          )}
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              onClick={() => handleStatusFilter('')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                !filters.status ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All Messages
            </button>
            <button
              onClick={() => handleStatusFilter('unread')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                filters.status === 'unread' ? 'bg-white dark:bg-slate-700 text-red-600 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Unread
              {unreadCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-red-600 text-white text-[10px] flex items-center justify-center font-black">
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => handleStatusFilter('read')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                filters.status === 'read' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Read
            </button>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search messages..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <Button type="submit" variant="outline" className="text-xs">
              Search
            </Button>
          </form>
        </div>

        {/* Master / Detail Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Messages List */}
          <div className="lg:col-span-5 space-y-2.5">
            {messages.data.map((msg) => {
              const isSelected = selectedMessage?.id === msg.id;

              return (
                <div
                  key={msg.id}
                  onClick={() => markAsRead(msg)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-red-500 bg-red-50/40 dark:bg-red-950/20 shadow-xs'
                      : !msg.is_read
                      ? 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xs font-semibold'
                      : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      {!msg.is_read && (
                        <span className="w-2 h-2 rounded-full bg-red-600 shrink-0" />
                      )}
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {msg.name}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {new Date(msg.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate mb-1">
                    {msg.subject}
                  </h4>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {msg.message}
                  </p>
                </div>
              );
            })}

            {messages.data.length === 0 && (
              <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-6">
                <Mail size={32} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                <h3 className="font-bold text-sm text-slate-700 dark:text-slate-300">No messages found</h3>
                <p className="text-xs text-slate-400 mt-1">Inquiries from the Contact form will appear here.</p>
              </div>
            )}
          </div>

          {/* Right Column: Selected Message Details */}
          <div className="lg:col-span-7">
            {selectedMessage ? (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6 sticky top-24">
                {/* Header */}
                <div className="flex items-start justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2.5 py-0.5 rounded-full bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 text-[10px] font-extrabold uppercase">
                        {selectedMessage.subject}
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">
                      {selectedMessage.name}
                    </h2>
                    <a
                      href={`mailto:${selectedMessage.email}`}
                      className="text-xs font-semibold text-red-600 hover:underline"
                    >
                      {selectedMessage.email}
                    </a>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setMessageToDelete(selectedMessage)}
                      className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                      title="Delete Message"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Message Body */}
                <div className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {selectedMessage.message}
                </div>

                {/* Footer Meta & Reply Button */}
                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
                  <div className="text-[11px] text-slate-400">
                    <span>Received: {new Date(selectedMessage.created_at).toLocaleString()}</span>
                    {selectedMessage.ip_address && (
                      <span className="ml-2">• IP: {selectedMessage.ip_address}</span>
                    )}
                  </div>

                  <a
                    href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject)}`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-2xs"
                  >
                    <Mail size={14} />
                    Reply via Email
                  </a>
                </div>
              </div>
            ) : (
              <div className="h-80 bg-slate-50 dark:bg-slate-900/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                <MessageSquare size={36} className="mb-2 text-slate-300 dark:text-slate-600" />
                <h3 className="font-bold text-sm text-slate-600 dark:text-slate-300">Select a message</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  Click any message on the left to read the full inquiry and reply to the reader.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {messageToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40">
                <Trash2 size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete Message</h3>
                <p className="text-xs text-slate-400">Remove inquiry from inbox.</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300">
              Are you sure you want to delete message from <strong className="text-slate-900 dark:text-white">{messageToDelete.name}</strong> ({messageToDelete.email})?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setMessageToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteMessage}
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
