<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('stories:pin {--lead=} {--featured=} {--trending=} {--reset} {--show} {--search=}', function () {
    $lead = $this->option('lead');
    $featured = $this->option('featured');
    $trending = $this->option('trending');
    $reset = $this->option('reset');
    $show = $this->option('show');
    $search = $this->option('search');

    $cmd = 'php ' . escapeshellarg(base_path('pin_stories.php'));
    if ($show) $cmd .= ' --show';
    if ($reset) $cmd .= ' --reset';
    if ($lead !== null) $cmd .= ' --lead=' . escapeshellarg($lead);
    if ($featured !== null) $cmd .= ' --featured=' . escapeshellarg($featured);
    if ($trending !== null) $cmd .= ' --trending=' . escapeshellarg($trending);
    if ($search !== null) $cmd .= ' --search=' . escapeshellarg($search);

    passthru($cmd);
})->purpose('Manage pinned Top Featured and Trending stories via CLI / SSH');
