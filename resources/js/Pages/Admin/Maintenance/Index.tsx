import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TriangleAlert, Globe, Plus, Trash2, CheckCircle2, XCircle, Clock, Save, Zap,
  Eye, ShieldCheck, Sparkles, ExternalLink, Activity
} from 'lucide-react';

/* ─── Known public pages for quick-select ─────────────────────── */
const PRESET_PAGES = [
  { label: 'Home', path: '/' },
  { label: 'All Articles', path: '/article/*' },
  { label: 'All Categories', path: '/category/*' },
  { label: 'Search', path: '/search' },
  { label: 'About', path: '/about' },
  { label: 'Contact', path: '/contact' },
  { label: 'Terms', path: '/terms-of-service' },
  { label: 'Privacy', path: '/privacy-policy' },
];

interface PageEntry { label: string; path: string; }
interface MaintenanceConfig {
  global_enabled: boolean;
  pages: PageEntry[];
  title: string;
  message: string;
  end_time: string;
  progress?: number;
}

function getStageLabel(p: number): string {
  if (p >= 100) return 'Completed';
  if (p >= 85) return 'Final Stage';
  if (p >= 60) return 'System Optimization';
  if (p >= 35) return 'Core Upgrades';
  return 'Initial Stage';
}

/* ─── Modern Switch Toggle ─────────────────────────────────────── */
function Toggle({ on, onChange, size = 'md' }: { on: boolean; onChange: (v: boolean) => void; size?: 'sm' | 'md' | 'lg' }) {
  const configs = {
    sm: { w: 40, h: 22, dot: 16, pad: 3, travel: 18 },
    md: { w: 50, h: 28, dot: 22, pad: 3, travel: 22 },
    lg: { w: 64, h: 34, dot: 26, pad: 4, travel: 30 },
  }[size];

  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      className={`relative inline-flex items-center cursor-pointer transition-all duration-300 focus:outline-none select-none shrink-0 rounded-full ${
        on
          ? 'bg-gradient-to-r from-red-600 to-rose-600 border border-red-500 shadow-[0_0_16px_rgba(220,38,38,0.4)]'
          : 'bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 shadow-inner'
      }`}
      style={{
        width: configs.w,
        height: configs.h,
      }}
      aria-pressed={on}
    >
      <motion.div
        animate={{ x: on ? configs.travel : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 32 }}
        className="rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,0.35)] flex items-center justify-center pointer-events-none"
        style={{
          width: configs.dot,
          height: configs.dot,
          position: 'absolute',
          top: configs.pad,
          left: configs.pad,
        }}
      >
        {/* Subtle center indicator */}
        <span
          className={`w-1.5 h-1.5 rounded-full transition-colors duration-200 ${
            on ? 'bg-red-600' : 'bg-slate-400 dark:bg-slate-500'
          }`}
        />
      </motion.div>
    </button>
  );
}

