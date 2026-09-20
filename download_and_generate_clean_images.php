<?php

ini_set('memory_limit', '512M');
set_time_limit(600);

$baseMediaDir = '/Applications/XAMPP/xamppfiles/htdocs/Rafelblog/Media Library/blog';
$publicMediaDir = '/Applications/XAMPP/xamppfiles/htdocs/Rafelblog/public/medialibrary/blog';

$articlesJsonFiles = glob('/Applications/XAMPP/xamppfiles/htdocs/Rafelblog/content/articles/batch_*.json');
$allArticles = [];
foreach ($articlesJsonFiles as $jsonFile) {
    $data = json_decode(file_get_contents($jsonFile), true);
    if (is_array($data)) {
        $allArticles = array_merge($allArticles, $data);
    }
}
usort($allArticles, fn ($a, $b) => $a['id'] <=> $b['id']);

// Curated high-resolution Unsplash photo IDs for each category / theme (1920x1080)
$curatedPhotos = [
    // Mobile / Android / iOS
    'mobile' => [
        'photo-1511707171634-5f897ff02aa9',
        'photo-1598327105666-5b89351aff97',
        'photo-1580910051074-3eb694886505',
        'photo-1563206767-5b18f218e8de',
        'photo-1510557880182-3d4d3cba35a5',
        'photo-1592750475338-74b7b21085ab',
        'photo-1565849904461-04a58ad377e0',
        'photo-1512499617640-c74ae3a79d37',
    ],
    // Desktop / macOS / Windows / Hardware
    'desktop' => [
        'photo-1517336714731-489689fd1ca8',
        'photo-1588872657578-7efd1f1555ed',
        'photo-1527443224154-c4a3942d3acf',
        'photo-1498050108023-c5249f4df085',
        'photo-1611186871348-b1ce696e52c9',
        'photo-1541807084-5c52b6b3adef',
        'photo-1593642632823-8f785ba67e45',
        'photo-1547394765-185e1e68f34e',
    ],
    // AI / Machine Learning / Data Science
    'ai' => [
        'photo-1620712943543-bcc4688e7485',
        'photo-1677442136019-21780efad99a',
        'photo-1618005182384-a83a8bd57fbe',
        'photo-1633419461186-7d40a38105ec',
        'photo-1451187580459-43490279c0fa',
        'photo-1555066931-4365d14bab8c',
        'photo-1551288049-bebda4e38f71',
        'photo-1460925895917-afdab827c52f',
    ],
    // Security / Privacy / Encryption
    'security' => [
        'photo-1550751827-4bd374c3f58b',
        'photo-1563013544-824ae1b704d3',
        'photo-1555949963-aa79dcee981c',
        'photo-1563986768609-322da13575f3',
        'photo-1614064642639-e398cf05badb',
        'photo-1510511459019-5dda7724fd87',
        'photo-1586769852044-692d6e3703f0',
        'photo-1526374965328-7f61d4dc18c5',
    ],
    // Academic / Students / Research / Library
    'academic' => [
        'photo-1497633762265-9d179a990aa6',
        'photo-1434030216411-0b793f4b4173',
        'photo-1523240795612-9a054b0db644',
        'photo-1516321318423-f06f85e504b3',
        'photo-1457369804613-52c61a468e7d',
        'photo-1481627834876-b7833e8f5570',
        'photo-1532012164546-f432f2e3777a',
        'photo-1524995997946-a1c2e315a42f',
    ],
    // Gadgets / Peripherals (Headphones, Mouse, Audio)
    'gadgets' => [
        'photo-1505740420928-5e560c06d30e',
        'photo-1546435770-a3e426bf472b',
        'photo-1484704849700-f032a568e944',
        'photo-1583394838336-acd977736f90',
        'photo-1615663245857-ac93bb7c39e7',
        'photo-1527864550417-7fd91fc51a46',
        'photo-1544197150-b99a580bb7a8',
        'photo-1558494949-ef010cbdcc31',
    ],
    // Stories / Nature / Lanterns / Mountains (Literary)
    'stories' => [
        'photo-1509198397868-475647b2a1e5', // Japanese glowing paper lanterns
        'photo-1513836279014-a89f7a76ae86', // Lantern alley twilight
        'photo-1542051841857-5f90071e7989', // Traditional wooden atelier
        'photo-1503899036084-c55cdd92da26', // Warm glowing lanterns
        'photo-1464822759023-fed622ff2c3b', // Majestic granite mountain peaks
        'photo-1506744038136-46273834b3fb', // Misty alpine pine valley
        'photo-1470071459604-3b5ec3a7fe05', // Ancient pine tree on cliff in fog
        'photo-1519681393784-d120267933ba', // Mountain sunrise glow
    ],
    // Writing / Productivity / Knowledge
    'productivity' => [
        'photo-1455390582262-044cdead277a',
        'photo-1517842645767-c639042777db',
        'photo-1506784983877-45594efa4cbe',
        'photo-1499750310107-5fef28a66643',
        'photo-1486312338219-ce68d2c6f44d',
        'photo-1531403009284-440f080d1e12',
        'photo-1507525428034-b723cf961d3e',
        'photo-1518495973542-4542c06a5843',
    ],
];

// Pre-cache downloaded images to avoid re-downloading duplicate photo IDs
$cacheDir = __DIR__.'/storage/app/photo_cache';
if (! is_dir($cacheDir)) {
    mkdir($cacheDir, 0755, true);
}

