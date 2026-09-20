<?php

namespace App\Services;

use App\Models\Article;
use App\Models\Category;
use App\Models\News;
use App\Models\Podcast;
use App\Models\Setting;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

class SearchIndexingService
{
    /**
     * Get or create the IndexNow API key and ensure the verification file exists in public directory.
     */
    public function getOrCreateIndexNowKey(): string
    {
        try {
            $key = Setting::where('key', 'indexnow_key')->value('value');
        } catch (\Throwable $e) {
            $key = null;
        }

        if (empty($key) || strlen($key) < 16) {
            $key = bin2hex(random_bytes(16)); // 32 hex chars
            try {
                Setting::updateOrCreate(
                    ['key' => 'indexnow_key'],
                    ['value' => $key]
                );
            } catch (\Throwable $e) {
                Log::warning('[SearchIndexingService] Could not persist indexnow_key to DB: '.$e->getMessage());
            }
        }

        // Ensure verification text file exists in both public/ and base directory
        $paths = [
            public_path($key.'.txt'),
            base_path($key.'.txt'),
        ];
        foreach ($paths as $filePath) {
            try {
                if (! File::exists($filePath) || File::get($filePath) !== $key) {
                    File::put($filePath, $key);
                }
            } catch (\Throwable $e) {
                Log::warning('[SearchIndexingService] Could not write key file to '.$filePath.': '.$e->getMessage());
            }
        }

        return $key;
    }

    /**
     * Resolve all public, indexable URLs across Rafvex.
     *
     * @return array<int, string>
     */
    public function getAllPublishedUrls(): array
    {
        $baseUrl = rtrim(config('app.url', 'https://rafvex.com'), '/');
        $urls = collect();

        // 1. High-Value Institutional & Discovery Pages
        $urls->push($baseUrl.'/');
        $urls->push($baseUrl.'/about');
        $urls->push($baseUrl.'/contact');
        $urls->push($baseUrl.'/popular');
        $urls->push($baseUrl.'/news');
        $urls->push($baseUrl.'/podcasts');
        $urls->push($baseUrl.'/sitemap');
        $urls->push($baseUrl.'/privacy-policy');
        $urls->push($baseUrl.'/terms-of-service');

        // 2. Active Categories
        try {
            $categories = Category::select('slug')->get();
            foreach ($categories as $cat) {
                if (! empty($cat->slug)) {
                    $urls->push($baseUrl.'/category/'.$cat->slug);
                }
            }
        } catch (\Throwable $e) {
            Log::warning('[SearchIndexingService] Category fetch failed: '.$e->getMessage());
        }

        // 3. Published Articles (where noindex != true)
        try {
            $articles = Article::where('status', 'published')
                ->where(fn ($q) => $q->whereNull('noindex')->orWhere('noindex', false))
                ->select('slug')
                ->latest('published_at')
                ->get();

            foreach ($articles as $art) {
                if (! empty($art->slug)) {
                    $urls->push($baseUrl.'/article/'.$art->slug);
                }
            }
        } catch (\Throwable $e) {
            Log::warning('[SearchIndexingService] Article fetch failed: '.$e->getMessage());
        }

        // 4. Published Technology News
        try {
            $news = News::where('status', 'published')
                ->select('slug')
                ->latest('published_at')
                ->get();

            foreach ($news as $n) {
                if (! empty($n->slug)) {
                    $urls->push($baseUrl.'/news/'.$n->slug);
                }
            }
        } catch (\Throwable $e) {
            // Optional news table
        }

        // 5. Published Podcasts
        try {
            if (Schema::hasTable('podcasts')) {
                $podcasts = Podcast::where('status', 'published')
                    ->select('slug')
                    ->latest('published_at')
                    ->get();

                foreach ($podcasts as $p) {
                    if (! empty($p->slug)) {
                        $urls->push($baseUrl.'/podcast/'.$p->slug);
                    }
                }
            }
        } catch (\Throwable $e) {
            // Optional podcasts table
        }

        return $urls->unique()->values()->all();
    }

