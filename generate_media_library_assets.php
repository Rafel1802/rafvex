<?php

$baseMediaDir = '/Applications/XAMPP/xamppfiles/htdocs/Rafelblog/Media Library/blog';
$articlesJsonFiles = glob('/Applications/XAMPP/xamppfiles/htdocs/Rafelblog/content/articles/batch_*.json');

$allArticles = [];
foreach ($articlesJsonFiles as $jsonFile) {
    $data = json_decode(file_get_contents($jsonFile), true);
    if (is_array($data)) {
        $allArticles = array_merge($allArticles, $data);
    }
}

// Sort by ID
usort($allArticles, fn($a, $b) => $a['id'] <=> $b['id']);

echo "Loaded " . count($allArticles) . " articles from batches.\n";

$colorPalettes = [
    0 => [ // Golden Sunrise
        'bg_top' => [44, 62, 80],
        'bg_bot' => [230, 126, 34],
        'card'   => [253, 246, 227],
        'text_dark' => [44, 62, 80],
        'accent' => [211, 84, 0],
        'gold'   => [243, 156, 18],
    ],
    1 => [ // Forest Sanctuary
        'bg_top' => [22, 160, 133],
        'bg_bot' => [39, 174, 96],
        'card'   => [254, 250, 236],
        'text_dark' => [26, 37, 48],
        'accent' => [22, 160, 133],
        'gold'   => [214, 137, 16],
    ],
    2 => [ // Twilight Lantern
        'bg_top' => [44, 62, 80],
        'bg_bot' => [142, 68, 173],
        'card'   => [250, 247, 240],
        'text_dark' => [34, 49, 63],
        'accent' => [142, 68, 173],
        'gold'   => [241, 196, 15],
    ],
    3 => [ // Deep Ocean / Evening Calm
        'bg_top' => [41, 128, 185],
        'bg_bot' => [52, 73, 94],
        'card'   => [252, 248, 238],
        'text_dark' => [44, 62, 80],
        'accent' => [41, 128, 185],
        'gold'   => [230, 126, 34],
    ],
];

function drawRoundedRect($im, $x1, $y1, $x2, $y2, $radius, $color) {
    imagefilledrectangle($im, $x1 + $radius, $y1, $x2 - $radius, $y2, $color);
    imagefilledrectangle($im, $x1, $y1 + $radius, $x2, $y2 - $radius, $color);
    imagefilledellipse($im, $x1 + $radius, $y1 + $radius, $radius * 2, $radius * 2, $color);
    imagefilledellipse($im, $x2 - $radius, $y1 + $radius, $radius * 2, $radius * 2, $color);
    imagefilledellipse($im, $x1 + $radius, $y2 - $radius, $radius * 2, $radius * 2, $color);
    imagefilledellipse($im, $x2 - $radius, $y2 - $radius, $radius * 2, $radius * 2, $color);
}

function wordWrapString($string, $maxChars = 90) {
    return explode("\n", wordwrap($string, $maxChars, "\n"));
}

$createdImagesCount = 0;
$createdFoldersCount = 0;

