import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { Sparkles, Shield, BookOpen, Compass, CheckCircle2, ArrowRight, Heart, Feather, Globe, Mail } from 'lucide-react';

export default function About({ auth }: any) {
  const { site = {} } = usePage().props as any;
  const founderDisplayName = site.founder_name
    ? (site.founder_name.startsWith('Mr.') ? site.founder_name : `Mr. ${site.founder_name}`)
    : 'Mr. Soporadara Rin';
  const founderInitials = site.founder_name
    ? site.founder_name.split(' ').filter(Boolean).map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'SR';
  const founderAvatar = site.founder_avatar || '/storage/settings/founder_avatar/M5hbcGOJYiaTeqlLtrvUEcujiZoMzM2ZTL0BADAv.png';

  return (
    <PublicLayout auth={auth}>
      <Head>
        <title>About Us &amp; Editorial Mission — Rafvex</title>
        <meta
          name="description"
          content="Discover the mission of Rafvex. Founded and written by Mr. Soporadara Rin, we share verified research, hands-on tech guides, AI insights, and English reading stories."
        />
        <meta property="og:title" content="About Us &amp; Editorial Mission — Rafvex" />
        <meta
          property="og:description"
          content="Learn about our writing philosophy, research standards, and founder Mr. Soporadara Rin."
        />
      </Head>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '48px 24px 100px' }}>
        
        {/* ── BREADCRUMB ── */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            <li>
              <Link href="/" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">Home</Link>
            </li>
            <li>/</li>
            <li className="text-slate-900 dark:text-slate-100 font-semibold">About Rafvex</li>
          </ol>
        </nav>

        {/* ── HERO BANNER ── */}
        <div className="pb-10 border-b border-slate-200 dark:border-slate-800 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs font-bold uppercase tracking-wider mb-4 border border-red-100 dark:border-red-900/40">
            <Feather size={13} />
            Our Mission &amp; Purpose
          </div>
          <h1
            style={{ fontFamily: "'Outfit', sans-serif" }}
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-[1.15] mb-4"
          >
            Curiosity. Deep Research.
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-rose-500 dark:from-red-500 dark:to-rose-400">
              Knowledge Shared Without Noise.
            </span>
          </h1>
          <p className="text-base sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
            Rafvex was born from a simple yet ambitious conviction: that technology, artificial intelligence, and digital discovery should be thoroughly researched, beautifully written, and freely shared to help people learn something new every day.
          </p>
        </div>

        {/* ── SECTION 1: WHO WE ARE & OUR PHILOSOPHY ── */}
        <section className="mb-14 space-y-6 text-slate-700 dark:text-slate-300 text-base sm:text-lg leading-relaxed">
          <h2
            style={{ fontFamily: "'Outfit', sans-serif" }}
            className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight"
          >
            We Are Writers, Researchers &amp; Digital Explorers
          </h2>
          <p>
            In an era dominated by automated content farms, clickbait headlines, and superficial summaries, the world doesn’t need more noise — it needs <strong>clarity, rigor, and genuine human insight</strong>.
          </p>
          <p>
            At Rafvex, we approach every topic as passionate writers and dedicated researchers. We do not simply repost press releases or recite superficial tech specs. Instead, we dive into the core of how technologies function: testing new AI prompts, configuring devices, investigating digital security vulnerabilities, discovering obscure but incredibly useful web tools, and crafting English reading stories that stimulate the mind.
          </p>
        </section>

        {/* ── SECTION 2: THE FOUR EDITORIAL PILLARS ── */}
        <section className="mb-16">
          <h2
            style={{ fontFamily: "'Outfit', sans-serif" }}
            className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight mb-8"
          >
            The Four Pillars of Rafvex
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs hover:border-red-200 dark:hover:border-red-500/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center mb-4">
                <Sparkles size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">1. Artificial Intelligence &amp; Emerging Tech</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                We demystify large language models, prompt engineering, generative tools, and automation. We examine how AI actually impacts your daily workflow, career, and creative endeavors.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs hover:border-red-200 dark:hover:border-red-500/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
                <Compass size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">2. Practical How-To Guides &amp; Fixes</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Step-by-step troubleshooting for Windows, macOS, iPhone, and Android. Clear instructions tested firsthand to solve real problems without confusion or jargon.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs hover:border-red-200 dark:hover:border-red-500/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                <Globe size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">3. Curated Apps, Websites &amp; Security</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Discover the best hidden gems on the internet. We review productivity applications, privacy safeguards, VPNs, and free web utilities that make everyday life faster and safer.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs hover:border-red-200 dark:hover:border-red-500/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
                <BookOpen size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">4. English Reading Stories &amp; Vocabulary</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Language is the foundation of knowledge. We craft immersive English reading stories and informative articles designed to inspire readers, expand vocabulary, and foster lifelong learning.
              </p>
            </div>
          </div>
        </section>

        {/* ── SECTION 3: VERIFIED EDITORIAL RIGOR ── */}
        <section className="mb-16 p-8 rounded-3xl bg-slate-900 dark:bg-[#0f172a] text-white border border-transparent dark:border-slate-800 shadow-xl">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-red-400 mb-2">
            <Shield size={14} />
            Verified Editorial Standards
          </div>
          <h2
            style={{ fontFamily: "'Outfit', sans-serif" }}
            className="text-2xl sm:text-3xl font-black text-white mb-4"
          >
            How Every Article is Researched
          </h2>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-6 max-w-2xl">
            Our readers rely on our tutorials and analyses for critical decisions. We adhere to strict quality rules:
          </p>

          <div className="space-y-3.5 text-sm text-slate-200">
            <div className="flex items-start gap-3">
              <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Hands-on Verification:</strong> Software, apps, and tutorials are personally installed and tested before publishing.</span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Independent &amp; Unbiased:</strong> Our editorial conclusions cannot be bought. We recommend tools because they work, not because of sponsorships.</span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Continuous Updates:</strong> Technology changes rapidly. We continuously audit older guides to ensure commands, menus, and recommendations remain 100% accurate.</span>
            </div>
          </div>
        </section>

        {/* ── SECTION 4: THE FOUNDER & CHIEF WRITER SPOTLIGHT (AT THE END) ── */}
        <section id="founder" className="pt-6 scroll-mt-24 border-t border-slate-200 dark:border-slate-800">
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-white via-slate-50/60 to-red-50/20 dark:from-slate-900 dark:via-[#0f172a] dark:to-red-950/20 p-8 sm:p-12 shadow-sm">
            <div className="flex flex-col md:flex-row items-start gap-8">
              
              {/* Avatar / Monogram Badge (Supports dynamic CMS upload) */}
              {founderAvatar ? (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shadow-lg shadow-red-600/15 border-2 border-red-500/20 shrink-0 bg-slate-100 dark:bg-slate-800">
                  <img
                    src={founderAvatar}
                    alt={founderDisplayName}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-red-600 via-rose-600 to-red-700 text-white font-black font-display text-4xl flex items-center justify-center shadow-lg shadow-red-600/20 shrink-0">
                  {founderInitials}
                </div>
              )}

              {/* Founder Bio & Narrative */}
              <div className="space-y-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400 text-xs font-extrabold uppercase tracking-wider mb-2">
                    <Sparkles size={12} />
                    {site.founder_title || 'Founder, Visionary Writer & Lead Researcher'}
                  </div>
                  <h2
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                    className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight"
                  >
                    {founderDisplayName}
                  </h2>
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">
                    Founder of {site.name || 'Rafvex'} · Creator · Technology Enthusiast
                  </p>
                </div>

                <div className="space-y-3.5 text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
                  <p>
                    <strong>{founderDisplayName}</strong> is the creative force, principal writer, and lead researcher behind {site.name || 'Rafvex'}. With a deep passion for understanding how systems work and an unyielding commitment to sharing actionable knowledge, he established {site.name || 'Rafvex'} as a beacon for learners, students, engineers, and curious minds worldwide.
                  </p>
                  <p>
                    Driven by the conviction that the most complex technical concepts can be broken down into intuitive, enjoyable reading, {founderDisplayName} spends countless hours researching emerging artificial intelligence breakthroughs, testing software, analyzing computing architectures, and composing compelling English reading stories.
                  </p>
                  <p>
                    Under his editorial direction, {site.name || 'Rafvex'} has grown from an ambitious concept into a trusted publication known for its meticulous attention to detail, verified facts, and reader-first philosophy.
                  </p>
                </div>

                {/* Personal Quote Card */}
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-2xs mt-6 border-l-4 border-l-red-600">
                  <p className="text-sm sm:text-base italic text-slate-800 dark:text-slate-200 leading-relaxed font-serif">
                    "Writing is not merely about assembling words; it is about distilling truth, sparking curiosity, and handing someone the keys to explore a world they didn't know existed. {site.name || 'Rafvex'} is my pledge to make that discovery accessible to everyone."
                  </p>
                  <span className="block mt-3 text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">
                    — {founderDisplayName}, Founder of {site.name || 'Rafvex'}
                  </span>
                </div>

                {/* Actions & Connect */}
                <div className="pt-4 flex flex-wrap items-center gap-3">
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-xs"
                  >
                    <Mail size={14} />
                    Get in Touch with {founderDisplayName}
                  </Link>
                  <Link
                    href="/sitemap"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all"
                  >
                    Explore His Articles &amp; Guides
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </section>

      </div>
    </PublicLayout>
  );
}