/* ─── Status Badge ─────────────────────────────────────────────── */
function StatusBadge({ on }: { on: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
      on
        ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-900/50'
        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50'
    }`}>
      <span className={`w-2 h-2 rounded-full ${on ? 'bg-red-600 animate-pulse' : 'bg-emerald-500'}`} />
      {on ? 'Maintenance Active' : 'All Systems Operational'}
    </span>
  );
}

/* ─── Main Maintenance Page (Widescreen 2-Column Dashboard) ────── */
export default function MaintenanceIndex({ auth, maintenance, config }: any) {
  const rawConfig = maintenance || config || {};
  const initialConfig: MaintenanceConfig = {
    global_enabled: Boolean(rawConfig.global_enabled),
    pages: rawConfig.pages || [],
    title: rawConfig.title || "We'll Be Right Back",
    message: rawConfig.message || "We're performing scheduled maintenance. Please check back soon.",
    end_time: rawConfig.end_time || '',
    progress: Math.min(100, Math.max(10, Number(rawConfig.progress) || 88)),
  };
  const [cfg, setCfg] = useState<MaintenanceConfig>(initialConfig);
  const currentProgress = Math.min(100, Math.max(10, Number(cfg.progress) || 88));

  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [newPage, setNewPage] = useState<PageEntry>({ label: '', path: '' });

  const csrfToken = () =>
    document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';

  const flash = (type: 'success' | 'error', text: string) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleToggleGlobal = async (val: boolean) => {
    setToggling(true);
    try {
      const res = await fetch('/ourcms/maintenance/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken(), 'Accept': 'application/json' },
        body: JSON.stringify({ enabled: val }),
      });
      const data = await res.json();
      if (data.success) {
        setCfg(c => ({ ...c, global_enabled: data.global_enabled }));
        flash('success', data.message);
      } else {
        flash('error', data.message ?? 'Failed to update maintenance state.');
      }
    } catch {
      flash('error', 'Network error. Please try again.');
    } finally {
      setToggling(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/ourcms/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken(), 'Accept': 'application/json' },
        body: JSON.stringify(cfg),
      });
      const data = await res.json();
      if (data.success) {
        flash('success', data.message);
      } else {
        flash('error', data.message ?? 'Failed to save settings.');
      }
    } catch {
      flash('error', 'Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const addPage = (entry: PageEntry) => {
    if (!entry.path.trim()) return;
    const path = entry.path.trim();
    if (cfg.pages.some(p => p.path === path)) {
      flash('error', `Path "${path}" is already in the maintenance list.`);
      return;
    }
    setCfg(c => ({
      ...c,
      pages: [...c.pages, { label: entry.label.trim() || path, path }],
    }));
  };

  const removePage = (path: string) => {
    setCfg(c => ({ ...c, pages: c.pages.filter(p => p.path !== path) }));
  };

  const togglePreset = (preset: PageEntry) => {
    if (cfg.pages.some(p => p.path === preset.path)) {
      removePage(preset.path);
    } else {
      addPage(preset);
    }
  };

  const presetSelected = (path: string) => cfg.pages.some(p => p.path === path);

  return (
    <AdminLayout auth={auth}>
      <Head title="Maintenance Mode — Rafvex CMS" />

      {/* ── Page Header (Widescreen) ── */}
      <div className="w-full max-w-[1600px] mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-red-600 bg-red-50 dark:bg-red-950/40 px-2.5 py-1 rounded-md border border-red-200 dark:border-red-900/40">
                System Availability
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-display tracking-tight flex items-center gap-2.5">
              <TriangleAlert size={24} className="text-red-600" />
              Maintenance Mode
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Control website availability for all readers or targeted URLs. Authenticated admins always bypass maintenance.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <StatusBadge on={cfg.global_enabled} />
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold shadow-sm hover:shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <Save size={16} />
              <span>{saving ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`mt-4 p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-300'
                  : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300'
              }`}
            >
              {feedback.type === 'success' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
              {feedback.text}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Main Content Grid (No Empty Space on Right) ── */}
      <div className="w-full max-w-[1600px] grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ── Left Column: Global Switch & Page Content ── */}
        <div className="lg:col-span-7 space-y-6">

          {/* Global Maintenance Toggle Card */}
          <div className={`border rounded-2xl p-6 shadow-xs transition-all ${
            cfg.global_enabled
              ? 'bg-linear-to-br from-red-50 to-rose-50/60 dark:from-red-950/30 dark:to-slate-900 border-red-200 dark:border-red-900/50'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  cfg.global_enabled
                    ? 'bg-red-100 text-red-600 dark:bg-red-950/60'
                    : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                }`}>
                  <Globe size={24} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">Global Maintenance</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {cfg.global_enabled
                      ? '⚠️ All public pages are currently showing the maintenance splash screen.'
                      : 'The entire public website is live and open to visitors.'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border transition-all ${
                  cfg.global_enabled
                    ? 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-300 dark:border-red-900/60 shadow-xs'
                    : 'bg-emerald-100/80 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-300/80 dark:border-emerald-900/50'
                }`}>
                  {cfg.global_enabled ? 'Active' : 'Off (Live)'}
                </span>
                <Toggle on={cfg.global_enabled} onChange={handleToggleGlobal} size="lg" />
                {toggling && <span className="text-xs text-slate-400">Saving...</span>}
              </div>
            </div>
          </div>

          {/* Maintenance Page Content Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-950/50 text-red-600 flex items-center justify-center">
                <TriangleAlert size={16} />
              </div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Maintenance Page Display Content
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Splash Page Title
                </label>
                <input
                  type="text"
                  value={cfg.title}
                  onChange={e => setCfg(c => ({ ...c, title: e.target.value }))}
                  placeholder="We'll Be Right Back"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Visitor Notice Message
                </label>
                <textarea
                  value={cfg.message}
                  onChange={e => setCfg(c => ({ ...c, message: e.target.value }))}
                  rows={3}
                  placeholder="We're performing scheduled upgrades to deliver an even faster reading experience..."
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all resize-y"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Clock size={13} className="text-red-600" />
                  Estimated Completion Time (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={cfg.end_time}
                  onChange={e => setCfg(c => ({ ...c, end_time: e.target.value }))}
                  className="px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Enables an interactive countdown timer on the visitor maintenance splash screen.
                </p>
              </div>

              {/* Upgrade Progress Percentage (10% - 100%) */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Activity size={13} className="text-red-600" />
                    Upgrade Progress Percentage ({currentProgress}%)
                  </label>
                  <span className="text-xs font-mono font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/60 px-2.5 py-0.5 rounded-full border border-red-200 dark:border-red-900/50">
                    {currentProgress}% · {getStageLabel(currentProgress)}
                  </span>
                </div>

                {/* Range Slider & Synced Number Input */}
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="1"
                    value={currentProgress}
                    onChange={e => {
                      const val = Math.min(100, Math.max(10, parseInt(e.target.value) || 10));
                      setCfg(c => ({ ...c, progress: val }));
                    }}
                    className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-600"
                  />
                  <div className="relative w-24 shrink-0">
                    <input
                      type="number"
                      min="10"
                      max="100"
                      value={currentProgress}
                      onChange={e => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val)) {
                          setCfg(c => ({ ...c, progress: Math.min(100, Math.max(10, val)) }));
                        }
                      }}
                      className="w-full pl-3 pr-7 py-1.5 text-xs font-mono font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-right"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold pointer-events-none">%</span>
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
                  <span className="text-[11px] text-slate-400 font-medium mr-1">Presets:</span>
                  {[10, 25, 50, 75, 88, 95, 100].map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setCfg(c => ({ ...c, progress: p }))}
                      className={`px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold transition-all cursor-pointer ${
                        currentProgress === p
                          ? 'bg-red-600 text-white shadow-xs scale-105'
                          : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {p}%
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Adjust the maintenance progress displayed to visitors from 10% to 100%.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* ── Right Column: Per-Page Maintenance & Live Preview ── */}
        <div className="lg:col-span-5 space-y-6">

          {/* Per-Page Maintenance Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-950/50 text-red-600 flex items-center justify-center">
                <Zap size={16} />
              </div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Per-Page Target Routes
              </h2>
            </div>
            <div className="p-6 space-y-5">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Lock down specific pages or paths without closing the whole publication. Supports wildcard routes like <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono text-[11px]">/category/*</code>.
              </p>

              {/* Quick Select Presets */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">Quick Select</p>
                <div className="flex flex-wrap gap-2">
                  {PRESET_PAGES.map(preset => {
                    const selected = presetSelected(preset.path);
                    return (
                      <button
                        key={preset.path}
                        type="button"
                        onClick={() => togglePreset(preset)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                          selected
                            ? 'bg-red-50 dark:bg-red-950/50 border-red-300 dark:border-red-900 text-red-600 dark:text-red-300'
                            : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                        }`}
                      >
                        {selected && <CheckCircle2 size={12} />}
                        {preset.label}
                        <span className="text-[10px] opacity-60 font-mono">
                          {preset.path}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Path Input */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Add Custom Path</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Path (e.g. /category/ai/*)"
                    value={newPage.path}
                    onChange={e => setNewPage(p => ({ ...p, path: e.target.value }))}
                    className="flex-1 px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        addPage(newPage);
                        setNewPage({ label: '', path: '' });
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => { addPage(newPage); setNewPage({ label: '', path: '' }); }}
                    className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Active list */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Routes Under Maintenance ({cfg.pages.length})
                </p>
                {cfg.pages.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {cfg.pages.map(pg => (
                      <div
                        key={pg.path}
                        className="flex items-center justify-between px-3 py-2 bg-red-50/60 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl text-xs"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <TriangleAlert size={12} className="text-red-600 shrink-0" />
                          <span className="font-semibold text-slate-900 dark:text-white">{pg.label || pg.path}</span>
                          <span className="text-[10px] font-mono text-slate-400 truncate">{pg.path}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removePage(pg.path)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
                    No individual pages selected.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Live Maintenance Preview Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye size={15} className="text-red-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">Live Visitor Preview</span>
              </div>
              <span className="text-[10px] font-mono text-red-700 dark:text-red-300 bg-red-100/80 dark:bg-red-950/60 px-2.5 py-0.5 rounded-full font-bold border border-red-200 dark:border-red-900/50">
                Light Red Theme
              </span>
            </div>
            <div
              className="p-6 text-center relative overflow-hidden transition-all"
              style={{
                background: 'linear-gradient(180deg, #fff1f2 0%, #ffe4e6 45%, #fff5f5 100%)',
              }}
            >
              {/* Subtle ambient decorative circle */}
              <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-red-300/30 blur-2xl pointer-events-none" />
              <div className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full bg-rose-300/30 blur-2xl pointer-events-none" />

              {/* Floating pill */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-red-200 text-[10px] font-extrabold text-red-600 uppercase tracking-wider mb-3.5 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                Scheduled Upgrade
              </div>

              {/* Logo emblem with official Rafvex logo */}
              <div className="mx-auto mb-3.5 flex items-center justify-center">
                <div className="p-3 rounded-2xl bg-white border border-red-200 shadow-[0_8px_20px_rgba(220,38,38,0.12)] inline-flex items-center justify-center hover:scale-105 transition-transform">
                  <img
                    src="/logo.png"
                    alt="Rafvex"
                    className="h-8 sm:h-9 w-auto object-contain"
                  />
                </div>
              </div>

              <h3 className="text-base font-extrabold text-slate-900 tracking-tight mb-1.5 font-display">
                {cfg.title || "We'll Be Right Back"}
              </h3>
              <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed mb-4">
                {cfg.message || "We're performing scheduled upgrades to deliver an even faster reading experience. Please check back soon."}
              </p>

              {/* Progress bar preview */}
              <div className="max-w-xs mx-auto mb-4 bg-white/95 p-3 rounded-2xl border border-red-200/90 shadow-[0_4px_12px_rgba(220,38,38,0.06)] text-left">
                <div className="flex items-center justify-between text-[11px] text-slate-700 mb-1.5 font-semibold">
                  <span className="flex items-center gap-1 text-slate-800">
                    <Activity size={12} className="text-red-600" /> Upgrade Progress
                  </span>
                  <span className="font-mono text-red-600 font-extrabold text-xs">
                    {currentProgress}% {getStageLabel(currentProgress)}
                  </span>
                </div>
                <div className="w-full bg-red-100/90 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-red-500 rounded-full transition-all duration-300 relative"
                    style={{ width: `${currentProgress}%` }}
                  />
                </div>
              </div>

              {cfg.end_time && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/90 border border-red-200 text-red-700 rounded-full text-[11px] font-bold shadow-2xs">
                  <Clock size={12} className="text-red-600" /> Expected Return: {new Date(cfg.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </AdminLayout>
  );
}
