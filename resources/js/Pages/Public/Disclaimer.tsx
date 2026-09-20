import React from 'react';
import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { AlertCircle, ShieldAlert, CheckCircle2, ExternalLink, HelpCircle, FileText } from 'lucide-react';

export default function Disclaimer({ auth }: any) {
  return (
    <PublicLayout auth={auth}>
      <Head>
        <title>Editorial &amp; Technical Disclaimer — Rafvex</title>
        <meta
          name="description"
          content="Read the official editorial, technical tutorial, and advertising disclaimer for Rafvex. Understand our guidelines on how-to guides, third-party software, and Google AdSense."
        />
        <meta property="og:title" content="Editorial &amp; Technical Disclaimer — Rafvex" />
        <meta
          property="og:description"
          content="Official guidelines on how-to guides, software commands, third-party software, and advertising on Rafvex."
        />
        <link rel="canonical" href="https://rafvex.com/disclaimer" />
      </Head>

      <div style={{ maxWidth: 840, margin: '0 auto', padding: '56px 24px 100px' }}>
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            <li>
              <Link href="/" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">
                Home
              </Link>
            </li>
            <li>/</li>
            <li className="text-slate-900 dark:text-slate-100 font-semibold">Disclaimer</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-10 pb-8 border-b border-slate-200 dark:border-slate-800">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs font-bold uppercase tracking-wider mb-5 border border-red-100 dark:border-red-900/40">
            <AlertCircle size={12} />
            Editorial Transparency &amp; Notice
          </div>
          <h1
            style={{ fontFamily: "'Outfit', sans-serif" }}
            className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight mb-3"
          >
            Editorial &amp; Technical Disclaimer
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Effective Date: September 2026 &nbsp;·&nbsp; Last Reviewed: September 18, 2026
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8 text-slate-700 dark:text-slate-300 text-[15px] leading-[1.75]">
          <section>
            <p>
              Welcome to <strong>Rafvex</strong> (accessible via <a href="https://rafvex.com" className="text-red-600 dark:text-red-400 hover:underline font-medium">https://rafvex.com</a>). The information provided on this website is published in good faith and solely for general educational, informative, and research purposes.
            </p>
            <p className="mt-3">
              By accessing and using Rafvex, you acknowledge and agree to the terms, limitations, and guidelines outlined in this Disclaimer. If you have any inquiries regarding this document, please reach out via our{' '}
              <Link href="/contact" className="text-red-600 dark:text-red-400 hover:underline font-medium">
                Contact Page
              </Link>.
            </p>
          </section>

          {/* Section 1: Technical Guides & Code */}
          <section className="p-6 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
              <span className="text-red-600 dark:text-red-400 font-black">1.</span> Technical Guides, Commands &amp; Software Tweaks
            </h2>
            <p className="mb-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Rafvex regularly publishes technical tutorials, diagnostic troubleshooting steps, operating system optimization guides (for Windows, macOS, Android, and iOS), terminal commands, and configuration scripts. While every tutorial is tested and reviewed prior to publication, computer environments and operating systems differ significantly across hardware configurations and software updates.
            </p>
            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300 pl-2 border-l-2 border-red-500/50">
              <p>
                <strong>Personal Discretion:</strong> Any technical action, registry modification, terminal execution, or hardware adjustments you make based upon information found on Rafvex are taken strictly at your own discretion and risk.
              </p>
              <p>
                <strong>Backup Recommendation:</strong> We strongly advise all readers to create complete data backups and system restore points before executing command-line utilities or altering system configurations.
              </p>
              <p>
                <strong>No Liability for Hardware or Data Losses:</strong> Rafvex, its writers, and its editors shall not be liable for any direct, indirect, incidental, or consequential losses, data corruption, warranty voidance, or device downtime resulting from following our guides.
              </p>
            </div>
          </section>

          {/* Section 2: Advertising & Google AdSense */}
          <section className="p-6 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/40">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
              <span className="text-red-600 dark:text-red-400 font-black">2.</span> Advertising &amp; Google AdSense Disclosure
            </h2>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
              Rafvex is committed to total transparency regarding the commercial mechanisms that support our independent editorial research and hosting infrastructure:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-slate-600 dark:text-slate-300 mb-3">
              <li>
                <strong>Third-Party Display Advertising:</strong> We may display advertisements provided by Google AdSense or certified advertising networks. These advertisements are clearly demarcated with "ADVERTISEMENT" labels or standard ad unit containers.
              </li>
              <li>
                <strong>Automated Ad Delivery:</strong> Third-party ad vendors, including Google, use cookies to deliver advertisements based on a user's prior browsing history. Rafvex does not personally select or endorse individual commercial products presented within programmatic ad slots.
              </li>
              <li>
                <strong>Editorial Independence:</strong> Advertisements, sponsorships, or commercial relationships never dictate our technical conclusions, benchmarking outcomes, or editorial reviews. Our recommendations are strictly based on merit, practical testing, and empirical utility.
              </li>
            </ul>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              For complete details on advertising cookies and how to opt out of personalized ad targeting, please review our{' '}
              <Link href="/privacy-policy" className="text-red-600 dark:text-red-400 underline font-medium">
                Privacy Policy &amp; Cookie Disclosure
              </Link>.
            </p>
          </section>

          {/* Section 3: Third-Party Links & Software */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
              <span className="text-red-600 dark:text-red-400 font-black">3.</span> External Hyperlinks &amp; Third-Party Applications
            </h2>
            <p className="mb-3">
              Our articles frequently cite external research papers, open-source GitHub repositories, software developer websites, and diagnostic utilities to provide additional context and convenience for readers.
            </p>
            <p>
              While we strive to provide links only to reputable, ethical, and secure web destinations, Rafvex has no control over the content, privacy practices, terms, or availability of external third-party sites. The inclusion of an outbound hyperlink does not imply an endorsement of all content found on that external domain. External site operators may modify their services or software packages at any time without our knowledge.
            </p>
          </section>

          {/* Section 4: Non-Affiliation & Trademarks */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
              <span className="text-red-600 dark:text-red-400 font-black">4.</span> Trademark &amp; Non-Affiliation Notice
            </h2>
            <p className="mb-3">
              All company names, brand names, product titles, and trademarks referenced on Rafvex (including, but not limited to, <em>Apple, macOS, iOS, iPhone, Microsoft, Windows, Google, Android, Gemini, OpenAI, ChatGPT, Anthropic, Claude</em>) are the property of their respective trademark holders.
            </p>
            <p>
              Reference to any specific commercial product, process, software, or trademark does not constitute or imply endorsement, sponsorship, or recommendation by Rafvex, nor does it imply an official affiliation between Rafvex and the respective intellectual property owners unless explicitly stated.
            </p>
          </section>

          {/* Section 5: Professional Advice Limitation */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
              <span className="text-red-600 dark:text-red-400 font-black">5.</span> No Professional Legal, Financial or Enterprise Consulting
            </h2>
            <p>
              Content regarding online security, privacy laws (e.g., GDPR, CCPA), cybersecurity precautions, or software licensing is published solely for educational awareness. It does not constitute formal legal, cybersecurity compliance, or enterprise financial counsel. For mission-critical legal or enterprise compliance decisions, readers should consult certified legal and cybersecurity professionals.
            </p>
          </section>

          {/* Section 6: Editorial Corrections */}
          <section className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
              <span className="text-red-600 dark:text-red-400 font-black">6.</span> Content Updates &amp; Corrections Policy
            </h2>
            <p className="mb-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Technology evolves rapidly. Software releases frequently deprecate features, alter user interfaces, or change command syntaxes. While our editorial team regularly audits older publications, we do not warrant that all historical guides remain current at every moment in time.
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              If you discover an error, outdated step, or broken reference in any of our articles, we encourage you to inform us via our{' '}
              <Link href="/contact" className="text-red-600 dark:text-red-400 font-semibold hover:underline">
                Contact Page
              </Link>{' '}
              or directly at{' '}
              <a href="mailto:rafvexofficial@gmail.com" className="text-red-600 dark:text-red-400 font-semibold hover:underline">
                rafvexofficial@gmail.com
              </a>. Our editorial desk promptly investigates and updates verified inaccuracies.
            </p>
          </section>
        </div>
      </div>
    </PublicLayout>
  );
}
