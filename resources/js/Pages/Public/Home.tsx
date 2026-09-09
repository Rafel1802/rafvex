import React, { useState, useEffect } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { 
  ArrowRight, 
  Clock, 
  Flame, 
  Sparkles, 
  BookOpen, 
  Compass, 
  Shield, 
  Laptop, 
  Smartphone, 
  HelpCircle, 
  CheckCircle2, 
  Headphones, 
  Globe, 
  Wrench, 
  Layers,
  Send,
  ExternalLink,
  Video
} from 'lucide-react';
import { format } from 'date-fns';
import AdBanner from '@/Components/AdBanner';
import BookmarkButton from '@/Components/Public/BookmarkButton';
import ReadBadge from '@/Components/Public/ReadBadge';

/* ── Helpers ── */
function ReadingTime({ minutes }: { minutes?: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 font-medium">
      <Clock size={11} /> {minutes || 5} min read
    </span>
  );
}

function ArticleImage({ src, alt }: { src?: string; alt?: string }) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt || 'Article cover'}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        loading="lazy"
      />
    );
  }
  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rafvex</span>
    </div>
  );
}

/* ── Main Lead Hero Card ── */
function LeadHeroCard({ article }: { article: any }) {
  if (!article) return null;
  return (
    <div className="relative flex-1 flex flex-col group">
      <Link href={`/article/${article.slug}`} className="block text-decoration-none flex-1 flex flex-col">
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-950 shadow-lg border border-slate-800 flex-1 min-h-[280px] sm:min-h-[440px] flex flex-col justify-end">
          <div className="absolute inset-0">
            <ArticleImage src={article.cover_image_url} alt={article.title} />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent pointer-events-none" />
          
          <div className="relative z-10 p-4 sm:p-7">
            <div className="flex items-center gap-2 mb-2">
              {article.category && (
                <span className="inline-block px-2.5 py-0.5 rounded-md bg-red-600 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-xs">
                  {article.category.name}
                </span>
              )}
              <ReadBadge articleId={article.id} className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40" />
            </div>

            <h2
              style={{ fontFamily: "'Outfit', sans-serif" }}
              className="text-lg sm:text-2xl lg:text-3xl font-black text-white leading-snug tracking-tight mb-2 max-w-2xl group-hover:text-red-300 transition-colors"
            >
              {article.title}
            </h2>
            {article.excerpt && (
              <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 leading-relaxed max-w-xl mb-3 hidden sm:block">
                {article.excerpt}
              </p>
            )}
            <div className="flex items-center gap-3 text-[11px] sm:text-xs text-slate-400 flex-wrap">
              {article.published_at && (
                <span>{format(new Date(article.published_at), 'MMM d, yyyy')}</span>
              )}
              <ReadingTime minutes={article.reading_time} />
            </div>
          </div>
        </div>
      </Link>

      {/* Floating Bookmark Button */}
      <div className="absolute top-4 right-4 z-20">
        <div className="w-8 h-8 rounded-xl bg-black/60 backdrop-blur-md flex items-center justify-center border border-white/20 hover:bg-black/90 transition-colors shadow-md">
          <BookmarkButton articleId={article.id} size={15} />
        </div>
      </div>
    </div>
  );
}

/* ── Editorial Card ── */
function EditorialCard({ article }: { article: any }) {
  if (!article) return null;
  return (
    <div className="group flex flex-col flex-1 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 sm:p-4 shadow-2xs hover:shadow-lg hover:border-red-200 dark:hover:border-red-800 transition-all duration-200 justify-between gap-3">
      <Link href={`/article/${article.slug}`} className="w-full aspect-[16/9] rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 block relative">
        <ArticleImage src={article.cover_image_url} alt={article.title} />
      </Link>
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-1 mb-1">
            <div className="flex items-center gap-1.5 min-w-0 truncate">
              {article.category && (
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-red-600 dark:text-red-400 block truncate">
                  {article.category.name}
                </span>
              )}
              <ReadBadge articleId={article.id} />
            </div>
          </div>
          <Link href={`/article/${article.slug}`}>
            <h3
              style={{ fontFamily: "'Outfit', sans-serif" }}
              className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-2 leading-snug mb-1 sm:mb-2"
            >
              {article.title}
            </h3>
          </Link>
        </div>
        <div className="pt-2 flex items-center justify-between text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            {article.published_at && <span>{format(new Date(article.published_at), 'MMM d')}</span>}
            <ReadingTime minutes={article.reading_time} />
          </div>
          <BookmarkButton articleId={article.id} size={14} />
        </div>
      </div>
    </div>
  );
}


