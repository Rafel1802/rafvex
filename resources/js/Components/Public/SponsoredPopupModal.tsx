import React, { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { X, ExternalLink, Sparkles, Check } from 'lucide-react';

interface PopupAdProps {
  id: number;
  title: string;
  subtitle?: string;
  sponsor_name?: string;
  media_type: 'image' | 'video' | 'gif';
  media_url?: string;
  video_url?: string;
  aspect_ratio: 'auto' | 'landscape' | 'portrait' | 'square';
  button_text?: string;
  button_url?: string;
  button_color?: string;
  delay_seconds?: number;
  show_on_pages?: 'all' | 'home' | 'articles';
  show_frequency?: 'once_per_session' | 'always' | 'once_per_day';
}

export default function SponsoredPopupModal() {
  const { props, url } = usePage<any>();
  const ad: PopupAdProps | null = props.active_popup_ad;

  const [isOpen, setIsOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    if (!ad || !ad.id) return;

    // 1. Page target check
    const currentUrl = url || window.location.pathname;
    const isHomePage = currentUrl === '/' || currentUrl === '' || currentUrl.startsWith('/?');
    const isArticlePage = currentUrl.startsWith('/article/');

    if (ad.show_on_pages === 'home' && !isHomePage) {
      return;
    }
    if (ad.show_on_pages === 'articles' && !isArticlePage) {
      return;
    }

    // 2. Frequency / Dismissal check
    const sessionKey = `rafvex_popup_ad_${ad.id}_session`;
    const dailyKey = `rafvex_popup_ad_${ad.id}_daily`;

    if (ad.show_frequency === 'once_per_session') {
      if (sessionStorage.getItem(sessionKey)) return;
    } else if (ad.show_frequency === 'once_per_day') {
      const lastDismissed = localStorage.getItem(dailyKey);
      if (lastDismissed) {
        const diffHours = (Date.now() - parseInt(lastDismissed, 10)) / (1000 * 60 * 60);
        if (diffHours < 24) return;
      }
    }

    // 3. Delay before appearance
    const delay = (ad.delay_seconds ?? 3) * 1000;
    const timer = setTimeout(() => {
      setIsOpen(true);

      // Track impression
      try {
        fetch(`/api/popup-ads/${ad.id}/impression`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
          keepalive: true,
        }).catch(() => {});
      } catch (e) {}
    }, delay);

    return () => clearTimeout(timer);
  }, [ad, url]);

  if (!ad || !isOpen) return null;

  const handleClose = () => {
    setIsOpen(false);

    // Persist dismissal
    const sessionKey = `rafvex_popup_ad_${ad.id}_session`;
    const dailyKey = `rafvex_popup_ad_${ad.id}_daily`;

    sessionStorage.setItem(sessionKey, '1');

    if (dontShowAgain || ad.show_frequency === 'once_per_day') {
      localStorage.setItem(dailyKey, Date.now().toString());
    }
  };

  const handleCtaClick = () => {
    // Track click
    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon(`/api/popup-ads/${ad.id}/click`);
      } else {
        fetch(`/api/popup-ads/${ad.id}/click`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
          keepalive: true,
        }).catch(() => {});
      }
    } catch (e) {}

    // Open target sponsor URL in new tab
    if (ad.button_url) {
      window.open(ad.button_url, '_blank', 'noopener,noreferrer');
    }

    handleClose();
  };

  // Determine aspect ratio class
  const getAspectRatioClasses = () => {
    switch (ad.aspect_ratio) {
      case 'portrait':
        return 'aspect-[4/5] sm:aspect-[9/16] max-h-[58vh]';
      case 'landscape':
        return 'aspect-[16/9] max-h-[46vh]';
      case 'square':
        return 'aspect-square max-h-[46vh]';
      default:
        return 'aspect-video sm:aspect-[16/10] max-h-[50vh]';
    }
  };

  // Determine modal width based on aspect ratio
  const getModalWidthClass = () => {
    if (ad.aspect_ratio === 'portrait') return 'max-w-sm sm:max-w-md';
    if (ad.aspect_ratio === 'landscape') return 'max-w-2xl';
    return 'max-w-lg';
  };

  const hasMedia = Boolean(ad.media_url || ad.video_url);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
      style={{
        background: 'rgba(15, 23, 42, 0.72)',
        backdropFilter: 'blur(8px)',
      }}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`relative w-full ${getModalWidthClass()} bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 transform transition-all animate-in fade-in zoom-in-95 duration-200`}
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Floating Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-3.5 right-3.5 z-20 w-8 h-8 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white flex items-center justify-center backdrop-blur-md transition-transform hover:scale-105 cursor-pointer shadow-md"
          aria-label="Close advertisement"
        >
          <X size={16} />
        </button>

        {/* Media Container (Responsive image / video / gif) */}
        {hasMedia && (
          <div
            className={`w-full overflow-hidden bg-slate-950 relative flex items-center justify-center cursor-pointer ${getAspectRatioClasses()}`}
            onClick={handleCtaClick}
          >
            {ad.media_type === 'video' ? (
              <video
                src={ad.media_url || ad.video_url}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={ad.media_url}
                alt={ad.title}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-103"
                loading="eager"
              />
            )}

            {/* Sponsor Pill Tag */}
            <div className="absolute top-3.5 left-3.5 z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/95 dark:bg-slate-900/95 text-red-600 dark:text-red-400 backdrop-blur-md shadow-sm border border-white/60 dark:border-slate-700/60">
                <Sparkles size={11} className="text-red-600 fill-red-600 dark:text-red-400 dark:fill-red-400" />
                {ad.sponsor_name ? `Sponsor: ${ad.sponsor_name}` : 'Sponsored'}
              </span>
            </div>
          </div>
        )}

        {/* Text & Action Body */}
        <div className="p-5 sm:p-6 flex flex-col justify-between overflow-y-auto">
          <div>
            {!hasMedia && (
              <div className="mb-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/40">
                  <Sparkles size={10} className="text-red-600 fill-red-600 dark:text-red-400 dark:fill-red-400" />
                  {ad.sponsor_name ? `Sponsor: ${ad.sponsor_name}` : 'Sponsored'}
                </span>
              </div>
            )}

            <h2
              style={{ fontFamily: "'Outfit', sans-serif" }}
              className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-snug cursor-pointer hover:text-red-600 dark:hover:text-red-400 transition-colors"
              onClick={handleCtaClick}
            >
              {ad.title}
            </h2>

            {ad.subtitle && (
              <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {ad.subtitle}
              </p>
            )}
          </div>

          {/* Call to Action Button */}
          <div className="mt-6 space-y-3">
            <button
              type="button"
              onClick={handleCtaClick}
              style={{ backgroundColor: ad.button_color || '#dc2626' }}
              className="w-full py-3.5 px-5 rounded-2xl text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 hover:opacity-95 transition-all shadow-md hover:shadow-lg cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>{ad.button_text || 'Visit Sponsor'}</span>
              <ExternalLink size={16} />
            </button>

            {/* Footer with "Don't show again today" and Close */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 pt-1">
              <label className="flex items-center gap-1.5 cursor-pointer select-none hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                <input
                  type="checkbox"
                  checked={dontShowAgain}
                  onChange={(e) => setDontShowAgain(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-red-600 focus:ring-red-500 w-3.5 h-3.5"
                />
                <span>Don't show this again today</span>
              </label>

              <button
                type="button"
                onClick={handleClose}
                className="text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium hover:underline transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
