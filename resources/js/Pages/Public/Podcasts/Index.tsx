import React, { useState, useRef, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { 
  Headphones, Play, Pause, Radio, RotateCcw, RotateCw, Volume2, 
  VolumeX, Clock, Calendar, Sparkles, ChevronRight, Share2, ArrowUpRight 
} from 'lucide-react';

interface PodcastItem {
  id: number;
  title: string;
  slug: string;
  summary?: string;
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
  category?: { id: number; name: string; slug: string };
  author?: { id: number; name: string };
}

interface PodcastCategoryWithEpisodes {
  id: number;
  name: string;
  slug: string;
  description?: string;
  podcasts: PodcastItem[];
}

export default function PodcastsIndex({
  auth,
  livePodcast,
  featuredPodcast,
  categories = [],
  recentPodcasts = [],
}: {
  auth: any;
  livePodcast?: PodcastItem | null;
  featuredPodcast?: PodcastItem | null;
  categories: PodcastCategoryWithEpisodes[];
  recentPodcasts: PodcastItem[];
}) {
  const [currentTrack, setCurrentTrack] = useState<PodcastItem | null>(livePodcast || featuredPodcast || null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLiveStream, setIsLiveStream] = useState(Boolean(livePodcast?.live_status === 'live'));

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Play a specific episode
  const handlePlayEpisode = (episode: PodcastItem) => {
    const isLive = episode.live_status === 'live';
    setIsLiveStream(isLive);

    if (currentTrack?.id === episode.id) {
      if (isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
      } else {
        audioRef.current?.play();
        setIsPlaying(true);
      }
      return;
    }

    setCurrentTrack(episode);
    setIsPlaying(true);

    if (audioRef.current) {
      const src = episode.stream_url || episode.audio_url || '';
      audioRef.current.src = src;
      audioRef.current.load();

      // If live stream, sync to live offset
      if (isLive && episode.live_offset_seconds) {
        audioRef.current.currentTime = episode.live_offset_seconds;
      }

      audioRef.current.play().catch(() => setIsPlaying(false));

      // Record play
      fetch(`/api/podcast/${episode.id}/play`, { method: 'POST', headers: { 'X-Requested-With': 'XMLHttpRequest' } });
    }
  };

  // Audio element listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration || 0);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current || isLiveStream) return;
    const time = Number(e.target.value);
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const skipTime = (seconds: number) => {
    if (!audioRef.current || isLiveStream) return;
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

  const formatTime = (time: number) => {
    if (isNaN(time) || time <= 0) return '00:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const heroItem = livePodcast || featuredPodcast;

  return (
    <PublicLayout auth={auth}>
      <Head title="Podcasts & Live Audio Broadcasts — Rafvex" />

      {/* Hidden Global Audio Tag */}
      <audio ref={audioRef} preload="metadata" />

      <div className="min-h-screen bg-slate-50/50 dark:bg-[#080d1a] pb-32">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white pt-10 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden border-b border-slate-800">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ef4444_1px,transparent_1px)] [background-size:16px_16px]" />

          <div style={{ maxWidth: 1320, margin: '0 auto' }} className="relative z-10">
            {/* Header Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-black tracking-widest uppercase mb-4">
              <Headphones size={13} />
              <span>Rafvex Audio Desk</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-white mb-3">
              Podcasts, Tech Talks & Live Audio
            </h1>
            <p className="text-slate-400 max-w-2xl text-sm sm:text-base leading-relaxed mb-8">
              Explore in-depth technical audio stories, live editorial broadcasts, and replayable discussions covering AI, system design, and technology.
            </p>

            {/* Featured / Live Hero Card */}
            {heroItem && (
              <div className="p-6 sm:p-8 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl relative overflow-hidden group">
                <div className="flex flex-col lg:flex-row items-center gap-6 sm:gap-8">
                  {/* Hero Cover Art */}
                  <div className="relative w-full sm:w-64 h-56 sm:h-64 rounded-2xl overflow-hidden bg-slate-800 shrink-0 border border-white/10 shadow-lg">
                    {heroItem.cover_image_url ? (
                      <img
                        src={heroItem.cover_image_url}
                        alt={heroItem.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-600 to-slate-900 text-white">
                        <Headphones size={48} />
                      </div>
                    )}

                    {/* Live indicator overlay */}
                    {heroItem.live_status === 'live' && (
                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-red-600 text-white text-[11px] font-black tracking-wider uppercase flex items-center gap-1.5 shadow-lg">
                        <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                        BROADCASTING LIVE
                      </div>
                    )}
                  </div>

                  {/* Hero Details */}
                  <div className="flex-1 min-w-0 space-y-4">
                    <div className="flex flex-wrap items-center gap-2.5">
                      {heroItem.live_status === 'live' ? (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-red-600 text-white uppercase tracking-wider animate-pulse">
                          🔴 LIVE STREAM
                        </span>
                      ) : heroItem.live_status === 'ended' ? (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
                          🔁 REPLAY AVAILABLE
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-white/10 text-white uppercase tracking-wider">
                          FEATURED EPISODE
                        </span>
                      )}

                      {heroItem.category && (
                        <span className="text-xs font-bold text-slate-300">
                          {heroItem.category.name}
                        </span>
                      )}

                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-400 font-mono">
                        {heroItem.formatted_duration || 'Audio'}
                      </span>
                    </div>

                    <Link href={`/podcast/${heroItem.slug}`}>
                      <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white hover:text-red-400 transition-colors leading-snug">
                        {heroItem.title}
                      </h2>
                    </Link>

                    <p className="text-slate-300 text-sm sm:text-base line-clamp-2 leading-relaxed">
                      {heroItem.summary || 'Listen to this podcast episode on Rafvex.'}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 pt-2">
                      <button
                        type="button"
                        onClick={() => handlePlayEpisode(heroItem)}
                        className="inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-sm tracking-wider uppercase transition-all hover:scale-102 active:scale-98 shadow-lg shadow-red-600/30 cursor-pointer"
                      >
                        {currentTrack?.id === heroItem.id && isPlaying ? (
                          <>
                            <Pause size={18} /> Pause Episode
                          </>
                        ) : (
                          <>
                            <Play size={18} className="fill-current" />
                            {heroItem.live_status === 'live' ? 'Tune In Live' : 'Listen Now'}
                          </>
                        )}
                      </button>

                      <Link
                        href={`/podcast/${heroItem.slug}`}
                        className="inline-flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors"
                      >
                        <span>Show Notes & Transcript</span>
                        <ArrowUpRight size={14} />
                      </Link>

                      <div className="text-xs text-slate-400 ml-auto">
                        Host: <span className="text-white font-semibold">{heroItem.host_name || 'Rafvex'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content Container: Categories with 5 items each */}
        <div style={{ maxWidth: 1320, margin: '0 auto', padding: '40px 20px 0' }} className="space-y-16">
          {/* Loop over each category, showing 5 episodes */}
          {categories.map((cat) => {
            const episodes = cat.podcasts || [];
            if (episodes.length === 0) return null;

            return (
              <section key={cat.id} className="space-y-6">
                {/* Category Header */}
                <div className="flex items-end justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-red-600 dark:text-red-400 mb-1">
                      <Radio size={13} />
                      <span>Channel / Category</span>
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                      {cat.name}
                    </h3>
                    {cat.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
                        {cat.description}
                      </p>
                    )}
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500">
                    Showing {Math.min(5, episodes.length)} Episodes
                  </span>
                </div>

                {/* 5 Episodes Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
                  {episodes.slice(0, 5).map((podcast) => {
                    const isTrackActive = currentTrack?.id === podcast.id;
                    const isCurrentlyPlaying = isTrackActive && isPlaying;

                    return (
                      <div
                        key={podcast.id}
                        className={`group flex flex-col justify-between bg-white dark:bg-slate-900/90 rounded-2xl border transition-all duration-300 p-4 shadow-xs hover:shadow-md ${
                          isTrackActive
                            ? 'border-red-500 dark:border-red-600 ring-2 ring-red-500/20'
                            : 'border-slate-200/90 dark:border-slate-800/90 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div>
                          {/* Card Thumbnail with Play Overlay */}
                          <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 mb-3">
                            {podcast.cover_image_url ? (
                              <img
                                src={podcast.cover_image_url}
                                alt={podcast.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 text-red-500">
                                <Headphones size={24} />
                              </div>
                            )}

                            {/* Play Overlay Button */}
                            <button
                              type="button"
                              onClick={() => handlePlayEpisode(podcast)}
                              className="absolute inset-0 m-auto w-11 h-11 rounded-full bg-red-600/90 hover:bg-red-600 text-white flex items-center justify-center shadow-lg transition-transform transform group-hover:scale-110 active:scale-95 cursor-pointer"
                              title={isCurrentlyPlaying ? 'Pause' : 'Play Episode'}
                            >
                              {isCurrentlyPlaying ? (
                                <Pause size={18} />
                              ) : (
                                <Play size={18} className="ml-0.5 fill-current" />
                              )}
                            </button>

                            {/* Duration / Status Pill */}
                            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] font-bold text-white">
                              <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-xs font-mono">
                                {podcast.formatted_duration || 'Audio'}
                              </span>

                              {podcast.live_status === 'live' ? (
                                <span className="px-2 py-0.5 rounded-md bg-red-600 text-white uppercase tracking-wider animate-pulse">
                                  LIVE
                                </span>
                              ) : podcast.live_status === 'ended' ? (
                                <span className="px-1.5 py-0.5 rounded-md bg-emerald-600/90 text-white text-[9px] uppercase">
                                  REPLAY
                                </span>
                              ) : null}
                            </div>
                          </div>

                          {/* Title & Summary */}
                          <Link href={`/podcast/${podcast.slug}`}>
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-2 leading-snug">
                              {podcast.title}
                            </h4>
                          </Link>

                          {podcast.summary && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
                              {podcast.summary}
                            </p>
                          )}
                        </div>

                        {/* Card Footer */}
                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                          <span className="truncate">{podcast.host_name || 'Rafvex'}</span>
                          <span>🎧 {podcast.plays_count || 0}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}

          {categories.length === 0 && (
            <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-xs max-w-2xl mx-auto">
              <Headphones size={44} className="mx-auto text-red-600 dark:text-red-400 mb-3" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Rafvex Audio Briefings &amp; Tech Talks</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 max-w-lg mx-auto mt-2 mb-6 leading-relaxed">
                Our audio explainers and technical discussions are produced alongside our deep research publications. In the meantime, explore our verified written tutorials across Artificial Intelligence, Operating Systems, and Digital Security.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link href="/category/ai-tools" className="px-5 py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors shadow-xs">
                  Explore AI Guides
                </Link>
                <Link href="/popular" className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  View Popular Tutorials
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Persistent Audio Player Floating Bar */}
      {currentTrack && (
        <div className="fixed bottom-0 inset-x-0 z-50 bg-white/95 dark:bg-[#0b1120]/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 shadow-2xl transition-all">
          {/* Scrubber Bar */}
          <div className="relative w-full h-1.5 bg-slate-200 dark:bg-slate-800 cursor-pointer">
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              disabled={isLiveStream}
              onChange={handleSeek}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div
              className="h-full bg-red-600 transition-all"
              style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
            />
          </div>

          <div style={{ maxWidth: 1320, margin: '0 auto', padding: '10px 20px' }}>
            <div className="flex items-center justify-between gap-4">
              {/* Left: Track Details */}
              <div className="flex items-center gap-3 min-w-0 max-w-xs sm:max-w-sm">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700">
                  {currentTrack.cover_image_url ? (
                    <img
                      src={currentTrack.cover_image_url}
                      alt={currentTrack.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-red-600">
                      <Headphones size={20} />
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {isLiveStream && (
                      <span className="px-1.5 py-0.5 rounded bg-red-600 text-white text-[9px] font-black tracking-wider uppercase animate-pulse">
                        LIVE
                      </span>
                    )}
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {currentTrack.title}
                    </h5>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {currentTrack.host_name || 'Rafvex Tech Desk'}
                  </p>
                </div>
              </div>

              {/* Center: Controls */}
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-3 sm:gap-4">
                  {/* Skip -15s */}
                  <button
                    type="button"
                    disabled={isLiveStream}
                    onClick={() => skipTime(-15)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-30 cursor-pointer"
                    title="Rewind 15 seconds"
                  >
                    <RotateCcw size={16} />
                  </button>

                  {/* Play/Pause Button */}
                  <button
                    type="button"
                    onClick={togglePlay}
                    className="w-10 h-10 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-transform active:scale-95 shadow-md shadow-red-600/30 cursor-pointer"
                  >
                    {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5 fill-current" />}
                  </button>

                  {/* Skip +15s */}
                  <button
                    type="button"
                    disabled={isLiveStream}
                    onClick={() => skipTime(15)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-30 cursor-pointer"
                    title="Fast forward 15 seconds"
                  >
                    <RotateCw size={16} />
                  </button>
                </div>

                {/* Timers */}
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                  <span>{formatTime(currentTime)}</span>
                  <span>/</span>
                  <span>{isLiveStream ? 'LIVE STREAM' : formatTime(duration)}</span>
                </div>
              </div>

              {/* Right: Rate & Volume */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={cyclePlaybackRate}
                  disabled={isLiveStream}
                  className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30"
                  title="Playback Speed"
                >
                  {playbackRate}x
                </button>

                <button
                  type="button"
                  onClick={toggleMute}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {isMuted ? <VolumeX size={17} /> : <Volume2 size={17} />}
                </button>

                <Link
                  href={`/podcast/${currentTrack.slug}`}
                  className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-700 ml-2"
                >
                  <span>Episode Page</span>
                  <ChevronRight size={13} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </PublicLayout>
  );
}
