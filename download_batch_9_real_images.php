<?php

ini_set('memory_limit', '1024M');
set_time_limit(600);

echo "====================================================================\n";
echo "   DOWNLOADING 100% REAL, COPYRIGHT-FREE PHOTOS FOR BATCH 9 (54-63) \n";
echo "====================================================================\n";

require __DIR__.'/vendor/autoload.php';
use Illuminate\Support\Str;

$baseMediaDir = __DIR__.'/Media Library/blog';
$publicMediaDir = __DIR__.'/public/medialibrary/blog';
$tmpDir = __DIR__.'/storage/app/tmp_batch9_photos';
if (! is_dir($tmpDir)) {
    mkdir($tmpDir, 0755, true);
}

function slugify($text)
{
    return Str::slug($text);
}

$articlesSpec = [
    54 => [
        'shortSlug' => 'top-5-speed-test-websites',
        'category' => 'Reviews',
        'subcategory' => 'Tech Reviews',
        'title' => 'Top 5 Popular Websites to Speed Test Your Network in 2026 (Ranked by Real User Experience)',
        'queries' => [
            'datacenter server room glowing optical fiber',
            'computer network speed test dashboard',
            'server rack blue led lights patch cables',
            'network engineer workstation monitoring',
        ],
    ],
    55 => [
        'shortSlug' => 'speedtest-fast-games-lag',
        'category' => 'Troubleshooting & How-To',
        'subcategory' => 'Network Engineering',
        'title' => 'Why Your Speed Test Shows 100 Mbps But Games Still Lag: The Bufferbloat & Jitter Breakdown',
        'queries' => [
            'esports gaming station mechanical keyboard',
            'gamer headphones computer monitor neon',
            'gaming computer setup illuminated desk',
            'fiber optic router wifi antennas',
        ],
    ],
    56 => [
        'shortSlug' => 'dns-speed-lookup-guide',
        'category' => 'Technology',
        'subcategory' => 'Future Tech',
        'title' => 'The Ultimate DNS Speed & Lookup Guide: How Switching to 1.1.1.1 or 8.8.8.8 Cuts Latency',
        'queries' => [
            'internet fiber optic communications glowing',
            'server room data networking cables rack',
            'code terminal dark screen programmer',
            'digital technology data routing glass fiber',
        ],
    ],
    57 => [
        'shortSlug' => 'diagnose-network-tech-questions',
        'category' => 'Troubleshooting & How-To',
        'subcategory' => 'Network Engineering',
        'title' => 'How to Ask Better Tech Questions and Diagnose Network Problems Like a Senior Systems Engineer',
        'queries' => [
            'network engineer troubleshooting server console',
            'system administrator dual monitors code desk',
            'it support technician laptop diagnostic',
            'command line interface terminal prompt code',
        ],
    ],
    58 => [
        'shortSlug' => 'isp-throttling-tests',
        'category' => 'Troubleshooting & How-To',
        'subcategory' => 'Network Engineering',
        'title' => 'Is Your ISP Secretly Throttling Your Internet? 5 Diagnostic Tests to Prove It Before You Call Support',
        'queries' => [
            'fiber optic cable testing technician tool',
            'network technician inspecting ethernet cables',
            'telecom cable wiring server rack',
            'data center cold aisle server racks',
        ],
    ],
    59 => [
        'shortSlug' => 'wifi-7-vs-wifi-6e-testing',
        'category' => 'Reviews',
        'subcategory' => 'Hardware & Gadgets',
        'title' => 'Wi-Fi 7 vs Wi-Fi 6E Real-World Testing: Is the 320 MHz Upgrade Actually Worth It in 2026?',
        'queries' => [
            'modern wifi router antennas clean desk',
            'wireless router home office tech setup',
            'computer motherboard microchip circuit',
            'smart home wireless router shelf',
        ],
    ],
    60 => [
        'shortSlug' => 'eliminate-zoom-audio-jitter',
        'category' => 'Troubleshooting & How-To',
        'subcategory' => 'Network Engineering',
        'title' => 'The Hidden Killer of Zoom and Teams Calls: How to Measure and Eliminate Audio Jitter and Packet Jitter',
        'queries' => [
            'professional headset video conference workspace',
            'remote worker laptop video call home office',
            'recording studio podcast microphone clean',
            'minimalist home office desk laptop window',
        ],
    ],
    61 => [
        'shortSlug' => '5g-vs-fiber-speed-test',
        'category' => 'Technology',
        'subcategory' => 'Future Tech',
        'title' => '5G Home Internet vs Fiber Broadband Speed Tests: Why 500 Mbps on Mobile Still Buffers 4K Video',
        'queries' => [
            'cellular telecommunications tower blue sky',
            'modern smartphone on wooden desk tech',
            'fiber optic cables glowing light strands',
            'mobile 5g network antenna cellular mast',
        ],
    ],
    62 => [
        'shortSlug' => 'eliminate-wifi-dead-zones',
        'category' => 'Troubleshooting & How-To',
        'subcategory' => 'Network Engineering',
        'title' => 'How to Eliminate Wi-Fi Dead Zones and Cut Ping by 60%: The Network Optimization Blueprint',
        'queries' => [
            'modern apartment living room architecture interior',
            'ethernet network cable wall socket',
            'mesh wifi node bookshelf clean living room',
            'laptop modern kitchen counter sunny morning',
        ],
    ],
    63 => [
        'shortSlug' => 'speed-test-privacy-breakdown',
        'category' => 'Basic Online Security',
        'subcategory' => 'Threat Modeling',
        'title' => 'Speed Test Privacy Breakdown: What Free Speed Tests Actually Collect About Your IP and Hardware',
        'queries' => [
            'cybersecurity padlock lock digital protection',
            'encrypted security code monitor server',
            'hacker terminal computer dark screen',
            'metal brass vintage padlock wood desk',
        ],
    ],
];

