<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Kernel::class);
$kernel->bootstrap();

use App\Models\Article;
use Illuminate\Contracts\Console\Kernel;

echo "Checking and cleaning invalid content_raw in articles...\n";
$articles = Article::whereNotNull('content_raw')->get();
$fixed = 0;
foreach ($articles as $art) {
    $raw = trim($art->content_raw);
    if (! str_starts_with($raw, '{') && ! str_starts_with($raw, '[')) {
        $art->update(['content_raw' => null]);
        $fixed++;
    } else {
        // Test JSON validity
        json_decode($raw);
        if (json_last_error() !== JSON_ERROR_NONE) {
            $art->update(['content_raw' => null]);
            $fixed++;
        }
    }
}
echo "Cleaned {$fixed} articles with invalid content_raw.\n";
