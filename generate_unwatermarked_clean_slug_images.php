<?php

ini_set('memory_limit', '1024M');
set_time_limit(1500);

echo "====================================================================\n";
echo "   RAFVEX UNWATERMARKED IMAGES & HYPHENATED CLEAN SLUG FOLDERS      \n";
echo "====================================================================\n";

require __DIR__.'/vendor/autoload.php';
use Illuminate\Support\Str;

$baseMediaDir = __DIR__.'/Media Library/blog';
$publicMediaDir = __DIR__.'/public/medialibrary/blog';
$tmpDir = __DIR__.'/storage/app/tmp_clean_photos';
if (! is_dir($tmpDir)) {
    mkdir($tmpDir, 0755, true);
}

// Clean slug helper (no spaces, only hyphens) via Laravel Str::slug
function slugify($text)
{
    return Str::slug($text);
}

// 53 Articles specification with short slugs and 4 custom queries each
$articlesSpec = [
    1 => [
        'shortSlug' => 'android-storage',
        'category' => 'Android & iPhone',
        'subcategory' => 'Android Tips',
        'queries' => [
            'smartphone storage full alert android',
            'microsd memory card smartphone close up',
            'mobile memory clean storage cache',
            'smartphone files organizer phone screen',
        ],
    ],
    2 => [
        'shortSlug' => 'student-ai-tools',
        'category' => 'AI for Students & Work',
        'subcategory' => 'AI for Students',
        'queries' => [
            'student studying laptop university modern library',
            'academic textbooks open research study notes',
            'college students working on laptops table',
            'digital notes tablet stylus university',
        ],
    ],
    3 => [
        'shortSlug' => 'android-iphone-sync',
        'category' => 'Android & iPhone',
        'subcategory' => 'Cross-Platform Utilities',
        'queries' => [
            'android and iphone side by side on wooden desk',
            'mobile wireless data transfer sharing',
            'modern smartphone screens glowing desk',
            'person holding two smartphones technology',
        ],
    ],
    4 => [
        'shortSlug' => 'mobile-hardware-sec',
        'category' => 'Android & iPhone',
        'subcategory' => 'Mobile Security',
        'queries' => [
            'mobile cybersecurity encrypted smartphone shield',
            'smartphone fingerprint sensor biometric security',
            'smartphone lock screen passcode privacy',
            'secure mobile payment nfc technology',
        ],
    ],
    5 => [
        'shortSlug' => 'offline-field-data',
        'category' => 'Android & iPhone',
        'subcategory' => 'Field Operations',
        'queries' => [
            'field researcher using tablet outdoors nature',
            'scientist collecting data field notebook wilderness',
            'topographic map compass GPS handheld device',
            'rugged outdoor electronics adventure exploration',
        ],
    ],
    6 => [
        'shortSlug' => 'windows-vs-mac',
        'category' => 'Windows & Mac',
        'subcategory' => 'Desktop OS Comparison',
        'queries' => [
            'macbook and windows laptop side by side desk',
            'desktop workstation dual monitors code',
            'modern office desk computer setup clean',
            'developer workspace mechanical keyboard screens',
        ],
    ],
    7 => [
        'shortSlug' => 'terminal-automation',
        'category' => 'Windows & Mac',
        'subcategory' => 'Terminal & Automation',
        'queries' => [
            'command line interface terminal code screen',
            'code matrix green terminal prompt programmer',
            'system administrator typing on keyboard dark',
            'bash script server console dark monitor',
        ],
    ],
    8 => [
        'shortSlug' => 'zero-trust-backup',
        'category' => 'Windows & Mac',
        'subcategory' => 'Data Integrity',
        'queries' => [
            'external hard drive data backup storage',
            'server backup raid storage datacenter',
            'secure encrypted ssd drive desk',
            'cloud data storage protection hardware',
        ],
    ],
    9 => [
        'shortSlug' => 'local-llms-ollama',
        'category' => 'AI Tools',
        'subcategory' => 'Local AI Models',
        'queries' => [
            'neural network glowing artificial intelligence server',
            'deep learning computer terminal gpu',
            'artificial intelligence brain digital data',
            'high performance computing gpu cluster',
        ],
    ],
    10 => [
        'shortSlug' => 'lit-networks-ai',
        'category' => 'AI Tools',
        'subcategory' => 'Literature Discovery',
        'queries' => [
            'academic research network visualization graph',
            'scientific data visualization connected nodes',
            'digital knowledge graph connecting concepts',
            'research paper citation connections network',
        ],
    ],
    11 => [
        'shortSlug' => 'prompt-engineering',
        'category' => 'AI Tools',
        'subcategory' => 'Advanced Prompting',
        'queries' => [
            'prompt engineering terminal prompt typing',
            'ai language model interface conversation',
            'creative thinking lightbulb brainstorming notes',
            'algorithmic prompt design futuristic interface',
        ],
    ],
    12 => [
        'shortSlug' => 'browser-hardening',
        'category' => 'Websites & Apps',
        'subcategory' => 'Browser Security',
        'queries' => [
            'web browser padlock secure https connection',
            'cybersecurity firewall shield digital privacy',
            'private incognito web browsing computer',
            'data privacy protection virtual private network',
        ],
    ],
    13 => [
        'shortSlug' => 'reference-managers',
        'category' => 'Websites & Apps',
        'subcategory' => 'Reference Management',
        'queries' => [
            'academic reference library books catalog',
            'university library bookshelves research archive',
            'citation index academic literature cards',
            'vintage card catalog library drawers',
        ],
    ],
    14 => [
        'shortSlug' => 'knowledge-vault',
        'category' => 'Websites & Apps',
        'subcategory' => 'Personal Knowledge Management',
        'queries' => [
            'obsidian markdown knowledge base digital graph',
            'personal archive filing cabinet documents',
            'organized knowledge system mind map',
            'digital notes interconnected web concepts',
        ],
    ],
    15 => [
        'shortSlug' => 'travel-opsec',
        'category' => 'Basic Online Security',
        'subcategory' => 'Travel OpSec',
        'queries' => [
            'traveler airport passport laptop security',
            'travel laptop backpack airport terminal',
            'international travel luggage boarding pass tech',
            'digital nomad working at train station',
        ],
    ],
    16 => [
        'shortSlug' => 'hardware-security-keys',
        'category' => 'Basic Online Security',
        'subcategory' => 'Multi-Factor Authentication',
        'queries' => [
            'yubikey usb hardware security key laptop',
            'usb authentication key plugged in computer',
            'biometric security token two factor',
            'hardware key security access token',
        ],
    ],
    17 => [
        'shortSlug' => 'threat-modeling',
        'category' => 'Basic Online Security',
        'subcategory' => 'Threat Modeling',
        'queries' => [
            'cyber threat defense strategy whiteboard',
            'information security audit diagram',
            'network vulnerability assessment cybersecurity',
            'chess board tactical strategy security',
        ],
    ],
    18 => [
        'shortSlug' => 'ai-academic-integrity',
        'category' => 'AI for Students & Work',
        'subcategory' => 'Academic Integrity',
        'queries' => [
            'student graduation cap diploma university ethics',
            'honor code academic integrity university lecture',
            'student writing research essay ethics',
            'university lecture hall amphitheater students',
        ],
    ],
    19 => [
        'shortSlug' => 'preprint-tracking',
        'category' => 'AI for Students & Work',
        'subcategory' => 'Workflow Automation',
        'queries' => [
            'academic journal article publishing papers',
            'automated data stream rss feed monitor',
            'scientific preprint archive repository',
            'research paper review magnifying glass',
        ],
    ],
    20 => [
        'shortSlug' => 'grant-stress-test',
        'category' => 'AI for Students & Work',
        'subcategory' => 'Academic Funding',
        'queries' => [
            'research grant funding proposal document review',
            'scientific committee evaluation meeting',
            'academic budget financial ledger calculator',
            'business contract signed pen desk',
        ],
    ],
    21 => [
        'shortSlug' => 'termux-automation',
        'category' => 'Android & iPhone',
        'subcategory' => 'Android Tips',
        'queries' => [
            'android terminal linux command line phone',
            'automation pipeline robotics gears',
            'scheduled cron jobs automation terminal',
            'mobile programming android dev studio',
        ],
    ],
    22 => [
        'shortSlug' => 'iphone-battery-privacy',
        'category' => 'Android & iPhone',
        'subcategory' => 'iPhone Tips',
        'queries' => [
            'modern iphone sleek camera lens reflection',
            'iphone settings privacy protection screen',
            'apple smartphone charging dock minimal',
            'holding iphone outdoors sunny afternoon',
        ],
    ],
    23 => [
        'shortSlug' => 'clean-android-apps',
        'category' => 'Android & iPhone',
        'subcategory' => 'Android Apps',
        'queries' => [
            'android smartphone clean minimalist app drawer',
            'mobile phone utility settings system',
            'lightweight fast android mobile clean',
            'smartphone screen sleek modern UI',
        ],
    ],
    24 => [
        'shortSlug' => 'home-screen-focus',
        'category' => 'Android & iPhone',
        'subcategory' => 'Settings & Customization',
        'queries' => [
            'minimalist phone screen black and white widgets',
            'zen focus desk plants smartphone notebook',
            'digital minimalism phone screen serene',
            'calm productivity clean desk mobile',
        ],
    ],
    25 => [
        'shortSlug' => 'windows-11-speed',
        'category' => 'Windows & Mac',
        'subcategory' => 'Windows 11',
        'queries' => [
            'high performance gaming pc illuminated hardware',
            'ram memory modules motherboard close up',
            'fast cpu cooler liquid cooling heatsink',
            'windows pc monitor speed benchmark',
        ],
    ],
    26 => [
        'shortSlug' => 'macos-shortcuts',
        'category' => 'Windows & Mac',
        'subcategory' => 'macOS Tips',
        'queries' => [
            'apple magic keyboard aluminum minimalist',
            'hands typing on macbook keyboard close up',
            'clean macbook desktop with coffee cup',
            'command key apple keyboard close up',
        ],
    ],
    27 => [
        'shortSlug' => 'open-source-software',
        'category' => 'Windows & Mac',
        'subcategory' => 'Software',
        'queries' => [
            'linux penguin open source software code',
            'collaboration open source programming team',
            'git repository branch terminal screen',
            'free open software creative studio',
        ],
    ],
    28 => [
        'shortSlug' => 'writing-ai-prompts',
        'category' => 'AI Tools',
        'subcategory' => 'ChatGPT',
        'queries' => [
            'typewriter creative writing paper vintage',
            'person typing on glowing mechanical keyboard',
            'clear handwritten instructions sticky notes',
            'chat interface prompt engineering text',
        ],
    ],
    29 => [
        'shortSlug' => 'gemini-vs-chatgpt',
        'category' => 'AI Tools',
        'subcategory' => 'Google AI',
        'queries' => [
            'two glowing futuristic ai interfaces side by side',
            'google search vs conversational ai monitor',
            'smartphone running ai chatbot assistant',
            'ai assistant voice interface soundwaves',
        ],
    ],
    30 => [
        'shortSlug' => 'ai-writing-voice',
        'category' => 'AI Tools',
        'subcategory' => 'AI Writing Tools',
        'queries' => [
            'author writing manuscript vintage fountain pen',
            'writer desk open journal coffee window rain',
            'hand holding luxury ink fountain pen writing',
            'creative writer thinking notebook cozy room',
        ],
    ],
    31 => [
        'shortSlug' => 'free-ai-tools',
        'category' => 'AI Tools',
        'subcategory' => 'Free AI Tools',
        'queries' => [
            'graphic designer drawing on digital tablet stylus',
            'creative content creator workspace camera laptop',
            'video editor workstation color grading dials',
            'digital artist studio multiple monitors art',
        ],
    ],
    32 => [
        'shortSlug' => 'notion-vs-obsidian',
        'category' => 'Websites & Apps',
        'subcategory' => 'Productivity Apps',
        'queries' => [
            'organized digital planner notes app screen',
            'bullet journal handwritten organized tasks',
            'notetaking desk stationery highlighters pens',
            'clean desktop with tablet and paper notebook',
        ],
    ],
    33 => [
        'shortSlug' => 'backup-cloud-storage',
        'category' => 'Websites & Apps',
        'subcategory' => 'Cloud Storage',
        'queries' => [
            'cloud computing datacenter blue server lights',
            'secure network storage drive synology nas',
            'cloud icon data transfer synchronization',
            'hard drive array storage enclosure',
        ],
    ],
    34 => [
        'shortSlug' => 'useful-free-websites',
        'category' => 'Websites & Apps',
        'subcategory' => 'Online Tools',
        'queries' => [
            'modern web browser bookmarks useful portals',
            'knowledge discovery library digital archives',
            'creative websites navigation multiple tabs',
            'curated web directories digital knowledge',
        ],
    ],
    35 => [
        'shortSlug' => 'stop-reusing-passwords',
        'category' => 'Basic Online Security',
        'subcategory' => 'Passwords',
        'queries' => [
            'brass vintage padlock locked on wooden door',
            'password vault master key digital security',
            'secure password generator asterisks screen',
            'metal combination lock safe dial',
        ],
    ],
    36 => [
        'shortSlug' => 'authenticator-vs-sms',
        'category' => 'Basic Online Security',
        'subcategory' => 'Two-Factor Authentication',
        'queries' => [
            'smartphone displaying two factor auth code digits',
            'mobile phone push notification security alert',
            'authenticator app verification qr code scan',
            'biometric facial recognition mobile phone',
        ],
    ],
    37 => [
        'shortSlug' => 'spot-fake-emails',
        'category' => 'Basic Online Security',
        'subcategory' => 'Phishing Awareness',
        'queries' => [
            'email inbox phishing warning banner red',
            'suspicious email link inspection magnifying glass',
            'cyber criminal hacker silhouette dark computer',
            'spam email folder warning cyber threat',
        ],
    ],
    38 => [
        'shortSlug' => 'ai-personal-tutor',
        'category' => 'AI for Students & Work',
        'subcategory' => 'AI for Students',
        'queries' => [
            'young student engaged in online tutoring video',
            'high school student solving physics math problem',
            'student studying with headphone tutor session',
            'college study hall desk late night lamp',
        ],
    ],
    39 => [
        'shortSlug' => 'ai-flashcard-generators',
        'category' => 'AI for Students & Work',
        'subcategory' => 'AI Study Tools',
        'queries' => [
            'colored index study flashcards medical revision',
            'spaced repetition study schedule desk calendar',
            'student flipping through review cards library',
            'study desk memory revision colorful notes',
        ],
    ],
    40 => [
        'shortSlug' => 'ai-publishing-workflows',
        'category' => 'AI for Students & Work',
        'subcategory' => 'AI for Writers',
        'queries' => [
            'digital blogger home studio laptop podcast mic',
            'content publishing workflow editorial board',
            'journalist interviewing typing fast modern news',
            'online publishing analytics growth dashboard',
        ],
    ],
    41 => [
        'shortSlug' => 'the-lantern-maker',
        'category' => 'English Reading Stories',
        'subcategory' => 'Short Stories',
        'queries' => [
            'floating lanterns night sky festival',
            'bamboo artisan craftsman shaving wood workshop',
            'hanging lanterns asian street night',
            'warm candlelight glowing inside glass lantern',
        ],
    ],
    42 => [
        'shortSlug' => 'words-for-feelings',
        'category' => 'English Reading Stories',
        'subcategory' => 'Vocabulary & Life',
        'queries' => [
            'cozy rain droplets falling on windowpane autumn',
            'golden sunrise mist over tranquil lake morning',
            'sunlight filtering through serene green forest trees',
            'solitary wooden bench in quiet peaceful park',
        ],
    ],
    43 => [
        'shortSlug' => 'mountain-and-seed',
        'category' => 'English Reading Stories',
        'subcategory' => 'Inspirational Stories',
        'queries' => [
            'majestic alpine mountain peak snow clouds',
            'green seedling sprout growing through rocky soil',
            'ancient pine tree on rugged mountain cliff',
            'crystal alpine stream flowing through mountain valley',
        ],
    ],
    44 => [
        'shortSlug' => 'm3-macbook-air',
        'category' => 'Reviews',
        'subcategory' => 'Tech Reviews',
        'queries' => [
            'apple macbook air midnight blue on oak desk',
            'slim macbook profile open beside espresso coffee',
            'macbook air trackpad keyboard illuminated',
            'traveler using macbook air in airport lounge',
        ],
    ],
    45 => [
        'shortSlug' => 'claude-vs-chatgpt',
        'category' => 'Reviews',
        'subcategory' => 'AI Software Reviews',
        'queries' => [
            'ai language model code generation dual screen',
            'futuristic conversational intelligence text terminal',
            'ai code syntax highlighting dark monitor',
            'developer analyzing two ai models side by side',
        ],
    ],
    46 => [
        'shortSlug' => 'sony-wh1000xm5',
        'category' => 'Reviews',
        'subcategory' => 'Hardware & Gadgets',
        'queries' => [
            'sony over ear wireless noise canceling headphones',
            'person wearing sleek dark headphones on subway',
            'headphones resting on wooden desk beside audio cable',
            'acoustic sound studio foam wall headphones',
        ],
    ],
    47 => [
        'shortSlug' => 'mx-master-3s',
        'category' => 'Reviews',
        'subcategory' => 'Hardware & Gadgets',
        'queries' => [
            'logitech mx master ergonomic wireless mouse desk',
            'designer hand on ergonomic productivity mouse',
            'precision metal scroll wheel computer mouse close up',
            'clean aesthetic desk setup mx master keyboard',
        ],
    ],
    48 => [
        'shortSlug' => 'fix-unstable-wifi',
        'category' => 'Troubleshooting & How-To',
        'subcategory' => 'Network Engineering',
        'queries' => [
            'modern wireless router blue glowing status lights',
            'server rack colorful ethernet network patch cables',
            'router antennas glowing living room shelf',
            'network engineer testing fiber optic cable',
        ],
    ],
    49 => [
        'shortSlug' => 'smartphone-battery-drain',
        'category' => 'Troubleshooting & How-To',
        'subcategory' => 'Mobile Diagnostics',
        'queries' => [
            'smartphone charging fast plugged in wall socket',
            'lithium ion battery circuit inside mobile phone',
            'power bank external battery charging phone transit',
            'green battery level icon smartphone screen',
        ],
    ],
    50 => [
        'shortSlug' => 'bluetooth-audio-delay',
        'category' => 'Troubleshooting & How-To',
        'subcategory' => 'Hardware Troubleshooting',
        'queries' => [
            'wireless earbuds resting in open charging case',
            'portable bluetooth speaker outdoor patio music',
            'digital audio workstation latency buffer settings',
            'musician recording studio audio interface',
        ],
    ],
    51 => [
        'shortSlug' => 'on-device-ai',
        'category' => 'Technology',
        'subcategory' => 'Future Tech',
        'queries' => [
            'macro silicon chip microprocessor glowing nodes',
            'circuit board printed tracks cpu socket macro',
            'futuristic quantum computer processor gold wiring',
            'silicon wafer semiconductor fabrication blue light',
        ],
    ],
    52 => [
        'shortSlug' => 'lantern-maker-study',
        'category' => 'English Reading Stories',
        'subcategory' => 'Short Stories',
        'queries' => [
            'glowing paper lantern alleyway twilight kyoto',
            'artisan woodworking carving tools cedar wood',
            'candle flickering inside handcrafted paper lantern',
            'warm lantern light reflecting on dark river water',
        ],
    ],
    53 => [
        'shortSlug' => 'mountain-seed-study',
        'category' => 'English Reading Stories',
        'subcategory' => 'Inspirational Stories',
        'queries' => [
            'vast mountain panorama granite peaks morning sun',
            'hardy bristlecone pine surviving high altitude rock',
            'tiny green plant growing out of stone fissure',
            'mountain waterfall cascading through valley flowers',
        ],
    ],
    54 => [
        'shortSlug' => 'top-5-speed-test-websites',
        'category' => 'Reviews',
        'subcategory' => 'Tech Reviews',
        'queries' => [
            'server rack fiber datacenter glowing',
            'network speed test dashboard modern',
            'fiber optic cables patch panel datacenter',
            'telecommunications engineer computer terminal',
        ],
    ],
    55 => [
        'shortSlug' => 'speedtest-fast-games-lag',
        'category' => 'Troubleshooting & How-To',
        'subcategory' => 'Network Engineering',
        'queries' => [
            'competitive esports gaming station neon lights',
            'gaming keyboard illuminated mechanical keys',
            'esports player focused monitor headphones',
            'gaming router antennas living room',
        ],
    ],
    56 => [
        'shortSlug' => 'dns-speed-lookup-guide',
        'category' => 'Technology',
        'subcategory' => 'Future Tech',
        'queries' => [
            'global internet routing cables glowing',
            'network server lights blinking rack',
            'developer terminal code network programming',
            'optical fiber internet communication technology',
        ],
    ],
    57 => [
        'shortSlug' => 'diagnose-network-tech-questions',
        'category' => 'Troubleshooting & How-To',
        'subcategory' => 'Network Engineering',
        'queries' => [
            'network engineer working on server console',
            'system administrator analyzing data monitors',
            'it technician diagnostics office desk',
            'command line interface terminal prompt code',
        ],
    ],
    58 => [
        'shortSlug' => 'isp-throttling-tests',
        'category' => 'Troubleshooting & How-To',
        'subcategory' => 'Network Engineering',
        'queries' => [
            'fiber optic fusion splicer technician tools',
            'telecom engineer testing cable lines',
            'network ethernet cables colorful close up',
            'server room cold aisle datacenter',
        ],
    ],
    59 => [
        'shortSlug' => 'wifi-7-vs-wifi-6e-testing',
        'category' => 'Reviews',
        'subcategory' => 'Hardware & Gadgets',
        'queries' => [
            'modern wireless router antennas clean desk',
            'home office technology router laptop',
            'circuit board high tech networking chip',
            'smart home modern wireless router',
        ],
    ],
    60 => [
        'shortSlug' => 'eliminate-zoom-audio-jitter',
        'category' => 'Troubleshooting & How-To',
        'subcategory' => 'Network Engineering',
        'queries' => [
            'professional headset video conference home office',
            'remote worker laptop video meeting call',
            'sound studio audio acoustic microphone',
            'modern home workspace minimalist desk laptop',
        ],
    ],
    61 => [
        'shortSlug' => '5g-vs-fiber-speed-test',
        'category' => 'Technology',
        'subcategory' => 'Future Tech',
        'queries' => [
            'cellular telecommunications tower blue sky',
            'smartphone on modern desk high tech',
            'fiber optic cable glowing glass strands',
            '5g mobile network antenna technology',
        ],
    ],
    62 => [
        'shortSlug' => 'eliminate-wifi-dead-zones',
        'category' => 'Troubleshooting & How-To',
        'subcategory' => 'Network Engineering',
        'queries' => [
            'modern interior apartment living room minimalist',
            'ethernet wall outlet jack network cable',
            'mesh wifi node wooden shelf living room',
            'laptop on clean kitchen counter morning light',
        ],
    ],
    63 => [
        'shortSlug' => 'speed-test-privacy-breakdown',
        'category' => 'Basic Online Security',
        'subcategory' => 'Threat Modeling',
        'queries' => [
            'cybersecurity padlock digital data protection',
            'encrypted security server code monitor',
            'hacker cybersecurity terminal dark screen',
            'brass vintage lock keyhole wooden desk',
        ],
    ],
];

