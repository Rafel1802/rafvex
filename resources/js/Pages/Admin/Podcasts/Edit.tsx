import React, { useState, useRef } from 'react';
import { Head, useForm, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/Button';
import { 
  Headphones, ArrowLeft, Upload, Radio, Image as ImageIcon, 
  Save, Play, Pause, Clock, AlertCircle, Sparkles, Check, Globe, 
  ExternalLink, Trash2 
} from 'lucide-react';

export default function PodcastEdit({ auth, podcast, categories = [], authors = [] }: any) {
  const [audioFilePreview, setAudioFilePreview] = useState<string | null>(null);
  const [detectedDuration, setDetectedDuration] = useState<number>(podcast.duration_seconds || 0);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { data, setData, post, processing, errors } = useForm({
    _method: 'PUT',
    title: podcast.title || '',
    slug: podcast.slug || '',
    category_id: podcast.category_id ? String(podcast.category_id) : '',
    author_id: podcast.author_id ? String(podcast.author_id) : '',
    host_name: podcast.host_name || 'Rafvex Tech Desk',
    summary: podcast.summary || '',
    description: podcast.description || '',
    audio_file: null as File | null,
    audio_url: podcast.audio_url || '',
    duration_seconds: podcast.duration_seconds || 0,
    cover_image_url: podcast.cover_image_url || '',
    episode_number: podcast.episode_number || '',
    season_number: podcast.season_number || 1,
    status: podcast.status || 'published',
    is_featured: Boolean(podcast.is_featured),
    live_status: podcast.live_status || 'none',
    live_scheduled_at: podcast.live_scheduled_at || '',
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setData('audio_file', file);

    const objectUrl = URL.createObjectURL(file);
    setAudioFilePreview(objectUrl);

    const tempAudio = new Audio(objectUrl);
    tempAudio.onloadedmetadata = () => {
      const sec = Math.round(tempAudio.duration || 0);
      setDetectedDuration(sec);
      setData('duration_seconds', sec);
    };
  };

  const togglePreviewPlay = () => {
    if (!previewAudioRef.current) return;
    if (isPlayingPreview) {
      previewAudioRef.current.pause();
      setIsPlayingPreview(false);
    } else {
      previewAudioRef.current.play();
      setIsPlayingPreview(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(`/ourcms/podcasts/${podcast.id}`, {
      forceFormData: true,
    });
  };

  const handleToggleLiveAction = (action: 'start' | 'end') => {
    router.post(`/ourcms/podcasts/${podcast.id}/toggle-live`, { action }, {
      preserveScroll: true,
    });
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${podcast.title}"? The uploaded audio file will also be permanently deleted from local disk to save storage.`)) {
      router.delete(`/ourcms/podcasts/${podcast.id}`);
    }
  };

  const formatSec = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const currentAudioSource = audioFilePreview || podcast.stream_url || podcast.audio_url;

  return (
    <AdminLayout auth={auth}>
      <Head title={`Edit Podcast: ${podcast.title}`} />

      <form onSubmit={handleSubmit} className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/ourcms/podcasts"
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Edit Podcast Episode
                </h1>
                {podcast.live_status === 'live' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-600 text-white animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    LIVE NOW
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Manage audio broadcast, upload replacement audio, or view replay settings.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {podcast.live_status === 'live' ? (
              <button
                type="button"
                onClick={() => handleToggleLiveAction('end')}
                className="px-3.5 py-2 text-xs font-bold rounded-xl bg-amber-600 hover:bg-amber-700 text-white transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Radio size={14} /> End Live Broadcast
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleToggleLiveAction('start')}
                className="px-3.5 py-2 text-xs font-bold rounded-xl border border-red-200 dark:border-red-900 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Radio size={14} /> Go Live Now
              </button>
            )}

            <a
              href={`/podcast/${podcast.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-red-600 flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <ExternalLink size={14} /> Public View
            </a>

            <Button type="submit" isLoading={processing} disabled={processing} className="shadow-xs">
              <Save size={15} className="mr-1.5" />
              Save Changes
            </Button>
          </div>
        </div>

        {/* Form Body: 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main 2 Cols */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title & Slug */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Episode Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={data.title}
                  onChange={(e) => setData('title', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-base font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  URL Slug
                </label>
                <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-xs font-mono text-slate-500">
                  <span>/podcast/</span>
                  <input
                    type="text"
                    value={data.slug}
                    onChange={(e) => setData('slug', e.target.value)}
                    className="flex-1 bg-transparent border-0 p-0 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-0 ml-0.5"
                  />
                </div>
              </div>
            </div>

            {/* Audio Management */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Headphones className="text-red-600 dark:text-red-400" size={18} />
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    Current Audio Stream
                  </h3>
                </div>
                <span className="text-xs text-slate-400">
                  {podcast.audio_format ? `Format: .${podcast.audio_format.toUpperCase()}` : ''}
                </span>
              </div>

              {/* Existing or preview audio player */}
              {currentAudioSource && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4">
                  <audio
                    ref={previewAudioRef}
                    src={currentAudioSource}
                    onEnded={() => setIsPlayingPreview(false)}
                    className="hidden"
                  />
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={togglePreviewPlay}
                      className="w-10 h-10 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-colors shrink-0 shadow-xs"
                    >
                      {isPlayingPreview ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
                    </button>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                        {data.audio_file ? data.audio_file.name : (podcast.audio_path ? 'Stored on Server Storage' : 'External Audio Stream')}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                        Duration: {formatSec(detectedDuration || data.duration_seconds)}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                    Audio Active
                  </span>
                </div>
              )}

              {/* Replace Audio File Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-red-400 dark:hover:border-red-600 rounded-2xl p-5 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-800/30 group"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="audio/mp3,audio/wav,audio/m4a,audio/aac,audio/ogg,audio/webm,.mp3,.m4a,.wav,.aac"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform">
                  <Upload size={18} />
                </div>

                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {data.audio_file ? `New File Selected: ${data.audio_file.name}` : 'Click to replace audio file (.mp3, .m4a, .wav)'}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Uploading replaces previous audio and frees disk storage.
                </p>
              </div>

              {/* Or external URL */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Or External Audio URL
                </label>
                <input
                  type="url"
                  placeholder="https://cdn.example.com/audio.mp3"
                  value={data.audio_url}
                  onChange={(e) => setData('audio_url', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="flex items-center gap-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Duration (Seconds):
                </label>
                <input
                  type="number"
                  min="0"
                  value={data.duration_seconds}
                  onChange={(e) => setData('duration_seconds', Number(e.target.value))}
                  className="w-24 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs text-center font-mono text-slate-900 dark:text-white"
                />
                <span className="text-xs text-slate-400 font-mono">
                  ({formatSec(data.duration_seconds)})
                </span>
              </div>
            </div>

            {/* Summary & Description */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Episode Summary <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={data.summary}
                  onChange={(e) => setData('summary', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Detailed Show Notes & Transcript
                </label>
                <textarea
                  rows={8}
                  value={data.description}
                  onChange={(e) => setData('description', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 resize-y"
                />
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Broadcast Mode Card */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Radio className="text-red-600 dark:text-red-400" size={17} />
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    Broadcast Mode
                  </h3>
                </div>
                {data.live_status === 'live' && (
                  <span className="text-[10px] font-black px-2 py-0.5 rounded bg-red-600 text-white animate-pulse">
                    LIVE
                  </span>
                )}
              </div>

              <div className="space-y-2">
                {[
                  { id: 'none', label: 'Standard Episode', desc: 'On-demand playback only' },
                  { id: 'live', label: '🔴 Broadcast Live Now', desc: 'Streams live on website with live offset sync' },
                  { id: 'upcoming', label: '⏳ Upcoming Scheduled Live', desc: 'Displays live countdown to readers' },
                  { id: 'ended', label: '🔁 Replay Available', desc: 'Live ended; full on-demand replay' },
                ].map((mode) => (
                  <label
                    key={mode.id}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      data.live_status === mode.id
                        ? 'border-red-500 bg-red-50/40 dark:bg-red-950/20 text-red-950 dark:text-red-200'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <input
                      type="radio"
                      name="live_status"
                      value={mode.id}
                      checked={data.live_status === mode.id}
                      onChange={(e) => setData('live_status', e.target.value as any)}
                      className="mt-1 text-red-600 focus:ring-red-500"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{mode.label}</p>
                      <p className="text-[11px] text-slate-400">{mode.desc}</p>
                    </div>
                  </label>
                ))}
              </div>

              {data.live_status === 'upcoming' && (
                <div className="pt-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Live Start Time:
                  </label>
                  <input
                    type="datetime-local"
                    value={data.live_scheduled_at}
                    onChange={(e) => setData('live_scheduled_at', e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              )}
            </div>

            {/* Info & Category */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm pb-2 border-b border-slate-100 dark:border-slate-800">
                Episode Details
              </h3>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={data.category_id}
                  onChange={(e) => setData('category_id', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Select Category</option>
                  {categories.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Host Name / Brand
                </label>
                <input
                  type="text"
                  value={data.host_name}
                  onChange={(e) => setData('host_name', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Episode #
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={data.episode_number}
                    onChange={(e) => setData('episode_number', e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-center text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Season #
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={data.season_number}
                    onChange={(e) => setData('season_number', Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-center text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={data.is_featured}
                    onChange={(e) => setData('is_featured', e.target.checked)}
                    className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
                  />
                  <span>Featured Hero Episode</span>
                </label>
              </div>
            </div>

            {/* Cover Art */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Episode Cover Art
                </span>
                <ImageIcon size={15} className="text-slate-400" />
              </div>

              <input
                type="url"
                placeholder="https://..."
                value={data.cover_image_url}
                onChange={(e) => setData('cover_image_url', e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />

              {data.cover_image_url && (
                <div className="relative rounded-xl overflow-hidden aspect-video border border-slate-200 dark:border-slate-700">
                  <img
                    src={data.cover_image_url}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                    onError={() => setData('cover_image_url', '')}
                  />
                </div>
              )}
            </div>

            {/* Danger Zone */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-red-200/80 dark:border-red-900/40 shadow-xs">
              <button
                type="button"
                onClick={handleDelete}
                className="w-full py-2.5 px-4 rounded-xl border border-red-200 dark:border-red-800 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Trash2 size={14} /> Delete Podcast Episode
              </button>
            </div>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
}
