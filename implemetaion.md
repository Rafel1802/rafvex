You are a senior full-stack software architect, Laravel engineer,
React engineer, UI/UX designer, database architect, SEO engineer,
DevSecOps engineer, and professional CMS developer.

I want you to BUILD the complete production-ready system described
below. Do not merely give me an explanation or a tutorial.

PROJECT:
A professional technology/how-to publishing website with a public
blog frontend and a secure professional CMS/admin dashboard.

PRIMARY GOAL:
Build a scalable publishing platform that can eventually contain
thousands of articles and multiple authors.

TECH STACK:
- Laravel backend
- React frontend
- Inertia.js where appropriate so public pages are server-rendered/
  crawlable while still using React
- MySQL database
- Vite
- Tailwind CSS
- TypeScript where practical
- Redis for caching/queues/rate limiting if available
- Laravel queues for background jobs
- Object/file storage abstraction for media
- REST/API endpoints where appropriate
- Clean service/repository/action architecture where it improves
  maintainability

IMPORTANT:
Before implementation, inspect the current stable versions of the
chosen technologies and use APIs/packages compatible with those
versions. Do not blindly use outdated Laravel/React syntax.

============================================================
1. BRAND / VISUAL DESIGN
============================================================

Create a professional technology publication.

Visual direction:
- Modern
- Premium
- Clean
- Fast
- Responsive
- Professional
- Editorial
- Easy to read
- Strong typography
- Excellent whitespace
- Subtle cards and borders
- Red/orange as the primary accent
- Do not make the entire website aggressively red
- Use neutral backgrounds with red/orange accents
- Light mode should be the default
- Optional dark mode
- Excellent mobile experience

Use the uploaded article-editor screenshot as visual inspiration
for the CMS article creation page.

Do NOT copy branding or proprietary UI exactly.
Use the screenshot only as design inspiration.

Create a reusable design system:
- Buttons
- Inputs
- Selects
- Dropdowns
- Modals
- Tables
- Badges
- Alerts
- Toasts
- Cards
- Tabs
- Breadcrumbs
- Pagination
- Empty states
- Loading states
- Error states
- Skeleton states
- Confirmation dialogs

Accessibility:
- Keyboard navigation
- Proper labels
- Focus states
- ARIA where appropriate
- Good contrast
- Semantic HTML

============================================================
2. PUBLIC WEBSITE
============================================================

Build:

/
 /category/{category}
 /category/{category}/{subcategory}
 /article/{slug}
 /author/{slug}
 /tag/{slug}
 /search
 /about
 /contact
 /privacy-policy
 /terms
 /cookie-policy
 /sitemap.xml
 /robots.txt

The public website must be SEO-friendly and crawlable.

Avoid a purely client-side rendered blog.

Use server-rendered/crawlable HTML through Laravel + Inertia/React
or another architecture that preserves React while ensuring search
engines can access article content without depending entirely on
client-side JavaScript.

============================================================
3. MAIN CONTENT CATEGORIES
============================================================

Create these seven primary categories:

1. Android & iPhone

Subcategories:
- Android Tips
- iPhone Tips
- Android Apps
- iPhone Apps
- Battery & Charging
- Storage & Performance
- Camera & Photos
- Privacy & Security
- Settings & Customization
- Buying Guides
- Troubleshooting
- Hidden Features
- Accessories

2. Windows & Mac

Subcategories:
- Windows Tips
- Windows 11
- macOS Tips
- MacBook Guides
- Software
- Drivers
- Performance
- File Management
- Networking
- Troubleshooting
- Security
- Keyboard Shortcuts
- Productivity

3. AI Tools

Subcategories:
- ChatGPT
- Google AI
- AI Image Tools
- AI Video Tools
- AI Writing Tools
- AI Coding Tools
- AI Productivity
- AI Search
- AI Automation
- AI Tool Reviews
- AI Comparisons
- AI Tutorials
- Free AI Tools

4. Websites & Apps

Subcategories:
- Google
- Microsoft
- Social Media
- Messaging Apps
- Productivity Apps
- Cloud Storage
- Browsers
- Email
- Online Tools
- Website Guides
- App Reviews
- App Comparisons
- Free Online Tools

5. Troubleshooting

Subcategories:
- Android Problems
- iPhone Problems
- Windows Problems
- Mac Problems
- Wi-Fi & Internet
- Bluetooth
- Printers
- Audio
- Video
- Software Errors
- App Errors
- Login Problems
- Performance Problems

