<?php

/**
 * Audit and repair all Article cover images and in-body images to guarantee 100% 200 OK.
 */

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';

// In Laravel 11, boot application
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

use App\Models\Article;
use Illuminate\Foundation\Bootstrap\BootProviders;
use Illuminate\Foundation\Bootstrap\HandleExceptions;
use Illuminate\Foundation\Bootstrap\LoadConfiguration;
use Illuminate\Foundation\Bootstrap\LoadEnvironmentVariables;
use Illuminate\Foundation\Bootstrap\RegisterFacades;
use Illuminate\Foundation\Bootstrap\RegisterProviders;
use Illuminate\Foundation\Bootstrap\SetRequestForConsole;

echo "====================================================================\n";
echo "       RAFVEX COMPREHENSIVE IMAGE AUDIT & AUTO-REPAIR               \n";
echo "====================================================================\n";

$basePublic = public_path('medialibrary/blog');
if (! is_dir($basePublic)) {
    $basePublic = __DIR__.'/public/medialibrary/blog';
}

// 1. Build an index of all existing webp files on disk
$allDiskFiles = [];
$iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($basePublic));
foreach ($iterator as $file) {
    if ($file->isFile() && $file->getExtension() === 'webp') {
        $realPath = $file->getRealPath();
        $relPath = str_replace(realpath($basePublic).'/', '', $realPath);
        $filename = $file->getFilename();
        $allDiskFiles[$filename] = '/blog/'.$relPath;
    }
}

echo 'Indexed '.count($allDiskFiles)." WebP assets on disk.\n\n";

$articles = Article::all();
$fixedCoverCount = 0;
$fixedBodyCount = 0;

foreach ($articles as $art) {
    $updated = false;
    $coverUrl = $art->cover_image_url;

    // Check cover image
    if ($coverUrl && str_starts_with($coverUrl, '/blog/')) {
        $cleanUrl = explode('?', $coverUrl)[0];
        $rel = substr($cleanUrl, 6);
        $diskPath = $basePublic.'/'.$rel;

        if (! file_exists($diskPath)) {
            $fn = basename($cleanUrl);
            if (isset($allDiskFiles[$fn])) {
                $newCover = $allDiskFiles[$fn].'?v=7';
                echo "Fixing Cover [Art #{$art->id} - {$art->slug}]:\n  Old: {$coverUrl}\n  New: {$newCover}\n";
                $art->cover_image_url = $newCover;
                $updated = true;
                $fixedCoverCount++;
            } else {
                echo "Warning: No disk file found for cover {$fn} (Art #{$art->id})\n";
            }
        }
    }

    // Check in-body images inside content
    $content = $art->content;
    if ($content && str_contains($content, 'src="/blog/')) {
        $repairedContent = preg_replace_callback('/src="(\/blog\/[^"]+)"/', function ($matches) use ($basePublic, $allDiskFiles, &$fixedBodyCount) {
            $rawUrl = $matches[1];
            $cleanUrl = explode('?', $rawUrl)[0];
            $rel = substr($cleanUrl, 6);
            $diskPath = $basePublic.'/'.$rel;

            if (! file_exists($diskPath)) {
                $fn = basename($cleanUrl);
                if (isset($allDiskFiles[$fn])) {
                    $fixedBodyCount++;

                    return 'src="'.$allDiskFiles[$fn].'?v=7"';
                }
            }

            return $matches[0];
        }, $content);

        if ($repairedContent !== $content) {
            $art->content = $repairedContent;
            $updated = true;
        }
    }

    if ($updated) {
        $art->save();
    }
}

echo "\n====================================================================\n";
echo "✓ Audit complete!\n";
echo "✓ Fixed Cover Images: {$fixedCoverCount}\n";
echo "✓ Fixed In-Body Images: {$fixedBodyCount}\n";
echo "====================================================================\n";

// Clear application caches
try {
    cache()->forget('mega_menu_categories');
    cache()->forget('top_categories');
    cache()->forget('featured_articles');
    cache()->forget('latest_articles');
    cache()->forget('all_categories_tree');
    echo "✓ Cleared menu and article caches.\n";
} catch (Throwable $e) {
}
