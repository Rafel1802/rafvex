import React, { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import { Cookie, X, Check, ShieldCheck } from 'lucide-react';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('rafvex_cookie_consent');
      if (!consent) {
        // Short delay for smoother page load perception
        const timer = setTimeout(() => setVisible(true), 800);
        return () => clearTimeout(timer);
      }
    } catch (e) {}
  }, []);

  const handleConsent = (type: 'all' | 'essential') => {
    try {
      localStorage.setItem('rafvex_cookie_consent', type);
      localStorage.setItem('rafvex_cookie_consent_date', new Date().toISOString());
    } catch (e) {}
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent notice"
      className="fixed bottom-4 inset-x-4 sm:inset-x-auto sm:right-6 sm:max-w-md z-50 rounded-2xl bg-white/98 dark:bg-slate-900/98 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 shadow-2xl p-4 sm:p-5 animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div className="flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-600 flex items-center justify-center shrink-0">
          <Cookie size={20} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white font-['Outfit']">
              Cookie &amp; Privacy Choices
            </h4>
            <button
              onClick={() => handleConsent('essential')}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
              aria-label="Dismiss cookie banner"
            >
              <X size={15} />
            </button>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
            Rafvex and our trusted partners (including Google AdSense) use cookies to enhance navigation, analyze site performance, and serve relevant advertisements. You can accept all or choose essential cookies only.
          </p>

          <div className="flex items-center justify-between gap-2 pt-1">
            <Link
              href="/privacy-policy"
              className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 underline underline-offset-2 transition-colors"
            >
              Privacy Policy
            </Link>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleConsent('essential')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Essential Only
              </button>

              <button
                type="button"
                onClick={() => handleConsent('all')}
                className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Check size={13} />
                <span>Accept All</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
