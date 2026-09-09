import React, { useEffect } from 'react';
import { Link } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Flame, MessageSquare, ArrowRight } from 'lucide-react';
import { RealtimeToast } from '@/hooks/usePusher';

interface Props {
  toast: RealtimeToast | null;
  onDismiss: () => void;
}

export default function RealtimeToastBanner({ toast, onDismiss }: Props) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 8000);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="fixed top-16 inset-x-3 sm:top-auto sm:bottom-6 sm:right-6 sm:inset-x-auto sm:max-w-sm w-auto sm:w-full z-50 bg-slate-900/95 text-white rounded-2xl shadow-2xl p-3.5 sm:p-4 border border-slate-800 flex items-start gap-3 backdrop-blur-md"
        >
          <div className="w-9 h-9 rounded-xl bg-red-600/20 text-red-500 flex items-center justify-center shrink-0 mt-0.5 border border-red-500/30">
            {toast.type === 'article' ? <Flame size={18} /> : <MessageSquare size={18} />}
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-xs sm:text-sm text-white leading-snug">
              {toast.title}
            </h4>
            <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
              {toast.message}
            </p>

            {toast.link && (
              <Link
                href={toast.link}
                onClick={onDismiss}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-red-400 hover:text-red-300 mt-2 transition-colors"
              >
                <span>Read now</span>
                <ArrowRight size={11} />
              </Link>
            )}
          </div>

          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss toast"
            className="text-slate-400 hover:text-white p-1 transition-colors cursor-pointer"
          >
            <X size={15} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