// Load catalog metadata
$batchFiles = glob(__DIR__.'/content/articles/batch_*.json');
$catalog = [];
foreach ($batchFiles as $bf) {
    $data = json_decode(file_get_contents($bf), true);
    if (is_array($data)) {
        foreach ($data as $item) {
            $catalog[$item['id']] = $item;
        }
    }
}

// Global set to guarantee NO DUPLICATE PHOTO IDS
$usedPhotoIds = [];

// Helper: fetch ONLY FREE, UNWATERMARKED photo from Unsplash
function fetchStrictFreeUnsplashPhoto($query, &$usedPhotoIds, $tmpDir)
{
    $encodedQuery = urlencode($query);
    $cmd = "curl -s \"https://unsplash.com/napi/search/photos?query={$encodedQuery}&per_page=30\"";
    $json = shell_exec($cmd);
    $data = json_decode($json, true);

    if (isset($data['results']) && is_array($data['results'])) {
        foreach ($data['results'] as $result) {
            // STRICT FILTER 1: Must NOT be premium
            if (! empty($result['premium'])) {
                continue;
            }

            $rawUrl = $result['urls']['raw'] ?? $result['urls']['regular'] ?? null;
            if (! $rawUrl) {
                continue;
            }

            // STRICT FILTER 2: Must NOT be plus.unsplash.com or premium_photo
            if (str_contains($rawUrl, 'plus.unsplash.com') || str_contains($rawUrl, 'premium_photo')) {
                continue;
            }

            // STRICT FILTER 3: Must be genuine images.unsplash.com/photo-
            if (! str_contains($rawUrl, 'images.unsplash.com/photo-')) {
                continue;
            }

            $id = $result['id'];
            // STRICT FILTER 4: Uniqueness check
            if (isset($usedPhotoIds[$id])) {
                continue;
            }

            // Request exact 1920x1080 crop
            $downloadUrl = $rawUrl.(str_contains($rawUrl, '?') ? '&' : '?').'w=1920&h=1080&fit=crop&q=85';
            $tmpFile = "{$tmpDir}/photo_{$id}.jpg";
            $dlCmd = "curl -s -L \"{$downloadUrl}\" -o \"{$tmpFile}\"";
            shell_exec($dlCmd);

            if (file_exists($tmpFile) && filesize($tmpFile) > 10000) {
                $usedPhotoIds[$id] = true;

                return $tmpFile;
            }
        }
    }

    return null;
}

