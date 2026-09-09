import React, { useState, useMemo, useRef } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
  Users, UserPlus, Search, ShieldCheck, PenTool, Edit3, Trash2, Key,
  X, Check, AlertCircle, Camera, Upload, CheckCircle2, Lock, Mail,
  User as UserIcon, Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface UserItem {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
  google_avatar: string | null;
  role: 'superadmin' | 'writer';
  role_label: 'Super Admin' | 'Writer';
  is_active: boolean;
  articles_count: number;
  last_login_at: string | null;
  created_at: string;
}

interface Props {
  auth: {
    user: {
      id?: number;
      name: string;
      email: string;
      avatar: string | null;
      roles?: string[];
    };
  };
  users: {
    data: UserItem[];
    current_page: number;
    last_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
  };
  filters: {
    search?: string;
    role?: string;
  };
}

export default function UsersIndex({ auth, users, filters }: Props) {
  const currentUserId = auth?.user?.id;
  const [search, setSearch] = useState(filters.search || '');
  const [roleFilter, setRoleFilter] = useState(filters.role || 'all');
  
  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserItem | null>(null);

  // Form for Creating User
  const { data: createData, setData: setCreateData, post: postCreate, processing: createProcessing, errors: createErrors, reset: resetCreate } = useForm({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'writer',
    avatar_url: '',
    avatar: null as File | null,
    is_active: true,
  });

  // Form for Editing User
  const { data: editData, setData: setEditData, post: postEdit, processing: editProcessing, errors: editErrors, reset: resetEdit } = useForm({
    _method: 'PUT',
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'writer',
    avatar_url: '',
    avatar: null as File | null,
    is_active: true,
  });

  const createAvatarRef = useRef<HTMLInputElement>(null);
  const editAvatarRef = useRef<HTMLInputElement>(null);

  const [createPreview, setCreatePreview] = useState<string | null>(null);
  const [editPreview, setEditPreview] = useState<string | null>(null);

  // Handle Search & Filter submission
  const handleFilter = (newSearch: string, newRole: string) => {
    router.get(
      '/ourcms/users',
      {
        search: newSearch || undefined,
        role: newRole !== 'all' ? newRole : undefined,
      },
      { preserveState: true, replace: true }
    );
  };

  const openCreateModal = () => {
    resetCreate();
    setCreatePreview(null);
    setIsCreateOpen(true);
  };

  const openEditModal = (user: UserItem) => {
    setEditingUser(user);
    setEditData({
      _method: 'PUT',
      name: user.name,
      email: user.email,
      password: '',
      password_confirmation: '',
      role: user.role,
      avatar_url: user.avatar || '',
      avatar: null,
      is_active: user.is_active,
    });
    setEditPreview(user.avatar || user.google_avatar || null);
  };

  const submitCreate = (e: React.FormEvent) => {
    e.preventDefault();
    postCreate('/ourcms/users', {
      onSuccess: () => {
        setIsCreateOpen(false);
        resetCreate();
        setCreatePreview(null);
      },
    });
  };

  const submitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    postEdit(`/ourcms/users/${editingUser.id}`, {
      onSuccess: () => {
        setEditingUser(null);
        resetEdit();
        setEditPreview(null);
      },
    });
  };

  const confirmDelete = () => {
    if (!userToDelete) return;
    router.delete(`/ourcms/users/${userToDelete.id}`, {
      onSuccess: () => setUserToDelete(null),
    });
  };

  // Stats calculation
  const totalSuperAdmins = useMemo(() => users.data.filter(u => u.role === 'superadmin').length, [users.data]);
  const totalWriters = useMemo(() => users.data.filter(u => u.role === 'writer').length, [users.data]);

  return (
    <AdminLayout auth={auth}>
      <Head title="Admin Users — Rafvex CMS" />

      {/* ── Page Header ── */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-red-600 bg-red-50 dark:bg-red-950/40 px-2.5 py-1 rounded-md border border-red-200 dark:border-red-900/40">
                CMS Staff & Permissions
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-display tracking-tight">
              Admin Users
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Manage CMS staff members with Super Admin or Writer roles. (Public registered customer accounts are in All users).
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
          >
            <UserPlus size={16} />
            <span>Create Admin User</span>
          </button>
        </div>

        {/* ── Quick Metrics ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Admin Users</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white font-display mt-1">{users.total}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
                <Users size={20} />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-red-600 uppercase tracking-wider">Super Admins</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white font-display mt-1">{totalSuperAdmins}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center">
                <ShieldCheck size={20} />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Writers</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white font-display mt-1">{totalWriters}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center">
                <PenTool size={20} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Filter & Search Toolbar ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 mb-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              handleFilter(e.target.value, roleFilter);
            }}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
          />
        </div>

        {/* Role Segment Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-full sm:w-auto">
          {[
            { id: 'all', label: 'All Roles' },
            { id: 'superadmin', label: 'Super Admins' },
            { id: 'writer', label: 'Writers' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setRoleFilter(tab.id);
                handleFilter(search, tab.id);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                roleFilter === tab.id
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Users Table Card ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-3.5 px-6">User / Profile</th>
                <th className="py-3.5 px-6">Assigned Role</th>
                <th className="py-3.5 px-6">Stories / Blogs</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6">Joined Date</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {users.data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Users size={32} className="mx-auto mb-2 opacity-40" />
                    <p className="font-semibold">No users found</p>
                    <p className="text-xs text-slate-400 mt-1">Try adjusting your search or filters.</p>
                  </td>
                </tr>
              ) : (
                users.data.map((user) => {
                  const avatarSrc = user.avatar || user.google_avatar;
                  const initials = user.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .substring(0, 2)
                    .toUpperCase();
                  const isCurrent = user.id === currentUserId;

                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* User Avatar + Name + Email */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3.5">
                          <div className="relative w-10 h-10 rounded-full bg-linear-to-br from-red-600 to-rose-700 text-white font-bold text-xs flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
                            {avatarSrc ? (
                              <img src={avatarSrc} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                              <span>{initials}</span>
                            )}
                            {user.is_active && (
                              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-900 dark:text-white">
                                {user.name}
                              </span>
                              {isCurrent && (
                                <span className="text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 px-1.5 py-0.5 rounded">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                              {user.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge (strictly Super Admin or Writer) */}
                      <td className="py-4 px-6">
                        {user.role === 'superadmin' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/50">
                            <ShieldCheck size={13} className="text-red-600" />
                            Super Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900/50">
                            <PenTool size={13} className="text-indigo-600" />
                            Writer
                          </span>
                        )}
                      </td>

                      {/* Articles count */}
                      <td className="py-4 px-6 font-semibold text-slate-700 dark:text-slate-300">
                        {user.articles_count} {user.articles_count === 1 ? 'article' : 'articles'}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        {user.is_active ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            Inactive
                          </span>
                        )}
                      </td>

                      {/* Joined Date */}
                      <td className="py-4 px-6 text-xs text-slate-500">
                        {user.created_at}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditModal(user)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Edit User & Password"
                          >
                            <Edit3 size={15} />
                          </button>

                          {!isCurrent && (
                            <button
                              type="button"
                              onClick={() => setUserToDelete(user)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                              title="Delete User"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ══════════════════════════════════════════
         CREATE USER MODAL
      ══════════════════════════════════════════ */}
      <AnimatePresence>
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/50 text-red-600 flex items-center justify-center">
                    <UserPlus size={16} />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-900 dark:text-white text-base">Create New User</h2>
                    <p className="text-xs text-slate-500">Add an author or administrator to Rafvex CMS</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={submitCreate} className="p-6 space-y-4">
                {/* Profile Avatar Picker */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                    Profile Image
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                      {createPreview ? (
                        <img src={createPreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon size={24} className="text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        placeholder="Avatar Image URL (https://...)"
                        value={createData.avatar_url}
                        onChange={(e) => {
                          setCreateData('avatar_url', e.target.value);
                          setCreatePreview(e.target.value || null);
                        }}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white"
                      />
                      <input
                        type="file"
                        ref={createAvatarRef}
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setCreateData('avatar', file);
                            setCreatePreview(URL.createObjectURL(file));
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => createAvatarRef.current?.click()}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-lg transition-colors"
                      >
                        <Upload size={12} /> Upload from Computer
                      </button>
                    </div>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sarah Jenkins"
                    value={createData.name}
                    onChange={(e) => setCreateData('name', e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  />
                  {createErrors.name && <p className="text-xs text-red-500 mt-1">{createErrors.name}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="sarah@example.com"
                    value={createData.email}
                    onChange={(e) => setCreateData('email', e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  />
                  {createErrors.email && <p className="text-xs text-red-500 mt-1">{createErrors.email}</p>}
                </div>

                {/* Role Selector (Strictly Super Admin or Writer) */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Role & Permissions <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label
                      className={`flex flex-col p-3 rounded-xl border cursor-pointer transition-all ${
                        createData.role === 'writer'
                          ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/20'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value="writer"
                        checked={createData.role === 'writer'}
                        onChange={() => setCreateData('role', 'writer')}
                        className="sr-only"
                      />
                      <div className="flex items-center gap-2 mb-1">
                        <PenTool size={15} className="text-indigo-600" />
                        <span className="font-bold text-sm text-slate-900 dark:text-white">Writer</span>
                      </div>
                      <span className="text-[11px] text-slate-500">Draft & publish stories</span>
                    </label>

                    <label
                      className={`flex flex-col p-3 rounded-xl border cursor-pointer transition-all ${
                        createData.role === 'superadmin'
                          ? 'border-red-600 bg-red-50/40 dark:bg-red-950/20'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value="superadmin"
                        checked={createData.role === 'superadmin'}
                        onChange={() => setCreateData('role', 'superadmin')}
                        className="sr-only"
                      />
                      <div className="flex items-center gap-2 mb-1">
                        <ShieldCheck size={15} className="text-red-600" />
                        <span className="font-bold text-sm text-slate-900 dark:text-white">Super Admin</span>
                      </div>
                      <span className="text-[11px] text-slate-500">Full control & settings</span>
                    </label>
                  </div>
                  {createErrors.role && <p className="text-xs text-red-500 mt-1">{createErrors.role}</p>}
                </div>

                {/* Password & Confirm Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Min 8 characters"
                      value={createData.password}
                      onChange={(e) => setCreateData('password', e.target.value)}
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                    />
                    {createErrors.password && <p className="text-xs text-red-500 mt-1">{createErrors.password}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Confirm password"
                      value={createData.password_confirmation}
                      onChange={(e) => setCreateData('password_confirmation', e.target.value)}
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                    />
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createProcessing}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-xs disabled:opacity-50"
                  >
                    {createProcessing ? 'Creating...' : 'Create User'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════
         EDIT USER MODAL
      ══════════════════════════════════════════ */}
      <AnimatePresence>
        {editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/50 text-red-600 flex items-center justify-center">
                    <Edit3 size={16} />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-900 dark:text-white text-base">Edit User</h2>
                    <p className="text-xs text-slate-500">Update profile, role, and change password</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={submitEdit} className="p-6 space-y-4">
                {/* Profile Avatar Picker */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                    Profile Image
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                      {editPreview ? (
                        <img src={editPreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon size={24} className="text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        placeholder="Avatar Image URL (https://...)"
                        value={editData.avatar_url}
                        onChange={(e) => {
                          setEditData('avatar_url', e.target.value);
                          setEditPreview(e.target.value || null);
                        }}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white"
                      />
                      <input
                        type="file"
                        ref={editAvatarRef}
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setEditData('avatar', file);
                            setEditPreview(URL.createObjectURL(file));
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => editAvatarRef.current?.click()}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-lg transition-colors"
                      >
                        <Upload size={12} /> Upload from Computer
                      </button>
                    </div>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editData.name}
                    onChange={(e) => setEditData('name', e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  />
                  {editErrors.name && <p className="text-xs text-red-500 mt-1">{editErrors.name}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={editData.email}
                    onChange={(e) => setEditData('email', e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  />
                  {editErrors.email && <p className="text-xs text-red-500 mt-1">{editErrors.email}</p>}
                </div>

                {/* Role Selector (Strictly Super Admin or Writer) */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Role & Permissions <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label
                      className={`flex flex-col p-3 rounded-xl border cursor-pointer transition-all ${
                        editData.role === 'writer'
                          ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/20'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="edit_role"
                        value="writer"
                        checked={editData.role === 'writer'}
                        onChange={() => setEditData('role', 'writer')}
                        className="sr-only"
                      />
                      <div className="flex items-center gap-2 mb-1">
                        <PenTool size={15} className="text-indigo-600" />
                        <span className="font-bold text-sm text-slate-900 dark:text-white">Writer</span>
                      </div>
                      <span className="text-[11px] text-slate-500">Draft & publish stories</span>
                    </label>

                    <label
                      className={`flex flex-col p-3 rounded-xl border cursor-pointer transition-all ${
                        editData.role === 'superadmin'
                          ? 'border-red-600 bg-red-50/40 dark:bg-red-950/20'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="edit_role"
                        value="superadmin"
                        checked={editData.role === 'superadmin'}
                        onChange={() => setEditData('role', 'superadmin')}
                        className="sr-only"
                      />
                      <div className="flex items-center gap-2 mb-1">
                        <ShieldCheck size={15} className="text-red-600" />
                        <span className="font-bold text-sm text-slate-900 dark:text-white">Super Admin</span>
                      </div>
                      <span className="text-[11px] text-slate-500">Full control & settings</span>
                    </label>
                  </div>
                  {editErrors.role && <p className="text-xs text-red-500 mt-1">{editErrors.role}</p>}
                </div>

                {/* Change Password (Optional) */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                    <Key size={13} className="text-amber-500" />
                    <span>Change Password (Leave blank to keep current)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <input
                        type="password"
                        placeholder="New password (optional)"
                        value={editData.password}
                        onChange={(e) => setEditData('password', e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                      />
                      {editErrors.password && <p className="text-xs text-red-500 mt-1">{editErrors.password}</p>}
                    </div>
                    <div>
                      <input
                        type="password"
                        placeholder="Confirm new password"
                        value={editData.password_confirmation}
                        onChange={(e) => setEditData('password_confirmation', e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editProcessing}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-xs disabled:opacity-50"
                  >
                    {editProcessing ? 'Saving Changes...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════
         DELETE CONFIRMATION MODAL
      ══════════════════════════════════════════ */}
      <AnimatePresence>
        {userToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl text-center"
            >
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/50 text-red-600 flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete User Account</h3>
              <p className="text-sm text-slate-500 mt-2">
                Are you sure you want to delete <strong className="text-slate-900 dark:text-white">{userToDelete.name}</strong> ({userToDelete.email})? This action cannot be undone.
              </p>
              <div className="flex items-center justify-center gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setUserToDelete(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-xs"
                >
                  Delete User
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
