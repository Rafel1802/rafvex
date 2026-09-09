import React, { useState, useRef } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import {
  User, Camera, Lock, Bookmark, History, Bell, Shield,
  CheckCircle2, AlertCircle, Trash2, ExternalLink, Clock,
  Calendar, Check, ArrowRight, BookOpen, MessageSquare, Flame
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import axios from 'axios';

interface ProfileProps {
  auth: {
    user: any;
  };
  profile: {
    id: number;
    name: string;
    email: string;
    avatar: string | null;
    google_avatar: string | null;
    google_email: string | null;
    google_linked: boolean;
    member_since: string;
    created_at: string;
    has_password: boolean;
  };
  stats: {
    read_count: number;
    favorites_count: number;
    comments_count: number;
  };
  savedArticles: any[];
  readingHistory: any[];
  notifications: any[];
}

export default function ProfileIndex({
  auth,
  profile,
  stats,
  savedArticles,
  readingHistory,
  notifications,
}: ProfileProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'saved' | 'history' | 'security' | 'notifications'>('profile');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatar || profile.google_avatar || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile Form (Name & Avatar)
  const {
    data: profileData,
    setData: setProfileData,
    post: submitProfile,
    processing: profileProcessing,
    errors: profileErrors,
    recentlySuccessful: profileSuccess,
  } = useForm({
    name: profile.name,
    avatar_file: null as File | null,
    remove_avatar: false,
  });

  // Password Form
  const {
    data: passwordData,
    setData: setPasswordData,
    post: submitPassword,
    processing: passwordProcessing,
    errors: passwordErrors,
    reset: resetPassword,
    recentlySuccessful: passwordSuccess,
  } = useForm({
    current_password: '',
    password: '',
    password_confirmation: '',
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileData('avatar_file', file);
      setProfileData('remove_avatar', false);
      const reader = new FileReader();
      reader.onload = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setProfileData('avatar_file', null);
    setProfileData('remove_avatar', true);
    setAvatarPreview(null);
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitProfile('/my/profile', {
      preserveScroll: true,
    });
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitPassword('/my/profile/password', {
      preserveScroll: true,
      onSuccess: () => resetPassword(),
    });
  };

  const handleRemoveSaved = async (articleId: number) => {
    try {
      await axios.post(`/api/articles/${articleId}/favorite`);
      router.reload({ only: ['savedArticles', 'stats'] });
    } catch (e) {}
  };

  const handleClearHistory = async () => {
    if (!confirm('Are you sure you want to clear your reading history?')) return;
    router.delete('/my/profile/history', {
      preserveScroll: true,
    });
  };

  const handleRemoveHistoryItem = async (articleId: number) => {
    router.delete(`/my/profile/history/${articleId}`, {
      preserveScroll: true,
    });
  };

  const effectiveAvatar = avatarPreview || profile.avatar || profile.google_avatar;

  return (
    <PublicLayout auth={auth}>
      <Head title="My Profile & Reading Portal — Rafvex" />

      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '36px 20px 80px' }}>
        {/* ── Top Header Banner Card ── */}
        <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white p-6 sm:p-10 shadow-xl border border-slate-800 overflow-hidden mb-8">
          <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            {/* Avatar with Upload button */}
            <div className="relative group shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden bg-slate-800 border-2 border-slate-700/80 shadow-md flex items-center justify-center">
                {effectiveAvatar ? (
                  <img
                    src={effectiveAvatar}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl sm:text-4xl font-black text-red-500">
                    {profile.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 w-9 h-9 rounded-xl bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105 cursor-pointer border-2 border-slate-900"
                title="Change profile image"
              >
                <Camera size={16} />
              </button>
            </div>

            {/* User Meta */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mb-1.5">
                <h1
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                  className="text-2xl sm:text-3xl font-black text-white tracking-tight"
                >
                  {profile.name}
                </h1>
                {profile.google_linked && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-800/90 text-slate-300 text-[11px] font-semibold border border-slate-700">
                    <CheckCircle2 size={12} className="text-emerald-400" />
                    Google Verified
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mb-4">{profile.email}</p>

              {/* Stats Counters */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-800/90 flex items-center justify-center text-red-400">
                    <BookOpen size={16} />
                  </div>
                  <div>
                    <span className="text-base font-extrabold text-white block leading-tight">
                      {stats.read_count}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                      Read
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-800/90 flex items-center justify-center text-amber-400">
                    <Bookmark size={16} />
                  </div>
                  <div>
                    <span className="text-base font-extrabold text-white block leading-tight">
                      {stats.favorites_count}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                      Saved
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-800/90 flex items-center justify-center text-rose-400">
                    <MessageSquare size={16} />
                  </div>
                  <div>
                    <span className="text-base font-extrabold text-white block leading-tight">
                      {stats.comments_count}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                      Comments
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-400 border-l border-slate-800 pl-4 hidden md:flex">
                  <Calendar size={13} />
                  <span>Member since {profile.member_since}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Navigation Tabs ── */}
        <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 mb-8 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'profile'
                ? 'border-red-600 text-red-600 dark:text-red-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <User size={16} />
            <span>Profile Details</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('saved')}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'saved'
                ? 'border-red-600 text-red-600 dark:text-red-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Bookmark size={16} />
            <span>Saved Articles ({stats.favorites_count})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'history'
                ? 'border-red-600 text-red-600 dark:text-red-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <History size={16} />
            <span>Reading History ({stats.read_count})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'security'
                ? 'border-red-600 text-red-600 dark:text-red-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Shield size={16} />
            <span>Security & Password</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('notifications')}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'notifications'
                ? 'border-red-600 text-red-600 dark:text-red-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Bell size={16} />
            <span>Notifications ({notifications.length})</span>
          </button>
        </div>

        {/* ── Tab 1: Profile Details ── */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <h2
              style={{ fontFamily: "'Outfit', sans-serif" }}
              className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1"
            >
              Edit Profile
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6">
              Manage your display name and public avatar photo.
            </p>

            {profileSuccess && (
              <div className="p-4 mb-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Your profile has been saved successfully!</span>
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-6">
              {/* Avatar Uploader */}
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0 flex items-center justify-center">
                  {effectiveAvatar ? (
                    <img src={effectiveAvatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold text-slate-400 dark:text-slate-500">
                      {profile.name.charAt(0)}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-colors cursor-pointer"
                    >
                      Upload New Photo
                    </button>
                    {effectiveAvatar && (
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500">JPG, PNG, WebP up to 4MB</span>
                </div>
              </div>

              {/* Display Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Display Name *
                </label>
                <input
                  type="text"
                  required
                  value={profileData.name}
                  onChange={(e) => setProfileData('name', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all"
                />
                {profileErrors.name && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">{profileErrors.name}</p>
                )}
              </div>

              {/* Email (Readonly) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  disabled
                  value={profile.email}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-sm text-slate-500 dark:text-slate-400 cursor-not-allowed"
                />
                <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 block">
                  Primary email linked to your account.
                </span>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={profileProcessing}
                  className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all disabled:opacity-60 cursor-pointer"
                >
                  {profileProcessing ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── Tab 2: Saved Articles ── */}
        {activeTab === 'saved' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                  className="text-xl font-bold text-slate-900 dark:text-slate-100"
                >
                  Saved For Later
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Articles you've bookmarked to read anytime.
                </p>
              </div>
            </div>

            {savedArticles.length === 0 ? (
              <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-3">
                  <Bookmark size={22} />
                </div>
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base mb-1">No Saved Articles Yet</h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-5">
                  Click the bookmark icon on any article card across Rafvex to save it here for quick access.
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <span>Explore Articles</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {savedArticles.map((article: any) => (
                  <div
                    key={article.id}
                    className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-3.5 shadow-2xs hover:shadow-lg dark:hover:shadow-slate-950/50 hover:border-red-200 dark:hover:border-red-500/50 transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Cover */}
                      <Link href={`/article/${article.slug}`} className="block aspect-[16/9] rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 mb-3 relative">
                        {article.cover_image_url ? (
                          <img
                            src={article.cover_image_url}
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">
                            Rafvex
                          </div>
                        )}
                        {article.category && (
                          <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-xs text-white text-[10px] font-extrabold uppercase tracking-wider">
                            {article.category.name}
                          </span>
                        )}
                      </Link>

                      <Link href={`/article/${article.slug}`}>
                        <h3
                          style={{ fontFamily: "'Outfit', sans-serif" }}
                          className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-2 leading-snug mb-1"
                        >
                          {article.title}
                        </h3>
                      </Link>

                      {article.excerpt && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-3">
                          {article.excerpt}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
                      <div className="flex items-center gap-1 text-[11px]">
                        <Clock size={11} />
                        <span>{article.reading_time || 4}m read</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveSaved(article.id)}
                        className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 flex items-center gap-1 cursor-pointer transition-colors"
                        title="Remove bookmark"
                      >
                        <Trash2 size={13} />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Tab 3: Reading History ── */}
        {activeTab === 'history' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                  className="text-xl font-bold text-slate-900 dark:text-slate-100"
                >
                  Reading History
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Track the stories and guides you've read on Rafvex.
                </p>
              </div>

              {readingHistory.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearHistory}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-red-300 dark:hover:border-red-500/50 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 size={13} />
                  <span>Clear History</span>
                </button>
              )}
            </div>

            {readingHistory.length === 0 ? (
              <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800">
                <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-3">
                  <History size={22} />
                </div>
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base mb-1">No Reading History</h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-5">
                  When you read guides and articles on Rafvex, they will appear here and receive a "Read" badge on cards.
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <span>Start Reading</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden shadow-xs">
                {readingHistory.map((item: any) => {
                  const article = item.article;
                  if (!article) return null;
                  return (
                    <div
                      key={item.id}
                      className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <Link
                          href={`/article/${article.slug}`}
                          className="w-16 h-14 sm:w-20 sm:h-16 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 block"
                        >
                          {article.cover_image_url ? (
                            <img
                              src={article.cover_image_url}
                              alt={article.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center p-2 bg-slate-50 dark:bg-slate-800">
                              <img src="/favicon.png" alt="Rafvex" className="w-6 h-6 object-contain opacity-40" />
                            </div>
                          )}
                        </Link>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {article.category && (
                              <span className="text-[10px] font-extrabold uppercase tracking-wider text-red-600 dark:text-red-400">
                                {article.category.name}
                              </span>
                            )}
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                              ✓ Read
                            </span>
                          </div>

                          <Link
                            href={`/article/${article.slug}`}
                            className="block font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 hover:text-red-600 dark:hover:text-red-400 transition-colors truncate"
                          >
                            {article.title}
                          </Link>

                          <div className="flex items-center gap-3 text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                            <span>Read {formatDistanceToNow(new Date(item.read_at))} ago</span>
                            {item.read_count > 1 && (
                              <span>• Viewed {item.read_count} times</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveHistoryItem(article.id)}
                        className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                        title="Remove from history"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Tab 4: Security & Password ── */}
        {activeTab === 'security' && (
          <div className="max-w-2xl space-y-8">
            {/* Password Change Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <h2
                style={{ fontFamily: "'Outfit', sans-serif" }}
                className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1"
              >
                Change Password
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6">
                Ensure your account uses a strong password to protect your preferences.
              </p>

              {passwordSuccess && (
                <div className="p-4 mb-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Password changed successfully!</span>
                </div>
              )}

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                {profile.has_password && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Current Password *
                    </label>
                    <input
                      type="password"
                      required
                      value={passwordData.current_password}
                      onChange={(e) => setPasswordData('current_password', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all"
                    />
                    {passwordErrors.current_password && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">{passwordErrors.current_password}</p>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    New Password * (Min 8 chars)
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordData.password}
                    onChange={(e) => setPasswordData('password', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all"
                  />
                  {passwordErrors.password && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">{passwordErrors.password}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Confirm New Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordData.password_confirmation}
                    onChange={(e) => setPasswordData('password_confirmation', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={passwordProcessing}
                    className="px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-red-600 hover:bg-black dark:hover:bg-red-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all disabled:opacity-60 cursor-pointer"
                  >
                    {passwordProcessing ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>

            {/* Google SSO Status */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base mb-1">Google Single Sign-On</h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-4">
                Connected Google accounts allow instantaneous one-tap sign-in.
              </p>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 block">
                      {profile.google_linked ? 'Google Account Connected' : 'Google Account Not Connected'}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {profile.google_linked ? profile.google_email || profile.email : 'Link your Google account for faster login'}
                    </span>
                  </div>
                </div>

                {profile.google_linked ? (
                  <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                    Connected
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold">
                    Not Linked
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Tab 5: Notifications ── */}
        {activeTab === 'notifications' && (
          <div className="max-w-3xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                  className="text-xl font-bold text-slate-900 dark:text-slate-100"
                >
                  Notification History
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Updates on comment discussions and published articles.
                </p>
              </div>
            </div>

            {notifications.length === 0 ? (
              <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center mx-auto mb-3">
                  <Bell size={22} />
                </div>
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base mb-1">No Notifications Yet</h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  When someone replies to your comments or new articles are published, notifications will appear here.
                </p>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden shadow-xs">
                {notifications.map((notif: any) => {
                  const isUnread = !notif.read_at;
                  return (
                    <div
                      key={notif.id}
                      className={`p-4 sm:p-5 flex items-start justify-between gap-4 transition-colors ${
                        isUnread ? 'bg-red-50/30 dark:bg-red-950/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-start gap-3.5 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                          {notif.type === 'new_article' ? (
                            <Flame size={18} className="text-red-500 dark:text-red-400" />
                          ) : (
                            <MessageSquare size={18} className="text-amber-500 dark:text-amber-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 mb-0.5">
                            {notif.title}
                          </h4>
                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-2">
                            {notif.message}
                          </p>
                          <span className="text-[11px] text-slate-400 dark:text-slate-500">
                            {formatDistanceToNow(new Date(notif.created_at))} ago
                          </span>
                        </div>
                      </div>

                      {notif.link && (
                        <Link
                          href={notif.link}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-red-300 dark:hover:border-red-500/50 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 flex items-center gap-1 shrink-0 transition-colors"
                        >
                          <span>View</span>
                          <ExternalLink size={12} />
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
