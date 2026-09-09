import React, { useState, useRef } from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { ExternalLink, RefreshCw, Maximize2, Minimize2, Sparkles, FolderArchive } from 'lucide-react';

export default function MediaIndex({ auth }: any) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleRefresh = () => {
    setIframeKey((prev) => prev + 1);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <AdminLayout auth={auth}>
      <Head title="Media Library - Rafvex CMS" />

      <div className={`space-y-4 transition-all ${isFullscreen ? 'fixed inset-0 z-50 p-4 bg-slate-950/90 backdrop-blur-md flex flex-col' : ''}`}>
        {/* Header & Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400">
              <FolderArchive size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white font-display">
                  Media Library
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  Live File Manager
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Upload assets, organize folders, convert WebP, and copy direct article links
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={handleRefresh}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="Reload File Manager"
            >
              <RefreshCw size={14} /> Refresh
            </button>

            <button
              type="button"
              onClick={toggleFullscreen}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullscreen ? (
                <>
                  <Minimize2 size={14} /> Exit Fullscreen
                </>
              ) : (
                <>
                  <Maximize2 size={14} /> Fullscreen
                </>
              )}
            </button>

            <a
              href="/medialibrary/index.php"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white shadow-xs transition-all"
              title="Open standalone window"
            >
              <ExternalLink size={14} /> Open Standalone
            </a>
          </div>
        </div>

        {/* Embedded Live File Manager */}
        <div className={`overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs ${
          isFullscreen ? 'flex-1 w-full h-full' : 'h-[calc(100vh-210px)] min-h-[720px]'
        }`}>
          <iframe
            key={iframeKey}
            ref={iframeRef}
            src="/medialibrary/index.php"
            title="Rafvex Media File Manager"
            className="w-full h-full border-0 rounded-2xl bg-white dark:bg-slate-900"
            allow="clipboard-read; clipboard-write; fullscreen"
          />
        </div>
      </div>
    </AdminLayout>
  );
}