6. Basic Online Security

Subcategories:
- Account Security
- Passwords
- Two-Factor Authentication
- Phishing Awareness
- Scam Awareness
- Privacy
- Browser Security
- Phone Security
- Computer Security
- Social Media Security
- Safe Downloads
- Data Protection

7. AI for Students & Work

Subcategories:
- AI for Students
- AI for Teachers
- AI for Developers
- AI for Writers
- AI for Designers
- AI for Business
- AI for Productivity
- AI for Research
- AI Study Tools
- AI Presentation Tools
- AI Resume/CV Tools
- AI Office Tools
- AI Workflows

Design the database so additional categories and nested categories
can be added later without code changes.

Use:
- categories
- parent_id
- slug
- name
- description
- SEO fields
- status
- sort order

============================================================
4. ARTICLE SYSTEM
============================================================

Create a professional article management system.

Article fields:

- id
- title
- slug
- excerpt
- content
- status
- author_id
- category_id
- published_at
- scheduled_at
- created_at
- updated_at
- cover_image
- cover_image_alt
- meta_title
- meta_description
- canonical_url
- reading_time
- views_count
- featured
- allow_comments
- noindex
- revision/version information

Statuses:

- Draft
- Review
- Scheduled
- Published
- Archived
- Trash

Features:

- Create
- Edit
- Preview
- Save draft
- Publish
- Schedule
- Unpublish
- Archive
- Trash
- Restore
- Permanent delete with permission
- Duplicate article
- Revision history
- Restore previous revision
- Autosave
- Slug generation
- Slug uniqueness
- Reading-time calculation

============================================================
5. RICH ARTICLE EDITOR
============================================================

Create a beautiful professional article editor inspired by the
uploaded screenshot.

Editor should support:

- Headings
- Paragraphs
- Bold
- Italic
- Underline
- Links
- Blockquotes
- Ordered lists
- Unordered lists
- Images
- Image captions
- Tables
- Code blocks
- Inline code
- YouTube/video embeds
- Horizontal rules
- Callout boxes
- Warning boxes
- Tip boxes
- Info boxes
- Keyboard shortcuts
- Undo/redo

The editor must sanitize HTML and prevent stored XSS.

Do not trust HTML coming from the browser.

Sanitize content on the server before storing/rendering.

Media insertion should use the CMS media library.

============================================================
6. ARTICLE PAGE DESIGN
============================================================

Create a premium editorial article page.

Display:

- Breadcrumbs
- Category
- H1 title
- Excerpt
- Author
- Author avatar
- Published date
- Updated date
- Reading time
- Cover image
- Table of contents
- Article body
- Related articles
- Previous/next article
- Author information
- Share controls
- Advertisement areas
- Optional comments

Use semantic HTML.

The article body must be easily readable by:
- Search engines
- Screen readers
- AI systems
- Browser readers

Do not hide the actual article content behind JavaScript.

============================================================
7. SEO SYSTEM
============================================================

Implement professional SEO.

Every public page must have:

- Unique title
- Meta description
- Canonical URL
- Open Graph metadata
- Social preview image
- Proper robots metadata
- Correct heading structure

Generate JSON-LD structured data.

Support appropriate schemas such as:
- WebSite
- Organization
- BreadcrumbList
- Article / BlogPosting
- Person
- HowTo where genuinely appropriate

Do not create fake structured data.

Create:

/robots.txt

/sitemap.xml

Sitemap should automatically include:
- Articles
- Categories
- Subcategories
- Tags
- Authors
- Important pages

Do not include:
- Admin pages
- Login pages
- Private dashboard pages
- Trash
- Drafts
- Private APIs

Automatically update sitemap data when content changes.

Use clean URLs.

Implement:
- Canonical URLs
- 301 redirects
- Slug changes with redirect creation
- Duplicate-content prevention
- Pagination SEO
- Noindex controls
- XML sitemap generation
- Breadcrumbs

============================================================
8. GOOGLE SEARCH CONSOLE FRIENDLINESS
============================================================

Make the system technically ready for Google Search Console.

Provide:
- Valid robots.txt
- Valid XML sitemap
- Canonical URLs
- Crawlable HTML
- Fast public pages
- Mobile responsive design
- Structured data
- Proper HTTP status codes
- 404 page
- 410 handling where appropriate
- Redirect management
- No accidental noindex
- No accidental robots blocking

Do not promise Google ranking or indexing.

The system should simply follow technical SEO best practices.

