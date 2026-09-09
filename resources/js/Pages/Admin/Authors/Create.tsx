import React, { useState, useRef } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/Button';
import { Input } from '@/Components/ui/Input';
import { ArrowLeft, Upload, Image as ImageIcon, Sparkles, UserCheck, X } from 'lucide-react';

export default function Create({ auth }: any) {
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data, setData, post, processing, errors } = useForm({
    name: '',
    job_title: 'Author',
    bio: '',
    email: '',
    avatar: null as File | null,
    avatar_url: '',
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setData('avatar', file);
      const reader = new FileReader();
      reader.onload = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAvatar = () => {
    setData('avatar', null);
    setData('avatar_url', '');
    setAvatarPreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/ourcms/authors');
  };

  return (
    <AdminLayout auth={auth}>
      <Head title="Create New Author - Rafvex CMS" />

      <div className="max-w-3xl mx-auto">
        {/* Top bar */}
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/ourcms/authors"
            className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
            title="Back to Authors"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-display">Create Author</h1>
            <p className="text-xs text-slate-500 mt-0.5">Add an author to publish articles and stories under their name</p>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
            
            {/* Profile Image Section */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Profile Image / Avatar
              </label>
              
              <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                {/* Preview Box */}
                <div className="relative shrink-0">
                  {avatarPreview || data.avatar_url ? (
                    <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-red-500 shadow-md" style={{ backgroundColor: '#ffffff' }}>
                      <img
                        src={avatarPreview || data.avatar_url}
                        alt="Author Preview"
                        className="w-full h-full object-contain"
                      />
                      <button
                        type="button"
                        onClick={removeAvatar}
                        className="absolute top-1 right-1 p-1 rounded-full bg-black/70 hover:bg-black text-white text-xs transition-colors"
                        title="Remove Image"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-2xl bg-slate-200 dark:bg-slate-700 flex flex-col items-center justify-center text-slate-400 border border-dashed border-slate-300 dark:border-slate-600">
                      <ImageIcon size={28} />
                      <span className="text-[10px] font-semibold mt-1">No Image</span>
                    </div>
                  )}
                </div>

                {/* Upload Trigger & Instructions */}
                <div className="flex-1 text-center sm:text-left space-y-2">
                  <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/jpg"
                      onChange={handleFileChange}
                      className="hidden"
                      id="author-avatar-upload"
                    />
                    <label
                      htmlFor="author-avatar-upload"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 cursor-pointer transition-all shadow-2xs"
                    >
                      <Upload size={14} />
                      Upload Photo
                    </label>

                    <span className="text-xs text-slate-400">or enter image URL below</span>
                  </div>

                  <input
                    type="url"
                    value={data.avatar_url}
                    onChange={(e) => {
                      setData('avatar_url', e.target.value);
                      if (e.target.value) setAvatarPreview(e.target.value);
                    }}
                    placeholder="https://... or /storage/..."
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <p className="text-[11px] text-slate-400">
                    Recommended: Square photo (at least 400x400px), PNG, JPG, or WebP. Max 5MB.
                  </p>
                </div>
              </div>
              {errors.avatar && <p className="text-red-500 text-xs mt-1.5">{errors.avatar}</p>}
            </div>

            {/* Author Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Author Full Name <span className="text-red-500">*</span>
              </label>
              <Input
                value={data.name}
                onChange={(e) => setData('name', e.target.value)}
                placeholder="e.g. Soporadara Rin, Alex Mercer, etc."
                error={errors.name}
                required
              />
            </div>

            {/* Job Title / Role */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Role / Title
              </label>
              <Input
                value={data.job_title}
                onChange={(e) => setData('job_title', e.target.value)}
                placeholder="e.g. Author, Senior Tech Analyst, Contributing Writer"
                error={errors.job_title}
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Displays below the author's name inside published blog articles.
              </p>
            </div>

            {/* Author Bio */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Author Bio Description
              </label>
              <textarea
                value={data.bio}
                onChange={(e) => setData('bio', e.target.value)}
                rows={3}
                placeholder="Brief professional bio or description for this author..."
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-900 dark:text-white placeholder:text-slate-400 resize-y"
              />
              {errors.bio && <p className="text-red-500 text-xs mt-1.5">{errors.bio}</p>}
            </div>

            {/* Optional Contact Email */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Author Email <span className="text-slate-400 font-normal lowercase">(optional)</span>
              </label>
              <Input
                type="email"
                value={data.email}
                onChange={(e) => setData('email', e.target.value)}
                placeholder="author@rafvex.com"
                error={errors.email}
              />
              <p className="text-[11px] text-slate-400 mt-1">
                If left empty, a private internal email will be generated automatically.
              </p>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3">
            <Link
              href="/ourcms/authors"
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
            >
              Cancel
            </Link>
            <Button
              type="submit"
              isLoading={processing}
              className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold"
            >
              <UserCheck size={14} className="mr-1.5" />
              Save Author
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
