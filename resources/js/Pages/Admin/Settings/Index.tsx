import React, { useRef, useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Upload, X, Globe, Palette, Search, BookOpen, Link2, Unlink, CheckCircle2, Save, Sparkles, Shield, Bell, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

declare global {
  interface Window { google?: any; }
}

/* ─── FileUploader ─────────────────────────────────────────────── */
function FileUploader({
  label, fieldName, currentUrl, accept = 'image/*', description
}: {
  label: string; fieldName: string; currentUrl?: string; accept?: string; description?: string;
}) {
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">{label}</label>
      {description && <p className="text-xs text-slate-400 dark:text-slate-500 mb-2.5">{description}</p>}

      <div className="flex items-center gap-4">
        {preview ? (
          <div className="relative">
            <img src={preview} alt={label} className="h-14 w-auto max-w-[120px] object-contain rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-1" />
            <button
              type="button"
              onClick={() => { setPreview(null); if (inputRef.current) inputRef.current.value = ''; }}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
            >
              <X size={11} />
            </button>
          </div>
        ) : (
          <div className="w-14 h-14 rounded-lg bg-slate-50 dark:bg-slate-800/80 border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400">
            <Upload size={18} />
          </div>
        )}

        <div>
          <input
            ref={inputRef}
            type="file"
            name={fieldName}
            accept={accept}
            className="hidden"
            onChange={e => {
              const file = e.target.files?.[0];
              if (file) {
                const url = URL.createObjectURL(file);
                setPreview(url);
              }
            }}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-red-500 transition-all cursor-pointer shadow-xs"
          >
            <Upload size={13} /> Upload {label}
          </button>
          <p className="text-[11px] text-slate-400 mt-1">PNG, JPG, SVG, ICO • Max 2MB</p>
        </div>
      </div>
    </div>
  );
}

/* ─── InputField ───────────────────────────────────────────────── */
function InputField({ label, name, value, onChange, type = 'text', placeholder }: any) {
  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">{label}</label>
      <input
        type={type}
        name={name}
        value={value ?? ''}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
      />
    </div>
  );
}

/* ─── TextareaField ────────────────────────────────────────────── */
function TextareaField({ label, name, value, onChange, rows = 3, placeholder }: any) {
  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">{label}</label>
      <textarea
        name={name}
        value={value ?? ''}
        onChange={onChange}
        rows={rows}
        placeholder={placeholder}
        className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all resize-y"
      />
    </div>
  );
}

/* ─── Section ──────────────────────────────────────────────────── */
function Section({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
      <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-950/50 text-red-600 flex items-center justify-center">
          <Icon size={16} />
        </div>
        <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">{title}</h2>
      </div>
      <div className="p-6 space-y-5">
        {children}
      </div>
    </div>
  );
}

/* ─── GoogleAccountSection ─────────────────────────────────────── */
const GOOGLE_CLIENT_ID = '424918974382-qbnphracdndii7vf9fhc1vf0n5e7qdgp.apps.googleusercontent.com';

