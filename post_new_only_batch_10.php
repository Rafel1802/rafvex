<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';

use App\Models\Article;
use App\Models\Category;
use App\Models\User;
use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

$kernel = $app->make(Kernel::class);
$kernel->bootstrap();

echo "====================================================================\n";
echo "   RAFVEX: SAFE PUBLISH FOR NEW BLOGS ONLY (ZERO TOUCH TO OLD)     \n";
echo "====================================================================\n\n";

// 1. Verify Database Connection
$dbConnected = false;
try {
    DB::connection()->getPdo();
    $dbConnected = true;
    echo "✓ Database connection established successfully.\n\n";
} catch (Throwable $e) {
    echo '⚠ Notice: Cannot connect to MySQL: '.$e->getMessage()."\n";
    echo "ℹ The 5 new blogs are fully prepared in content/articles/batch_10.json and public/medialibrary/blog/.\n";
    echo "ℹ When MySQL is started, run this command to safely post:\n";
    echo "    php post_new_only_batch_10.php\n\n";
}

// 2. Load Batch 10 Articles
$batchFile = __DIR__.'/content/articles/batch_10.json';
if (! file_exists($batchFile)) {
    exit("✗ Error: content/articles/batch_10.json not found!\n");
}

$newArticles = json_decode(file_get_contents($batchFile), true);
if (! is_array($newArticles)) {
    exit("✗ Error: batch_10.json is invalid JSON!\n");
}

echo 'Found '.count($newArticles)." articles in Batch 10:\n";
foreach ($newArticles as $art) {
    echo '  - [#'.$art['id'].'] '.$art['title']."\n";
}
echo "\n";

if (! $dbConnected) {
    echo "Files and media are ready for Git commit and push.\n";
    exit(0);
}

// 3. Resolve Author
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

$shortSlugMap = [
    64 => 'free-speed-test-multi-lang',
    65 => 'ai-network-routing-latency',
    66 => 'gamers-guide-ping-ip-lookup',
    67 => 'tech-english-vocabulary',
    68 => 'ai-english-language-revolution',
];

$categoryCache = [];
$postedCount = 0;
$skippedCount = 0;

