<?php

namespace App\Console\Commands;

use App\Models\Article;
use Illuminate\Console\Command;

class PublishScheduledArticles extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'articles:publish-scheduled';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Publish any scheduled articles whose scheduled_at timestamp has passed';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $count = Article::autoPublishScheduled();

        if ($count > 0) {
            $this->info("Successfully published {$count} scheduled article(s).");
        } else {
            $this->line('No pending scheduled articles to publish.');
        }

        return self::SUCCESS;
    }
}
