<?php

/**
 * Clean all raw markdown asterisks (**) from articles table in the database.
 * Converts section headers like **1. Title** into <h2>1. Title</h2> and **bold** into <strong>bold</strong>.
 */

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';

use App\Models\Article;
use Illuminate\Foundation\Bootstrap\BootProviders;
use Illuminate\Foundation\Bootstrap\HandleExceptions;
use Illuminate\Foundation\Bootstrap\LoadConfiguration;
use Illuminate\Foundation\Bootstrap\LoadEnvironmentVariables;
use Illuminate\Foundation\Bootstrap\RegisterFacades;
use Illuminate\Foundation\Bootstrap\RegisterProviders;
use Illuminate\Foundation\Bootstrap\SetRequestForConsole;

if (method_exists($app, 'bootstrapWith')) {
    $app->bootstrapWith([
        LoadEnvironmentVariables::class,
        LoadConfiguration::class,
        HandleExceptions::class,
        RegisterFacades::class,
        SetRequestForConsole::class,
        RegisterProviders::class,
        BootProviders::class,
    ]);
}

echo "=== Cleaning Markdown Asterisks (**) Across All Articles ===\n";

$articles = Article::all();
$cleanedCount = 0;

foreach ($articles as $article) {
    $content = $article->content;
    if (empty($content) || ! str_contains($content, '**')) {
        continue;
    }

    $original = $content;

    // Step 1: Protect code blocks (<pre><code>...</code></pre>)
    $codeBlocks = [];
    $content = preg_replace_callback('/<pre[\s\S]*?<\/pre>/i', function ($matches) use (&$codeBlocks) {
        $codeBlocks[] = $matches[0];

        return '___CODE_BLOCK_'.(count($codeBlocks) - 1).'___';
    }, $content);

    // Step 2: Convert standalone numbered section titles (e.g. "**1. Title**", "<p>**1. Title**</p>", or "**1. Title") into proper H2
    $content = preg_replace_callback('/(?:<p[^>]*>)?\s*\*\*([0-9]+\.[^*\n<]+)(?:\*\*)?\s*(?:<\/p>)?/i', function ($matches) {
        $title = trim(str_replace('**', '', $matches[1]));

        return '<h2 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 mt-8 mb-4 tracking-tight">'.htmlspecialchars($title, ENT_QUOTES, 'UTF-8').'</h2>';
    }, $content);

    // Step 3: Process table cells to convert markdown bold (**text**), italic (*text*), and code (`code`)
    $content = preg_replace_callback('/<(td|th)([^>]*)>([\s\S]*?)<\/\1>/i', function ($matches) {
        $tag = $matches[1];
        $attrs = $matches[2];
        $inner = $matches[3];
        $formatted = preg_replace('/\*\*([^*\n]+)\*\*/', '<strong>$1</strong>', $inner);
        $formatted = str_replace('**', '', $formatted);

        return "<{$tag}{$attrs}>{$formatted}</{$tag}>";
    }, $content);

    // Step 4: Convert standard bold pairs **text** -> <strong>text</strong>
    $content = preg_replace('/\*\*([^*\n<]+)\*\*/', '<strong>$1</strong>', $content);

    // Step 5: Convert any remaining ** at start or end of tags
    $content = preg_replace('/<(p|h[1-6]|li)([^>]*)>\s*\*\*+/i', '<$1$2>', $content);
    $content = preg_replace('/\*\*+\s*<\/(p|h[1-6]|li)>/i', '</$1>', $content);

    // Step 6: Strip ANY leftover stray double asterisks
    $content = str_replace('**', '', $content);

    // Step 7: Restore code blocks intact
    $content = preg_replace_callback('/___CODE_BLOCK_(\d+)___/', function ($matches) use ($codeBlocks) {
        $idx = (int) $matches[1];

        return $codeBlocks[$idx] ?? '';
    }, $content);

    if ($content !== $original) {
        $article->content = $content;
        $article->save();
        $cleanedCount++;
        echo "Cleaned article ID {$article->id}: {$article->slug}\n";
    }
}

echo "Done! Cleaned {$cleanedCount} articles in the database.\n";
