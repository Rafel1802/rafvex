import React, { useState, useRef, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { 
  Headphones, Play, Pause, Radio, RotateCcw, RotateCw, Volume2, 
  VolumeX, Clock, Calendar, ArrowLeft, Share2, Check, Copy, Sparkles, 
  ExternalLink, ChevronRight, User, BookOpen 
} from 'lucide-react';

interface PodcastItem {
  id: number;
  title: string;
  slug: string;
  summary?: string;
  description?: string;
  stream_url?: string;
  audio_url?: string;
  cover_image_url?: string;
  duration_seconds: number;
  formatted_duration: string;
  host_name?: string;
  episode_number?: number;
  season_number?: number;
  published_at?: string;
  live_status: 'none' | 'upcoming' | 'live' | 'ended';
  live_started_at?: string;
  live_offset_seconds?: number;
  plays_count: number;
  views_count: number;
  category?: { id: number; name: string; slug: string };
  author?: { id: number; name: string; profile?: { avatar?: string; bio?: string } };
}

export default function PodcastShow({
  auth,
  podcast,
  relatedPodcasts = [],
  stationLive = null,
}: {
  auth: any;
  podcast: PodcastItem;
  relatedPodcasts: PodcastItem[];
  stationLive?: PodcastItem | null;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(podcast.duration_seconds || 0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [copied, setCopied] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isLive = podcast.live_status === 'live';

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration || podcast.duration_seconds || 0);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', onEnded);

    // If it's a live podcast, sync to current live offset
    if (isLive && podcast.live_offset_seconds) {
      audio.currentTime = podcast.live_offset_seconds;
    }

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', onEnded);
    };
  }, [podcast.id, isLive, podcast.live_offset_seconds]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
      fetch(`/api/podcast/${podcast.id}/play`, { method: 'POST', headers: { 'X-Requested-With': 'XMLHttpRequest' } });
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current || isLive) return;
    const time = Number(e.target.value);
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const skipTime = (seconds: number) => {
    if (!audioRef.current || isLive) return;
    audioRef.current.currentTime = Math.max(0, Math.min(audioRef.current.currentTime + seconds, duration));
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const cyclePlaybackRate = () => {
    if (!audioRef.current) return;
    const rates = [1, 1.25, 1.5, 2];
    const nextIndex = (rates.indexOf(playbackRate) + 1) % rates.length;
    const nextRate = rates[nextIndex];
    audioRef.current.playbackRate = nextRate;
    setPlaybackRate(nextRate);
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time) || time <= 0) return '00:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const audioSrc = podcast.stream_url || podcast.audio_url || '';

  return (
    <PublicLayout auth={auth}>
      <Head title={`${podcast.title} — Rafvex Podcast`} />

      {/* Hidden HTML5 audio element */}
      <audio ref={audioRef} src={audioSrc} preload="metadata" />

      <div className="min-h-screen bg-slate-50/50 dark:bg-[#080d1a] pb-24">
        {/* Navigation Breadcrumb Bar */}
        <div className="border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md sticky top-0 z-30">
          <div style={{ maxWidth: 1100, margin: '0 auto', padding: '12px 20px' }} className="flex items-center justify-between gap-4">
            <Link
              href="/podcasts"
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            >
              <ArrowLeft size={15} />
              <span>Back to All Podcasts</span>
            </Link>

            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-red-600 transition-colors cursor-pointer"
            >
              {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
              <span>{copied ? 'Link Copied!' : 'Share Episode'}</span>
            </button>
          </div>
        </div>

        {/* Episode Player Hero */}
        <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white pt-10 pb-14 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Cover Art */}
              <div className="relative w-56 sm:w-64 h-56 sm:h-64 rounded-3xl overflow-hidden bg-slate-800 shrink-0 border border-white/10 shadow-2xl">
                {podcast.cover_image_url ? (
                  <img
                    src={podcast.cover_image_url}
                    alt={podcast.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-600 to-slate-900 text-white">
                    <Headphones size={54} />
                  </div>
                )}

                {isLive && (
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg">
                    <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                    LIVE
                  </div>
                )}
              </div>

              {/* Main Info */}
              <div className="flex-1 min-w-0 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  {isLive ? (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-red-600 text-white uppercase tracking-wider animate-pulse">
                      🔴 BROADCASTING LIVE NOW
                    </span>
                  ) : podcast.live_status === 'ended' ? (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
                      🔁 FULL REPLAY AVAILABLE
                    </span>
                  ) : null}

                  {podcast.category && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/10 text-slate-200">
                      {podcast.category.name}
                    </span>
                  )}

                  {podcast.episode_number && (
                    <span className="text-xs text-slate-400 font-mono">
                      Episode #{podcast.episode_number}
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight tracking-tight">
                  {podcast.title}
                </h1>

                {podcast.summary && (
                  <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                    {podcast.summary}
                  </p>
                )}

                <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                  <span>Host: <strong className="text-white">{podcast.host_name || 'Rafvex'}</strong></span>
                  <span>•</span>
                  <span>🎧 {podcast.plays_count || 0} plays</span>
                  <span>•</span>
                  <span className="font-mono">{podcast.formatted_duration || 'Audio'}</span>
                </div>
              </div>
            </div>

            {/* In-Hero Interactive Player Deck */}
            <div className="mt-8 p-5 sm:p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 shadow-xl space-y-4">
              {/* Range Scrubber */}
              <div className="space-y-1">
                <div className="relative w-full h-2 bg-white/20 rounded-full cursor-pointer overflow-hidden">
                  <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    value={currentTime}
                    disabled={isLive}
                    onChange={handleSeek}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div
                    className="h-full bg-red-500 rounded-full transition-all"
                    style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>{formatTime(currentTime)}</span>
                  <span>{isLive ? '🔴 LIVE OFFSET' : formatTime(duration)}</span>
                </div>
              </div>

              {/* Player Buttons Row */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={isLive}
                    onClick={() => skipTime(-15)}
                    className="p-2 text-slate-300 hover:text-white disabled:opacity-30 cursor-pointer"
                    title="Skip back 15s"
                  >
                    <RotateCcw size={18} />
                  </button>

                  <button
                    type="button"
                    onClick={togglePlay}
                    className="w-12 h-12 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg shadow-red-600/40 transition-transform active:scale-95 cursor-pointer"
                  >
                    {isPlaying ? <Pause size={22} /> : <Play size={22} className="ml-0.5 fill-current" />}
                  </button>

                  <button
                    type="button"
                    disabled={isLive}
                    onClick={() => skipTime(15)}
                    className="p-2 text-slate-300 hover:text-white disabled:opacity-30 cursor-pointer"
                    title="Skip forward 15s"
                  >
                    <RotateCw size={18} />
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={cyclePlaybackRate}
                    disabled={isLive}
                    className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-mono font-bold text-white transition-colors disabled:opacity-30"
                  >
                    {playbackRate}x
                  </button>

                  <button
                    type="button"
                    onClick={toggleMute}
                    className="p-2 text-slate-300 hover:text-white"
                  >
                    {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Body: Show notes & Related */}
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 20px 0' }} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main 2 Cols: Notes */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                Show Notes & Chapters
              </h3>

              {podcast.description ? (
                <div className="prose prose-slate dark:prose-invert max-w-none text-sm sm:text-base leading-relaxed whitespace-pre-line">
                  {podcast.description}
                </div>
              ) : (
                <p className="text-sm text-slate-500 italic">
                  No show notes provided for this episode.
                </p>
              )}
            </div>
          </div>

          {/* Right 1 Col: Related Episodes */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                More in this Channel
              </h3>

              <div className="space-y-4">
                {relatedPodcasts.map((rel) => (
                  <Link
                    key={rel.id}
                    href={`/podcast/${rel.slug}`}
                    className="flex items-start gap-3 group"
                  >
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-100 dark:border-slate-800">
                      {rel.cover_image_url ? (
                        <img
                          src={rel.cover_image_url}
                          alt={rel.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-red-500">
                          <Headphones size={18} />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-red-600 transition-colors line-clamp-2 leading-snug">
                        {rel.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-1 font-mono">
                        {rel.formatted_duration || 'Audio'}
                      </p>
                    </div>
                  </Link>
                ))}

                {relatedPodcasts.length === 0 && (
                  <p className="text-xs text-slate-400 italic">
                    More episodes coming soon.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
