<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Kernel::class);
$kernel->bootstrap();

use App\Models\Article;
use App\Models\Category;
use App\Models\User;
use Illuminate\Contracts\Console\Kernel;

echo "Starting article and category seeder...\n";

// Get Primary Author (User 1 or first user)
$user = User::first();
if (! $user) {
    echo "Error: No user found in database!\n";
    exit(1);
}
$userId = $user->id;

// 1. Ensure English Reading Stories parent category and subcategories exist
$englishCat = Category::firstOrCreate(
    ['slug' => 'english-reading-stories'],
    [
        'name' => 'English Reading Stories',
        'description' => 'Inspiring short stories, vocabulary, and daily reading guides to help you master English and expand your mindset.',
        'sort_order' => 7,
        'featured' => true,
        'status' => 'active',
    ]
);

$shortStoriesCat = Category::firstOrCreate(
    ['slug' => 'short-stories'],
    [
        'parent_id' => $englishCat->id,
        'name' => 'Short Stories',
        'description' => 'Thought-provoking short stories crafted with clear English and memorable life lessons.',
        'sort_order' => 1,
        'status' => 'active',
    ]
);

$vocabLifeCat = Category::firstOrCreate(
    ['slug' => 'vocabulary-life'],
    [
        'parent_id' => $englishCat->id,
        'name' => 'Vocabulary & Life',
        'description' => 'Practical phrases, everyday expressions, and nuanced vocabulary explained with real contexts.',
        'sort_order' => 2,
        'status' => 'active',
    ]
);

$inspirationalCat = Category::firstOrCreate(
    ['slug' => 'inspirational-stories'],
    [
        'parent_id' => $englishCat->id,
        'name' => 'Inspirational Stories',
        'description' => 'Real-world journeys of resilience, creativity, and self-improvement written in engaging English.',
        'sort_order' => 3,
        'status' => 'active',
    ]
);

// 2. Ensure Reviews parent category and subcategories exist
$reviewsCat = Category::firstOrCreate(
    ['slug' => 'reviews'],
    [
        'name' => 'Reviews',
        'description' => 'Comprehensive reviews, real-world benchmarks, and honest buying recommendations for hardware, software, and AI.',
        'sort_order' => 6,
        'featured' => true,
        'status' => 'active',
    ]
);

$techReviewsCat = Category::firstOrCreate(
    ['slug' => 'tech-reviews'],
    [
        'parent_id' => $reviewsCat->id,
        'name' => 'Tech Reviews',
        'description' => 'In-depth reviews of modern laptops, peripherals, and everyday productivity gear.',
        'sort_order' => 1,
        'status' => 'active',
    ]
);

$aiReviewsCat = Category::firstOrCreate(
    ['slug' => 'ai-software-reviews'],
    [
        'parent_id' => $reviewsCat->id,
        'name' => 'AI Software Reviews',
        'description' => 'Hands-on tests of cutting-edge AI models, prompt suites, and web applications.',
        'sort_order' => 2,
        'status' => 'active',
    ]
);

$gadgetsCat = Category::firstOrCreate(
    ['slug' => 'hardware-gadgets'],
    [
        'parent_id' => $reviewsCat->id,
        'name' => 'Hardware & Gadgets',
        'description' => 'Audio gear, ergonomic accessories, and smart devices thoroughly tested.',
        'sort_order' => 3,
        'status' => 'active',
    ]
);

$phoneReviewsCat = Category::firstOrCreate(
    ['slug' => 'smartphone-reviews'],
    [
        'parent_id' => $reviewsCat->id,
        'name' => 'Smartphone Reviews',
        'description' => 'Camera shootouts, battery endurance benchmarks, and smartphone evaluations.',
        'sort_order' => 4,
        'status' => 'active',
    ]
);