function GoogleAccountSection({ initialStatus }: { initialStatus: { linked: boolean; email: string | null; avatar: string | null; linked_at: string | null } }) {
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [googleReady, setGoogleReady] = useState(false);

  const csrfToken = () =>
    document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';

  useEffect(() => {
    if (window.google?.accounts?.id) { initGoogle(); return; }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initGoogle;
    document.head.appendChild(script);
  }, []);

  const initGoogle = () => {
    try {
      window.google?.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleConnectCredential,
        auto_select: false,
      });
      setGoogleReady(true);
    } catch (err) {
      console.error('Google initialization error:', err);
    }
  };

  const handleConnectCredential = async (response: any) => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/ourcms/auth/google/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken(), 'Accept': 'application/json' },
        body: JSON.stringify({ id_token: response.credential }),
      });
      const json = await res.json();
      if (json.success) {
        setStatus({ linked: true, email: json.google_email, avatar: json.google_avatar, linked_at: json.google_linked_at });
        setMessage({ type: 'success', text: json.message });
      } else {
        setMessage({ type: 'error', text: json.message ?? 'Failed to connect Google account.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = () => {
    if (!googleReady || !window.google) {
      setMessage({ type: 'error', text: 'Google Sign-In is loading. Please wait and try again.' });
      return;
    }
    setMessage(null);
    window.google.accounts.id.prompt((notification: any) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        const container = document.getElementById('google-connect-container');
        if (container) {
          container.innerHTML = '';
          window.google.accounts.id.renderButton(container, {
            type: 'standard', theme: 'outline', size: 'large', width: 340,
          });
          const btn = container.querySelector('div[role="button"]') as HTMLElement;
          btn?.click();
        }
      }
    });
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect your Google account? You will only be able to sign in with email and password.')) return;
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/ourcms/auth/google/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken(), 'Accept': 'application/json' },
      });
      const json = await res.json();
      if (json.success) {
        setStatus({ linked: false, email: null, avatar: null, linked_at: null });
        setMessage({ type: 'success', text: json.message });
      } else {
        setMessage({ type: 'error', text: json.message ?? 'Failed to disconnect.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Section title="Google Account SSO" icon={Link2}>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Link your Google account to enable one-click "Continue with Google" sign-in on the CMS login page.
      </p>

      {/* Status Card */}
      <div className={`p-4 rounded-xl border transition-colors ${
        status.linked
          ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50'
          : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800'
      }`}>
        <div className="flex items-center gap-3.5">
          {status.linked && status.avatar ? (
            <img src={status.avatar} alt="Google Avatar" className="w-10 h-10 rounded-full border border-emerald-300 dark:border-emerald-700" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-xs">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {status.linked ? 'Google Account Connected' : 'No Account Linked'}
              </p>
              {status.linked && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                  <CheckCircle2 size={11} /> Linked
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
              {status.linked ? status.email : 'Sign in faster next time using continue with Google.'}
            </p>
          </div>
        </div>
      </div>

      <div id="google-connect-container" className="hidden" />

      {/* Feedback Message */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`p-3 rounded-xl text-xs font-semibold border ${
              message.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-300'
                : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300'
            }`}
          >
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action button */}
      <div>
        {status.linked ? (
          <button
            type="button"
            onClick={handleDisconnect}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl border border-red-200 dark:border-red-900/50 bg-white dark:bg-slate-800 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all cursor-pointer shadow-xs disabled:opacity-50"
          >
            <Unlink size={14} />
            {loading ? 'Disconnecting...' : 'Disconnect Google Account'}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleConnect}
            disabled={loading}
            className="inline-flex items-center gap-2.5 px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white hover:border-red-500 transition-all cursor-pointer shadow-xs disabled:opacity-50"
          >
            {loading ? (
              <span className="w-4 h-4 rounded-full border-2 border-slate-300 border-t-red-600 animate-spin" />
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            {loading ? 'Connecting...' : 'Connect Google Account'}
          </button>
        )}
      </div>
    </Section>
  );
}

/* ─── PusherBeamsSection ───────────────────────────────────────── */
function PusherBeamsSection({ formData, handleChange }: any) {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [permissionState, setPermissionState] = useState<string>('default');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermissionState(Notification.permission);
    }
  }, []);

  const handleRequestPermission = async () => {
    try {
      if ((window as any).beamsClient) {
        await (window as any).beamsClient.start();
        await (window as any).beamsClient.addDeviceInterest('hello');
        await (window as any).beamsClient.addDeviceInterest('admin');
        if ('Notification' in window) {
          setPermissionState(Notification.permission);
        }
        alert('Device successfully registered with Pusher Beams! (Interests: hello, admin)');
      } else if ('Notification' in window) {
        const perm = await Notification.requestPermission();
        setPermissionState(perm);
      }
    } catch (e: any) {
      alert('Registration notice: ' + (e?.message || e));
    }
  };

  const handleSendTest = async () => {
    setTesting(true);
    setTestResult(null);
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';

    try {
      const res = await fetch('/ourcms/settings/test-notification', {
        method: 'POST',
        headers: { 'X-CSRF-TOKEN': csrfToken, 'Accept': 'application/json' },
      });
      const data = await res.json();
      setTestResult(data);
    } catch {
      setTestResult({ success: false, message: 'Network error sending test notification.' });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Section title="Real-Time Push Notifications (Pusher Beams)" icon={Bell}>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Pusher Beams delivers real-time web push notifications directly to your desktop or mobile browser when comments, contact inquiries, and important system activities occur.
      </p>

      {/* Connection Card */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Device Status</span>
          </div>
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
            permissionState === 'granted'
              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
              : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
          }`}>
            {permissionState === 'granted' ? 'Notifications Allowed' : 'Permission: ' + permissionState}
          </span>
        </div>

        <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
          <div><strong>Subscribed Interests:</strong> <code className="text-red-600 bg-red-50 dark:bg-red-950/50 px-1.5 py-0.5 rounded font-mono text-[11px]">hello</code>, <code className="text-red-600 bg-red-50 dark:bg-red-950/50 px-1.5 py-0.5 rounded font-mono text-[11px]">admin</code></div>
          <div><strong>Service Worker:</strong> <code className="text-slate-700 dark:text-slate-300 font-mono text-[11px]">/service-worker.js</code> (Pusher Beams SDK 2.1.0)</div>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          <button
            type="button"
            onClick={handleRequestPermission}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:border-red-500 transition-all cursor-pointer shadow-2xs"
          >
            <Bell size={13} className="text-red-600" />
            <span>Register Browser / Request Permission</span>
          </button>

          <button
            type="button"
            onClick={handleSendTest}
            disabled={testing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all cursor-pointer shadow-2xs disabled:opacity-50"
          >
            <Send size={13} />
            <span>{testing ? 'Sending Test...' : 'Send Test Notification'}</span>
          </button>
        </div>

        {testResult && (
          <div className={`p-2.5 rounded-lg text-xs font-medium ${
            testResult.success 
              ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' 
              : 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
          }`}>
            {testResult.message}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4">
        <InputField
          label="Pusher Beams Instance ID"
          name="pusher_beams_instance_id"
          value={formData.pusher_beams_instance_id || '282c56a0-960e-404f-bf35-647dbc68722b'}
          onChange={handleChange}
          placeholder="282c56a0-960e-404f-bf35-647dbc68722b"
        />

        <InputField
          label="Pusher Beams Primary Secret Key"
          name="pusher_beams_secret_key"
          value={formData.pusher_beams_secret_key}
          onChange={handleChange}
          type="password"
          placeholder="Paste your Pusher Beams Primary Key (from Keys tab)"
        />
      </div>

      {/* Triggers list */}
      <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">Active Push Notification Triggers</div>
        <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            <span><strong>New Article Comments:</strong> Instant push alert with author name, article title, and excerpt.</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            <span><strong>Get In Touch Form:</strong> Real-time alerts when visitors send news tips or inquiries.</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            <span><strong>Important Activity:</strong> Crucial administrative & security events.</span>
          </li>
        </ul>
      </div>
    </Section>
  );
}

/* ─── Main Settings Page (Widescreen 2-Column Dashboard) ────────── */
export default function SettingsIndex({ auth, settings, google_status }: any) {
  const [formData, setFormData] = useState(settings ?? {});
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const form = e.currentTarget;
    const fd = new FormData(form);
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';

    try {
      const res = await fetch('/ourcms/settings', {
        method: 'POST',
        headers: { 'X-CSRF-TOKEN': csrfToken },
        body: fd,
      });

      if (res.ok || res.redirected) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout auth={auth}>
      <Head title="Settings — Rafvex CMS" />

      {/* ── Page Header (Widescreen) ── */}
      <div className="w-full max-w-[1600px] mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-red-600 bg-red-50 dark:bg-red-950/40 px-2.5 py-1 rounded-md border border-red-200 dark:border-red-900/40">
                Site Configuration
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-display tracking-tight">
              Settings & Branding
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Manage site identity, favicon, brand assets, SEO defaults, social connections, and Google SSO.
            </p>
          </div>

          <button
            type="submit"
            form="settings-form"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold shadow-sm hover:shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
          >
            <Save size={16} />
            <span>{submitting ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>

        {/* Success banner */}
        <AnimatePresence>
          {saved && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 rounded-xl text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-2"
            >
              <CheckCircle2 size={16} /> Settings saved and cache refreshed successfully!
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Main Form Grid (No Empty Space on Right) ── */}
      <form id="settings-form" onSubmit={handleSubmit} encType="multipart/form-data" className="w-full max-w-[1600px]">
        <input type="hidden" name="_token" value={document.querySelector('meta[name=csrf-token]')?.getAttribute('content') ?? ''} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ── Left Column: Identity & Branding ── */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Site Identity */}
            <Section title="Site Identity" icon={BookOpen}>
              <InputField label="Site Name" name="site_name" value={formData.site_name} onChange={handleChange} placeholder="e.g. Rafvex" />
              <InputField label="Site Tagline" name="site_tagline" value={formData.site_tagline} onChange={handleChange} placeholder="e.g. Premium Tech & AI Guides" />
              <TextareaField label="Site Description" name="site_description" value={formData.site_description} onChange={handleChange} placeholder="Used in search engine meta description fallback" rows={2} />
            </Section>

            {/* Branding & Icons */}
            <Section title="Branding & Icons" icon={Palette}>
              <p className="text-xs text-slate-500 dark:text-slate-400 pb-2 border-b border-slate-100 dark:border-slate-800">
                Upload your favicon, logo, and OG image. These appear in the browser tab, site header, and social sharing previews.
              </p>
              <FileUploader label="Favicon" fieldName="favicon" currentUrl={formData.favicon} accept="image/x-icon,image/png,image/svg+xml,image/gif" description="Browser tab icon. Use 32×32 or 64×64 ICO/PNG" />
              <FileUploader label="Site Logo" fieldName="logo" currentUrl={formData.logo} description="Displayed in site header and CMS. Use SVG or PNG with transparent background" />
              <FileUploader label="CMS Login Cover Image" fieldName="login_bg_image" currentUrl={formData.login_bg_image || '/images/cms_login_bg.jpg'} description="Custom background image for CMS login screen. Recommended: 1280×1280 px" />
              <FileUploader label="Default OG Image" fieldName="og_default_image" currentUrl={formData.og_default_image} description="Used when an article has no cover image. Recommended: 1200×630" />
            </Section>

            {/* Pusher Beams Real-Time Push Notifications */}
            <PusherBeamsSection formData={formData} handleChange={handleChange} />

          </div>

          {/* ── Right Column: Google SSO, SEO & Social ── */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Google SSO Account Card */}
            <GoogleAccountSection initialStatus={google_status ?? { linked: false, email: null, avatar: null, linked_at: null }} />

            {/* SEO Defaults */}
            <Section title="SEO & Analytics" icon={Search}>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                Track reader traffic, daily visitor counts, and popular articles on your blog with Google Analytics 4 (GA4).
              </p>
              <InputField label="Google Analytics ID" name="analytics_id" value={formData.analytics_id} onChange={handleChange} placeholder="G-XXXXXXXXXX" />
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5">
                Optional. Enter your GA4 Measurement ID starting with <code>G-</code> (from analytics.google.com). Leave blank if not used.
              </p>
            </Section>

            {/* Social Links & Communities */}
            <Section title="Social Media Channels" icon={Globe}>
              <p className="text-xs text-slate-400 dark:text-slate-500 mb-2">
                Configure your official public profiles. These appear in the header, footer, contact page, and share cards.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField label="Twitter / 𝕏 Handle" name="twitter_handle" value={formData.twitter_handle} onChange={handleChange} placeholder="@rafvex" />
                <InputField label="Telegram Channel / Link" name="telegram_url" value={formData.telegram_url} onChange={handleChange} placeholder="https://t.me/rafvex" />
                <InputField label="Facebook Page URL" name="facebook_url" value={formData.facebook_url} onChange={handleChange} placeholder="https://facebook.com/rafvex" />
                <InputField label="LinkedIn URL" name="linkedin_url" value={formData.linkedin_url} onChange={handleChange} placeholder="https://linkedin.com/company/rafvex" />
                <InputField label="YouTube Channel" name="youtube_url" value={formData.youtube_url} onChange={handleChange} placeholder="https://youtube.com/@rafvex" />
                <InputField label="Instagram Profile" name="instagram_url" value={formData.instagram_url} onChange={handleChange} placeholder="https://instagram.com/rafvex" />
                <InputField label="GitHub Profile" name="github_url" value={formData.github_url} onChange={handleChange} placeholder="https://github.com/rafvex" />
              </div>
            </Section>

            {/* Contact Channels */}
            <Section title="Contact & Inquiries" icon={Link2}>
              <InputField label="Official Contact Email" name="contact_email" value={formData.contact_email} onChange={handleChange} placeholder="rafvexofficial@gmail.com" />
              <InputField label="Editorial Phone / WhatsApp" name="contact_phone" value={formData.contact_phone} onChange={handleChange} placeholder="+1 (555) 019-2834" />
              <InputField label="Editorial Location / Address" name="contact_address" value={formData.contact_address} onChange={handleChange} placeholder="e.g. Phnom Penh, Cambodia / Global" />
            </Section>

            {/* Founder & Lead Writer Identity */}
            <Section title="Founder & Lead Writer" icon={Sparkles}>
              <FileUploader
                label="Founder Profile Photo / Avatar"
                fieldName="founder_avatar"
                currentUrl={formData.founder_avatar}
                description="Profile photo for About Us spotlight, author bio cards, and public editorial channels. Recommended: Square 1:1 ratio (500×500 px or larger)"
              />
              <InputField label="Founder Name" name="founder_name" value={formData.founder_name} onChange={handleChange} placeholder="Mr. Soporadara Rin" />
              <InputField label="Founder Title" name="founder_title" value={formData.founder_title} onChange={handleChange} placeholder="Founder, Writer & Lead Researcher" />
              <TextareaField label="Founder Bio / Message" name="founder_bio" value={formData.founder_bio} onChange={handleChange} placeholder="Brief editorial philosophy and background for About Us and footer" rows={3} />
            </Section>

            {/* Bottom Save Button */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold shadow-sm hover:shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
              >
                <Save size={16} />
                <span>{submitting ? 'Saving Changes...' : 'Save Settings'}</span>
              </button>
            </div>

          </div>

        </div>
      </form>
    </AdminLayout>
  );
}
