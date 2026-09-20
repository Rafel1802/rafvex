import React from 'react';
import { Link } from '@inertiajs/react';
import {
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  BookOpen,
  Cpu,
  Globe,
  ArrowRight,
  HelpCircle,
  FileCheck,
  Compass,
  MessageSquare,
  Lock
} from 'lucide-react';

export default function ReviewsSection() {
  const editorialPrinciples = [
    {
      icon: Cpu,
      title: 'First-Hand Software & Hardware Testing',
      desc: 'We do not recite press releases. Every tutorial, prompt, command, and troubleshooting step is tested directly on real hardware—from macOS and Windows 11 to Android and iOS.',
      badge: 'Rigorous Testing',
      color: 'from-blue-600 to-indigo-600',
    },
    {
      icon: ShieldCheck,
      title: 'Strict Editorial Independence',
      desc: 'Our reviews and recommendations cannot be purchased. We spotlight tools, utilities, and workflows based solely on practical utility, security, and proven value to our readers.',
      badge: '100% Unbiased',
      color: 'from-red-600 to-rose-600',
    },
    {
      icon: HelpCircle,
      title: 'Search-Intent Driven Solutions',
      desc: 'No endless filler or generic AI intros. Our guides get straight to the solution with clear headings, exact commands, step-by-step diagnostic workflows, and real-world screenshots.',
      badge: 'Zero Fluff',
      color: 'from-emerald-600 to-teal-600',
    },
    {
      icon: BookOpen,
      title: 'Human-First Mindful Learning',
      desc: 'Beyond tech diagnostics, Rafvex crafts immersive English reading stories and essays that inspire curiosity, foster lifelong learning, and expand practical vocabulary.',
      badge: 'Lifelong Growth',
      color: 'from-amber-600 to-orange-600',
    },
  ];

  const topicsCovered = [
    { name: 'Artificial Intelligence', count: '10+ Deep Guides', slug: 'ai-tools' },
    { name: 'Operating Systems (Win & Mac)', count: '10+ Tutorials', slug: 'windows-mac' },
    { name: 'Smartphones & Mobile Tech', count: '10+ Solutions', slug: 'android-iphone' },
    { name: 'Network Troubleshooting', count: '10+ Blueprints', slug: 'troubleshooting' },
    { name: 'Basic Online Security', count: '8+ Protocols', slug: 'basic-online-security' },
    { name: 'English Reading Stories', count: 'Curated Essays', slug: 'english-reading-stories' },
  ];

  return (
    <section className="mt-16 pt-12 pb-8 border-t border-slate-200 dark:border-slate-800">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 text-xs font-bold uppercase tracking-wider mb-3 border border-red-100 dark:border-red-900/50">
          <FileCheck size={13} />
          Editorial Charter &amp; Research Standards
        </div>
        <h2
          style={{ fontFamily: "'Outfit', sans-serif" }}
          className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-tight mb-3"
        >
          Why Thousands of Readers Trust Rafvex
        </h2>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          Rafvex is an independent technology publication founded by Mr. Soporadara Rin. We provide verified tech knowledge, clear how-to guides, and educational insights built on a reader-first foundation.
        </p>
      </div>

      {/* 4 Core Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {editorialPrinciples.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs hover:shadow-md hover:border-red-200 dark:hover:border-red-800/60 transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 flex items-center justify-center">
                    <Icon size={20} className="text-red-600 dark:text-red-400" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800">
                    {item.badge}
                  </span>
                </div>
                <h3
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                  className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2 leading-snug"
                >
                  {item.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 gap-1.5">
                <CheckCircle2 size={13} /> Verified Standard
              </div>
            </div>
          );
        })}
      </div>

      {/* Trust & Topic Directory Banner */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-900 via-[#0f172a] to-slate-950 text-white p-8 sm:p-10 shadow-xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-red-400 text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
              <Compass size={13} />
              Organized Knowledge Channels
            </div>
            <h3
              style={{ fontFamily: "'Outfit', sans-serif" }}
              className="text-2xl sm:text-3xl font-black text-white tracking-tight"
            >
              Explore Our Core Topic Channels
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
              From beginner troubleshooting to advanced AI workflows, find exactly what you need with verified, original explanations written by humans for humans.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors shadow-xs"
              >
                Read Our Full Mission &amp; About Us <ArrowRight size={13} />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-colors border border-white/10"
              >
                <MessageSquare size={13} />
                Submit Editorial Feedback
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {topicsCovered.map((topic, i) => (
              <Link
                key={i}
                href={`/category/${topic.slug}`}
                className="p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors group block"
              >
                <span className="block text-xs font-bold text-white group-hover:text-red-400 transition-colors truncate">
                  {topic.name}
                </span>
                <span className="block text-[10px] text-slate-400 mt-0.5">
                  {topic.count}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
