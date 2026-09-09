import React from 'react';

interface VideoEmbedProps {
  url?: string | null;
  title?: string;
  className?: string;
}

export function parseVideoUrl(url: string | null | undefined): {
  type: 'youtube' | 'facebook' | 'unknown' | null;
  embedUrl: string | null;
  videoId?: string;
} {
  if (!url || typeof url !== 'string') {
    return { type: null, embedUrl: null };
  }

  const trimmed = url.trim();

  // 1. YouTube Detection
  // Matches youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID, youtube.com/shorts/ID
  const ytMatch = trimmed.match(
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );

  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`,
      videoId,
    };
  }

  // 2. Facebook Video Detection
  // Matches facebook.com/.../videos/..., facebook.com/watch/?v=..., fb.watch/...
  const fbMatch = trimmed.match(
    /(?:https?:\/\/)?(?:www\.|web\.|m\.)?(?:facebook\.com\/(?:[^\/\n\s]+\/videos\/\d+|watch\/?\?v=\d+|video\.php\?v=\d+)|fb\.watch\/[a-zA-Z0-9_-]+)/i
  );

  if (fbMatch || trimmed.includes('facebook.com') || trimmed.includes('fb.watch')) {
    return {
      type: 'facebook',
      embedUrl: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(trimmed)}&show_text=false&width=1280`,
    };
  }

  return { type: 'unknown', embedUrl: trimmed };
}

export default function VideoEmbed({ url, title = 'Video Player', className = '' }: VideoEmbedProps) {
  if (!url) return null;

  const parsed = parseVideoUrl(url);

  if (parsed.type === 'youtube' && parsed.embedUrl) {
    return (
      <div className={`video-embed-container my-6 rounded-2xl overflow-hidden shadow-xl border border-slate-800 bg-slate-950 ${className}`}>
        <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-600/90 text-white font-bold text-[10px] tracking-wider uppercase">
              <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              YouTube
            </span>
            <span className="font-medium text-slate-300 truncate max-w-xs">{title}</span>
          </div>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-medium text-slate-400 hover:text-white transition-colors"
          >
            Watch on YouTube &rarr;
          </a>
        </div>
        <div className="aspect-video w-full">
          <iframe
            src={parsed.embedUrl}
            title={title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
          />
        </div>
      </div>
    );
  }

  if (parsed.type === 'facebook' && parsed.embedUrl) {
    return (
      <div className={`video-embed-container my-6 rounded-2xl overflow-hidden shadow-xl border border-slate-800 bg-slate-950 ${className}`}>
        <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#1877F2] text-white font-bold text-[10px] tracking-wider uppercase">
              <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              Facebook Video
            </span>
            <span className="font-medium text-slate-300 truncate max-w-xs">{title}</span>
          </div>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-medium text-slate-400 hover:text-white transition-colors"
          >
            Watch on Facebook &rarr;
          </a>
        </div>
        <div className="aspect-video w-full bg-black">
          <iframe
            src={parsed.embedUrl}
            title={title}
            className="w-full h-full border-0"
            style={{ border: 'none', overflow: 'hidden' }}
            scrolling="no"
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
          />
        </div>
      </div>
    );
  }

  // Fallback for custom or direct video links
  return (
    <div className={`video-embed-container my-6 p-4 rounded-2xl bg-slate-900 border border-slate-800 text-white flex items-center justify-between ${className}`}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-red-600/20 text-red-500 flex items-center justify-center">
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
        </div>
        <div>
          <span className="text-xs text-slate-400 block font-semibold uppercase tracking-wider">Video Attached</span>
          <span className="text-sm font-bold text-white">{title}</span>
        </div>
      </div>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5"
      >
        <span>Watch Video</span>
        <span>&rarr;</span>
      </a>
    </div>
  );
}