foreach ($allArticles as $art) {
    $cat = $art['category'];
    $subcat = $art['subcategory'];
    $slug = $art['slug'];
    $artId = $art['id'];
    $title = $art['title'];

    $articleDir = "{$baseMediaDir}/{$cat}/{$subcat}/{$slug}";
    if (!is_dir($articleDir)) {
        mkdir($articleDir, 0755, true);
        $createdFoldersCount++;
    }

    // Save prompt text manifest
    $promptsText = "RAFVEX MASTER CATALOG • ARTICLE #{$artId}\n";
    $promptsText .= "Title: {$title}\n";
    $promptsText .= "Category: {$cat} > {$subcat}\n";
    $promptsText .= "Slug: {$slug}\n";
    $promptsText .= "Aspect Ratio: 16:9 (1920x1080)\n\n";

    foreach ($art['image_prompts'] as $idx => $prompt) {
        $pNum = $idx + 1;
        $promptsText .= "--- [PROMPT {$pNum}] ---\n{$prompt}\n\n";

        // Generate 1920x1080 WebP Card
        $im = imagecreatetruecolor(1920, 1080);
        $pal = $colorPalettes[$idx % 4];

        // Gradient Background
        for ($y = 0; $y < 1080; $y++) {
            $ratio = $y / 1080;
            $r = (int)($pal['bg_top'][0] * (1 - $ratio) + $pal['bg_bot'][0] * $ratio);
            $g = (int)($pal['bg_top'][1] * (1 - $ratio) + $pal['bg_bot'][1] * $ratio);
            $b = (int)($pal['bg_top'][2] * (1 - $ratio) + $pal['bg_bot'][2] * $ratio);
            $c = imagecolorallocate($im, $r, $g, $b);
            imageline($im, 0, $y, 1920, $y, $c);
        }

        // Card Container
        $cardColor = imagecolorallocate($im, $pal['card'][0], $pal['card'][1], $pal['card'][2]);
        $accentColor = imagecolorallocate($im, $pal['accent'][0], $pal['accent'][1], $pal['accent'][2]);
        $darkTextColor = imagecolorallocate($im, $pal['text_dark'][0], $pal['text_dark'][1], $pal['text_dark'][2]);
        $goldColor = imagecolorallocate($im, $pal['gold'][0], $pal['gold'][1], $pal['gold'][2]);
        $white = imagecolorallocate($im, 255, 255, 255);
        $mutedGray = imagecolorallocate($im, 100, 110, 120);

        // Draw inner card
        drawRoundedRect($im, 120, 80, 1800, 1000, 36, $cardColor);

        // Top Header Banner inside Card
        drawRoundedRect($im, 150, 110, 1770, 200, 16, $accentColor);

        // Header text
        $headerLine1 = "RAFVEX ARTICLE #{$artId}  |  " . strtoupper($cat) . " > " . strtoupper($subcat);
        imagestring($im, 5, 180, 130, $headerLine1, $white);
        
        $headerLine2 = "IMAGE GENERATION CONCEPT " . $pNum . " OF 4  |  STUDIO GHIBLI-INSPIRED AESTHETIC (16:9 • 1920x1080)";
        imagestring($im, 4, 180, 162, $headerLine2, $goldColor);

        // Article Title Banner
        $titleDisplay = strlen($title) > 90 ? substr($title, 0, 87) . '...' : $title;
        imagestring($im, 5, 180, 240, "ARTICLE:", $accentColor);
        imagestring($im, 5, 270, 240, $titleDisplay, $darkTextColor);

        // Decorative line
        imageline($im, 180, 280, 1740, 280, $accentColor);
        imageline($im, 180, 282, 1740, 282, $goldColor);

        // Prompt Box
        $promptBoxColor = imagecolorallocate($im, 242, 237, 222);
        drawRoundedRect($im, 180, 320, 1740, 850, 20, $promptBoxColor);

        imagestring($im, 5, 220, 350, "OPTIMIZED MIDJOURNEY / IMAGEN / DALL-E PROMPT:", $accentColor);

        // Prompt text wrapping
        $wrappedLines = wordWrapString('"' . $prompt . '"', 85);
        $lineY = 400;
        foreach ($wrappedLines as $wLine) {
            imagestring($im, 5, 220, $lineY, trim($wLine), $darkTextColor);
            $lineY += 35;
        }

        // Specs block in bottom of prompt box
        imageline($im, 220, 720, 1700, 720, $goldColor);
        imagestring($im, 4, 220, 745, "PRIMARY FOCUS KEYWORD: " . $art['primary_keyword'], $mutedGray);
        imagestring($im, 4, 220, 775, "TARGET SLUG: https://rafvex.com/article/" . $slug, $accentColor);
        imagestring($im, 4, 220, 805, "STYLE: Warm natural lighting, wooden workbenches, parchment, clean screens, anime concept art", $mutedGray);

        // Card Footer
        imagestring($im, 4, 180, 920, "RAFVEX PUBLISHING ENGINE  |  OFFICIAL MEDIA LIBRARY ASSET  |  1920x1080 (16:9)", $mutedGray);
        imagestring($im, 4, 1420, 920, "ASSET ID: {$slug}-img-{$pNum}.webp", $accentColor);

        // Save WebP Image
        $imagePath = "{$articleDir}/{$slug}-img-{$pNum}.webp";
        imagewebp($im, $imagePath, 85);
        $createdImagesCount++;
    }

    file_put_contents("{$articleDir}/prompts.txt", $promptsText);
    file_put_contents("{$articleDir}/prompts.json", json_encode([
        'article_id' => $artId,
        'title' => $title,
        'category' => $cat,
        'subcategory' => $subcat,
        'slug' => $slug,
        'image_prompts' => $art['image_prompts']
    ], JSON_PRETTY_PRINT));
}

echo "Successfully generated {$createdImagesCount} 1920x1080 images across {$createdFoldersCount} article folders in Media Library!\n";
