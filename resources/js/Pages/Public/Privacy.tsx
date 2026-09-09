import React from 'react';
import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { Shield, Cookie, ExternalLink, Lock, CheckCircle2 } from 'lucide-react';

export default function Privacy({ auth }: any) {
  return (
    <PublicLayout auth={auth}>
      <Head>
        <title>Privacy Policy &amp; Cookie Disclosure — Rafvex</title>
        <meta name="description" content="Learn how Rafvex collects, uses, and protects your information, including our Google AdSense and third-party advertising disclosures." />
      </Head>

      <div style={{ maxWidth: 840, margin: '0 auto', padding: '56px 24px 100px' }}>

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            <li><Link href="/" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">Home</Link></li>
            <li>/</li>
            <li className="text-slate-900 dark:text-slate-100 font-semibold">Privacy Policy</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-10 pb-8 border-b border-slate-200 dark:border-slate-800">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs font-bold uppercase tracking-wider mb-5 border border-red-100 dark:border-red-900/40">
            <Shield size={12} />
            Privacy &amp; Data Transparency
          </div>
          <h1 style={{ fontFamily: "'Outfit', sans-serif" }} className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight mb-3">
            Privacy Policy &amp; Cookie Disclosure
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Effective Date: September 5, 2026 &nbsp;·&nbsp; Last Updated: September 7, 2026
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8 text-slate-700 dark:text-slate-300 text-[15px] leading-[1.75]">

          <section>
            <p>
              At <strong>Rafvex</strong> (accessible from <a href="https://rafvex.com" className="text-red-600 dark:text-red-400 hover:underline">https://rafvex.com</a>), one of our main priorities is the privacy of our visitors. This Privacy Policy document outlines the types of information that is collected and recorded by Rafvex, how we use it, and how third-party services—including <strong>Google AdSense</strong>—operate on our website.
            </p>
            <p className="mt-3">
              If you have additional questions or require more information about our Privacy Policy, please feel free to reach us via our <Link href="/contact" className="text-red-600 dark:text-red-400 hover:underline font-medium">Contact Page</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
              <span className="text-red-600 dark:text-red-400 font-black">1.</span> Information We Collect
            </h2>
            <p className="mb-3">We collect minimal information necessary to deliver quality editorial articles and reliable site features:</p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <li>
                <strong className="text-slate-800 dark:text-slate-100">User Inquiries &amp; Contact:</strong> When you submit a message through our Contact page, we collect your name, email address, and message contents to correspond with you.
              </li>
              <li>
                <strong className="text-slate-800 dark:text-slate-100">Community Discussion &amp; Comments:</strong> When participating in article discussions, we record your name, email address, and comment text.
              </li>
              <li>
                <strong className="text-slate-800 dark:text-slate-100">Registered Customer Accounts:</strong> If you register or authenticate via Google OAuth, we receive your name, email address, and profile picture to maintain your account profile, reading history, and saved favorites.
              </li>
              <li>
                <strong className="text-slate-800 dark:text-slate-100">Server Log Files:</strong> Rafvex follows standard web hosting procedures using log files. These logs record visitors when they visit websites (including internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and number of clicks). These are not linked to personally identifiable information and are used solely for analyzing trends, administering the site, and defending against malicious cyberattacks.
              </li>
            </ul>
          </section>

          {/* CRITICAL GOOGLE ADSENSE SECTION */}
          <section className="p-6 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <span className="text-red-600 dark:text-red-400 font-black">2.</span> Google AdSense &amp; Advertising Cookies
            </h2>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
              Google is one of the third-party vendors on our site. Google uses cookies, known as <strong>DoubleClick cookies</strong> and advertising identifiers, to serve advertisements to our website visitors based upon their visit to <strong className="text-slate-900 dark:text-white">rafvex.com</strong> and other websites across the internet.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-slate-700 dark:text-slate-300 mb-4">
              <li>
                Third-party vendors, including Google, use cookies to serve ads based on a user's prior visits to your website or other websites.
              </li>
              <li>
                Google's use of advertising cookies enables it and its partners to serve ads to our users based on their visit to our sites and/or other sites on the Internet.
              </li>
              <li>
                Users may opt out of personalized advertising by visiting <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className="text-red-600 dark:text-red-400 font-semibold hover:underline inline-flex items-center gap-1">Google Ads Settings <ExternalLink size={12} /></a>.
              </li>
              <li>
                Alternatively, you can opt out of a third-party vendor's use of cookies for personalized advertising by visiting <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" className="text-red-600 dark:text-red-400 font-semibold hover:underline inline-flex items-center gap-1">www.aboutads.info <ExternalLink size={12} /></a> or the <a href="https://www.youronlinechoices.com/" target="_blank" rel="noopener noreferrer" className="text-red-600 dark:text-red-400 font-semibold hover:underline inline-flex items-center gap-1">European Interactive Digital Advertising Alliance <ExternalLink size={12} /></a>.
              </li>
            </ul>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Rafvex has no access to or control over these cookies that are used by third-party advertisers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
              <span className="text-red-600 dark:text-red-400 font-black">3.</span> Cookies and Web Beacons
            </h2>
            <p className="mb-3">
              Like any other website, Rafvex uses 'cookies'. These cookies are used to store information including visitors' preferences, such as your theme choice (light or dark mode), session authentication tokens, and the pages on the website that the visitor accessed or visited.
            </p>
            <p className="mb-3">
              You can choose to disable cookies through your individual browser options. Detailed information about cookie management with specific web browsers can be found at the browsers' respective websites:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm text-slate-600 dark:text-slate-300">
              <li><strong>Google Chrome:</strong> Settings &gt; Privacy and Security &gt; Cookies and other site data</li>
              <li><strong>Mozilla Firefox:</strong> Options &gt; Privacy &amp; Security &gt; Cookies and Site Data</li>
              <li><strong>Apple Safari:</strong> Preferences &gt; Privacy &gt; Manage Website Data</li>
              <li><strong>Microsoft Edge:</strong> Settings &gt; Cookies and site permissions</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
              <span className="text-red-600 dark:text-red-400 font-black">4.</span> CCPA Privacy Rights (Do Not Sell My Personal Information)
            </h2>
            <p className="mb-3">Under the California Consumer Privacy Act (CCPA), California consumers have the right to:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-sm text-slate-600 dark:text-slate-300">
              <li>Request that a business disclose the categories and specific pieces of personal data that a business has collected about consumers.</li>
              <li>Request that a business delete any personal data about the consumer that a business has collected.</li>
              <li>Request that a business that sells or shares a consumer's personal data, not sell or share the consumer's personal data. <em>(Rafvex does not sell personal information to third parties).</em></li>
            </ul>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
              If you make a request, we have one month to respond to you. If you would like to exercise any of these rights, please contact us.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
              <span className="text-red-600 dark:text-red-400 font-black">5.</span> GDPR Data Protection Rights
            </h2>
            <p className="mb-3">We would like to make sure you are fully aware of all of your data protection rights. Every user is entitled to the following:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-sm text-slate-600 dark:text-slate-300">
              <li><strong>The right to access:</strong> You have the right to request copies of your personal data.</li>
              <li><strong>The right to rectification:</strong> You have the right to request that we correct any information you believe is inaccurate or incomplete.</li>
              <li><strong>The right to erasure:</strong> You have the right to request that we erase your personal data, under certain conditions.</li>
              <li><strong>The right to restrict processing:</strong> You have the right to request that we restrict the processing of your personal data.</li>
              <li><strong>The right to data portability:</strong> You have the right to request that we transfer the data that we have collected to another organization, or directly to you.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
              <span className="text-red-600 dark:text-red-400 font-black">6.</span> Children's Information
            </h2>
            <p>
              Another part of our priority is adding protection for children while using the internet. We encourage parents and guardians to observe, participate in, and/or monitor and guide their online activity.
            </p>
            <p className="mt-2">
              Rafvex does not knowingly collect any Personal Identifiable Information from children under the age of 13. If you think that your child provided this kind of information on our website, we strongly encourage you to contact us immediately and we will do our best efforts to promptly remove such information from our records.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
              <span className="text-red-600 dark:text-red-400 font-black">7.</span> Consent
            </h2>
            <p>
              By using our website, you hereby consent to our Privacy Policy and agree to its terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
              <span className="text-red-600 dark:text-red-400 font-black">8.</span> Contact Us
            </h2>
            <p>
              If you have any questions, feedback, or requests regarding this Privacy Policy, please reach out via our{' '}
              <Link href="/contact" className="text-red-600 dark:text-red-400 hover:underline font-bold">Contact Page</Link>.
            </p>
          </section>

        </div>

        {/* Footer note */}
        <div className="mt-12 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-wrap gap-4 text-xs text-slate-400 dark:text-slate-500">
          <span>© 2026 Rafvex. All rights reserved.</span>
          <span>·</span>
          <Link href="/terms-of-service" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">Terms of Service</Link>
          <span>·</span>
          <Link href="/about" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">About Us</Link>
          <span>·</span>
          <Link href="/contact" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">Contact</Link>
        </div>

      </div>
    </PublicLayout>
  );
}