// Helper to download or generate a clean 1920x1080 WebP image
function getCleanPhoto($photoId, $cacheDir)
{
    $cachedFile = "{$cacheDir}/{$photoId}.webp";
    if (file_exists($cachedFile) && filesize($cachedFile) > 10000) {
        return $cachedFile;
    }

    $url = "https://images.unsplash.com/{$photoId}?auto=format&fit=crop&w=1920&h=1080&q=85";
    $ctx = stream_context_create([
        'http' => [
            'timeout' => 20,
            'header' => "User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36\r\n",
        ],
    ]);

    $data = @file_get_contents($url, false, $ctx);
    if ($data) {
        $im = @imagecreatefromstring($data);
        if ($im) {
            $w = imagesx($im);
            $h = imagesy($im);
            if ($w !== 1920 || $h !== 1080) {
                $canvas = imagecreatetruecolor(1920, 1080);
                imagecopyresampled($canvas, $im, 0, 0, 0, 0, 1920, 1080, $w, $h);
                imagewebp($canvas, $cachedFile, 85);
                imagedestroy($canvas);
            } else {
                imagewebp($im, $cachedFile, 85);
            }
            imagedestroy($im);

            return $cachedFile;
        }
    }

    // Fallback: Elegant clean dark gradient card without any text
    $im = imagecreatetruecolor(1920, 1080);
    $bg1 = [30, 41, 59];
    $bg2 = [15, 23, 42];
    for ($y = 0; $y < 1080; $y++) {
        $ratio = $y / 1080;
        $r = (int) ($bg1[0] * (1 - $ratio) + $bg2[0] * $ratio);
        $g = (int) ($bg1[1] * (1 - $ratio) + $bg2[1] * $ratio);
        $b = (int) ($bg1[2] * (1 - $ratio) + $bg2[2] * $ratio);
        $c = imagecolorallocate($im, $r, $g, $b);
        imageline($im, 0, $y, 1920, $y, $c);
    }
    imagewebp($im, $cachedFile, 85);
    imagedestroy($im);

    return $cachedFile;
}

echo "Generating clean 1920x1080 images for all 53 articles without any text prompts...\n";

$count = 0;
foreach ($allArticles as $art) {
    $id = $art['id'];
    $slug = $art['slug'];
    $cat = $art['category'];
    $subcat = $art['subcategory'];

    // Select theme pool
    if (in_array($id, [41, 52])) {
        $pool = [$curatedPhotos['stories'][0], $curatedPhotos['stories'][1], $curatedPhotos['stories'][2], $curatedPhotos['stories'][3]]; // Lanterns
    } elseif (in_array($id, [43, 53])) {
        $pool = [$curatedPhotos['stories'][4], $curatedPhotos['stories'][5], $curatedPhotos['stories'][6], $curatedPhotos['stories'][7]]; // Mountain & Seed
    } elseif (in_array($id, [42])) {
        $pool = [$curatedPhotos['stories'][5], $curatedPhotos['stories'][7], $curatedPhotos['productivity'][6], $curatedPhotos['productivity'][7]]; // Feelings
    } elseif (in_array($id, [46, 50])) {
        $pool = [$curatedPhotos['gadgets'][0], $curatedPhotos['gadgets'][1], $curatedPhotos['gadgets'][2], $curatedPhotos['gadgets'][3]]; // Headphones
    } elseif (in_array($id, [47])) {
        $pool = [$curatedPhotos['gadgets'][4], $curatedPhotos['gadgets'][5], $curatedPhotos['gadgets'][6], $curatedPhotos['gadgets'][7]]; // Mouse
    } elseif (in_array($id, [48])) {
        $pool = [$curatedPhotos['gadgets'][6], $curatedPhotos['gadgets'][7], $curatedPhotos['security'][7], $curatedPhotos['security'][0]]; // Network
    } elseif (in_array($id, [1, 3, 4, 5, 21, 22, 23, 24, 49])) {
        $pool = $curatedPhotos['mobile'];
    } elseif (in_array($id, [6, 7, 8, 25, 26, 27, 44])) {
        $pool = $curatedPhotos['desktop'];
    } elseif (in_array($id, [15, 16, 17, 35, 36, 37])) {
        $pool = $curatedPhotos['security'];
    } elseif (in_array($id, [2, 18, 19, 20, 38, 39, 40])) {
        $pool = $curatedPhotos['academic'];
    } elseif (in_array($id, [12, 13, 14, 32, 33, 34])) {
        $pool = $curatedPhotos['productivity'];
    } else {
        $pool = $curatedPhotos['ai'];
    }

    $destDir1 = "{$baseMediaDir}/{$cat}/{$subcat}/{$slug}";
    $destDir2 = "{$publicMediaDir}/{$cat}/{$subcat}/{$slug}";
    if (! is_dir($destDir1)) {
        mkdir($destDir1, 0755, true);
    }
    if (! is_dir($destDir2)) {
        mkdir($destDir2, 0755, true);
    }

    for ($p = 1; $p <= 4; $p++) {
        $photoId = $pool[($p - 1) % count($pool)];
        $destPath1 = "{$destDir1}/{$slug}-img-{$p}.webp";
        $destPath2 = "{$destDir2}/{$slug}-img-{$p}.webp";
        $cachedFile = getCleanPhoto($photoId, $cacheDir);
        copy($cachedFile, $destPath1);
        copy($cachedFile, $destPath2);
        $count++;
    }

    echo "Processed Article #{$id}: {$slug}\n";
}

echo "Successfully generated {$count} clean 1920x1080 images across all 53 articles!\n";
