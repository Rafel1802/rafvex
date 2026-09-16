import React, { useEffect, useState, useCallback } from 'react';
import { Head } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  RefreshCw,
  CheckCircle2,
  Clock,
  Radio,
} from 'lucide-react';

interface Props {
  title?: string;
  message?: string;
  end_time?: string | null;
  progress?: number | string;
  logo?: string | null;
}

function getStageLabel(p: number): string {
  if (p >= 100) return 'Completed';
  if (p >= 85) return 'Final Stage';
  if (p >= 60) return 'System Optimization';
  if (p >= 35) return 'Core Upgrades';
  return 'Initial Stage';
}

function useCountdown(endTime: string | null) {
  const [timeLeft, setTimeLeft] = useState<{ h: number; m: number; s: number } | null>(null);

  useEffect(() => {
    if (!endTime) return;
    const target = new Date(endTime).getTime();
    if (isNaN(target)) return;

    const tick = () => {
      const diff = target - Date.now();
      if (diff <= 0) {
        setTimeLeft({ h: 0, m: 0, s: 0 });
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft({ h, m, s });
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endTime]);

  return timeLeft;
}

function Pad({ val }: { val: number }) {
  return <>{String(val).padStart(2, '0')}</>;
}

export default function Maintenance({ title, message, end_time, progress, logo }: Props) {
  const countdown = useCountdown(end_time ?? null);
  const siteName = 'Rafvex';
  const logoUrl = logo || '/logo.png';
  const currentProgress = Math.min(100, Math.max(10, Number(progress) || 88));

  // Live Auto-Checker State
  const [autoCheckSeconds, setAutoCheckSeconds] = useState(30);
  const [isChecking, setIsChecking] = useState(false);
  const [checkStatus, setCheckStatus] = useState<'online' | 'still-down' | 'error' | null>(null);

  const checkLiveStatus = useCallback(async (manual = false) => {
    setIsChecking(true);
    try {
      const res = await fetch(`/?t=${Date.now()}`, {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'Accept': 'text/html,application/xhtml+xml',
        },
      });

      if (res.status === 200) {
        setCheckStatus('online');
        setTimeout(() => {
          window.location.href = '/';
        }, 800);
        return;
      }

      if (manual) {
        setCheckStatus('still-down');
        setTimeout(() => setCheckStatus(null), 4000);
      }
    } catch {
      if (manual) {
        setCheckStatus('error');
        setTimeout(() => setCheckStatus(null), 4000);
      }
    } finally {
      setIsChecking(false);
      setAutoCheckSeconds(30);
    }
  }, []);

  // Recurring 30s auto-check
  useEffect(() => {
    const timer = setInterval(() => {
      setAutoCheckSeconds((prev) => {
        if (prev <= 1) {
          checkLiveStatus(false);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [checkLiveStatus]);

  const displayTitle = title && title.trim() ? title : "We'll Be Right Back";
  const displayMessage =
    message && message.trim()
      ? message
      : "We're performing scheduled maintenance. Please check back soon.";

  return (
    <div
      className="min-h-screen text-slate-800 flex flex-col justify-between selection:bg-red-500/20 selection:text-red-700 relative overflow-x-hidden"
      style={{
        background: 'linear-gradient(180deg, #fff1f2 0%, #ffe4e6 45%, #fff5f5 100%)',
        fontFamily: "'Outfit', 'Inter', system-ui, sans-serif",
      }}
    >
      <Head>
        <title>{`${displayTitle} — ${siteName}`}</title>
        <meta name="description" content="Rafvex is currently undergoing scheduled maintenance and system upgrades." />
        <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png?v=2" head-key="favicon-48" />
        <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png?v=2" head-key="favicon-96" />
        <link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png?v=2" head-key="favicon-192" />
        <link rel="icon" type="image/png" sizes="512x512" href="/android-chrome-512x512.png?v=2" head-key="favicon-512" />
        <link rel="icon" href="/favicon.ico?v=2" sizes="48x48 32x32 16x16" head-key="favicon-ico" />
        <link rel="shortcut icon" href="/favicon.ico?v=2" head-key="favicon-shortcut" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=2" head-key="apple-touch-icon" />
      </Head>

      {/* ── Soft Ambient Glow Background Orbs (Light Red Theme) ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.65, 0.4] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-[10%] -left-[10%] w-[55vw] h-[55vw] rounded-full bg-red-200/60 blur-[130px]"
        />
        <motion.div
          animate={{ scale: [1, 1.12, 1], opacity: [0.35, 0.55, 0.35] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute -bottom-[15%] -right-[10%] w-[50vw] h-[50vw] rounded-full bg-rose-200/60 blur-[120px]"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.25, 0.45, 0.25] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
          className="absolute top-[40%] left-[30%] w-[35vw] h-[35vw] rounded-full bg-red-100/70 blur-[100px]"
        />

        {/* Subtle red-tinted grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.45]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(225, 29, 72, 0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(225, 29, 72, 0.05) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
            maskImage: 'radial-gradient(ellipse at 50% 45%, black 40%, transparent 85%)',
            WebkitMaskImage: 'radial-gradient(ellipse at 50% 45%, black 40%, transparent 85%)',
          }}
        />
      </div>

      {/* ── Top Header Bar ── */}
      <header className="relative z-10 w-full max-w-5xl mx-auto px-6 pt-8 pb-4 flex items-center justify-end">
        {/* Live Operational Status Pill */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/95 border border-red-200 shadow-sm text-xs backdrop-blur-md">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600" />
          </span>
          <span className="font-bold text-slate-700 tracking-wide">
            System Maintenance Mode
          </span>
          <span className="text-[10px] font-mono font-extrabold text-red-700 bg-red-100/90 px-2 py-0.5 rounded border border-red-300">
            HTTP 503
          </span>
        </div>
      </header>

      {/* ── Main Hero Card: Light Red Luxury UI ── */}
      <main className="relative z-10 w-full max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10 my-auto">
        <motion.div
          initial={{ opacity: 0, y: 25, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative rounded-3xl p-6 sm:p-12 bg-white/95 backdrop-blur-2xl border border-red-200/90 shadow-[0_25px_70px_rgba(225,29,72,0.12),0_4px_20px_rgba(239,68,68,0.06)] overflow-hidden"
        >
          {/* Subtle top crimson gradient highlight line */}
          <div className="absolute top-0 left-1/4 right-1/4 h-[3px] bg-gradient-to-r from-transparent via-red-600 to-transparent" />

          {/* Center Column: Logo & Header */}
          <div className="flex flex-col items-center text-center">
            
            {/* ── Official Rafvex Logo Display ── */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="mb-6 flex flex-col items-center"
            >
              <div className="p-4 sm:p-5 rounded-3xl bg-white border border-red-200 shadow-[0_12px_36px_rgba(220,38,38,0.12)] flex items-center justify-center">
                <img
                  src={logoUrl}
                  alt={siteName}
                  style={{ maxHeight: 68, width: 'auto', objectFit: 'contain' }}
                  className="h-14 sm:h-16 hover:scale-105 transition-transform"
                />
              </div>

              {/* Upgrade Badge */}
              <div className="mt-3.5 inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-100/80 border border-red-200/90 text-[11px] font-extrabold text-red-700 tracking-wider uppercase shadow-2xs">
                <Radio className="w-3 h-3 text-red-600 animate-pulse" />
                Scheduled Infrastructure Upgrade
              </div>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight max-w-2xl mb-3 font-display"
            >
              {displayTitle}
            </motion.h1>

            {/* Description / Notice */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-xl mb-8"
            >
              {displayMessage}
            </motion.p>

            {/* ── Countdown Timer (If end_time set) ── */}
            {countdown && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.5 }}
                className="w-full max-w-md mb-8 p-4 rounded-2xl bg-gradient-to-b from-red-50/70 to-rose-50/50 border border-red-200/90 shadow-2xs"
              >
                <div className="flex items-center justify-between mb-3 text-xs text-slate-600 font-bold uppercase tracking-wider px-1">
                  <span className="flex items-center gap-1.5 text-red-600">
                    <Clock className="w-3.5 h-3.5" /> Estimated Time Remaining
                  </span>
                  {end_time && (
                    <span className="font-mono text-[11px] text-red-700 font-bold bg-white px-2 py-0.5 rounded border border-red-200">
                      ETA: {new Date(end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2.5 text-center">
                  {[
                    { val: countdown.h, label: 'HOURS' },
                    { val: countdown.m, label: 'MINUTES' },
                    { val: countdown.s, label: 'SECONDS' },
                  ].map(({ val, label }) => (
                    <div
                      key={label}
                      className="p-3 rounded-xl bg-white border border-red-200 shadow-2xs flex flex-col items-center"
                    >
                      <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight leading-none">
                        <Pad val={val} />
                      </div>
                      <div className="text-[9px] font-extrabold tracking-widest text-red-600 uppercase mt-1.5">
                        {label}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── Upgrade Progress Bar (Light Red Theme) ── */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="w-full max-w-xl mb-8"
            >
              {/* Progress Bar Container */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-red-50/90 via-rose-50/70 to-red-50/90 border border-red-200/90 shadow-2xs">
                <div className="flex items-center justify-between text-xs mb-2.5">
                  <span className="text-slate-800 font-bold flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-red-600" />
                    Overall Upgrade Deployment
                  </span>
                  <span className="font-mono text-red-600 font-extrabold text-xs sm:text-sm bg-white px-3 py-0.5 rounded-full border border-red-200 shadow-2xs">
                    {currentProgress}% {getStageLabel(currentProgress)}
                  </span>
                </div>
                <div className="w-full bg-red-100/90 rounded-full h-3 overflow-hidden relative border border-red-200/60">
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: `${currentProgress}%` }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-red-600 rounded-full relative"
                  >
                    <motion.div
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ repeat: Infinity, duration: 2.2, ease: 'linear' }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-2/3"
                    />
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* ── Auto-Refresh Controller ── */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.5 }}
              className="w-full max-w-md flex flex-col items-center gap-3 pt-1"
            >
              <div className="flex items-center gap-3 flex-wrap justify-center">
                <button
                  type="button"
                  onClick={() => checkLiveStatus(true)}
                  disabled={isChecking}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold text-xs shadow-md shadow-red-600/25 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
                  <span>{isChecking ? 'Checking System...' : 'Check Live Status Now'}</span>
                </button>

                <div className="text-xs text-slate-600 font-medium">
                  Auto-checking in{' '}
                  <span className="font-mono text-red-600 font-extrabold text-sm">{autoCheckSeconds}s</span>
                </div>
              </div>

              {/* Toast response feedback */}
              <AnimatePresence>
                {checkStatus && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className={`mt-1 px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
                      checkStatus === 'online'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-red-50 border-red-200 text-red-800'
                    }`}
                  >
                    {checkStatus === 'online' ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>System is back online! Launching Rafvex...</span>
                      </>
                    ) : (
                      <>
                        <Activity className="w-4 h-4 text-amber-600 animate-pulse" />
                        <span>Maintenance still in progress — engineers are finishing up!</span>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

          </div>
        </motion.div>
      </main>

      {/* ── Footer Bar ── */}
      <footer className="relative z-10 w-full max-w-5xl mx-auto px-6 py-6 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-red-200/70">
        <div>
          &copy; 2026 Rafvex. All rights reserved.
        </div>
        <div className="flex items-center gap-4 text-[11px] text-slate-500 font-mono">
          <span className="inline-flex items-center gap-1.5 text-slate-600">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Core Servers Nominal
          </span>
          <span>·</span>
          <span>Security Level: Tier 1</span>
        </div>
      </footer>
    </div>
  );
}
