<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';

use App\Models\Article;
use App\Models\Category;
use App\Models\User;
use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Facades\DB;

$kernel = $app->make(Kernel::class);
$kernel->bootstrap();

echo "====================================================================\n";
echo "   RAFVEX: POSTING 'THE LOST WALLET' STORY WITH YOUTUBE VIDEO       \n";
echo "====================================================================\n\n";

try {
    DB::connection()->getPdo();
    echo "✓ Database connection established successfully.\n";
} catch (Throwable $e) {
    echo '⚠ Notice: Cannot connect to MySQL on localhost: '.$e->getMessage()."\n";
    echo "ℹ The article is fully registered in compiled_articles_cache.json and articles_manifest.json.\n";
    echo "ℹ Start MySQL in XAMPP Control Panel and run this script again:\n";
    echo "    php post_the_lost_wallet_story.php\n";
    exit(1);
}

// 1. Author
$author = User::first();
if (! $author) {
    $author = User::create([
        'name' => 'Mr. Soporadara Rin',
        'email' => 'rafvexofficial@gmail.com',
        'password' => bcrypt('RafvexResearch2026!'),
        'email_verified_at' => now(),
    ]);
}
$authorId = $author->id;

// 2. Parent Category: English Reading Stories
$parentCat = Category::firstOrCreate(
    ['slug' => 'english-reading-stories'],
    [
        'name' => 'English Reading Stories',
        'description' => 'Comprehensive inspiring English stories, reading practice, and vocabulary building.',
        'status' => 'active',
        'featured' => true,
    ]
);

// 3. Subcategory: Short Stories
$subCat = Category::firstOrCreate(
    ['slug' => 'short-stories'],
    [
        'parent_id' => $parentCat->id,
        'name' => 'Short Stories',
        'description' => 'Engaging and thought-provoking short stories with moral lessons and listening practice.',
        'status' => 'active',
        'featured' => false,
    ]
);

// 4. Load from content/articles/the_lost_wallet.json
$jsonPath = __DIR__.'/content/articles/the_lost_wallet.json';
if (! file_exists($jsonPath)) {
    echo "✗ Error: the_lost_wallet.json not found!\n";
    exit(1);
}

$data = json_decode(file_get_contents($jsonPath), true);
$slug = $data['slug'];
$title = $data['title'];
$videoUrl = $data['video_url'];
$htmlContent = $data['html_content'];
$excerpt = $data['meta_description'];

$article = Article::where('slug', $slug)->first();

if ($article) {
    $article->update([
        'category_id' => $subCat->id,
        'title' => $title,
        'excerpt' => $excerpt,
        'content' => $htmlContent,
        'cover_image_url' => $data['cover_image_url'],
        'cover_image_alt' => $data['cover_image_alt'],
        'video_url' => $videoUrl,
        'meta_title' => $data['seo_meta_title'],
        'meta_description' => $data['meta_description'],
        'status' => 'published',
        'published_at' => $article->published_at ?? now(),
        'reading_time' => 7,
        'featured' => true,
        'allow_comments' => true,
        'ai_assisted' => true,
    ]);
    echo "✓ Existing article updated successfully!\n";
} else {
    $article = Article::create([
        'user_id' => $authorId,
        'category_id' => $subCat->id,
        'title' => $title,
        'slug' => $slug,
        'excerpt' => $excerpt,
        'content' => $htmlContent,
        'content_raw' => null,
        'status' => 'published',
        'published_at' => now(),
        'cover_image_url' => $data['cover_image_url'],
        'cover_image_alt' => $data['cover_image_alt'],
        'video_url' => $videoUrl,
        'meta_title' => $data['seo_meta_title'],
        'meta_description' => $data['meta_description'],
        'reading_time' => 7,
        'featured' => true,
        'allow_comments' => true,
        'ai_assisted' => true,
    ]);
    echo "✓ New article created and published successfully!\n";
}

echo "\nArticle Details:\n";
echo '  ID: '.$article->id."\n";
echo '  Title: '.$article->title."\n";
echo '  Slug: '.$article->slug."\n";
echo '  Category: '.$parentCat->name.' > '.$subCat->name."\n";
echo '  Video URL: '.$article->video_url."\n";
echo '  Status: '.$article->status."\n";
echo '  Live URL: https://rafvex.com/article/'.$article->slug."\n";
echo "====================================================================\n";
