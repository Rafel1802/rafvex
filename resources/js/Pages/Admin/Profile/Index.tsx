import React, { useState, useRef } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
  User, Mail, Lock, Upload, Camera, Check,
  AlertCircle, X, Eye, EyeOff, KeyRound, Unlink,
  ShieldCheck, Calendar, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

declare const google: any;

interface ProfileUser {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
  google_id: string | null;
  google_email: string | null;
  google_avatar: string | null;
  google_linked_at: string | null;
  roles: string[];
  created_at: string;
}

interface Props {
  auth: { user: any };
  profileUser: ProfileUser;
  google_client_id: string;
}

export default function ProfileIndex({ auth, profileUser, google_client_id }: Props) {
  const [avatarPreview, setAvatarPreview] = useState<string>(profileUser.avatar || '');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [googleStatus, setGoogleStatus] = useState({
    linked: !!profileUser.google_id,
    email: profileUser.google_email,
    avatar: profileUser.google_avatar,
    linked_at: profileUser.google_linked_at,
  });
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleMsg, setGoogleMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);

  const { data, setData, post, processing, errors, reset } = useForm({
    name: profileUser.name,
    email: profileUser.email,
    password: '',
    password_confirmation: '',
    avatar: null as File | null,
    avatar_url: profileUser.avatar || '',
  });

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setData('avatar', file);
      const reader = new FileReader();
      reader.onload = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/ourcms/profile', {
      preserveScroll: true,
      forceFormData: true,
      onSuccess: () => reset('password', 'password_confirmation'),
    });
  };

  const handleConnectGoogle = () => {
    setGoogleLoading(true);
    setGoogleMsg(null);
    try {
      google.accounts.id.initialize({
        client_id: google_client_id,
        callback: async (response: any) => {
          try {
            const res = await axios.post('/ourcms/auth/google/connect', { id_token: response.credential });
            if (res.data.success) {
              setGoogleStatus({ linked: true, email: res.data.google_email, avatar: res.data.google_avatar, linked_at: res.data.google_linked_at });
              setGoogleMsg({ type: 'success', text: res.data.message });
            } else {
              setGoogleMsg({ type: 'error', text: res.data.message });
            }
          } catch (err: any) {
            setGoogleMsg({ type: 'error', text: err?.response?.data?.message || 'Failed to connect Google account.' });
          } finally {
            setGoogleLoading(false);
          }
        },
      });
      google.accounts.id.prompt();
    } catch {
      setGoogleLoading(false);
      setGoogleMsg({ type: 'error', text: 'Google Sign-In unavailable. Please refresh and try again.' });
    }
  };

  const handleDisconnectGoogle = async () => {
    if (!window.confirm('Are you sure you want to unlink your Google account?')) return;
    setGoogleLoading(true);
    setGoogleMsg(null);
    try {
      const res = await axios.post('/ourcms/auth/google/disconnect');
      if (res.data.success) {
        setGoogleStatus({ linked: false, email: null, avatar: null, linked_at: null });
        setGoogleMsg({ type: 'success', text: 'Google account unlinked successfully.' });
      }
    } catch (err: any) {
      setGoogleMsg({ type: 'error', text: err?.response?.data?.message || 'Failed to disconnect.' });
    } finally {
      setGoogleLoading(false);
    }
  };

  const initials = profileUser.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  const roleLabel = profileUser.roles?.[0] || 'Administrator';

  const GoogleIcon = () => (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
    </svg>
  );

  return (
    <AdminLayout auth={auth}>
      <Head title="My Profile — CMS" />
      <script src="https://accounts.google.com/gsi/client" async defer />

      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-red-600 bg-red-50 dark:bg-red-950/40 px-2.5 py-1 rounded-md border border-red-200 dark:border-red-900/40">
            Account Settings
          </span>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-2">My CMS Profile</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Update your name, email, profile image, and password — separate from Site Settings.
          </p>
        </div>

        {/* Summary Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex items-center gap-4">
          <div
            className="relative w-14 h-14 rounded-2xl overflow-hidden shrink-0 cursor-pointer group"
            onClick={() => fileRef.current?.click()}
          >
            {avatarPreview ? (
              <img src={avatarPreview} alt={profileUser.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-lg font-bold bg-gradient-to-br from-red-600 to-rose-700 text-white">
                {initials}
              </div>
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
              <Camera size={16} className="text-white" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-slate-900 dark:text-white truncate">{profileUser.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{profileUser.email}</p>
            <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold uppercase tracking-wider text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded-full border border-red-200 dark:border-red-900/40">
              <ShieldCheck size={9} /> {roleLabel}
            </span>
          </div>
          <div className="hidden sm:block text-right shrink-0">
            <p className="text-[10px] text-slate-400">Member since</p>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1 justify-end">
              <Calendar size={10} className="text-slate-400" /> {profileUser.created_at}
            </p>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-5">
          <h2 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <User size={14} className="text-red-600" /> Profile Information
          </h2>

          {/* Avatar */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Profile Image</label>
            <div className="flex items-center gap-4">
              <div
                className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-dashed border-slate-300 dark:border-slate-600 cursor-pointer group shrink-0"
                style={{ backgroundColor: '#ffffff' }}
                onClick={() => fileRef.current?.click()}
              >
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Preview" className="w-full h-full object-contain" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300"><Camera size={22} /></div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Upload size={13} className="text-white" />
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
                <button
                  type="button" onClick={() => fileRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <Upload size={11} /> Upload Photo
                </button>
                <input
                  type="url" placeholder="Or paste image URL..."
                  value={data.avatar_url}
                  onChange={(e) => { setData('avatar_url', e.target.value); if (e.target.value) setAvatarPreview(e.target.value); }}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                />
              </div>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Display Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text" required value={data.name} onChange={(e) => setData('name', e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
              />
            </div>
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email" required value={data.email} onChange={(e) => setData('email', e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
              />
            </div>
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>

          {/* Password */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-3">
              <KeyRound size={12} /> Change Password
              <span className="font-normal normal-case">(leave blank to keep current)</span>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">New Password</label>
                <div className="relative">
                  <Lock size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'} value={data.password} placeholder="Min 8 chars"
                    onChange={(e) => setData('password', e.target.value)}
                    className="w-full pl-9 pr-9 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer">
                    {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Confirm Password</label>
                <div className="relative">
                  <Lock size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showConfirm ? 'text' : 'password'} value={data.password_confirmation} placeholder="Repeat password"
                    onChange={(e) => setData('password_confirmation', e.target.value)}
                    className="w-full pl-9 pr-9 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer">
                    {showConfirm ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit" disabled={processing}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold shadow-sm disabled:opacity-60 transition-all cursor-pointer"
            >
              {processing ? <RefreshCw size={13} className="animate-spin" /> : <Check size={13} />}
              {processing ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>

        {/* Google Account */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
          <h2 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
            <GoogleIcon /> Google Account
          </h2>

          <AnimatePresence>
            {googleMsg && (
              <motion.div
                initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className={`mb-4 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                  googleMsg.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                }`}
              >
                {googleMsg.type === 'success' ? <Check size={12} /> : <AlertCircle size={12} />}
                {googleMsg.text}
                <button type="button" onClick={() => setGoogleMsg(null)} className="ml-auto cursor-pointer"><X size={11} /></button>
              </motion.div>
            )}
          </AnimatePresence>

          {googleStatus.linked ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {googleStatus.avatar && (
                  <img src={googleStatus.avatar} alt="Google" className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 shrink-0" />
                )}
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">Connected</span>
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-extrabold uppercase bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded-full">
                      <Check size={8} /> Linked
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{googleStatus.email}</p>
                  {googleStatus.linked_at && (
                    <p className="text-[11px] text-slate-400 mt-0.5">Linked on {googleStatus.linked_at}</p>
                  )}
                </div>
              </div>
              <button
                type="button" onClick={handleDisconnectGoogle} disabled={googleLoading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-red-600 border border-red-200 dark:border-red-800/60 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {googleLoading ? <RefreshCw size={12} className="animate-spin" /> : <Unlink size={12} />}
                Unlink Google
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No Google account linked</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Link Google to sign in with one click instead of email &amp; password.
                </p>
              </div>
              <button
                type="button" onClick={handleConnectGoogle} disabled={googleLoading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                {googleLoading ? <RefreshCw size={12} className="animate-spin" /> : <GoogleIcon />}
                Connect Google
              </button>
            </div>
          )}
        </div>

      </div>
    </AdminLayout>
  );
}