// 3. Ensure Troubleshooting is a top-level parent category
$troubleshootCat = Category::where('slug', 'troubleshooting')->first();
if ($troubleshootCat) {
    $troubleshootCat->update([
        'parent_id' => null,
        'name' => 'Troubleshooting & How-To',
        'description' => 'Step-by-step diagnostic guides, error fixes, and practical troubleshooting for phones, computers, and networks.',
        'status' => 'active',
        'featured' => true,
    ]);
} else {
    $troubleshootCat = Category::create([
        'slug' => 'troubleshooting',
        'parent_id' => null,
        'name' => 'Troubleshooting & How-To',
        'description' => 'Step-by-step diagnostic guides, error fixes, and practical troubleshooting for phones, computers, and networks.',
        'status' => 'active',
        'featured' => true,
    ]);
}

// 4. Ensure More menu categories exist
$moreCategories = [
    'technology' => ['name' => 'Technology', 'desc' => 'Insights into emerging technologies, system architecture, and digital breakthroughs.'],
    'websites' => ['name' => 'Websites', 'desc' => 'Curated directory of the web’s most useful, obscure, and powerful websites.'],
    'internet' => ['name' => 'Internet', 'desc' => 'Guides on digital privacy, cloud infrastructure, and modern internet tools.'],
    'tips-tricks' => ['name' => 'Tips & Tricks', 'desc' => 'Quick, actionable tech shortcuts and life hacks to supercharge your workflow.'],
    'education' => ['name' => 'Education', 'desc' => 'Study strategies, digital learning resources, and academic tools.'],
    'interesting' => ['name' => 'Interesting', 'desc' => 'Fascinating discoveries, tech history, and curious digital phenomenons.'],
];

foreach ($moreCategories as $slug => $data) {
    Category::firstOrCreate(
        ['slug' => $slug],
        [
            'name' => $data['name'],
            'description' => $data['desc'],
            'status' => 'active',
            'featured' => true,
        ]
    );
}

echo "✓ Categories structure verified and ensured.\n";