$usedPhotoIds = [];

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
            if (isset($usedPhotoIds[$id])) {
                continue;
            }

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
        imagedestroy($canvas);
    } else {
        imagewebp($im, $dest1, 85);
    }
    imagedestroy($im);
    copy($dest1, $dest2);

    return true;
}

$totalGenerated = 0;

foreach ($articlesSpec as $id => $spec) {
    $shortSlug = $spec['shortSlug'];
    $catSlug = slugify($spec['category']);
    $subcatSlug = slugify($spec['subcategory']);
    $queries = $spec['queries'];
    $title = $spec['title'];

    $dir1 = "{$baseMediaDir}/{$catSlug}/{$subcatSlug}/{$shortSlug}";
    $dir2 = "{$publicMediaDir}/{$catSlug}/{$subcatSlug}/{$shortSlug}";
    if (! is_dir($dir1)) {
        mkdir($dir1, 0755, true);
    }
    if (! is_dir($dir2)) {
        mkdir($dir2, 0755, true);
    }

    $promptData = [
        'article_id' => $id,
        'title' => $title,
        'short_slug' => $shortSlug,
        'category_slug' => $catSlug,
        'subcategory_slug' => $subcatSlug,
        'category_name' => $spec['category'],
        'subcategory_name' => $spec['subcategory'],
        'image_type' => '100% genuine real-world photography (non-AI, copyright-free from Unsplash)',
    ];
    file_put_contents("{$dir1}/prompts.json", json_encode($promptData, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
    file_put_contents("{$dir2}/prompts.json", json_encode($promptData, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));

    for ($i = 1; $i <= 4; $i++) {
        $query = $queries[$i - 1];
        $destPath1 = "{$dir1}/{$shortSlug}-{$i}.webp";
        $destPath2 = "{$dir2}/{$shortSlug}-{$i}.webp";

        if (file_exists($destPath1) && filesize($destPath1) > 5000) {
            echo "  Image {$i} already exists for #{$id}\n";
            $totalGenerated++;

            continue;
        }

        $tmpFile = fetchStrictFreeUnsplashPhoto($query, $usedPhotoIds, $tmpDir);
        if (! $tmpFile) {
            $fallback = 'network technology hardware';
            $tmpFile = fetchStrictFreeUnsplashPhoto($fallback, $usedPhotoIds, $tmpDir);
        }

        if ($tmpFile) {
            processImageToWebP($tmpFile, $destPath1, $destPath2);
            @unlink($tmpFile);
            $totalGenerated++;
            echo "  ✓ Generated Img {$i} for #{$id} [{$shortSlug}-{$i}.webp]\n";
        } else {
            echo "  ✗ Failed fetching photo for #{$id} Img {$i}\n";
        }
    }

    echo "✓ Article #{$id} [{$shortSlug}]: Completed.\n";
}

echo "====================================================================\n";
echo "✓ Total clean real-world photos generated: {$totalGenerated}\n";
echo "====================================================================\n";
