import React from 'react';
import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { Scale } from 'lucide-react';

export default function Terms({ auth }: any) {
  return (
    <PublicLayout auth={auth}>
      <Head>
        <title>Terms of Service — Rafvex</title>
        <meta name="description" content="Terms of Service for Rafvex — a technology, AI, and guides blog. Read the rules and policies that govern your use of our website." />
      </Head>

      <div style={{ maxWidth: 780, margin: '0 auto', padding: '56px 24px 100px' }}>

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            <li><Link href="/" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">Home</Link></li>
            <li>/</li>
            <li className="text-slate-900 dark:text-slate-100 font-semibold">Terms of Service</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-10 pb-8 border-b border-slate-200 dark:border-slate-800">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs font-bold uppercase tracking-wider mb-5 border border-red-100 dark:border-red-900/40">
            <Scale size={12} />
            Legal
          </div>
          <h1 style={{ fontFamily: "'Outfit', sans-serif" }} className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight mb-3">
            Terms of Service
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Effective: September 5, 2026 &nbsp;·&nbsp; Last updated: September 5, 2026
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8 text-slate-700 dark:text-slate-300 text-[15px] leading-[1.75]">

          <section>
            <p>
              Welcome to Rafvex. These Terms of Service ("Terms") govern your access to and use of our website, including all articles, guides, tutorials, and other content we publish. Please read them carefully. By visiting or using Rafvex, you agree to these Terms. If you do not agree, please do not use our website.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">1. About Rafvex</h2>
            <p>
              Rafvex is an independent technology and lifestyle content website. We publish articles, how-to guides, app and software reviews, AI insights, device tips, and educational reading stories to help people make better use of technology in their daily lives. Our content is intended for informational and educational purposes only.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">2. Acceptance of Terms</h2>
            <p>
              By accessing any page on Rafvex, you confirm that you are at least 13 years old and that you agree to be bound by these Terms and our{' '}
              <Link href="/privacy-policy" className="text-red-600 dark:text-red-400 hover:underline font-medium">Privacy Policy</Link>.
              These Terms apply to all visitors, readers, and anyone who interacts with our website, including the comment section and contact form.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">3. Content &amp; Intellectual Property</h2>
            <p className="mb-3">
              All content published on Rafvex — including articles, guides, images, graphics, logos, and website design — is owned by Rafvex and protected by copyright law. You may not copy, reproduce, redistribute, or republish our content without our written permission.
            </p>
            <p className="mb-3">
              <strong>What you can do:</strong> You are welcome to read, reference, and share links to our articles for personal, non-commercial use. Brief quotations with clear attribution to Rafvex are acceptable.
            </p>
            <p>
              <strong>What you cannot do:</strong> You may not reproduce full articles or large portions of our content on other websites, publications, or platforms. You may not use our content to train artificial intelligence (AI) or machine learning models without our explicit written consent. You may not remove or alter any copyright notices or author credits.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">4. Informational Purpose — No Warranty on Guides</h2>
            <p>
              Our articles, tutorials, and guides are written to help and inform readers, but they are provided for general informational purposes only. Technology changes frequently, and while we do our best to keep content accurate and up to date, we cannot guarantee that every guide or recommendation will apply to your specific device, software version, or situation.
            </p>
            <p className="mt-2">
              Any technical steps, commands, or modifications you apply to your devices based on our content are done entirely at your own risk. Rafvex is not responsible for any damage, data loss, or unintended outcomes resulting from following our guides.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">5. Comments &amp; User Submissions</h2>
            <p className="mb-3">
              Readers may leave comments on articles to share thoughts, ask questions, or provide feedback. When posting a comment, you agree that:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm text-slate-600 dark:text-slate-400">
              <li>Your comment is your own and does not infringe the rights of any third party.</li>
              <li>Your comment does not contain spam, hate speech, threats, or illegal content.</li>
              <li>Your comment does not contain promotional links, affiliate links, or advertising.</li>
              <li>You grant Rafvex the right to display, moderate, edit, or remove your comment at any time without notice.</li>
            </ul>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
              We reserve the right to remove any comment we determine to be harmful, inappropriate, or in violation of these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">6. Contact Form</h2>
            <p>
              Our contact form is intended for genuine inquiries, feedback, article suggestions, or collaboration requests. Using it for spam, solicitation, or sending harmful content is strictly prohibited and may result in your IP address being blocked.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">7. Acceptable Use</h2>
            <p className="mb-2">When using Rafvex, you agree not to:</p>
            <ul className="list-disc pl-5 space-y-1 text-sm text-slate-600 dark:text-slate-400">
              <li>Attempt to gain unauthorized access to any part of our website or backend systems.</li>
              <li>Use automated bots, scrapers, or crawlers to bulk download or copy our content.</li>
              <li>Interfere with or disrupt the performance or availability of our website.</li>
              <li>Submit false, misleading, or harmful information through any form on our website.</li>
              <li>Impersonate any person, organization, or Rafvex editorial team member.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">8. External Links &amp; Third-Party Content</h2>
            <p>
              Our articles frequently link to external websites, apps, tools, or resources for further reading and reference. These links are provided for your convenience. Rafvex does not control third-party websites and is not responsible for their content, availability, or privacy practices. Visiting third-party links is at your own discretion.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">9. Disclaimer of Warranties</h2>
            <p>
              Rafvex is provided on an "as is" and "as available" basis. We make no warranties — express or implied — regarding the accuracy, completeness, reliability, or availability of our website or content. We do not guarantee that the website will be error-free or uninterrupted at all times.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">10. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by applicable law, Rafvex and its team shall not be liable for any direct, indirect, incidental, or consequential damages arising from your use of, or inability to use, our website or content. This includes but is not limited to data loss, device damage, or loss of productivity resulting from applying information found on our website.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">11. Advertising &amp; Third-Party Partners (Google AdSense)</h2>
            <p>
              To maintain Rafvex as a free informational publication, we display digital advertisements served by third-party advertising networks, primarily <strong>Google AdSense</strong>. Third-party ad vendors, including Google, use cookies and similar identifiers to deliver personalized or non-personalized advertisements based on user visits to Rafvex and other sites across the internet.
            </p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              For complete details regarding how advertising data and cookies are processed and how you can manage your advertising preferences, please review our{' '}
              <Link href="/privacy-policy" className="text-red-600 dark:text-red-400 hover:underline font-medium">Privacy Policy</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">12. Push Notifications</h2>
            <p>
              We offer optional web push notifications to keep you updated with new articles and guides. You can opt in or out at any time through your browser settings. Push notifications are sent via Pusher Beams and use only an anonymous device token — no personal information is required to subscribe.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">13. Changes to These Terms</h2>
            <p>
              We may update these Terms from time to time to reflect changes to our website, legal requirements, or our practices. Updates will be reflected by the "Last updated" date at the top of this page. Continued use of Rafvex after changes are posted means you accept the updated Terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">14. Governing Law</h2>
            <p>
              These Terms shall be governed by and interpreted in accordance with applicable laws. Any disputes relating to these Terms should first be submitted to us informally via our Contact page before any formal proceedings are initiated.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">15. Contact Us</h2>
            <p>
              If you have any questions about these Terms of Service, please reach us through our{' '}
              <Link href="/contact" className="text-red-600 dark:text-red-400 hover:underline font-medium">Contact page</Link>.
            </p>
          </section>

        </div>

        {/* Footer note */}
        <div className="mt-12 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-wrap gap-4 text-xs text-slate-400 dark:text-slate-500">
          <span>© 2026 Rafvex. All rights reserved.</span>
          <span>·</span>
          <Link href="/privacy-policy" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">Privacy Policy</Link>
        </div>

      </div>
    </PublicLayout>
  );
}