// 5. High-quality normal blog articles across categories and subcategories
$sampleArticles = [
    // --- Android & iPhone ---
    [
        'category_slug' => 'iphone-tips',
        'title' => 'Essential iPhone Settings You Should Review for Better Battery and Privacy',
        'slug' => 'essential-iphone-settings-battery-privacy',
        'excerpt' => 'A step-by-step walkthrough of hidden iOS background refresh toggles, location permissions, and optimized charging settings.',
        'reading_time' => 6,
        'cover_image_url' => 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=1200&q=80',
        'content' => '<p>Modern iPhones are packed with features, but several default settings can drain your battery faster than necessary and broadcast background telemetry. Reviewing a handful of key toggles will noticeably extend your daily screen-on time while keeping your personal data private.</p><h3>1. Limit Background App Refresh</h3><p>Many apps continuously wake your processor to check for updates even when you are not using them. Head to <strong>Settings &gt; General &gt; Background App Refresh</strong> and turn off access for ride-sharing apps, shopping tools, and games that do not need live sync.</p><h3>2. Audit Precise Location Permissions</h3><p>Under <strong>Settings &gt; Privacy &amp; Security &gt; Location Services</strong>, check which applications have access to your "Precise Location." Navigation apps need it, but weather and social media apps work just as well with approximate location, conserving battery and protecting your whereabouts.</p><h3>3. Enable Optimized Battery Charging</h3><p>Keeping your battery between 20% and 80% when possible prevents chemical aging. Make sure <strong>Settings &gt; Battery &gt; Battery Health &amp; Charging</strong> has Optimized Battery Charging enabled.</p>',
    ],
    [
        'category_slug' => 'android-apps',
        'title' => 'Top Lightweight Android Utilities to Clean Up and Organize Your Device',
        'slug' => 'top-lightweight-android-utilities-clean-organize',
        'excerpt' => 'Discover minimal open-source Android apps that free up storage, block distractions, and organize your files without intrusive ads.',
        'reading_time' => 5,
        'cover_image_url' => 'https://images.unsplash.com/photo-1563206767-5b18f218e8de?auto=format&fit=crop&w=1200&q=80',
        'content' => '<p>Over time, Android phones accumulate cached thumbnails, orphan download files, and redundant notifications. Instead of downloading bloated cleaners that bombard you with advertisements, consider these lightweight, privacy-focused utilities.</p><h3>Google Files Clean Tool</h3><p>Built directly by Google, the Files app safely identifies temporary files, duplicate screenshots, and unused apps without installing dubious third-party background services.</p><h3>Minimalist Launchers</h3><p>If app clutter is causing digital fatigue, minimalist launchers strip down your home screen to simple text lists, significantly lowering your screen time and conserving system RAM.</p>',
    ],
    [
        'category_slug' => 'settings-customization',
        'title' => 'How to Customize Your Smartphone Home Screen for Maximum Focus',
        'slug' => 'customize-smartphone-home-screen-maximum-focus',
        'excerpt' => 'Simple decluttering strategies to turn your smartphone from a distraction machine into an intentional productivity tool.',
        'reading_time' => 5,
        'cover_image_url' => 'https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?auto=format&fit=crop&w=1200&q=80',
        'content' => '<p>Your home screen is prime mental real estate. By deliberately organizing your first screen and moving infinite-scroll feeds out of sight, you regain control over your attention.</p><h3>Keep Only Essential Utility Apps on Screen 1</h3><p>Reserve your primary home screen strictly for tools: Calendar, Notes, Navigation, Camera, and Phone. Remove social media icons, news tickers, and gaming badges from the first swipe.</p><h3>Use Focus Modes and Scheduled Do Not Disturb</h3><p>Both Android and iOS let you create custom Focus profiles that filter notifications based on whether you are working, studying, or resting.</p>',
    ],

    // --- Windows & Mac ---
    [
        'category_slug' => 'windows-11',
        'title' => 'Complete Windows 11 Speed Optimization Guide: Free Up RAM and Stop Lag',
        'slug' => 'complete-windows-11-speed-optimization-guide',
        'excerpt' => 'Practical tweaks to disable unnecessary startup apps, remove background telemetry, and make Windows 11 snappy on any laptop.',
        'reading_time' => 7,
        'cover_image_url' => 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=1200&q=80',
        'content' => '<p>Windows 11 introduces a modern interface, but pre-installed background services and uncurated startup applications can slow down boot times and consume system memory. Here are tested steps to optimize performance without breaking system stability.</p><h3>1. Clean Up Startup Applications</h3><p>Press <code>Ctrl + Shift + Esc</code> to open Task Manager, then switch to the <strong>Startup Apps</strong> tab. Disable high-impact apps like game launchers, chat clients, and browser helpers that do not need to run immediately upon booting.</p><h3>2. Turn Off Unnecessary Visual Animations</h3><p>If you are running on an ultraportable laptop or older hardware, disabling translucent window effects and smooth scrolling animations will free up integrated GPU cycles.</p><h3>3. Manage Storage Sense</h3><p>Enable Storage Sense under <strong>Settings &gt; System &gt; Storage</strong> to automatically purge temporary installation files and emptied recycle bins every week.</p>',
    ],
    [
        'category_slug' => 'macos-tips',
        'title' => '12 Essential macOS Keyboard Shortcuts and Finder Tricks to Work Faster',
        'slug' => '12-essential-macos-keyboard-shortcuts-finder-tricks',
        'excerpt' => 'Master Spotlight calculations, quick preview with Spacebar, multi-desktop navigation, and text navigation commands on Mac.',
        'reading_time' => 6,
        'cover_image_url' => 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80',
        'content' => '<p>Mac power users rarely reach for the trackpad when managing files or switching tasks. Learning a handful of muscle-memory keyboard shortcuts will instantly speed up your daily workflow.</p><h3>1. Quick Look with Spacebar</h3><p>In Finder, pressing <strong>Space</strong> previews documents, images, videos, and PDFs instantly without waiting for dedicated applications to launch.</p><h3>2. Instant Spotlight Math &amp; Conversions</h3><p>Press <strong>Cmd + Space</strong> and type equations like <code>128 * 4</code> or currency conversions like <code>50 USD to EUR</code> directly into the search bar for immediate answers.</p><h3>3. Jump Words and Lines in Text</h3><p>Use <strong>Option + Left/Right Arrow</strong> to leap whole words, and <strong>Cmd + Left/Right Arrow</strong> to jump straight to the beginning or end of any line.</p>',
    ],
    [
        'category_slug' => 'software',
        'title' => 'The Best Free and Open Source Software Replacements for Everyday Work',
        'slug' => 'best-free-open-source-software-replacements',
        'excerpt' => 'Replace expensive subscriptions with trusted, community-maintained tools for photo editing, PDF viewing, media playback, and office documents.',
        'reading_time' => 6,
        'cover_image_url' => 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
        'content' => '<p>High subscription costs have made software ownership increasingly rare. Fortunately, the open-source community continues to build mature, robust alternatives that respect user freedom and privacy.</p><h3>VLC Media Player</h3><p>VLC remains the unmatched standard for audio and video playback, handling any codec without requiring third-party plugins or tracking.</p><h3>LibreOffice &amp; OnlyOffice</h3><p>For word processing, spreadsheets, and presentations, both suites offer strong compatibility with Microsoft Office formats without monthly licensing fees.</p><h3>GIMP &amp; Krita</h3><p>For image manipulation, photo retouching, and digital illustration, these tools offer multi-layer workflows and robust brush engines completely free of charge.</p>',
    ],

    // --- Reviews ---
    [
        'category_slug' => 'tech-reviews',
        'title' => 'M3 MacBook Air Review: One Year Later — Why It Remains the Ultimate Daily Laptop',
        'slug' => 'm3-macbook-air-review-daily-laptop',
        'excerpt' => 'A real-world long-term review of battery longevity, thermal performance, and whether 8GB vs 16GB of unified memory matters.',
        'reading_time' => 7,
        'cover_image_url' => 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80',
        'content' => '<p>After twelve months of daily writing, coding, and browsing on the M3 MacBook Air, here is our definitive evaluation of Apple\'s thinnest portable computer. While synthetic benchmarks tell part of the story, day-to-day usability, keyboard comfort, and real battery endurance are what truly matter.</p><h3>Build Quality and Portability</h3><p>At just over 11 millimeters thin, the chassis fits easily into any bag without noticeable weight. The anodized aluminum finish resists minor scratches, and the Midnight color shows significantly fewer fingerprint smudges than the previous M2 generation.</p><h3>Battery Life in the Real World</h3><p>Apple advertises 18 hours, but with high screen brightness and multiple browser tabs open, you can reliably expect 13 to 14 hours of continuous productivity. You can leave the charger at home with zero battery anxiety.</p><h3>The Verdict: 9/10</h3><p>For writers, students, and professionals who do not require sustained 3D rendering or intensive 8K video exports, the M3 MacBook Air remains the best laptop you can buy.</p>',
    ],
    [
        'category_slug' => 'ai-software-reviews',
        'title' => 'Claude 3.5 Sonnet vs ChatGPT Plus: Hands-On Review for Writers and Researchers',
        'slug' => 'claude-35-sonnet-vs-chatgpt-plus-review',
        'excerpt' => 'We put Anthropic’s Claude 3.5 Sonnet and OpenAI’s ChatGPT head-to-head across creative storytelling, nuanced research, and reasoning.',
        'reading_time' => 8,
        'cover_image_url' => 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
        'content' => '<p>Artificial intelligence assistants have evolved beyond simple chatbots. In this review, we compare the two leading models on how they handle complex tasks like editorial writing, technical synthesis, and fact-checking.</p><h3>Writing Quality and Natural Voice</h3><p>Claude 3.5 Sonnet excels at nuanced, human-like prose without falling into predictable clichés. ChatGPT Plus provides structured, bullet-point heavy responses that are ideal for outlines, but Claude feels more organic for prose.</p><h3>Artifacts and Workspace Integration</h3><p>Anthropic’s Artifacts window allows you to preview interactive HTML, documents, and code side-by-side, which elevates productivity considerably.</p><h3>Final Recommendation</h3><p>If your primary workload involves writing, synthesis, and deep literature reviews, Claude 3.5 Sonnet takes the lead. For multimodal web browsing and custom GPTs, ChatGPT remains highly competitive.</p>',
    ],
    [
        'category_slug' => 'hardware-gadgets',
        'title' => 'Sony WH-1000XM5 Long-Term Review: The Benchmark for Noise Canceling Headphones',
        'slug' => 'sony-wh-1000xm5-long-term-review',
        'excerpt' => 'An in-depth review of comfort, active noise cancellation in coffee shops and airplanes, microphone clarity, and sound signature.',
        'reading_time' => 6,
        'cover_image_url' => 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1200&q=80',
        'content' => '<p>Over-ear noise canceling headphones are an essential investment for anyone working in noisy environments. Having tested the Sony WH-1000XM5 across busy airports, bustling cafes, and quiet home offices, here are our findings.</p><h3>Active Noise Cancellation Performance</h3><p>Equipped with dual processors and eight microphones, the XM5 attenuates high-frequency chatter and deep engine hum with remarkable ease. It creates an immediate cocoon of silence that makes focus effortless.</p><h3>All-Day Ergonomics</h3><p>The soft-fit synthetic leather headband distributes weight evenly, allowing for 4 to 5 hours of continuous listening without pressure points atop the skull.</p><h3>Verdict: 9.2/10</h3><p>The Sony WH-1000XM5 remains our top recommendation for remote professionals, frequent commuters, and audio enthusiasts looking for premier silence.</p>',
    ],
    [
        'category_slug' => 'hardware-gadgets',
        'title' => 'Logitech MX Master 3S Review: Why It Is the Undisputed King of Productivity Mice',
        'slug' => 'logitech-mx-master-3s-review',
        'excerpt' => 'From the near-silent clicks to the MagSpeed electromagnetic scroll wheel, here is why every professional setup benefits from the MX Master 3S.',
        'reading_time' => 5,
        'cover_image_url' => 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=1200&q=80',
        'content' => '<p>While touchpads have gotten better, nothing matches the precision and speed of a dedicated ergonomic mouse. The Logitech MX Master 3S is widely regarded as the pinnacle of office input devices—and our testing confirms why.</p><h3>Electromagnetic MagSpeed Scrolling</h3><p>With a flick of your finger, the scroll wheel shifts from ratcheted precision to frictionless hyper-fast scrolling, allowing you to fly through thousands of lines of spreadsheets or long articles in seconds.</p><h3>Quiet Click Switches</h3><p>Unlike previous generations, the 3S features 90% quieter tactile switches that provide satisfying feedback without disturbing colleagues in quiet rooms.</p>',
    ],

    // --- Troubleshooting (How-To) ---
    [
        'category_slug' => 'troubleshooting',
        'title' => 'How to Fix Unstable Wi-Fi Connections and DNS Dropouts on Windows 11 and Mac',
        'slug' => 'fix-unstable-wifi-dns-disconnections',
        'excerpt' => 'A complete troubleshooting guide to clearing DNS cache, renewing DHCP leases, and selecting optimal Cloudflare or Google DNS addresses.',
        'reading_time' => 7,
        'cover_image_url' => 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1200&q=80',
        'content' => '<p>Nothing interrupts a productive workday faster than a Wi-Fi connection that randomly disconnects or displays "Connected, no internet". Before you restart your router, follow these systematic steps to diagnose and repair network stack issues.</p><h3>1. Flush DNS Cache</h3><p>Corrupted DNS records can prevent your browser from resolving domain names. On Windows, open Terminal and run <code>ipconfig /flushdns</code>. On macOS, run <code>sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder</code>.</p><h3>2. Switch to Secure Public DNS</h3><p>ISP DNS servers are frequently slow and prone to timeouts. Configure your network adapter to use <strong>1.1.1.1 (Cloudflare)</strong> or <strong>8.8.8.8 (Google Public DNS)</strong> for faster, more reliable lookups.</p><h3>3. Disable Power Saving on Wi-Fi Adapters</h3><p>In Windows Device Manager, ensure the Wi-Fi card does not have "Allow the computer to turn off this device to save power" enabled under Power Management.</p>',
    ],
    [
        'category_slug' => 'troubleshooting',
        'title' => 'Step-by-Step Guide to Fixing Sudden Smartphone Battery Drain After Updates',
        'slug' => 'fix-smartphone-battery-drain-after-updates',
        'excerpt' => 'Learn why phones overheat and lose battery rapidly after major system updates, and how to safely recalibrate background indexing.',
        'reading_time' => 6,
        'cover_image_url' => 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80',
        'content' => '<p>After installing a major operating system update on iOS or Android, many users report rapid battery consumption and excessive heat. In most cases, this is temporary and easily resolved.</p><h3>Understand Post-Update Spotlight &amp; Media Re-indexing</h3><p>Following an update, your phone rebuilds its photo facial recognition models, search databases, and app caches in the background. Leave the phone plugged into a charger overnight to let these indexing tasks complete without interrupting your workday.</p><h3>Check Battery Usage Per App</h3><p>Inspect your battery analytics under Settings to identify rogue third-party apps that have not yet been optimized for the new OS version.</p>',
    ],
    [
        'category_slug' => 'troubleshooting',
        'title' => 'How to Fix Bluetooth Audio Delay and Pairing Failures on Laptops and Phones',
        'slug' => 'fix-bluetooth-audio-delay-pairing-failures',
        'excerpt' => 'Resolve audio desync on YouTube and Netflix, fix device discovery issues, and reset the Bluetooth controller daemon safely.',
        'reading_time' => 5,
        'cover_image_url' => 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80',
        'content' => '<p>Bluetooth audio delay is distracting when streaming movies or participating in video calls. Here is how to eliminate latency and fix pairing failures across devices.</p><h3>1. Check Codec Support</h3><p>Ensure your headphones and operating system are utilizing low-latency codecs such as AAC or aptX rather than falling back to low-quality SBC.</p><h3>2. Clear Stale Bluetooth Pairings</h3><p>Remove unused devices from your paired list to prevent polling conflicts that cause micro-stutters and audio dropouts.</p>',
    ],

    // --- Technology ---
    [
        'category_slug' => 'technology',
        'title' => 'The Future of On-Device AI: How Neural Engines Are Changing Everyday Computing',
        'slug' => 'future-of-on-device-ai-neural-engines',
        'excerpt' => 'An insightful look into localized NPUs, privacy-first offline models, and why tomorrow’s AI won’t require constant cloud connections.',
        'reading_time' => 7,
        'cover_image_url' => 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
        'content' => '<p>As dedicated Neural Processing Units (NPUs) become standard across modern silicon, computing is shifting from cloud-dependent processing to on-device intelligence. This transformation brings tangible benefits in latency, privacy, and battery efficiency.</p><h3>Why Local Processing Matters</h3><p>Sending personal audio, documents, and camera feeds to remote data centers incurs latency and privacy trade-offs. On-device models process sensitive tasks entirely within your hardware’s secure enclave.</p>',
    ],

    // --- English Reading Stories ---
    [
        'category_slug' => 'short-stories',
        'title' => 'The Lantern Maker: An Inspiring English Reading Story About Patience and Craft',
        'slug' => 'the-lantern-maker-inspiring-english-story',
        'excerpt' => 'A beautifully written short story in clear English that explores mindfulness, dedication, and the quiet beauty of creating meaningful work.',
        'reading_time' => 6,
        'cover_image_url' => 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1200&q=80',
        'content' => '<p>High in the misty mountains of a forgotten valley lived an artisan named Kaelen. While the world rushed toward automated machines, Kaelen spent his days shaping lanterns from paper and bamboo.</p><p>"A lantern does not fight the night," he would tell his young apprentice. "It simply reminds travelers that light is always possible, so long as someone tends the flame."</p><h3>Key Vocabulary to Learn</h3><ul><li><strong>Mindfulness</strong> — The practice of being fully present and attentive.</li><li><strong>Resilience</strong> — The capacity to recover quickly from difficulties.</li><li><strong>Artisan</strong> — A skilled craftsperson who makes things by hand.</li></ul>',
    ],
    [
        'category_slug' => 'vocabulary-life',
        'title' => '10 Beautiful English Words to Describe Feelings You Experience Every Day',
        'slug' => '10-beautiful-english-words-everyday-feelings',
        'excerpt' => 'Expand your English reading vocabulary with nuanced words like Sonder, Petrichor, Chrysalism, and Serendipity explained with evocative examples.',
        'reading_time' => 5,
        'cover_image_url' => 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1200&q=80',
        'content' => '<p>Learning English becomes truly joyful when you discover words that capture subtle human experiences that ordinary language often struggles to express. Here are five evocative terms to enrich your daily reading and writing.</p><h3>1. Sonder (noun)</h3><p>The profound realization that every stranger passing by lives a life as vivid and complex as your own, filled with their own dreams, sorrows, and memories.</p><h3>2. Petrichor (noun)</h3><p>The earthy, pleasant scent that rises from the dry ground after the first rainfall of a summer afternoon.</p><h3>3. Serendipity (noun)</h3><p>The occurrence of finding valuable, delightful things by fortunate chance when you were not actively looking for them.</p>',
    ],
    [
        'category_slug' => 'inspirational-stories',
        'title' => 'The Mountain and the Seed: A Lesson on Small Daily Habits',
        'slug' => 'the-mountain-and-the-seed-daily-habits',
        'excerpt' => 'A motivating reflection on how tiny, continuous daily efforts accumulate to move mountains and transform personal knowledge.',
        'reading_time' => 5,
        'cover_image_url' => 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
        'content' => '<p>A traveler once asked an old monk why a colossal oak tree stood firmly on the jagged slope of a granite cliff. The monk smiled and pointed to a crack in the rock no wider than a blade of grass.</p><p>"The oak did not shatter the rock in a single day," the monk explained. "A single seed landed in that crack, drank the morning dew, and sent down roots one millimeter at a time. The stone was patient, but the seed was relentless."</p>',
    ],
];