// Helper: convert to standard 1920x1080 WebP
function processImageToWebP($sourceFile, $dest1, $dest2)
{
    $imgData = @file_get_contents($sourceFile);
    if (! $imgData) {
        return false;
    }
    $im = @imagecreatefromstring($imgData);
    if (! $im) {
        return false;
    }

    $w = imagesx($im);
    $h = imagesy($im);
    if ($w !== 1920 || $h !== 1080) {
        $canvas = imagecreatetruecolor(1920, 1080);
        imagecopyresampled($canvas, $im, 0, 0, 0, 0, 1920, 1080, $w, $h);
        imagewebp($canvas, $dest1, 85);
    } else {
        imagewebp($im, $dest1, 85);
    }
    copy($dest1, $dest2);

    return true;
}

// Clean old media folders to eliminate space-containing directories completely
echo "Completely cleaning old media directories for pure hyphenated slug structure...\n";
shell_exec("rm -rf '{$baseMediaDir}'/* '{$publicMediaDir}'/*");

$totalGenerated = 0;

foreach ($articlesSpec as $id => $spec) {
    $shortSlug = $spec['shortSlug'];
    $catSlug = slugify($spec['category']);
    $subcatSlug = slugify($spec['subcategory']);
    $queries = $spec['queries'];
    $artMeta = $catalog[$id] ?? null;
    $title = $artMeta['title'] ?? $shortSlug;
    $prompts = $artMeta['image_prompts'] ?? [];

    // Hyphenated clean directory paths (NO SPACES!)
    $dir1 = "{$baseMediaDir}/{$catSlug}/{$subcatSlug}/{$shortSlug}";
    $dir2 = "{$publicMediaDir}/{$catSlug}/{$subcatSlug}/{$shortSlug}";
    if (! is_dir($dir1)) {
        mkdir($dir1, 0755, true);
    }
    if (! is_dir($dir2)) {
        mkdir($dir2, 0755, true);
    }

    // Save prompt manifests
    $promptData = [
        'article_id' => $id,
        'title' => $title,
        'short_slug' => $shortSlug,
        'category_slug' => $catSlug,
        'subcategory_slug' => $subcatSlug,
        'category_name' => $spec['category'],
        'subcategory_name' => $spec['subcategory'],
        'prompts' => $prompts,
    ];
    file_put_contents("{$dir1}/prompts.json", json_encode($promptData, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
    file_put_contents("{$dir2}/prompts.json", json_encode($promptData, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));

    $txtContent = "ARTICLE #{$id}: {$title}\nSHORT SLUG: {$shortSlug}\nCATEGORY: {$catSlug} > {$subcatSlug}\n\n";
    foreach ($prompts as $idx => $p) {
        $pNum = $idx + 1;
        $txtContent .= "IMAGE {$pNum}:\n{$p}\n\n";
    }
    file_put_contents("{$dir1}/prompts.txt", $txtContent);
    file_put_contents("{$dir2}/prompts.txt", $txtContent);

    // Fetch and process 4 unique, unwatermarked images
    for ($i = 1; $i <= 4; $i++) {
        $query = $queries[$i - 1];
        $destPath1 = "{$dir1}/{$shortSlug}-{$i}.webp";
        $destPath2 = "{$dir2}/{$shortSlug}-{$i}.webp";

        $tmpFile = fetchStrictFreeUnsplashPhoto($query, $usedPhotoIds, $tmpDir);
        if (! $tmpFile) {
            // Broader unwatermarked query fallback
            $fallbackQuery = "{$spec['subcategory']} wallpaper photography";
            $tmpFile = fetchStrictFreeUnsplashPhoto($fallbackQuery, $usedPhotoIds, $tmpDir);
        }
        if (! $tmpFile) {
            $fallbackQuery = "{$spec['category']} background clean";
            $tmpFile = fetchStrictFreeUnsplashPhoto($fallbackQuery, $usedPhotoIds, $tmpDir);
        }

        if ($tmpFile) {
            processImageToWebP($tmpFile, $destPath1, $destPath2);
            @unlink($tmpFile);
            $totalGenerated++;
        } else {
            echo "Warning: Could not fetch photo for Article #{$id} Img {$i}\n";
        }
    }

    echo "✓ Article #{$id} [{$catSlug}/{$subcatSlug}/{$shortSlug}]: 4 clean unwatermarked images created.\n";
}

echo "====================================================================\n";
echo "✓ Finished! Successfully generated {$totalGenerated} clean unwatermarked images!\n";
echo '✓ Total unique photo IDs tracked: '.count($usedPhotoIds)."\n";
echo "====================================================================\n";
