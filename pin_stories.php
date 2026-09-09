<?php
/**
 * Rafvex Homepage Pinned Stories Manager CLI
 *
 * Usage:
 *   Interactive:
 *     php pin_stories.php
 *
 *   Command line flags:
 *     php pin_stories.php --show
 *     php pin_stories.php --list
 *     php pin_stories.php --search="keyword"
 *     php pin_stories.php --lead=17 --featured=8,12 --trending=1,5,9,14
 *     php pin_stories.php --reset
 */

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Article;
use App\Models\Setting;
use Illuminate\Support\Facades\Cache;

function getPinnedData(): array {
    $raw = Setting::where('key', 'pinned_stories')->value('value');
    if (!$raw) return ['lead_id' => null, 'featured_ids' => [], 'trending_ids' => []];
    $data = json_decode($raw, true);
    return is_array($data) ? $data : ['lead_id' => null, 'featured_ids' => [], 'trending_ids' => []];
}

function savePinnedData(array $data): void {
    Setting::updateOrCreate(
        ['key' => 'pinned_stories'],
        [
            'value' => json_encode($data),
            'group' => 'general',
            'label' => 'Pinned Stories'
        ]
    );
    Cache::flush();
}

function printHeader(): void {
    echo "\033[1;31m";
    echo "====================================================================\n";
    echo "            RAFVEX HOMEPAGE PINNED STORIES MANAGER (SSH)             \n";
    echo "====================================================================\n";
    echo "\033[0m";
}

function showCurrentPinned(): void {
    $pinned = getPinnedData();
    echo "\033[1;36m>>> Current Homepage Pinned Stories:\033[0m\n";
    
    // 1. Lead Story
    if (!empty($pinned['lead_id'])) {
        $lead = Article::find($pinned['lead_id']);
        $leadTitle = $lead ? "#{$lead->id} - {$lead->title} ({$lead->category?->name})" : "(Article ID {$pinned['lead_id']} not found)";
        echo "  \033[1;32m[Main Lead Hero (Image 3)]\033[0m: $leadTitle\n";
    } else {
        echo "  \033[1;33m[Main Lead Hero (Image 3)]\033[0m: (Default: Most recent featured story)\n";
    }

    // 2. Top Featured Stories (2)
    echo "  \033[1;32m[Top Featured Stories (2 on Right)]\033[0m:\n";
    if (!empty($pinned['featured_ids'])) {
        foreach ($pinned['featured_ids'] as $idx => $id) {
            $art = Article::find($id);
            $title = $art ? "#{$art->id} - {$art->title} ({$art->category?->name})" : "(Article ID $id not found)";
            echo "    " . ($idx + 1) . ") $title\n";
        }
    } else {
        echo "    (Default: 2 most recent featured stories)\n";
    }

    // 3. Trending on Rafvex (4)
    echo "  \033[1;32m[Trending on Rafvex (4)]\033[0m:\n";
    if (!empty($pinned['trending_ids'])) {
        foreach ($pinned['trending_ids'] as $idx => $id) {
            $art = Article::find($id);
            $title = $art ? "#{$art->id} - {$art->title} ({$art->category?->name})" : "(Article ID $id not found)";
            echo "    " . ($idx + 1) . ") $title\n";
        }
    } else {
        echo "    (Default: 4 highest viewed stories)\n";
    }
    echo "--------------------------------------------------------------------\n";
}

function searchArticles(string $query): void {
    $articles = Article::with('category')
        ->where('status', 'published')
        ->where(function ($q) use ($query) {
            $q->where('title', 'like', "%{$query}%")
              ->orWhere('slug', 'like', "%{$query}%")
              ->orWhereHas('category', fn($cq) => $cq->where('name', 'like', "%{$query}%"));
        })
        ->orderBy('published_at', 'desc')
        ->take(15)
        ->get();

    echo "\033[1;34mSearch Results for '{$query}' (" . count($articles) . " found):\033[0m\n";
    if ($articles->isEmpty()) {
        echo "  No published articles found matching '{$query}'.\n";
        return;
    }
    foreach ($articles as $art) {
        $cat = $art->category ? "[{$art->category->name}]" : "";
        echo "  \033[1;33m#{$art->id}\033[0m - {$art->title} \033[0;36m{$cat}\033[0m\n";
    }
}

function listAllArticles(): void {
    $articles = Article::with('category')
        ->where('status', 'published')
        ->orderBy('id', 'desc')
        ->get();

    echo "\033[1;34mAll Published Articles (" . count($articles) . " total):\033[0m\n";
    foreach ($articles as $art) {
        $cat = $art->category ? "[{$art->category->name}]" : "";
        echo "  \033[1;33m#{$art->id}\033[0m - {$art->title} \033[0;36m{$cat}\033[0m\n";
    }
}

// ── Parse CLI flags if provided ──
$options = getopt('', ['show', 'list', 'search:', 'lead:', 'featured:', 'trending:', 'reset', 'help']);

if (isset($options['help'])) {
    printHeader();
    echo "Usage:\n";
    echo "  php pin_stories.php                   (Interactive menu)\n";
    echo "  php pin_stories.php --show            (Show current pinned)\n";
    echo "  php pin_stories.php --list            (List all published articles)\n";
    echo "  php pin_stories.php --search=\"AI\"      (Search articles)\n";
    echo "  php pin_stories.php --lead=17 --featured=8,12 --trending=1,5,9,14\n";
    echo "  php pin_stories.php --reset           (Reset all pins to default)\n";
    exit(0);
}

if (isset($options['list'])) {
    printHeader();
    listAllArticles();
    exit(0);
}

if (isset($options['search'])) {
    printHeader();
    searchArticles($options['search']);
    exit(0);
}

$didChange = false;

