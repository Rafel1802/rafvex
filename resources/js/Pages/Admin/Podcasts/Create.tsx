import React, { useState, useRef } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/Button';
import { 
  Headphones, ArrowLeft, Upload, Radio, Image as ImageIcon, 
  Save, Play, Pause, Clock, AlertCircle, Sparkles, Check, Globe 
} from 'lucide-react';

export default function PodcastCreate({ auth, categories = [], authors = [] }: any) {
  const [audioFilePreview, setAudioFilePreview] = useState<string | null>(null);
  const [detectedDuration, setDetectedDuration] = useState<number>(0);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { data, setData, post, processing, errors } = useForm({
    title: '',
    slug: '',
    category_id: categories[0]?.id ? String(categories[0].id) : '',
    author_id: auth?.user?.id ? String(auth.user.id) : '',
    host_name: auth?.user?.name || 'Rafvex Tech Desk',
    summary: '',
    description: '',
    audio_file: null as File | null,
    audio_url: '',
    duration_seconds: 0,
    cover_image_url: '',
    episode_number: '',
    season_number: 1,
    status: 'published',
    is_featured: false,
    live_status: 'none', // 'none' | 'live' | 'upcoming' | 'ended'
    live_scheduled_at: '',
  });

  const handleTitleChange = (val: string) => {
    setData((prev) => {
      const autoSlug = val
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      if (!prev.slug || prev.slug === autoSlug.slice(0, prev.slug.length)) {
        return { ...prev, title: val, slug: autoSlug };
      }
      return { ...prev, title: val };
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setData('audio_file', file);

    const objectUrl = URL.createObjectURL(file);
    setAudioFilePreview(objectUrl);

    // Read audio duration
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
    post('/ourcms/podcasts', {
      forceFormData: true,
    });
  };

  const formatSec = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <AdminLayout auth={auth}>
      <Head title="Create Podcast Episode — CMS" />

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
              <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5 tracking-tight">
                <Headphones className="text-red-600 dark:text-red-500" size={26} />
                New Podcast Episode
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Upload audio (MP3/WAV/M4A), broadcast live, or publish for on-demand replay.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Button type="submit" isLoading={processing} disabled={processing} className="shadow-xs">
              <Save size={15} className="mr-1.5" />
              Publish Podcast
            </Button>
          </div>
        </div>

        {/* Form Body: 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main 2 Cols: Audio & Content */}
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
                  placeholder="e.g. The Future of AI Agents in 2026"
                  value={data.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
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

            {/* Audio Upload / Audio Source */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Headphones className="text-red-600 dark:text-red-400" size={18} />
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    Audio Source (.mp3, .m4a, .wav, .aac)
                  </h3>
                </div>
                <span className="text-[11px] font-bold text-slate-400">Save Storage Friendly</span>
              </div>

              {/* Upload Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-red-400 dark:hover:border-red-600 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-800/30 group"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="audio/mp3,audio/wav,audio/m4a,audio/aac,audio/ogg,audio/webm,.mp3,.m4a,.wav,.aac"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform">
                  <Upload size={22} />
                </div>

                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {data.audio_file ? data.audio_file.name : 'Click to select audio file (.mp3, .m4a, .wav)'}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Supports up to 100MB per episode. Automatically calculates duration.
                </p>
              </div>

              {/* Audio File Preview Player */}
              {audioFilePreview && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4">
                  <audio
                    ref={previewAudioRef}
                    src={audioFilePreview}
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
                        {data.audio_file?.name}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                        Duration: {formatSec(detectedDuration)} • {((data.audio_file?.size || 0) / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                    Ready to stream
                  </span>
                </div>
              )}

              {/* Alternative: External Audio URL */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Or Stream / CDN Audio URL (Optional)
                  </label>
                  <span className="text-[10px] text-slate-400">Conserves 20GB local disk quota</span>
                </div>
                <input
                  type="url"
                  placeholder="https://cdn.example.com/audio/episode-1.mp3"
                  value={data.audio_url}
                  onChange={(e) => setData('audio_url', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* Manual duration override */}
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

            {/* Summary & Show Notes */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Episode Summary <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="A compelling 2-sentence summary displayed on podcast cards..."
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
                  placeholder="Key takeaways, timestamped chapters, links discussed, guest bio..."
                  value={data.description}
                  onChange={(e) => setData('description', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 resize-y"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Broadcast Controls & Metadata */}
          <div className="space-y-6">
            {/* Live Stream / Broadcast Settings */}
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

            {/* Publishing Settings */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm pb-2 border-b border-slate-100 dark:border-slate-800">
                Episode Info
              </h3>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Podcast Category <span className="text-red-500">*</span>
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
                    placeholder="1"
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

            {/* Cover Image */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Episode Cover Art
                </span>
                <ImageIcon size={15} className="text-slate-400" />
              </div>

              <input
                type="url"
                placeholder="https://images.unsplash.com/... or /storage/..."
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
          </div>
        </div>
      </form>
    </AdminLayout>
  );
}
