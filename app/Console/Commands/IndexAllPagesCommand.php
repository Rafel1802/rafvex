<?php

namespace App\Console\Commands;

use App\Services\SearchIndexingService;
use Illuminate\Console\Command;

class IndexAllPagesCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'seo:index-all {--dry-run : Only list the URLs without submitting}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Submit all published articles and pages to IndexNow (Bing, Copilot AI, Yahoo, Yandex, Naver)';

    /**
     * Execute the console command.
     */
    public function handle(SearchIndexingService $service): int
    {
        $this->info('🔍 Discovering all published URLs across Rafvex...');

        $urls = $service->getAllPublishedUrls();
        $count = count($urls);

        $this->info("Found {$count} public, indexable URLs.");

        if ($this->option('dry-run')) {
            $this->table(['#', 'URL'], collect($urls)->take(25)->map(fn ($url, $idx) => [$idx + 1, $url])->toArray());
            if ($count > 25) {
                $this->comment('... and '.($count - 25).' more URLs.');
            }
            $this->info('Dry-run completed. No requests were sent.');

            return self::SUCCESS;
        }

        $this->info('⚡ Pushing URLs to IndexNow API...');
        $result = $service->submitToIndexNow($urls);

        if ($result['success']) {
            $this->info("✅ {$result['message']}");
            $this->comment('Verification key active at: '.url('/'.$service->getOrCreateIndexNowKey().'.txt'));

            return self::SUCCESS;
        }

        $this->error("❌ {$result['message']}");

        return self::FAILURE;
    }
}