============================================================
9. CONTENT QUALITY / AI
============================================================

The website will use AI-assisted content creation.

The CMS must NOT automatically publish unchecked AI content.

Build an editorial workflow:

AI draft
   ↓
Author review
   ↓
Editor review
   ↓
Publish

Create article metadata that allows the editorial team to identify
AI-assisted content internally if desired.

The public website should not attempt to deceive search engines or
AI systems.

Make content easy to understand through:
- semantic HTML
- clear headings
- concise paragraphs
- lists
- tables where useful
- descriptive image alt text
- structured data
- author information
- published/updated dates

============================================================
9B. HUMAN EDITORIAL WORKFLOW — CRITICAL REQUIREMENT
============================================================

DO NOT generate, seed, or auto-publish hundreds or thousands of
articles as part of this build.

This platform is NOT an AI content farm.

The correct content workflow for every article is:

  Research
     ↓
  AI draft (optional assist)
     ↓
  Fact check (human verifies all claims, links, steps)
     ↓
  Human editing (rewrite, improve, personalise)
     ↓
  Screenshots / examples (real device screenshots, real examples)
     ↓
  SEO review (title, meta, slug, structured data)
     ↓
  Publish

The CMS must SUPPORT this workflow, not bypass it.

Build the CMS so that:

- Every article moves through a defined status pipeline
  (Draft → Review → Approved → Scheduled → Published)
- No article can be published without a human explicitly
  triggering the Publish action
- There is NO bulk-publish, bulk-generate, or auto-publish feature
- There is NO "generate 100 articles" or "seed articles from AI"
  command or admin button
- Seed data for development uses only a small number of clearly
  marked SAMPLE/DEMO articles (5–10 maximum), not hundreds

Why this matters:
- A small number of thoroughly researched, fact-checked, human-edited
  articles with real screenshots will outperform thousands of
  AI-generated articles in Google Search long-term
- Google and other search engines increasingly detect and demote
  low-quality scaled AI content
- Building a content farm creates technical debt, editorial debt,
  and reputational risk that is very difficult to recover from
- Quality and trust compound over time; volume of thin content does not

The system must make it EASY to create one excellent article at a time.
It must make it IMPOSSIBLE to accidentally publish at scale without
human review.

============================================================
10. MEDIA LIBRARY
============================================================

Create:

Media Library

Features:
- Upload images
- Drag/drop upload
- Search
- Filter
- Delete
- Replace
- Alt text
- Caption
- Description
- Filename
- MIME type
- Size
- Dimensions
- Uploaded by
- Created date

Security:
- Validate MIME types
- Validate file extensions
- Validate file size
- Do not trust uploaded filenames
- Generate safe filenames
- Prevent executable uploads
- Store uploads outside executable paths where appropriate
- Generate image variants/thumbnails
- Strip unnecessary metadata where appropriate
- Protect private media if introduced later

============================================================
11. USERS / ROLES / PERMISSIONS
============================================================

Create user management.

Roles:

- Super Admin
- Administrator
- Editor
- Author
- Writer

Implement granular permissions.

Examples:

articles.view
articles.create
articles.edit
articles.publish
articles.delete
articles.restore
articles.manage_revisions

categories.view
categories.manage

media.view
media.upload
media.delete

users.view
users.create
users.edit
users.delete

security.view
security.manage
security.block_ip

settings.view
settings.manage

ads.view
ads.manage

SEO permissions should also be granular.

Enforce permissions on the Laravel backend.

Never rely only on frontend permission checks.

============================================================
12. AUTHENTICATION
============================================================

Implement secure authentication.

Features:
- Login
- Logout
- Password reset
- Email verification
- Remember me where appropriate
- 2FA/TOTP
- Session management
- Logout other sessions
- Login throttling
- Failed login tracking
- Secure password hashing
- CSRF protection
- Secure cookies
- SameSite configuration
- Security headers

Do not store plaintext passwords.

============================================================
13. SECURITY DASHBOARD
============================================================

Create:

Admin → Security

Sections:

- Security Overview
- Activity Logs
- Login Logs
- Active Sessions
- Security Events
- IP Management
- Rate Limit Events
- Authentication Events

Dashboard cards:

- Failed logins today
- Successful logins today
- Blocked IPs
- Suspicious requests
- Active sessions
- Security events

============================================================
14. ACTIVITY LOGGING
============================================================

Create an audit log system.

Track:

- User login
- Failed login
- Logout
- Password reset
- Password change
- 2FA changes
- User creation
- User deletion
- Role changes
- Article creation
- Article update
- Article publish
- Article delete
- Article restore
- Category changes
- Media uploads
- Settings changes
- IP block
- IP unblock
- Security events

Fields:

- id
- user_id
- action
- entity_type
- entity_id
- IP address
- user agent
- request ID
- metadata
- created_at

Do not log passwords, authentication secrets, tokens, or other
sensitive credentials.

Provide filtering:
- User
- Action
- Date
- IP
- Entity
- Severity

Add pagination and retention configuration.

============================================================
15. IP BLOCKING
============================================================

Create:

Security → IP Management

Allow administrators with permission to:

- Block IP
- Unblock IP
- Set reason
- Set duration

Durations:
- 1 hour
- 6 hours
- 24 hours
- 7 days
- 30 days
- Custom date
- Permanent

Database fields:

- IP address
- CIDR if supported
- reason
- created_by
- expires_at
- permanent
- active
- created_at
- updated_at

Automatically expire temporary blocks.

Do not blindly trust X-Forwarded-For or similar headers.

Make trusted proxy configuration explicit.

Ensure the application does not accidentally allow IP spoofing.

============================================================
16. RATE LIMITING
============================================================

Implement rate limiting for:

- Login
- Password reset
- Contact form
- Search
- API endpoints
- Admin actions
- Comment submission

Use Laravel's rate limiting facilities.

Return appropriate HTTP status codes.

Do not create a security system that can be abused to block legitimate
users.

============================================================
17. ADMIN DASHBOARD
============================================================

Create a premium dashboard.

Show:

- Total articles
- Published
- Drafts
- Scheduled
- Views
- Authors
- Categories
- Recent activity
- Recent articles
- Security alerts
- Failed logins
- Blocked IPs

Charts:
- Views over time
- Articles published over time
- Top articles
- Top categories

Make dashboard responsive.

============================================================
18. ARTICLE SEO PANEL
============================================================

Inside article editor add:

SEO panel:

SEO title
Meta description
Canonical URL
Robots:
- index/noindex
- follow/nofollow

Social:
- Open Graph title
- Open Graph description
- Open Graph image

Show a live search-result-style preview.

Add SEO validation such as:
- Missing title
- Missing description
- Missing image alt
- Missing canonical
- Poor slug
- Missing H1

These should be recommendations, not fake guarantees of ranking.

============================================================
19. SEARCH
============================================================

Create site search.

Search:
- Article title
- Excerpt
- Content
- Tags
- Categories

Provide:
- Pagination
- Search highlighting
- Filters
- Sorting

Avoid SQL injection.

Use parameterized queries / ORM safely.

If full-text search is needed, design the system so it can later use
MySQL full-text search or a dedicated search engine.

============================================================
20. TAGGING
============================================================

Create tags.

Article can have multiple tags.

Implement:
- Create tag
- Rename tag
- Delete tag
- Merge tags
- Tag slug
- Tag SEO metadata

============================================================
21. COMMENTS
============================================================

Make comments optional.

If enabled:
- Moderation
- Spam protection
- Rate limiting
- Approve
- Reject
- Delete
- Report
- IP logging only where operationally necessary
- User agent logging only where necessary

Never publish comments automatically if spam protection is not
sufficient.

============================================================
22. ADVERTISEMENT SYSTEM
============================================================

Create:

Admin → Advertisements

Allow admins to manage ad placement settings.

Placements:
- Homepage
- Article top
- Article middle
- Article bottom
- Sidebar
- Category pages

Do not hardcode advertisement IDs throughout the application.

Create a configuration-based system.

Do not encourage invalid ad clicks.

Do not create deceptive ad placements.

============================================================
23. SITE SETTINGS
============================================================

Create:

Settings

General:
- Site name
- Logo
- Favicon
- Description
- Contact email
- Social links

SEO:
- Default title
- Default description
- Default social image
- Organization data

Appearance:
- Primary color
- Secondary accent
- Logo
- Dark mode
- Footer

Content:
- Articles per page
- Related article count
- Comments enabled
- Author display

Security:
- Login rate limits
- Session settings
- IP block settings
- Log retention

Advertisements:
- Enable/disable
- Placement configuration

============================================================
24. DATABASE
============================================================

Design normalized MySQL database tables.

At minimum consider:

users
roles
permissions
role_user
permission_role

categories
tags
article_tag

articles
article_revisions

authors / profiles where appropriate

media

comments

