import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/Button';
import { 
  Headphones, Plus, Search, Filter, Radio, Play, Pause, 
  Trash2, Edit, ExternalLink, Clock, Eye, Sparkles, AlertCircle, CheckCircle2 
} from 'lucide-react';

interface Podcast {
  id: number;
  title: string;
  slug: string;
  summary?: string;
  audio_url?: string;
  audio_path?: string;
  stream_url?: string;
  cover_image_url?: string;
  duration_seconds: number;
  formatted_duration: string;
  host_name?: string;
  status: 'draft' | 'published' | 'scheduled';
  live_status: 'none' | 'upcoming' | 'live' | 'ended';
  live_started_at?: string;
  views_count: number;
  plays_count: number;
  created_at: string;
  category?: { id: number; name: string };
  author?: { id: number; name: string };
}

export default function PodcastsIndex({ auth, podcasts, categories = [], filters = {} }: any) {
  const [search, setSearch] = useState(filters.search || '');
  const [selectedCategory, setSelectedCategory] = useState(filters.category_id || '');
  const [selectedLiveStatus, setSelectedLiveStatus] = useState(filters.live_status || '');
  const [playingAudioId, setPlayingAudioId] = useState<number | null>(null);
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get('/ourcms/podcasts', {
      search,
      category_id: selectedCategory,
      live_status: selectedLiveStatus,
    }, { preserveState: true });
  };

  const handleToggleLive = (podcast: Podcast, action: 'start' | 'end') => {
    const promptMsg = action === 'start'
      ? `Start LIVE broadcast for "${podcast.title}" now? Listeners on the website will be able to tune in live.`
      : `End live broadcast for "${podcast.title}"? The podcast will immediately convert to an on-demand replay.`;

    if (confirm(promptMsg)) {
      router.post(`/ourcms/podcasts/${podcast.id}/toggle-live`, { action }, {
        preserveScroll: true,
      });
    }
  };

  const handleDelete = (podcast: Podcast) => {
    if (confirm(`Delete podcast "${podcast.title}"? The uploaded audio file will also be permanently deleted to save disk space.`)) {
      router.delete(`/ourcms/podcasts/${podcast.id}`);
    }
  };

  const togglePlayAudio = (podcast: Podcast) => {
    if (playingAudioId === podcast.id) {
      audioRef?.pause();
      setPlayingAudioId(null);
    } else {
      if (audioRef) {
        audioRef.pause();
      }
      const audioUrl = podcast.stream_url || podcast.audio_url;
      if (!audioUrl) return;
      const audio = new Audio(audioUrl);
      audio.play();
      audio.onended = () => setPlayingAudioId(null);
      setAudioRef(audio);
      setPlayingAudioId(podcast.id);
    }
  };

  return (
    <AdminLayout auth={auth}>
      <Head title="Podcasts & Audio Shows — CMS" />

      <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5 tracking-tight">
              <Headphones className="text-red-600 dark:text-red-500" size={26} />
              Podcasts & Audio Shows
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Upload MP3/audio files, broadcast simulated live streams, and manage on-demand replays.
            </p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              href="/ourcms/podcast-categories"
              className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Categories
            </Link>
            <Link href="/ourcms/podcasts/create">
              <Button className="shadow-xs">
                <Plus size={16} className="mr-1.5" />
                New Podcast Episode
              </Button>
            </Link>
          </div>
        </div>

        {/* Filter Bar */}
        <form onSubmit={handleSearch} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search episodes by title, host, or summary..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-10 pr-3.5 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                router.get('/ourcms/podcasts', {
                  search,
                  category_id: e.target.value,
                  live_status: selectedLiveStatus,
                }, { preserveState: true });
              }}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">All Categories</option>
              {categories.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            <select
              value={selectedLiveStatus}
              onChange={(e) => {
                setSelectedLiveStatus(e.target.value);
                router.get('/ourcms/podcasts', {
                  search,
                  category_id: selectedCategory,
                  live_status: e.target.value,
                }, { preserveState: true });
              }}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">All Broadcast Statuses</option>
              <option value="live">🔴 Live Now</option>
              <option value="ended">🔁 Replay Available</option>
              <option value="upcoming">⏳ Upcoming Live</option>
              <option value="none">Standard Episodes</option>
            </select>

            <Button type="submit" size="sm" variant="secondary">
              Filter
            </Button>
          </div>
        </form>

        {/* Podcast Episodes List */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-slate-800/30">
                  <th className="py-3 px-4">Episode</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Broadcast Mode</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Plays / Views</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {(podcasts?.data || []).map((podcast: Podcast) => {
                  const isPlaying = playingAudioId === podcast.id;
                  const hasAudio = Boolean(podcast.stream_url || podcast.audio_url);

                  return (
                    <tr key={podcast.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {/* Audio Play Trigger / Thumbnail */}
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700">
                            {podcast.cover_image_url ? (
                              <img
                                src={podcast.cover_image_url}
                                alt={podcast.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400">
                                <Headphones size={20} />
                              </div>
                            )}

                            {hasAudio && (
                              <button
                                type="button"
                                onClick={() => togglePlayAudio(podcast)}
                                className={`absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/60 text-white transition-opacity ${
                                  isPlaying ? 'opacity-100' : 'opacity-0 hover:opacity-100'
                                }`}
                                title={isPlaying ? 'Pause Audio' : 'Preview Audio'}
                              >
                                {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
                              </button>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <Link
                              href={`/ourcms/podcasts/${podcast.id}/edit`}
                              className="font-bold text-slate-900 dark:text-white hover:text-red-600 dark:hover:text-red-400 transition-colors line-clamp-1"
                            >
                              {podcast.title}
                            </Link>
                            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                              <span>{podcast.host_name || 'Host'}</span>
                              <span>•</span>
                              <span className="font-mono text-[11px]">/podcast/{podcast.slug}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {podcast.category ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {podcast.category.name}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">General</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {podcast.live_status === 'live' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 animate-pulse">
                            <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                            🔴 BROADCASTING LIVE
                          </span>
                        ) : podcast.live_status === 'ended' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
                            🔁 Replay Active
                          </span>
                        ) : podcast.live_status === 'upcoming' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50">
                            ⏳ Upcoming Live
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800">
                            On-Demand
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-xs font-mono text-slate-600 dark:text-slate-400">
                        {podcast.formatted_duration || 'Audio'}
                      </td>

                      <td className="py-3.5 px-4 text-xs text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-3">
                          <span>🎧 {podcast.plays_count || 0}</span>
                          <span>👁️ {podcast.views_count || 0}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Live broadcast quick action */}
                          {podcast.live_status === 'live' ? (
                            <button
                              type="button"
                              onClick={() => handleToggleLive(podcast, 'end')}
                              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-600 hover:bg-amber-700 text-white transition-colors"
                              title="Conclude live stream and switch to replay mode"
                            >
                              End Live
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleToggleLive(podcast, 'start')}
                              className="px-2.5 py-1 text-xs font-bold rounded-lg border border-red-200 dark:border-red-900 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 transition-colors"
                              title="Broadcast this episode live right now"
                            >
                              Go Live Now
                            </button>
                          )}

                          <a
                            href={`/podcast/${podcast.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Open public page"
                          >
                            <ExternalLink size={15} />
                          </a>

                          <Link
                            href={`/ourcms/podcasts/${podcast.id}/edit`}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Edit Episode"
                          >
                            <Edit size={15} />
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleDelete(podcast)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                            title="Delete Episode"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {(!podcasts?.data || podcasts.data.length === 0) && (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <Headphones size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                      <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No podcasts found</h3>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
                        Upload your first MP3/audio podcast or broadcast an audio stream live.
                      </p>
                      <Link href="/ourcms/podcasts/create">
                        <Button size="sm">
                          <Plus size={14} className="mr-1" /> New Podcast Episode
                        </Button>
                      </Link>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