$insertedCount = 0;

foreach ($sampleArticles as $art) {
    // Find category by slug
    $category = Category::where('slug', $art['category_slug'])->first();
    if (! $category) {
        // Fallback to parent
        $category = Category::where('slug', 'reviews')->first() ?? Category::first();
    }

    $existing = Article::where('slug', $art['slug'])->first();
    if ($existing) {
        $existing->update([
            'category_id' => $category->id,
            'status' => 'published',
            'published_at' => $existing->published_at ?? now(),
            'cover_image_url' => $art['cover_image_url'] ?? $existing->cover_image_url,
        ]);
        echo "Updated existing: {$art['title']}\n";
    } else {
        Article::create([
            'user_id' => $userId,
            'category_id' => $category->id,
            'title' => $art['title'],
            'slug' => $art['slug'],
            'excerpt' => $art['excerpt'],
            'content' => $art['content'],
            'content_raw' => null,
            'cover_image_url' => $art['cover_image_url'] ?? null,
            'status' => 'published',
            'published_at' => now(),
            'reading_time' => $art['reading_time'],
            'views_count' => 0,
            'featured' => ($insertedCount % 3 === 0),
            'allow_comments' => true,
            'meta_title' => $art['title'].' — Rafvex',
            'meta_description' => $art['excerpt'],
        ]);
        $insertedCount++;
        echo "✓ Created: {$art['title']} in category [{$category->name}]\n";
    }
}

// Clear caches so the mega menu immediately updates
cache()->forget('mega_menu_categories');
cache()->forget('top_categories');
cache()->forget('featured_articles');
cache()->forget('latest_articles');

echo "Finished seeding! Total new articles created: {$insertedCount}\n";
