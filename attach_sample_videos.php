<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Article;

// Attach a YouTube video to Article 2 (AI Tools for Students)
$art2 = Article::find(2);
if ($art2) {
    $art2->video_url = 'https://www.youtube.com/watch?v=kYqD6Q17Fas';
    $art2->save();
    echo "Updated Article #2 with YouTube video.\n";
}

// Attach a Facebook video / YouTube to Article 1
$art1 = Article::find(1);
if ($art1) {
    $art1->video_url = 'https://www.youtube.com/watch?v=inWWhr5tnEA';
    $art1->save();
    echo "Updated Article #1 with video.\n";
}

// Attach to Article 30 (use-ai-writing-assistants-without-losing-voice)
$art30 = Article::where('slug', 'like', '%use-ai-writing-assistants%')->first();
if ($art30) {
    $art30->video_url = 'https://www.youtube.com/watch?v=aircAruvnKk';
    $art30->save();
    echo "Updated Article #30 with video: {$art30->slug}\n";
}

echo "Video attachment complete!\n";