activity_logs
login_logs
security_events
blocked_ips
sessions

settings
redirects

advertisements
ad_placements

pages

notifications

Create proper:
- Primary keys
- Foreign keys
- Unique indexes
- Composite indexes
- Slug indexes
- Date indexes
- Foreign-key indexes

Use database constraints where appropriate.

Avoid N+1 queries.

============================================================
25. PERFORMANCE
============================================================

Optimize for real-world production usage.

Implement:
- Database indexing
- Eager loading
- Query optimization
- Caching
- HTTP caching where appropriate
- Image optimization
- Lazy loading images
- Responsive images
- WebP/AVIF where practical
- Queue background jobs
- Minified production assets
- Code splitting where useful

Do not sacrifice SEO for frontend performance tricks.

============================================================
26. SECURITY HARDENING
============================================================

Follow secure development practices.

Protect against:
- SQL injection
- XSS
- CSRF
- SSRF where applicable
- Broken access control
- IDOR
- Mass assignment
- File upload vulnerabilities
- Session attacks
- Brute-force attacks
- Rate-limit bypasses
- Stored XSS in article content
- Stored XSS in comments
- Malicious SVG uploads
- Unsafe redirects
- Open redirects
- Privilege escalation

Validate all server-side input.

Use Laravel validation and authorization.

Use policies/gates for resource authorization.

Use secure HTTP headers.

Do not expose:
- .env
- application secrets
- debug pages
- stack traces
- private configuration

Production:
APP_DEBUG=false

Never commit secrets to source control.

============================================================
27. API SECURITY
============================================================

If APIs are created:

- Authentication
- Authorization
- Rate limiting
- Validation
- Consistent JSON responses
- Pagination
- API versioning where appropriate

Do not expose admin APIs publicly without authentication.

============================================================
28. ERROR HANDLING
============================================================

Create professional:

404
403
419
429
500
503

pages.

Never display stack traces to normal visitors in production.

Log errors server-side without exposing secrets.

============================================================
29. BACKUP / RECOVERY
============================================================

Design for backups.

Document:
- MySQL backups
- Media backups
- Configuration backup
- Restore procedure

Do not claim backups are working unless actually configured.

============================================================
30. ADMIN UX
============================================================

The CMS must feel like a real professional product.

Use:
- Sidebar navigation
- Top navigation
- Breadcrumbs
- Responsive tables
- Search
- Filters
- Bulk actions
- Confirmation dialogs
- Toast notifications
- Loading states
- Empty states
- Error states
- Pagination
- Keyboard-friendly interactions

Article editor should feel polished and efficient.

============================================================
31. CONTENT WORKFLOW
============================================================

Support:

Writer:
Create draft

Author:
Edit own articles

Editor:
Review/edit/publish

Administrator:
Manage content/users/settings

Super Admin:
Full access

Do not allow authors to edit other authors' articles unless permission
explicitly grants it.

============================================================
32. SEO-FRIENDLY URL STRUCTURE
============================================================

Use clean URLs.

Example:

/android/
/android/android-tips/
/android/how-to-free-up-storage-on-android/

/windows/
/windows/windows-tips/
/windows/how-to-fix-windows-wifi/

/ai-tools/
/ai-tools/chatgpt/
/ai-tools/best-ai-tools-for-students/

Avoid unnecessary query parameters for normal article URLs.

Ensure all slugs are unique.

If a slug changes:
- create a redirect from old URL to new URL
- preserve SEO value where appropriate

============================================================
33. INTERNAL LINKING
============================================================

Create related-content functionality.

Each article should be able to show:

- Related articles
- Same category
- Same subcategory
- Same tags
- Previous article
- Next article

Create admin controls for manually selecting related articles.

============================================================
34. AUTHOR SYSTEM
============================================================

Author profile:

- Name
- Slug
- Avatar
- Bio
- Website/social links if desired
- Job/title
- Published article count

Public author page:

/author/{slug}

Show:
- Author bio
- Articles
- Pagination

============================================================
35. ANALYTICS
============================================================

Create a basic internal analytics dashboard.

Track only what is necessary.

Possible metrics:
- Page views
- Article views
- Top articles
- Top categories
- Referrer
- Device category
- Browser category

Avoid collecting unnecessary personal information.

Make privacy considerations part of the design.

============================================================
36. DEVELOPMENT QUALITY
============================================================

Use:

- Clean architecture
- Reusable React components
- Reusable Laravel services/actions
- Form Requests
- Policies
- Resources/DTOs where appropriate
- Database migrations
- Seeders
- Factories
- Automated tests
- Type-safe frontend code where practical

