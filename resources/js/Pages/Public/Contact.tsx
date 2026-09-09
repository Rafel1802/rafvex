import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { Mail, MessageSquare, Phone, MapPin, Send, CheckCircle2, Sparkles, Globe, HelpCircle, ArrowRight } from 'lucide-react';

export default function Contact({ auth }: any) {
  const { props } = usePage<any>();
  const site = props.site ?? {};

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'editorial_tip',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';

    try {
      await fetch('/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-CSRF-TOKEN': csrfToken,
        },
        body: JSON.stringify(formData),
      });
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PublicLayout auth={auth}>
      <Head>
        <title>Contact Us &amp; Get In Touch — Rafvex</title>
        <meta
          name="description"
          content="Get in touch with the Rafvex editorial team and founder Mr. Soporadara Rin. Direct contact channels, news tips, and partnership inquiries."
        />
        <meta property="og:title" content="Contact Us &amp; Get In Touch — Rafvex" />
        <meta
          property="og:description"
          content="Connect with the Rafvex editorial team and founder Mr. Soporadara Rin."
        />
      </Head>

      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '48px 24px 100px' }}>
        
        {/* ── BREADCRUMB ── */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            <li>
              <Link href="/" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">Home</Link>
            </li>
            <li>/</li>
            <li className="text-slate-900 dark:text-slate-100 font-semibold">Contact &amp; Get In Touch</li>
          </ol>
        </nav>

        {/* ── HEADER ── */}
        <div className="pb-8 border-b border-slate-200 dark:border-slate-800 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs font-bold uppercase tracking-wider mb-3 border border-red-100 dark:border-red-900/40">
            <MessageSquare size={13} />
            Direct Communication
          </div>
          <h1
            style={{ fontFamily: "'Outfit', sans-serif" }}
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-[1.15] mb-3"
          >
            Get In Touch With Us
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
            Have a question, feedback, story suggestion, or news tip? We read and appreciate every message. Connect with our editorial desk or reach out directly to founder Mr. Soporadara Rin.
          </p>
        </div>

        {/* ── TWO-COLUMN CONTACT LAYOUT ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-16">
          
          {/* Left Column: Interactive Contact Form (7 cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2
              style={{ fontFamily: "'Outfit', sans-serif" }}
              className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2"
            >
              Send an Editorial Message
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-8">
              Fill out the form below and our team will respond within 24 to 48 hours.
            </p>

            {submitted ? (
              <div className="p-8 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 size={26} />
                </div>
                <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-200">Message Received!</h3>
                <p className="text-xs text-emerald-700 dark:text-emerald-300 max-w-md mx-auto">
                  Thank you for reaching out to Rafvex. Your message has been forwarded to Mr. Soporadara Rin and the editorial desk.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: '', email: '', subject: 'editorial_tip', message: '' });
                  }}
                  className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors cursor-pointer"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. John Doe"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/80 focus:bg-white dark:focus:bg-slate-800 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. john@example.com"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/80 focus:bg-white dark:focus:bg-slate-800 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                    Inquiry Topic
                  </label>
                  <select
                    value={formData.subject}
                    onChange={e => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/80 focus:bg-white dark:focus:bg-slate-800 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all text-sm text-slate-900 dark:text-slate-100"
                  >
                    <option value="editorial_tip">News Tip or Story Idea</option>
                    <option value="correction">Article Correction or Feedback</option>
                    <option value="tech_question">Technical Inquiry / How-To Question</option>
                    <option value="partnership">Partnership &amp; Collaboration</option>
                    <option value="general">General Message to Mr. Soporadara Rin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                    Your Message *
                  </label>
                  <textarea
                    rows={5}
                    required
                    value={formData.message}
                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Share your thoughts, details, or questions here..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/80 focus:bg-white dark:focus:bg-slate-800 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 resize-y"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-red-600/20 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                >
                  <Send size={14} />
                  <span>{submitting ? 'Sending Message...' : 'Send Message Now'}</span>
                </button>
              </form>
            )}
          </div>

          {/* Right Column: Direct Channels & Social Communities (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Direct Channels Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 dark:bg-[#0f172a] text-white border border-transparent dark:border-slate-800 shadow-lg space-y-5">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-white/10 text-xs font-bold text-red-400 uppercase tracking-wider">
                Direct Channels
              </div>
              <h3
                style={{ fontFamily: "'Outfit', sans-serif" }}
                className="text-xl font-bold text-white"
              >
                Official Editorial Desk
              </h3>

              <div className="space-y-4 text-xs sm:text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-red-400 shrink-0">
                    <Mail size={16} />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase font-bold block">Editorial Email</span>
                    <a href={`mailto:${site.contact_email || 'rafvexofficial@gmail.com'}`} className="font-semibold text-white hover:text-red-400 transition-colors">
                      {site.contact_email || 'rafvexofficial@gmail.com'}
                    </a>
                  </div>
                </div>

                {site.contact_phone && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-red-400 shrink-0">
                      <Phone size={16} />
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 uppercase font-bold block">Direct Telephone</span>
                      <span className="font-semibold text-white">{site.contact_phone}</span>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-red-400 shrink-0">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase font-bold block">Headquarters / Location</span>
                    <span className="font-semibold text-white">
                      {site.contact_address || 'Phnom Penh, Cambodia · Global Editorial Network'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Founder Note Card */}
            <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-red-50/40 via-white to-slate-50 dark:from-red-950/20 dark:via-slate-900 dark:to-slate-900 p-6 shadow-2xs">
              <div className="flex items-center gap-2 text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider mb-2">
                <Sparkles size={14} />
                Founder Note
              </div>
              <h4
                style={{ fontFamily: "'Outfit', sans-serif" }}
                className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1.5"
              >
                Reach Mr. Soporadara Rin
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                "Whether you have a suggestion for our next tech deep dive, a question about an AI guide, or feedback on our English reading stories, I welcome direct correspondence from our readers."
              </p>
              <Link
                href="/about#founder"
                className="text-xs font-bold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 inline-flex items-center gap-1"
              >
                Learn more about Mr. Soporadara Rin <ArrowRight size={12} />
              </Link>
            </div>

            {/* Social Media Communities (Controlled via CMS) */}
            <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
              <div className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
                Connect on Social Media
              </div>
              <div className="space-y-2.5">
                {site.twitter_handle && (
                  <a
                    href={`https://twitter.com/${site.twitter_handle.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors"
                  >
                    <span>Follow on 𝕏 (Twitter)</span>
                    <span className="text-slate-400 dark:text-slate-400 font-mono text-[11px]">{site.twitter_handle}</span>
                  </a>
                )}
                {site.telegram_url && (
                  <a
                    href={site.telegram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors"
                  >
                    <span>Join Official Telegram</span>
                    <span className="text-sky-600 dark:text-sky-400 font-bold text-[11px]">t.me/rafvex</span>
                  </a>
                )}
                {site.facebook_url && (
                  <a
                    href={site.facebook_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors"
                  >
                    <span>Official Facebook Page</span>
                    <span className="text-blue-600 dark:text-blue-400 font-bold text-[11px]">Facebook →</span>
                  </a>
                )}
                {site.linkedin_url && (
                  <a
                    href={site.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors"
                  >
                    <span>Connect on LinkedIn</span>
                    <span className="text-blue-700 dark:text-blue-400 font-bold text-[11px]">LinkedIn →</span>
                  </a>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* ── FAQ SECTION ── */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-12">
          <div className="flex items-center gap-2 mb-6">
            <HelpCircle size={18} className="text-red-600 dark:text-red-400" />
            <h2
              style={{ fontFamily: "'Outfit', sans-serif" }}
              className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight"
            >
              Frequently Asked Questions
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2">How fast do you reply?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                We review inbound messages daily. Editorial inquiries and article corrections typically receive a response within 24 to 48 business hours.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2">Can I submit a news tip?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Yes! We welcome tips on emerging AI models, software tools, or new computing discoveries. Select "News Tip or Story Idea" in the contact form.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2">Do you accept paid guest posts?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                To protect our readers, Rafvex maintains strictly verified editorial independence. We do not publish automated, sponsored, or unchecked articles.
              </p>
            </div>
          </div>
        </div>

      </div>
    </PublicLayout>
  );
}
