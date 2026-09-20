<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Kernel::class);
$kernel->bootstrap();

use App\Models\Article;
use App\Models\Category;
use App\Models\User;
use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Str;

echo '====================================================================\\n';
echo '       RAFVEX 53 ARTICLES MASTER DATABASE SYNC / SEEDER              \\n';
echo '====================================================================\\n';

$author = User::first();
if (! $author) {
    echo 'Creating default author user...\\n';
    $author = User::create([
        'name' => 'Mr. Soporadara Rin',
        'email' => 'rafvexofficial@gmail.com',
        'password' => bcrypt('RafvexResearch2026!'),
        'email_verified_at' => now(),
    ]);
}
$authorId = $author->id;

// Load precompiled articles cache
$cacheFile = __DIR__.'/content/compiled_articles_cache.json';
if (! file_exists($cacheFile)) {
    exit('Error: compiled_articles_cache.json not found! Run compile_catalog_and_seeders.py first.\\n');
}
$articles = json_decode(file_get_contents($cacheFile), true);
echo 'Loaded '.count($articles).' precompiled articles from cache.\\n';

$categoryCache = [];

foreach ($articles as $art) {
    $catName = $art['category'];
    $subcatName = $art['subcategory'];
    $slug = $art['slug'];
    $title = $art['title'];

    // 1. Ensure Parent Category
    $parentSlug = Str::slug($catName);
    if (! isset($categoryCache[$parentSlug])) {
        $parentCat = Category::firstOrCreate(
            ['slug' => $parentSlug],
            [
                'name' => $catName,
                'description' => "Comprehensive research and guides on {$catName}.",
                'status' => 'active',
                'featured' => true,
            ]
        );
        $categoryCache[$parentSlug] = $parentCat;
    } else {
        $parentCat = $categoryCache[$parentSlug];
    }

    // 2. Ensure Subcategory
    $subcatSlug = Str::slug($subcatName);
    if (! isset($categoryCache[$subcatSlug])) {
        $subCat = Category::firstOrCreate(
            ['slug' => $subcatSlug],
            [
                'parent_id' => $parentCat->id,
                'name' => $subcatName,
                'description' => "In-depth guides and analysis in {$subcatName}.",
                'status' => 'active',
                'featured' => false,
            ]
        );
        $categoryCache[$subcatSlug] = $subCat;
    } else {
        $subCat = $categoryCache[$subcatSlug];
    }

    $htmlContent = $art['html_content'];
    $coverImageUrl = $art['cover_image_url'];
    $coverImageAlt = $art['cover_image_alt'];

    // 3. Update or Create Article in Database
    $dbArticle = Article::updateOrCreate(
        ['slug' => $slug],
        [
            'user_id' => $authorId,
            'category_id' => $subCat->id,
            'title' => $title,
            'excerpt' => $art['meta_description'],
            'content' => $htmlContent,
            'content_raw' => null,
            'status' => 'published',
            'published_at' => now()->subDays(53 - $art['id']),
            'cover_image_url' => $coverImageUrl,
            'cover_image_alt' => $coverImageAlt,
            'meta_title' => $art['seo_meta_title'],
            'meta_description' => $art['meta_description'],
            'reading_time' => max(8, (int) (str_word_count(strip_tags($htmlContent)) / 200)),
            'featured' => in_array($art['id'], [1, 2, 6, 9, 14, 16, 22, 28, 35, 41, 44, 48, 51]),
            'allow_comments' => true,
            'ai_assisted' => true,
        ]
    );

    echo "Synced Article #{$art['id']}: {$title} [ID: {$dbArticle->id}]\\n";
}

echo '====================================================================\\n';
echo '✓ All 53 Articles Successfully Seeded / Updated in Database!        \\n';
echo '====================================================================\\n';