    /**
     * Submit a list of URLs to IndexNow (Bing, Copilot AI, Yahoo, Yandex, Naver, Seznam).
     *
     * @param  array<int, string>  $urls
     * @return array{success: bool, submitted_count: int, message: string, status_code: int|null}
     */
    public function submitToIndexNow(array $urls): array
    {
        if (empty($urls)) {
            return [
                'success' => false,
                'submitted_count' => 0,
                'message' => 'No URLs provided for submission.',
                'status_code' => null,
            ];
        }

        $key = $this->getOrCreateIndexNowKey();
        $host = parse_url(config('app.url', 'https://rafvex.com'), PHP_URL_HOST) ?? 'rafvex.com';
        $keyLocation = "https://{$host}/{$key}.txt";

        // IndexNow supports up to 10,000 URLs per call
        $batch = array_slice($urls, 0, 10000);

        $payload = [
            'host' => $host,
            'key' => $key,
            'keyLocation' => $keyLocation,
            'urlList' => $batch,
        ];

        try {
            // Primary IndexNow endpoint
            $response = Http::timeout(15)
                ->withHeaders([
                    'Content-Type' => 'application/json; charset=utf-8',
                    'User-Agent' => 'Rafvex-SEO-Engine/1.0',
                ])
                ->post('https://api.indexnow.org/IndexNow', $payload);

            $statusCode = $response->status();

            // Status 200 or 202 is success according to IndexNow spec
            if ($statusCode === 200 || $statusCode === 202) {
                Log::info('[SearchIndexingService] Successfully submitted '.count($batch)." URLs to IndexNow. Status: {$statusCode}");

                return [
                    'success' => true,
                    'submitted_count' => count($batch),
                    'message' => 'Successfully submitted '.count($batch).' URLs to IndexNow (Bing, Copilot, Yahoo, Yandex, Naver).',
                    'status_code' => $statusCode,
                ];
            }

            // Fallback to Bing IndexNow endpoint if main endpoint returned an error
            $bingResponse = Http::timeout(15)
                ->withHeaders(['Content-Type' => 'application/json; charset=utf-8'])
                ->post('https://www.bing.com/IndexNow', $payload);

            if ($bingResponse->status() === 200 || $bingResponse->status() === 202) {
                return [
                    'success' => true,
                    'submitted_count' => count($batch),
                    'message' => 'Successfully submitted '.count($batch).' URLs to Bing IndexNow.',
                    'status_code' => $bingResponse->status(),
                ];
            }

            return [
                'success' => false,
                'submitted_count' => 0,
                'message' => "IndexNow returned status {$statusCode}: ".$response->body(),
                'status_code' => $statusCode,
            ];
        } catch (\Throwable $e) {
            Log::error('[SearchIndexingService] IndexNow error: '.$e->getMessage());

            return [
                'success' => false,
                'submitted_count' => 0,
                'message' => 'IndexNow connection error: '.$e->getMessage(),
                'status_code' => 500,
            ];
        }
    }

    /**
     * Submit a single URL to IndexNow (e.g. upon publishing an article).
     */
    public function submitSingleUrl(string $url): bool
    {
        $res = $this->submitToIndexNow([$url]);

        return $res['success'];
    }

    /**
     * Submit all published URLs to IndexNow and return detailed report.
     *
     * @return array{success: bool, total_urls: int, submitted_count: int, message: string, key: string}
     */
    public function submitAll(): array
    {
        $urls = $this->getAllPublishedUrls();
        $result = $this->submitToIndexNow($urls);

        return [
            'success' => $result['success'],
            'total_urls' => count($urls),
            'submitted_count' => $result['submitted_count'],
            'message' => $result['message'],
            'key' => $this->getOrCreateIndexNowKey(),
        ];
    }
}