/* ── Section Header ── */
function SectionHeader({ title, subtitle, href }: { title: string; subtitle?: string; href?: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-3 mb-6 border-b border-slate-200 dark:border-slate-800">
      <div>
        <h2
          style={{ fontFamily: "'Outfit', sans-serif" }}
          className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight"
        >
          {title}
        </h2>
        {subtitle && <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      {href && (
        <Link
          href={href}
          className="inline-flex items-center gap-1 text-xs font-bold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors shrink-0"
        >
          View all in {title} <ArrowRight size={13} />
        </Link>
      )}
    </div>
  );
}

/* ── Home Ads Sidebar Widget (Below Editorial Standards) ── */
function HomeAdsSidebarWidget({ ads = [] }: { ads: any[] }) {
  if (!ads || ads.length === 0) return null;

  useEffect(() => {
    ads.slice(0, 4).forEach((ad: any) => {
      if (ad?.id) {
        fetch(`/api/home-ads/${ad.id}/impression`, { method: 'POST', keepalive: true }).catch(() => {});
      }
    });
  }, [ads]);

  const handleAdClick = (ad: any) => {
    try {
      fetch(`/api/home-ads/${ad.id}/click`, { method: 'POST', keepalive: true });
    } catch (e) {}
  };

  return (
    <div className="space-y-4 pt-2">
      {/* Widget Header */}
      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
          <Sparkles size={12} className="text-red-600 dark:text-red-400" />
          Sponsored Showcase
        </span>
        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">Featured Partners</span>
      </div>

      {/* Grid of Ads (Up to 4 responsive cards) */}
      <div className="space-y-4">
        {ads.slice(0, 4).map((ad: any) => {
          const isVideo = ad.media_type === 'video';
          const isSquare = ad.aspect_ratio === 'square';
          const targetUrl = ad.link_url || '#';

          return (
            <a
              key={ad.id}
              href={targetUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleAdClick(ad)}
              className="group block rounded-2xl border border-slate-200/90 dark:border-slate-800 hover:border-red-300 dark:hover:border-red-700 bg-white dark:bg-slate-900 p-4 shadow-2xs hover:shadow-md transition-all duration-200 text-decoration-none"
            >
              {/* Header Badges */}
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <span className="px-2 py-0.5 rounded-md bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 text-[10px] font-extrabold uppercase tracking-wider border border-red-100 dark:border-red-900/50">
                  {ad.badge_text || 'Sponsored'}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
                  {ad.sponsor_name || 'Our Sponsor'}
                </span>
              </div>

              {/* Media Container: Square (1:1) or Landscape (16:9) */}
              <div
                className={`w-full ${
                  isSquare ? 'aspect-square' : 'aspect-[16/9]'
                } rounded-xl overflow-hidden bg-slate-950 relative mb-3`}
              >
                {isVideo ? (
                  <video
                    src={ad.video_url || ad.media_url}
                    muted
                    loop
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={ad.media_url || 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80'}
                    alt={ad.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                )}
              </div>

              {/* Headline */}
              <h4
                style={{ fontFamily: "'Outfit', sans-serif" }}
                className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-2 leading-snug mb-1"
              >
                {ad.title}
              </h4>

              {/* Subtitle / Copy */}
              {ad.subtitle && (
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-2.5">
                  {ad.subtitle}
                </p>
              )}

              {/* Bottom Sponsor link */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 dark:text-slate-500 font-medium">rafvex.com sponsor</span>
                <span className="inline-flex items-center gap-1 font-bold text-red-600 dark:text-red-400 group-hover:translate-x-0.5 transition-transform">
                  Visit Sponsor <ArrowRight size={11} />
                </span>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}

/* ── Main Home Page ── */
export default function Home({ 
  auth, 
  featured, 
  leadStory: propLeadStory, 
  secondaryStories: propSecondaryStories, 
  subFeaturedStories: propSubFeaturedStories,
  trendingStories: propTrendingStories, 
  storyStories: propStoryStories,
  troubleshootingStories: propTroubleshootingStories,
  latest, 
  topCategories,
  homeSections,
  spotlightMain,
  spotlightSubs,
  homeAds
}: any) {
  const safeFeatured = Array.isArray(featured) ? featured : (featured && typeof featured === 'object' ? Object.values(featured) : []);
  const safeLatest = Array.isArray(latest) ? latest : (latest && typeof latest === 'object' ? Object.values(latest) : []);
  const safeTopCategories = Array.isArray(topCategories) ? topCategories : (topCategories && typeof topCategories === 'object' ? Object.values(topCategories) : []);

  const leadStory = propLeadStory || safeFeatured[0] || safeLatest[0];
  const secondaryStories = propSecondaryStories || (safeFeatured.length > 1 ? safeFeatured.slice(1, 3) : safeLatest.slice(1, 3));
  const subFeaturedStories = propSubFeaturedStories || (safeLatest.length > 0 ? safeLatest.slice(0, 2) : []);
  const trendingStories = propTrendingStories || safeLatest.slice(2, 6);

  // Categorized article groups with word-boundary awareness (prevents substring false-positives like 'dr-ai-n' matching 'ai')
  const filterByKeywords = (keywords: string[], exactWords: string[] = []) => safeLatest.filter((a: any) => {
    const slug = (a?.category?.slug || '').toLowerCase();
    const name = (a?.category?.name || '').toLowerCase();
    const title = (a?.title || '').toLowerCase();

    const hasExactWord = exactWords.some(w => {
      const regex = new RegExp(`\\b${w}\\b`, 'i');
      return regex.test(title) || regex.test(name) || slug.split('-').includes(w);
    });
    if (hasExactWord) return true;

    return keywords.some(k => slug.includes(k) || name.includes(k) || title.includes(k));
  });

  const aiArticles = filterByKeywords(
    ['artificial intelligence', 'chatgpt', 'claude', 'neural', 'prompt', 'llm', 'copilot'],
    ['ai']
  );
  const phoneArticles = filterByKeywords(['phone', 'android', 'iphone', 'ios', 'mobile']);
  const computingArticles = filterByKeywords(['windows', 'mac', 'computing', 'pc', 'laptop', 'desktop']);
  const troubleshootingArticles = filterByKeywords(['troubleshoot', 'how-to', 'fix', 'audio', 'wifi', 'battery']);
  const storyArticles = filterByKeywords(['story', 'stories', 'english', 'reading', 'words', 'vocabulary', 'habit', 'lantern', 'seed']);
  const reviewArticles = filterByKeywords(['review', 'gadget', 'hardware', 'benchmark']);

  // Tech & productivity articles strictly excluding literary stories for fallbacks
  const techFallbacks = safeLatest.filter((a: any) => {
    const slug = (a?.category?.slug || '').toLowerCase();
    return !['english-reading-stories', 'short-stories', 'vocabulary-life', 'inspirational-stories'].includes(slug);
  });

  // Guaranteed 4 latest blogs for How-To & Tech Troubleshooting (Always exactly 4)
  const candidateTroubleshooting = [
    ...(Array.isArray(propTroubleshootingStories) ? propTroubleshootingStories : []),
    ...troubleshootingArticles,
    ...techFallbacks,
    ...safeLatest,
    ...safeFeatured,
  ];
  const displayTroubleshooting: any[] = [];
  const seenTbIds = new Set<number>();
  for (const art of candidateTroubleshooting) {
    if (art && art.id && !seenTbIds.has(art.id)) {
      seenTbIds.add(art.id);
      displayTroubleshooting.push(art);
      if (displayTroubleshooting.length === 4) break;
    }
  }

  // Guaranteed 4 latest blogs for English Reading Stories (Always exactly 4)
  const candidateStories = [
    ...(Array.isArray(propStoryStories) ? propStoryStories : []),
    ...storyArticles,
    ...safeLatest,
    ...safeFeatured,
  ];
  const displayStories: any[] = [];
  const seenStoryIds = new Set<number>();
  for (const art of candidateStories) {
    if (art && art.id && !seenStoryIds.has(art.id)) {
      seenStoryIds.add(art.id);
      displayStories.push(art);
      if (displayStories.length === 4) break;
    }
  }

  // Section 4: Trending
  const trendingConfig = homeSections?.trending || {};
  const isTrendingEnabled = trendingConfig.enabled ?? true;
  const trendingTitle = trendingConfig.title || 'Trending on Rafvex';
  const trendingSubtitle = trendingConfig.subtitle || 'The most-read technology breakdowns and tutorials';

  // Section 5: Category Spotlight Showcase: 1 Main + 4 Sub-Articles (Always exactly 4 sub-articles on the right)
  const spotlightConfig = homeSections?.spotlight || {};
  const isSpotlightEnabled = spotlightConfig.enabled ?? true;
  const spotlightTitle = spotlightConfig.title || 'Artificial Intelligence & Digital Tools';
  const spotlightSubtitle = spotlightConfig.subtitle || 'Generative models, prompt engineering, and hands-on AI software testing';
  const spotlightSlug = spotlightConfig.category_slug || 'ai-tools';

  // Section 6: How-To & Tech Troubleshooting
  const troubleshootingConfig = homeSections?.troubleshooting || {};
  const isTroubleshootingEnabled = troubleshootingConfig.enabled ?? true;
  const troubleshootingTitle = troubleshootingConfig.title || 'How-To Guides & Tech Troubleshooting';
  const troubleshootingSubtitle = troubleshootingConfig.subtitle || 'Practical, step-by-step diagnostic solutions for everyday devices and software';
  const troubleshootingSlug = troubleshootingConfig.category_slug || 'troubleshooting';

  // Section 7: English Reading Stories
  const readingConfig = homeSections?.reading_stories || {};
  const isReadingEnabled = readingConfig.enabled ?? true;
  const readingTitle = readingConfig.title || 'English Reading Stories & Daily Discovery';
  const readingSubtitle = readingConfig.subtitle || 'Inspiring stories, curated essays, and rich language designed to empower your English learning journey.';
  const readingSlug = readingConfig.category_slug || 'english-reading-stories';

  // Section 8: Publishing Directory
  const directoryConfig = homeSections?.directory || {};
  const isDirectoryEnabled = directoryConfig.enabled ?? true;
  const directoryTitle = directoryConfig.title || 'Explore All Publishing Departments';
  const directorySubtitle = directoryConfig.subtitle || 'Rafvex organizes knowledge across dedicated focus channels. Find exactly what you need with verified depth.';

  // Section 9: Latest Published Stories
  const latestConfig = homeSections?.latest || {};
  const isLatestEnabled = latestConfig.enabled ?? true;
  const latestTitle = latestConfig.title || 'Latest Published Stories';
  const latestSubtitle = latestConfig.subtitle || 'Fresh knowledge, breakdowns, and verified guides released by our editorial desk';

  const displaySpotlightMain = spotlightMain || aiArticles[0] || safeLatest[0];
  const candidateSpotlightSubs = [
    ...(Array.isArray(spotlightSubs) ? spotlightSubs : []),
    ...(aiArticles.length > 1 ? aiArticles.slice(1) : []),
    ...techFallbacks,
    ...safeLatest,
  ];
  const displaySpotlightSubs: any[] = [];
  const seenSpotlightIds = new Set<number>();
  if (displaySpotlightMain?.id) {
    seenSpotlightIds.add(displaySpotlightMain.id);
  }
  for (const art of candidateSpotlightSubs) {
    if (art && art.id && !seenSpotlightIds.has(art.id)) {
      seenSpotlightIds.add(art.id);
      displaySpotlightSubs.push(art);
      if (displaySpotlightSubs.length === 4) break;
    }
  }

  const { props } = usePage<any>();
  const site = props.site || {};
  const siteName = site.name || 'Rafvex';
  const siteTagline = site.tagline || 'Technology, AI, Guides & Knowledge';
  const siteDescription = site.description || 'Explore technology, AI, how-to guides, useful apps and websites, English reading stories, tutorials, and informative articles. Learn something new with Rafvex.';
  const siteLogo = site.logo 
    ? (site.logo.startsWith('http') ? site.logo : `https://rafvex.com${site.logo}`)
    : 'https://rafvex.com/storage/settings/logo/vI8j4DzG40GuTkdVi7IEcmphAAmkBzOm0M0IZBeM.png';

  const megaCategories = props.mega_menu_categories || [];

  // Newsletter state
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      setSubscribed(true);
      setNewsletterEmail('');
    }
  };

  // Department icon mapper
  const getDeptIcon = (slug: string) => {
    switch (slug) {
      case 'ai-tools':
      case 'ai-for-students-work':
        return Sparkles;
      case 'android-iphone':
        return Smartphone;
      case 'windows-mac':
        return Laptop;
      case 'troubleshooting':
        return HelpCircle;
      case 'english-reading-stories':
        return BookOpen;
      case 'basic-online-security':
        return Shield;
      case 'websites-apps':
        return Globe;
      case 'reviews':
        return Headphones;
      default:
        return Layers;
    }
  };

  return (
    <PublicLayout auth={auth}>
      <Head>
        <title>{`${siteName} — ${siteTagline}`}</title>
        <meta name="description" content={siteDescription} />
        <meta property="og:site_name" content={siteName} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={`${siteName} — ${siteTagline}`} />
        <meta property="og:description" content={siteDescription} />
        <meta property="og:image" content={siteLogo} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${siteName} — ${siteTagline}`} />
        <meta name="twitter:description" content={siteDescription} />
        <meta name="twitter:image" content={siteLogo} />
        <link rel="icon" type="image/png" href={siteLogo} />
        <link rel="apple-touch-icon" href={siteLogo} />
        <link rel="image_src" href={siteLogo} />
      </Head>

      <div style={{ maxWidth: 1320, margin: '0 auto', padding: '0 20px 80px' }}>
        
        {/* ── 1. EDITORIAL WELCOME HEADER & POPULAR STREAMS (Above Hero "Like Before") ── */}
        {/* ── 1. MAIN HERO & TOP FEATURED STORIES (Unified Balanced Grid) ── */}
        <section className="pt-6 pb-8 border-b border-slate-200 dark:border-slate-800">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Left Column (8 cols): Welcome Header + Main Lead Story */}
            <div className="lg:col-span-8 flex flex-col justify-between">
              
              {/* Editorial Welcome Header */}
              <div className="mb-4 sm:mb-5">
                <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-2 border border-red-100 dark:border-red-900/50">
                  <Sparkles size={12} />
                  Knowledge, Technology &amp; Digital Discovery
                </div>
                <h1
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                  className="text-xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-[1.2] mb-1.5 sm:mb-2"
                >
                  Rafvex — Learn. Explore. Discover.
                </h1>
                <p className="text-xs sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl line-clamp-3 sm:line-clamp-none">
                  Your place for useful knowledge and digital discovery. Explore technology, AI, how-to guides, useful apps and websites, English reading stories, tutorials, and informative articles — created to help you learn something new every day.
                </p>
              </div>

              {/* Main Lead Story Card */}
              <LeadHeroCard article={leadStory} />

            </div>

            {/* Right Column (4 cols): Top Featured Stories */}
            <div className="lg:col-span-4 flex flex-col">
              
              {/* Header without Editor's Pick */}
              <div className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 pb-2 mb-4 border-b border-slate-200 dark:border-slate-800">
                Top Featured Stories
              </div>

              {/* 2 Top Featured Cards */}
              <div className="flex-1 flex flex-col gap-4">
                {secondaryStories.map((art: any) => (
                  <EditorialCard key={art.id} article={art} />
                ))}
              </div>

            </div>

          </div>
        </section>

        {/* ── 3. CHANNELS / TOPIC QUICK-NAV PILLS ── */}
        <section className="py-4 border-b border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 min-w-max">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mr-2 flex items-center gap-1">
              <Compass size={13} className="text-red-600 dark:text-red-400" /> Channels:
            </span>
            {[
              { name: 'All Stories', href: '/', icon: Flame },
              { name: 'AI Tools', href: '/category/ai-tools', icon: Sparkles },
              { name: 'Phones & Mobile', href: '/category/android-iphone', icon: Smartphone },
              { name: 'Windows & Mac', href: '/category/windows-mac', icon: Laptop },
              { name: 'Troubleshooting', href: '/category/troubleshooting', icon: HelpCircle },
              { name: 'English Stories', href: '/category/english-reading-stories', icon: BookOpen },
              { name: 'Security & Privacy', href: '/category/basic-online-security', icon: Shield },
              { name: 'Hardware & Reviews', href: '/category/reviews', icon: Headphones },
            ].map(pill => {
              const Icon = pill.icon;
              return (
                <Link
                  key={pill.name}
                  href={pill.href}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-red-300 dark:hover:border-red-700 hover:bg-red-50/60 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400 transition-all shadow-2xs"
                >
                  <Icon size={12} className="text-slate-400 dark:text-slate-500" />
                  {pill.name}
                </Link>
              );
            })}
          </div>
        </section>

        {/* ── 4. 🔥 TRENDING ON RAFVEX (Numbered 1-4) ── */}
        {isTrendingEnabled && trendingStories.length > 0 && (
          <section className="py-8 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-xl bg-red-100 dark:bg-red-950/60 flex items-center justify-center text-red-600 dark:text-red-400">
                <Flame size={18} className="fill-red-500 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h2
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                  className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight"
                >
                  {trendingTitle}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">{trendingSubtitle}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {trendingStories.map((art: any, idx: number) => (
                <Link
                  key={art.id}
                  href={`/article/${art.slug}`}
                  className="group relative flex flex-col rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xs hover:shadow-md hover:border-red-200 dark:hover:border-red-800 transition-all duration-200"
                >
                  <span className="absolute top-3 left-3 w-6 h-6 rounded-full bg-slate-900 dark:bg-slate-800 text-white font-extrabold text-[11px] flex items-center justify-center shadow-xs z-10">
                    {idx + 1}
                  </span>
                  <div className="aspect-[16/9] rounded-xl overflow-hidden mb-3 bg-slate-100 dark:bg-slate-800">
                    <ArticleImage src={art.cover_image_url} alt={art.title} />
                  </div>
                  {art.category && (
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-red-600 dark:text-red-400 mb-1">
                      {art.category.name}
                    </span>
                  )}
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-2 leading-snug mb-2">
                    {art.title}
                  </h3>
                  <div className="mt-auto pt-2 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
                    <ReadingTime minutes={art.reading_time} />
                    <ArrowRight size={13} className="text-red-600 dark:text-red-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>

            {/* Google AdSense / Sponsor Banner (Responsive Leaderboard) */}
            <AdBanner slot="1029384756" className="mt-8 mb-2" />
          </section>
        )}

        {/* ── 5. CATEGORY SPOTLIGHT SHOWCASE (1 MAIN + 4 SUB-ARTICLES) ── */}
        {isSpotlightEnabled && displaySpotlightMain && (
          <section className="py-10 border-b border-slate-200 dark:border-slate-800">
            <SectionHeader
              title={spotlightTitle}
              subtitle={spotlightSubtitle}
              href={`/category/${spotlightSlug}`}
            />
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Featured Main Spotlight Story (Left 6 cols) */}
              <div className="lg:col-span-6">
                <Link
                  href={`/article/${displaySpotlightMain.slug}`}
                  className="group flex flex-col rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 hover:border-red-300 dark:hover:border-red-700 hover:shadow-lg transition-all"
                >
                  <div className="aspect-[16/9] rounded-xl overflow-hidden mb-4 bg-slate-100 dark:bg-slate-800">
                    <ArticleImage src={displaySpotlightMain.cover_image_url} alt={displaySpotlightMain.title} />
                  </div>
                  {displaySpotlightMain.category && (
                    <span className="inline-block px-2 py-0.5 rounded bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 text-[10px] font-bold uppercase tracking-wider mb-2 self-start">
                      {displaySpotlightMain.category.name}
                    </span>
                  )}
                  <h3
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                    className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-2 mb-2 leading-snug"
                  >
                    {displaySpotlightMain.title}
                  </h3>
                  {displaySpotlightMain.excerpt && (
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed mb-4">
                      {displaySpotlightMain.excerpt}
                    </p>
                  )}
                  <div className="mt-auto pt-3 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-800">
                    {displaySpotlightMain.published_at && (
                      <span>{format(new Date(displaySpotlightMain.published_at), 'MMM d, yyyy')}</span>
                    )}
                    <ReadingTime minutes={displaySpotlightMain.reading_time} />
                  </div>
                </Link>
              </div>

              {/* Supporting 4 Sub-Articles (Right 6 cols: exactly 4 sub-articles cards) */}
              <div className="lg:col-span-6 flex flex-col gap-3">
                {displaySpotlightSubs.map((art: any) => (
                  <Link
                    key={art.id}
                    href={`/article/${art.slug}`}
                    className="group flex gap-3.5 sm:gap-4 p-3 sm:p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-red-200 dark:hover:border-red-800 hover:shadow-md transition-all duration-200 items-center"
                  >
                    <div className="w-24 h-20 sm:w-28 sm:h-20 aspect-[16/9] rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                      <ArticleImage src={art.cover_image_url} alt={art.title} />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                      <div>
                        {art.category && (
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-red-600 dark:text-red-400 block mb-0.5">
                            {art.category.name}
                          </span>
                        )}
                        <h4
                          style={{ fontFamily: "'Outfit', sans-serif" }}
                          className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-2 leading-snug"
                        >
                          {art.title}
                        </h4>
                      </div>
                      <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 mt-1">
                        {art.published_at && <span>{format(new Date(art.published_at), 'MMM d, yyyy')}</span>}
                        <ReadingTime minutes={art.reading_time} />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── 6. HOW-TO GUIDES & TECH TROUBLESHOOTING (4 Latest Blogs) ── */}
        {isTroubleshootingEnabled && displayTroubleshooting.length > 0 && (
          <section className="py-10 border-b border-slate-200 dark:border-slate-800">
            <SectionHeader
              title={troubleshootingTitle}
              subtitle={troubleshootingSubtitle}
              href={`/category/${troubleshootingSlug}`}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {displayTroubleshooting.map((art: any) => (
                <EditorialCard key={art.id} article={art} />
              ))}
            </div>
          </section>
        )}

        {/* ── 7. ENGLISH READING STORIES & KNOWLEDGE HUB (4 Latest Blogs) ── */}
        {isReadingEnabled && displayStories.length > 0 && (
          <section className="py-10 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-red-50/50 via-white to-amber-50/30 dark:from-slate-900/90 dark:via-slate-900/50 dark:to-slate-900/90 border border-red-100/80 dark:border-slate-800 p-6 sm:p-8 rounded-3xl mb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider mb-1">
                  <BookOpen size={14} />
                  Language, Literature &amp; Life
                </div>
                <h2
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                  className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight"
                >
                  {readingTitle}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  {readingSubtitle}
                </p>
              </div>
              <Link
                href={`/category/${readingSlug}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors shrink-0 shadow-xs"
              >
                Explore All Stories <ArrowRight size={13} />
              </Link>
            </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayStories.map((art: any) => (
              <Link
                key={art.id}
                href={`/article/${art.slug}`}
                className="group p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-red-300 dark:hover:border-red-700 hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-[16/9] rounded-xl overflow-hidden mb-3 bg-slate-100 dark:bg-slate-800">
                    <ArticleImage src={art.cover_image_url} alt={art.title} />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-red-600 dark:text-red-400 block mb-2">
                    Reading Story
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-2 leading-snug mb-2">
                    {art.title}
                  </h3>
                  {art.excerpt && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">
                      {art.excerpt}
                    </p>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <ReadingTime minutes={art.reading_time} />
                  <span className="font-semibold text-red-600 dark:text-red-400 group-hover:underline">Read Now →</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
        )}

        {/* ── 8. 🏛️ EXPLORE ALL PUBLISHING DEPARTMENTS (Comprehensive Taxonomy Hub) ── */}
        {isDirectoryEnabled && (
          <section className="py-10 border-b border-slate-200 dark:border-slate-800">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">
                <Layers size={13} />
                Publishing Directory
              </div>
              <h2
                style={{ fontFamily: "'Outfit', sans-serif" }}
                className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight"
              >
                {directoryTitle}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                {directorySubtitle}
              </p>
            </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {(megaCategories.length > 0 ? megaCategories : safeTopCategories).slice(0, 8).map((cat: any) => {
              const Icon = getDeptIcon(cat.slug);
              return (
                <div
                  key={cat.id}
                  className="group flex flex-col p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-red-300 dark:hover:border-red-700 hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-colors">
                      <Icon size={20} />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-bold">
                      {cat.total_articles ?? cat.articles_count ?? 0} Stories
                    </span>
                  </div>
                  <h3
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                    className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors mb-1.5"
                  >
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4 flex-1">
                    {cat.description || `Comprehensive guides, analysis, and step-by-step articles in ${cat.name}.`}
                  </p>

                  {/* Subcategories preview */}
                  {cat.subcategories && cat.subcategories.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {cat.subcategories.slice(0, 3).map((sub: any) => (
                        <Link
                          key={sub.id}
                          href={`/category/${sub.slug}`}
                          className="px-2 py-0.5 rounded bg-slate-50 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/60 hover:text-red-600 dark:hover:text-red-400 text-[10px] font-medium text-slate-600 dark:text-slate-300 transition-colors"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}

                  <Link
                    href={`/category/${cat.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 group-hover:translate-x-0.5 transition-all mt-auto pt-2 border-t border-slate-100 dark:border-slate-800"
                  >
                    Browse Department <ArrowRight size={12} />
                  </Link>
                </div>
              );
            })}
          </div>
        </section>
        )}

        {/* ── 9. LATEST CHRONOLOGICAL STORIES WITH EDITORIAL SIDEBAR ── */}
        <section className="py-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Left: Latest Articles Stream (8 cols) */}
            {isLatestEnabled && (
              <div className="lg:col-span-8">
                <SectionHeader
                  title={latestTitle}
                  subtitle={latestSubtitle}
                  href="/sitemap"
                />

                <div className="space-y-6">
                  {safeLatest.slice(0, 10).map((art: any) => (
                    <Link
                      key={art.id}
                      href={`/article/${art.slug}`}
                      className="group flex flex-col sm:flex-row gap-5 pb-6 border-b border-slate-100 dark:border-slate-800 last:border-b-0 hover:bg-slate-50/50 dark:hover:bg-slate-900/60 p-2 rounded-xl transition-all"
                    >
                      <div className="w-full sm:w-48 h-40 sm:h-32 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                        <ArticleImage src={art.cover_image_url} alt={art.title} />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          {art.category && (
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-red-600 dark:text-red-400 mb-1 block">
                              {art.category.name}
                            </span>
                          )}
                          <h3
                            style={{ fontFamily: "'Outfit', sans-serif" }}
                            className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-2 leading-snug mb-2"
                          >
                            {art.title}
                          </h3>
                          {art.excerpt && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-3">
                              {art.excerpt}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
                          {art.published_at && (
                            <span>{format(new Date(art.published_at), 'MMM d, yyyy')}</span>
                          )}
                          <ReadingTime minutes={art.reading_time} />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Right: Editorial Sidebar (4 cols) */}
            <aside className="lg:col-span-4 space-y-6">
              
              {/* Newsletter / Knowledge Digest Subscribe Card */}
              <div className="p-6 rounded-2xl border border-red-200/80 dark:border-slate-800 bg-gradient-to-br from-red-50/60 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-[#0f172a] text-slate-900 dark:text-slate-100 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center mb-3 shadow-xs">
                  <Send size={18} />
                </div>
                <h3
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                  className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1.5"
                >
                  Rafvex Knowledge Digest
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                  Join our weekly reading list. Receive distilled guides on AI developments, operating system tweaks, and inspirational stories.
                </p>

                {subscribed ? (
                  <div className="p-3 rounded-xl bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 size={16} /> Thank you for subscribing!
                  </div>
                ) : (
                  <form onSubmit={handleSubscribe} className="space-y-2">
                    <input
                      type="email"
                      required
                      placeholder="Enter your email"
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-hidden bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    />
                    <button
                      type="submit"
                      className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors shadow-xs"
                    >
                      Subscribe Free
                    </button>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block text-center mt-1">Zero spam. Unsubscribe anytime.</span>
                  </form>
                )}
              </div>

              {/* Department Directory List */}
              <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <h3
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                  className="text-base font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center justify-between"
                >
                  <span>Quick Departments</span>
                  <Link href="/sitemap" className="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline">
                    View All
                  </Link>
                </h3>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {safeTopCategories.slice(0, 7).map((cat: any) => (
                    <Link
                      key={cat.id}
                      href={`/category/${cat.slug}`}
                      className="py-2.5 flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 transition-colors group"
                    >
                      <span>{cat.name}</span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-red-50 dark:group-hover:bg-red-950/60 group-hover:text-red-600 dark:group-hover:text-red-400 text-slate-500 dark:text-slate-400 text-[10px] font-bold">
                        {cat.articles_count || 0}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Editorial Standard Card */}
              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
                  Editorial Standards
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                  Every guide published on Rafvex is written, fact-checked, and independently tested to provide actionable, reliable tech wisdom.
                </p>
                <Link
                  href="/about"
                  className="text-xs font-bold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 inline-flex items-center gap-1"
                >
                  About Our Editorial Desk <ArrowRight size={12} />
                </Link>
              </div>

              {/* ── Home Ads / Sponsor Showcase (Below Editorial Standards) ── */}
              <HomeAdsSidebarWidget ads={homeAds} />
            </aside>
          </div>
        </section>

      </div>
    </PublicLayout>
  );
}
