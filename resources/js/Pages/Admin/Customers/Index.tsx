import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
  Users, Search, UserCheck, ShieldAlert, Eye, Edit3, Trash2,
  CheckCircle2, AlertCircle, X, Lock, Mail, User, Clock,
  Bookmark, MessageSquare, History, Globe, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

interface CustomerItem {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
  google_avatar: string | null;
  is_google_linked: boolean;
  google_email: string | null;
  is_active: boolean;
  comments_count: number;
  favorites_count: number;
  reading_history_count: number;
  last_login_at: string;
  last_login_ip: string;
  created_at: string;
}

interface Props {
  auth: {
    user: any;
  };
  customers: {
    data: CustomerItem[];
    current_page: number;
    last_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
  };
  filters: {
    search?: string;
    status?: string;
    google?: string;
  };
  metrics: {
    total_customers: number;
    active_today: number;
    total_comments: number;
    total_favorites: number;
  };
}

export default function CustomersIndex({ auth, customers, filters, metrics }: Props) {
  const [search, setSearch] = useState(filters.search || '');
  const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
  const [googleFilter, setGoogleFilter] = useState(filters.google || 'all');

  // Customer Details Modal
  const [inspectingCustomer, setInspectingCustomer] = useState<any | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Edit Customer Modal
  const [editingCustomer, setEditingCustomer] = useState<CustomerItem | null>(null);
  const { data: editData, setData: setEditData, put: postEdit, processing: editProcessing, errors: editErrors, reset: resetEdit } = useForm({
    name: '',
    email: '',
    password: '',
    is_active: true,
  });

  // Delete Confirmation
  const [customerToDelete, setCustomerToDelete] = useState<CustomerItem | null>(null);

  const handleFilter = (newSearch: string, newStatus: string, newGoogle: string) => {
    router.get(
      '/ourcms/customers',
      {
        search: newSearch || undefined,
        status: newStatus !== 'all' ? newStatus : undefined,
        google: newGoogle !== 'all' ? newGoogle : undefined,
      },
      { preserveState: true, replace: true }
    );
  };

  const openDetails = async (customer: CustomerItem) => {
    setDetailsLoading(true);
    setInspectingCustomer({ customer });
    try {
      const res = await axios.get(`/ourcms/customers/${customer.id}`);
      setInspectingCustomer(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setDetailsLoading(false);
    }
  };

  const openEdit = (customer: CustomerItem) => {
    setEditingCustomer(customer);
    setEditData({
      name: customer.name,
      email: customer.email,
      password: '',
      is_active: customer.is_active,
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;
    postEdit(`/ourcms/customers/${editingCustomer.id}`, {
      preserveScroll: true,
      onSuccess: () => setEditingCustomer(null),
    });
  };

  const handleToggleStatus = (customer: CustomerItem) => {
    router.post(`/ourcms/customers/${customer.id}/toggle`, {}, {
      preserveScroll: true,
    });
  };

  const confirmDelete = () => {
    if (!customerToDelete) return;
    router.delete(`/ourcms/customers/${customerToDelete.id}`, {
      preserveScroll: true,
      onSuccess: () => setCustomerToDelete(null),
    });
  };

  return (
    <AdminLayout auth={auth}>
      <Head title="Reader Accounts (Website Members) — CMS" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                Public Website Members
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
              <Users className="text-red-600" size={26} />
              <span>Reader Accounts</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Registered public readers and subscribers. CMS Administrators, Editors, and Writers are managed separately in <strong className="text-slate-700 dark:text-slate-200">CMS Staff &amp; Admins</strong>.
            </p>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
              Total Readers
            </span>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {metrics.total_customers}
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
              Active Today
            </span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
              {metrics.active_today}
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
              User Comments
            </span>
            <span className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
              {metrics.total_comments}
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
              Saved Favorites
            </span>
            <span className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400">
              {metrics.total_favorites}
            </span>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center gap-3 justify-between">
          <div className="relative w-full md:w-80">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                handleFilter(e.target.value, statusFilter, googleFilter);
              }}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white outline-none focus:border-red-500"
            />
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                handleFilter(search, e.target.value, googleFilter);
              }}
              className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="suspended">Suspended Only</option>
            </select>

            {/* Google Filter */}
            <select
              value={googleFilter}
              onChange={(e) => {
                setGoogleFilter(e.target.value);
                handleFilter(search, statusFilter, e.target.value);
              }}
              className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
            >
              <option value="all">All Authentication</option>
              <option value="connected">Google SSO</option>
              <option value="email">Email / Password</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50/70 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">User</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Engagement</th>
                  <th className="py-3.5 px-4">Last Active</th>
                  <th className="py-3.5 px-4">Joined</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {customers.data.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400">
                      No user accounts found matching your filters.
                    </td>
                  </tr>
                ) : (
                  customers.data.map((c) => {
                    const avatarSrc = c.avatar || c.google_avatar;
                    return (
                      <tr key={c.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/50 transition-colors">
                        {/* Customer */}
                        <td className="py-3.5 px-4 sm:px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                              {avatarSrc ? (
                                <img src={avatarSrc} alt={c.name} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-sm font-black text-slate-500">
                                  {c.name.charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-900 dark:text-white truncate block">
                                  {c.name}
                                </span>
                                {c.is_google_linked && (
                                  <span title="Google SSO Connected" className="inline-block shrink-0">
                                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                                    </svg>
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-400 block truncate">
                                {c.email}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(c)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold cursor-pointer transition-all ${
                              c.is_active
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100'
                                : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 hover:bg-red-100'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${c.is_active ? 'bg-emerald-500' : 'bg-red-500'}`} />
                            <span>{c.is_active ? 'Active' : 'Suspended'}</span>
                          </button>
                        </td>

                        {/* Engagement Stats */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3 text-xs">
                            <span title="Articles Read" className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300">
                              <History size={13} className="text-slate-400" />
                              {c.reading_history_count}
                            </span>
                            <span title="Favorites" className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300">
                              <Bookmark size={13} className="text-amber-500" />
                              {c.favorites_count}
                            </span>
                            <span title="Comments" className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300">
                              <MessageSquare size={13} className="text-red-500" />
                              {c.comments_count}
                            </span>
                          </div>
                        </td>

                        {/* Last Active */}
                        <td className="py-3.5 px-4">
                          <span className="text-slate-700 dark:text-slate-300 block text-xs">
                            {c.last_login_at}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {c.last_login_ip}
                          </span>
                        </td>

                        {/* Joined Date */}
                        <td className="py-3.5 px-4 text-xs text-slate-500 dark:text-slate-400">
                          {c.created_at}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 sm:px-6 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => openDetails(c)}
                              className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                              title="Inspect Activity Details"
                            >
                              <Eye size={15} />
                            </button>

                            <button
                              type="button"
                              onClick={() => openEdit(c)}
                              className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                              title="Edit User"
                            >
                              <Edit3 size={15} />
                            </button>

                            <button
                              type="button"
                              onClick={() => setCustomerToDelete(c)}
                              className="w-8 h-8 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 text-slate-400 hover:text-red-600 flex items-center justify-center transition-colors cursor-pointer"
                              title="Delete User"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {customers.links && customers.links.length > 3 && (
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Total {customers.total} users
              </span>
              <div className="flex items-center gap-1">
                {customers.links.map((link, idx) => (
                  <button
                    key={idx}
                    type="button"
                    disabled={!link.url}
                    onClick={() => link.url && router.visit(link.url)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                      link.active
                        ? 'bg-red-600 text-white'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    } disabled:opacity-40`}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Customer Details Drawer Modal ── */}
      <AnimatePresence>
        {inspectingCustomer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setInspectingCustomer(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10 p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
            >
              <button
                type="button"
                onClick={() => setInspectingCustomer(null)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X size={16} />
              </button>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                  {inspectingCustomer.customer?.avatar ? (
                    <img
                      src={inspectingCustomer.customer.avatar}
                      alt={inspectingCustomer.customer.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl font-black text-slate-400">
                      {inspectingCustomer.customer?.name?.charAt(0)}
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {inspectingCustomer.customer?.name}
                  </h3>
                  <p className="text-xs text-slate-500">{inspectingCustomer.customer?.email}</p>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Registered: {inspectingCustomer.customer?.created_at}
                  </span>
                </div>
              </div>

              {/* Activity Lists */}
              <div className="space-y-6">
                {/* Recent Comments */}
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <MessageSquare size={14} className="text-red-500" />
                    Recent Comments ({inspectingCustomer.recentComments?.length || 0})
                  </h4>
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-3 divide-y divide-slate-100 dark:divide-slate-800">
                    {(!inspectingCustomer.recentComments || inspectingCustomer.recentComments.length === 0) ? (
                      <p className="text-xs text-slate-400 text-center py-2">No comments written yet.</p>
                    ) : (
                      inspectingCustomer.recentComments.map((cmt: any) => (
                        <div key={cmt.id} className="py-2">
                          <span className="text-[11px] font-bold text-red-600 block">
                            On: {cmt.article?.title || 'Article'}
                          </span>
                          <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">"{cmt.content}"</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Recent Favorites */}
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <Bookmark size={14} className="text-amber-500" />
                    Saved Bookmarks ({inspectingCustomer.recentFavorites?.length || 0})
                  </h4>
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-3 divide-y divide-slate-100 dark:divide-slate-800">
                    {(!inspectingCustomer.recentFavorites || inspectingCustomer.recentFavorites.length === 0) ? (
                      <p className="text-xs text-slate-400 text-center py-2">No bookmarks saved yet.</p>
                    ) : (
                      inspectingCustomer.recentFavorites.map((fav: any) => (
                        <div key={fav.id} className="py-2 flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                            {fav.title}
                          </span>
                          <span className="text-[10px] text-slate-400">{fav.category?.name}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Edit Customer Modal ── */}
      <AnimatePresence>
        {editingCustomer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingCustomer(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 z-10 p-6 sm:p-8"
            >
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                Edit User Details
              </h3>
              <p className="text-xs text-slate-500 mb-6">Update name, email or set a new password.</p>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={editData.name}
                    onChange={(e) => setEditData('name', e.target.value)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  />
                  {editErrors.name && <p className="text-xs text-red-600 mt-1">{editErrors.name}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={editData.email}
                    onChange={(e) => setEditData('email', e.target.value)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  />
                  {editErrors.email && <p className="text-xs text-red-600 mt-1">{editErrors.email}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Reset Password (Optional)
                  </label>
                  <input
                    type="password"
                    placeholder="Leave blank to keep unchanged"
                    value={editData.password}
                    onChange={(e) => setEditData('password', e.target.value)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={editData.is_active}
                      onChange={(e) => setEditData('is_active', e.target.checked)}
                      className="rounded text-red-600"
                    />
                    <span>Account Active</span>
                  </label>
                </div>

                <div className="flex justify-end gap-2.5 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditingCustomer(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editProcessing}
                    className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs disabled:opacity-60"
                  >
                    {editProcessing ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Delete Confirmation Modal ── */}
      <AnimatePresence>
        {customerToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCustomerToDelete(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 z-10 p-6 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
                <Trash2 size={20} />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">
                Delete User Account?
              </h3>
              <p className="text-xs text-slate-500 mb-6">
                Are you sure you want to permanently delete <strong>{customerToDelete.name}</strong> ({customerToDelete.email})? This action cannot be undone.
              </p>

              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setCustomerToDelete(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Delete Account
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