foreach ($newArticles as $art) {
    $id = $art['id'];
    $slug = $art['slug'];
    $title = $art['title'];
    $catName = $art['category'];
    $subcatName = $art['subcategory'];
    $shortSlug = $shortSlugMap[$id] ?? $slug;

    // CHECK IF ARTICLE ALREADY EXISTS IN DATABASE
    $existing = Article::where('slug', $slug)->first();
    if ($existing) {
        echo "🛡️  [PRESERVED] Existing article found (slug: {$slug}, ID: {$existing->id}).\n";
        echo "   -> Skipping completely to guarantee NO changes to your edited blogs.\n\n";
        $skippedCount++;

        continue;
    }

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

    // 3. Format Content from Markdown to HTML
    $catSlug = $parentSlug;
    $subSlug = $subcatSlug;
    $markdown = $art['content'];

    // Convert Tables
    $markdown = preg_replace_callback('/((?:\|[^\n]+\|\r?\n)+)/', function ($match) {
        $lines = array_filter(array_map('trim', explode("\n", trim($match[1]))));
        if (count($lines) < 2) {
            return $match[0];
        }
        $html = '<div class="overflow-x-auto my-6"><table class="min-w-full text-left border-collapse border border-slate-200 shadow-xs rounded-lg overflow-hidden">';
        $isHeader = true;
        foreach ($lines as $line) {
            if (preg_match('/^\|(?:\s*:?-+:?\s*\|)+$/', $line)) {
                $isHeader = false;

                continue;
            }
            $cells = array_slice(explode('|', $line), 1, -1);
            $tag = $isHeader ? 'th' : 'td';
            $cls = $isHeader
                ? 'bg-slate-100 dark:bg-slate-800 font-bold p-3 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm'
                : 'p-3 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-sm';
            $html .= '<tr>';
            foreach ($cells as $cell) {
                $cellContent = trim($cell);
                $cellContent = preg_replace('/\*\*(.*?)\*\*/', '<strong>$1</strong>', $cellContent);
                $html .= "<{$tag} class=\"{$cls}\">".$cellContent."</{$tag}>";
            }
            $html .= '</tr>';
        }
        $html .= '</table></div>';

        return $html;
    }, $markdown);

    // Format Headings & Text Styles
    $content = preg_replace('/^### (.*?)$/m', '<h3 class="text-xl font-bold text-slate-900 dark:text-slate-100 mt-6 mb-3">$1</h3>', $markdown);
    $content = preg_replace('/^## (.*?)$/m', '<h2 class="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-8 mb-4">$1</h2>', $content);
    $content = preg_replace('/\*\*(.*?)\*\*/', '<strong>$1</strong>', $content);

    // Code Blocks
    $codeBlocks = [];
    $content = preg_replace_callback('/```([a-zA-Z0-9_-]*)\r?\n([\s\S]*?)```/s', function ($m) use (&$codeBlocks) {
        $lang = ! empty($m[1]) ? htmlspecialchars(trim($m[1]), ENT_QUOTES, 'UTF-8') : 'terminal';
        $code = htmlspecialchars(trim($m[2]), ENT_QUOTES, 'UTF-8');
        $encoded = rawurlencode(trim($m[2]));
        $html = <<<HTML
<div class="code-terminal-block my-6 rounded-2xl overflow-hidden border border-slate-800 bg-[#0f172a] shadow-xl">
  <div class="flex items-center justify-between px-4 py-2.5 bg-[#1e293b] border-b border-slate-700/60">
    <div class="flex items-center gap-2">
      <span class="w-2.5 h-2.5 rounded-full bg-red-500/80"></span>
      <span class="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
      <span class="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
      <span class="text-xs font-mono text-slate-400 ml-2 font-medium">{$lang}</span>
    </div>
    <button class="copy-code-btn" data-code="{$encoded}">
      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
      <span>Copy</span>
    </button>
  </div>
  <pre class="p-4 text-xs sm:text-sm font-mono text-slate-100 overflow-x-auto leading-relaxed"><code>{$code}</code></pre>
</div>
HTML;
        $idx = count($codeBlocks);
        $codeBlocks[$idx] = $html;

        return "\n\n___CODE_BLOCK_{$idx}___\n\n";
    }, $content);

    // Links
    $content = preg_replace('/\[([^\]]+)\]\(([^)]+)\)/', '<a href="$2" class="text-red-600 hover:text-red-700 underline font-semibold">$1</a>', $content);

    // Paragraphs & Lists
    $paragraphs = explode("\n\n", $content);
    $formattedParagraphs = [];
    foreach ($paragraphs as $para) {
        $para = trim($para);
        if (empty($para)) {
            continue;
        }
        if (preg_match('/^___CODE_BLOCK_(\d+)___$/', $para, $cm)) {
            $formattedParagraphs[] = $codeBlocks[(int) $cm[1]] ?? '';
        } elseif (str_starts_with($para, '<h') || str_starts_with($para, '<pre') || str_starts_with($para, '<div') || str_starts_with($para, '<table') || str_starts_with($para, '<figure')) {
            $formattedParagraphs[] = $para;
        } elseif (preg_match('/^(\*|-)\s/', $para)) {
            $listItems = explode("\n", $para);
            $listHtml = '<ul class="list-disc list-inside space-y-2 my-4 text-slate-700 dark:text-slate-300 leading-relaxed">';
            foreach ($listItems as $item) {
                $item = trim(preg_replace('/^(\*|-)\s+/', '', $item));
                if (! empty($item)) {
                    $listHtml .= '<li>'.$item.'</li>';
                }
            }
            $listHtml .= '</ul>';
            $formattedParagraphs[] = $listHtml;
        } else {
            $formattedParagraphs[] = '<p class="text-slate-700 dark:text-slate-300 leading-relaxed my-4">'.nl2br($para).'</p>';
        }
    }

    // Insert Body Images
    $img2 = "<figure class=\"my-8\"><img src=\"/blog/{$catSlug}/{$subSlug}/{$shortSlug}/{$shortSlug}-2.webp?v=7\" alt=\"".htmlspecialchars($title).' - Analysis" class="rounded-2xl shadow-lg w-full object-cover" loading="lazy" /></figure>';
    $img3 = "<figure class=\"my-8\"><img src=\"/blog/{$catSlug}/{$subSlug}/{$shortSlug}/{$shortSlug}-3.webp?v=7\" alt=\"".htmlspecialchars($title).' - In-Depth Review" class="rounded-2xl shadow-lg w-full object-cover" loading="lazy" /></figure>';
    $img4 = "<figure class=\"my-8\"><img src=\"/blog/{$catSlug}/{$subSlug}/{$shortSlug}/{$shortSlug}-4.webp?v=7\" alt=\"".htmlspecialchars($title).' - Key Takeaways" class="rounded-2xl shadow-lg w-full object-cover" loading="lazy" /></figure>';

    $totalParas = count($formattedParagraphs);
    if ($totalParas >= 6) {
        $pos1 = (int) ($totalParas * 0.25);
        $pos2 = (int) ($totalParas * 0.55) + 1;
        $pos3 = (int) ($totalParas * 0.85) + 2;
        array_splice($formattedParagraphs, $pos1, 0, [$img2]);
        array_splice($formattedParagraphs, $pos2, 0, [$img3]);
        array_splice($formattedParagraphs, $pos3, 0, [$img4]);
    }

    $finalHtml = implode("\n\n", $formattedParagraphs);
    $coverImageUrl = "/blog/{$catSlug}/{$subSlug}/{$shortSlug}/{$shortSlug}-1.webp?v=7";
    $coverImageAlt = $art['image_captions']['img1']['title'] ?? $title;

    // POST NEW ARTICLE ONLY (via Article::create)
    $createdArticle = Article::create([
        'user_id' => $authorId,
        'category_id' => $subCat->id,
        'title' => $title,
        'slug' => $slug,
        'excerpt' => $art['meta_description'],
        'content' => $finalHtml,
        'content_raw' => null,
        'status' => 'published',
        'published_at' => now(),
        'cover_image_url' => $coverImageUrl,
        'cover_image_alt' => $coverImageAlt,
        'meta_title' => $art['seo_meta_title'],
        'meta_description' => $art['meta_description'],
        'reading_time' => max(6, (int) (str_word_count(strip_tags($finalHtml)) / 200)),
        'featured' => ($id === 64),
        'allow_comments' => true,
        'ai_assisted' => true,
    ]);

    echo "✅ [POSTED NEW] Article #{$id} created successfully! (DB ID: {$createdArticle->id})\n";
    echo "   Title: {$title}\n";
    echo "   URL: https://rafvex.com/article/{$slug}\n\n";
    $postedCount++;
}

echo "====================================================================\n";
echo "SUMMARY: {$postedCount} new articles posted, {$skippedCount} existing articles preserved.\n";
echo "✓ Zero existing articles were modified or overwritten!\n";
echo "====================================================================\n";