if (isset($options['reset'])) {
    savePinnedData(['lead_id' => null, 'featured_ids' => [], 'trending_ids' => []]);
    echo "\033[1;32m✓ Pinned stories have been reset to automated defaults!\033[0m\n";
    $didChange = true;
}

// Handle setting via flags
if (isset($options['lead']) || isset($options['featured']) || isset($options['trending'])) {
    $pinned = getPinnedData();
    if (isset($options['lead'])) {
        $leadId = (int) $options['lead'];
        if ($leadId === 0) {
            $pinned['lead_id'] = null;
            echo "✓ Main Lead Story cleared (set to default)\n";
        } elseif ($leadId > 0 && Article::find($leadId)) {
            $pinned['lead_id'] = $leadId;
            echo "✓ Main Lead Story set to #{$leadId}\n";
        } else {
            echo "✗ Article ID #{$leadId} not found\n";
        }
    }
    if (isset($options['featured'])) {
        $ids = array_filter(array_map('intval', explode(',', $options['featured'])));
        $validIds = Article::whereIn('id', $ids)->pluck('id')->toArray();
        $pinned['featured_ids'] = array_slice($validIds, 0, 2);
        echo "✓ Top Featured Stories set to: " . (empty($pinned['featured_ids']) ? '(none)' : implode(', ', $pinned['featured_ids'])) . "\n";
    }
    if (isset($options['trending'])) {
        $ids = array_filter(array_map('intval', explode(',', $options['trending'])));
        $validIds = Article::whereIn('id', $ids)->pluck('id')->toArray();
        $pinned['trending_ids'] = array_slice($validIds, 0, 4);
        echo "✓ Trending Stories set to: " . (empty($pinned['trending_ids']) ? '(none)' : implode(', ', $pinned['trending_ids'])) . "\n";
    }
    savePinnedData($pinned);
    echo "\033[1;32m✓ Saved successfully and cache cleared!\033[0m\n";
    $didChange = true;
}

if (isset($options['show']) || $didChange) {
    printHeader();
    showCurrentPinned();
    exit(0);
}

// ── Interactive Mode (Standard CLI) ──
printHeader();

while (true) {
    showCurrentPinned();
    echo "Options:\n";
    echo "  1) Pin Main Lead Hero Story (Image 3)\n";
    echo "  2) Pin Top Featured Stories (2 stories on the right)\n";
    echo "  3) Pin Trending on Rafvex (4 stories)\n";
    echo "  4) Search articles by title or keyword\n";
    echo "  5) List all published articles\n";
    echo "  6) Reset all pinned stories to default\n";
    echo "  q) Quit\n";
    echo "\033[1;33mSelect an option (1-6, q): \033[0m";

    $handle = fopen('php://stdin', 'r');
    $choice = trim(fgets($handle));

    if (strtolower($choice) === 'q' || $choice === '') {
        echo "Exiting.\n";
        break;
    }

    $pinned = getPinnedData();

    if ($choice === '1') {
        echo "\nEnter search keyword (or press Enter to input Article ID directly): ";
        $term = trim(fgets($handle));
        if ($term !== '') {
            searchArticles($term);
        }
        echo "Enter Article ID for Main Lead Story (0 to clear): ";
        $id = (int) trim(fgets($handle));
        if ($id === 0) {
            $pinned['lead_id'] = null;
            echo "Lead story cleared.\n";
        } elseif (Article::where('id', $id)->where('status', 'published')->exists()) {
            $pinned['lead_id'] = $id;
            echo "Main Lead Story set to #$id.\n";
        } else {
            echo "\033[1;31mInvalid or unpublished article ID.\033[0m\n";
        }
        savePinnedData($pinned);
    } elseif ($choice === '2') {
        echo "\nEnter search keyword (or press Enter to skip search): ";
        $term = trim(fgets($handle));
        if ($term !== '') {
            searchArticles($term);
        }
        echo "Enter first Featured Article ID (right card #1): ";
        $id1 = (int) trim(fgets($handle));
        echo "Enter second Featured Article ID (right card #2): ";
        $id2 = (int) trim(fgets($handle));
        $ids = array_filter([$id1, $id2]);
        $validIds = Article::whereIn('id', $ids)->where('status', 'published')->pluck('id')->toArray();
        $pinned['featured_ids'] = $validIds;
        savePinnedData($pinned);
        echo "\033[1;32m✓ Top Featured Stories updated.\033[0m\n";
    } elseif ($choice === '3') {
        echo "\nEnter search keyword (or press Enter to skip search): ";
        $term = trim(fgets($handle));
        if ($term !== '') {
            searchArticles($term);
        }
        echo "Enter 4 Article IDs separated by comma (e.g. 1, 5, 9, 14): ";
        $input = trim(fgets($handle));
        $ids = array_map('intval', explode(',', $input));
        $validIds = Article::whereIn('id', $ids)->where('status', 'published')->pluck('id')->toArray();
        $pinned['trending_ids'] = array_slice($validIds, 0, 4);
        savePinnedData($pinned);
        echo "\033[1;32m✓ Trending on Rafvex updated.\033[0m\n";
    } elseif ($choice === '4') {
        echo "\nEnter search query: ";
        $term = trim(fgets($handle));
        if ($term !== '') {
            searchArticles($term);
        }
        echo "\nPress Enter to continue...";
        fgets($handle);
    } elseif ($choice === '5') {
        listAllArticles();
        echo "\nPress Enter to continue...";
        fgets($handle);
    } elseif ($choice === '6') {
        savePinnedData(['lead_id' => null, 'featured_ids' => [], 'trending_ids' => []]);
        echo "\033[1;32m✓ Reset to default.\033[0m\n";
    } else {
        echo "Unknown option.\n";
    }
    echo "\n";
}