Do not put all logic inside controllers.

Keep controllers thin.

============================================================
37. TESTING
============================================================

Create tests for:

Authentication
Authorization
Article CRUD
Article publishing
Scheduling
Revisions
Categories
Tags
Media
SEO
Sitemap
Robots.txt
IP blocking
IP expiration
Rate limiting
User permissions
Security logging
Redirects
Search
Comments

Include:
- Unit tests
- Feature tests
- Important frontend tests where practical

============================================================
38. SEED DATA
============================================================

Create development seed data.

Create:
- Super Admin
- Administrator
- Editor
- Author
- Writer

Create all seven main categories and their subcategories.

Create sample articles.

Create sample tags.

Create realistic dashboard data.

Clearly mark development/test credentials and never use insecure
default credentials in production.

============================================================
39. DOCUMENTATION
============================================================

Create documentation:

README.md

Include:
- Requirements
- Installation
- Environment configuration
- Database setup
- Storage setup
- Queue setup
- Cache setup
- Development commands
- Production build
- Deployment
- Cron/scheduler
- Queue workers
- Backup recommendations
- Security checklist
- SEO checklist

============================================================
40. DEPLOYMENT
============================================================

Prepare for production deployment.

Document:
- PHP requirements
- Node requirements
- MySQL
- Redis if used
- Web server
- HTTPS
- Queue worker
- Scheduler
- Storage
- Environment variables
- Database migrations
- Cache configuration

Production must:
- disable debug
- use HTTPS
- use secure cookies
- protect secrets
- use proper file permissions
- use production asset builds

============================================================
41. IMPLEMENTATION PROCESS
============================================================

Do NOT build everything as one giant untested block.

Work in phases.

PHASE 1:
Architecture
Database schema
Authentication
Base layout
Design system

PHASE 2:
Categories
Tags
Articles
Rich editor
Media library

PHASE 3:
Public website
Article pages
Category pages
Author pages
Search

PHASE 4:
SEO
Metadata
JSON-LD
Sitemap
robots.txt
Redirects

PHASE 5:
Roles
Permissions
Admin dashboard
Activity logs

PHASE 6:
Security
2FA
Rate limiting
IP blocking
Security dashboard

PHASE 7:
Advertisements
Analytics
Settings

PHASE 8:
Testing
Performance
Security audit
SEO audit
Accessibility audit

After each phase:
- run tests
- fix errors
- verify migrations
- verify frontend build
- verify authorization
- verify responsive UI

Do not move to the next phase with known critical errors.

============================================================
42. IMPORTANT ENGINEERING RULES
============================================================

Do not:
- hardcode secrets
- trust frontend authorization
- trust uploaded file extensions
- store passwords in plaintext
- expose stack traces
- use unsafe raw SQL unnecessarily
- render unsanitized user HTML
- expose private admin APIs
- create fake SEO structured data
- create fake reviews
- use hidden text to manipulate search rankings
- create doorway pages
- automatically publish unchecked AI content
- scrape/copy copyrighted articles
- create spam pages

Do:
- validate input
- authorize every sensitive action
- sanitize rich content
- use CSRF protection
- rate limit authentication
- log important administrative/security actions
- use secure cookies
- use HTTPS in production
- optimize database queries
- write tests
- keep public pages crawlable
- provide real useful content
- make the website fast and accessible

============================================================
43. FINAL DELIVERABLE
============================================================

Build the actual application.

Do not stop at pseudocode.

Generate:
- Laravel application
- React frontend
- Inertia integration where appropriate
- MySQL migrations
- Models
- Controllers
- Policies
- Form Requests
- Services/actions
- Routes
- React pages
- React components
- CMS dashboard
- Article editor
- Media library
- Authentication
- Roles/permissions
- Security dashboard
- Activity logging
- IP management
- SEO system
- Sitemap
- robots.txt
- JSON-LD
- Search
- Categories
- Tags
- Authors
- Advertisement management
- Settings
- Tests
- Seeders
- Documentation

Before considering the project complete, perform a final audit:

1. Security audit
2. Authorization audit
3. SEO audit
4. Sitemap/robots audit
5. Accessibility audit
6. Performance audit
7. Mobile responsive audit
8. Database/index audit
9. Error-handling audit
10. Production deployment audit

Fix issues found during the audit.

The result should feel like a serious professional publishing CMS,
not a beginner CRUD demo.