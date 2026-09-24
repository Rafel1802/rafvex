<?php

namespace Database\Seeders;

use App\Models\Article;
use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class MasterArticlesSeeder extends Seeder
{
    public function run(): void
    {
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
            1 => 'android-storage',
            2 => 'student-ai-tools',
            3 => 'android-iphone-sync',
            4 => 'mobile-hardware-sec',
            5 => 'offline-field-data',
            6 => 'windows-vs-mac',
            7 => 'terminal-automation',
            8 => 'zero-trust-backup',
            9 => 'local-llms-ollama',
            10 => 'lit-networks-ai',
            11 => 'prompt-engineering',
            12 => 'browser-hardening',
            13 => 'reference-managers',
            14 => 'knowledge-vault',
            15 => 'travel-opsec',
            16 => 'hardware-security-keys',
            17 => 'threat-modeling',
            18 => 'ai-academic-integrity',
            19 => 'preprint-tracking',
            20 => 'grant-stress-test',
            21 => 'termux-automation',
            22 => 'iphone-battery-privacy',
            23 => 'clean-android-apps',
            24 => 'home-screen-focus',
            25 => 'windows-11-speed',
            26 => 'macos-shortcuts',
            27 => 'open-source-software',
            28 => 'writing-ai-prompts',
            29 => 'gemini-vs-chatgpt',
            30 => 'ai-writing-voice',
            31 => 'free-ai-tools',
            32 => 'notion-vs-obsidian',
            33 => 'backup-cloud-storage',
            34 => 'useful-free-websites',
            35 => 'stop-reusing-passwords',
            36 => 'authenticator-vs-sms',
            37 => 'spot-fake-emails',
            38 => 'ai-personal-tutor',
            39 => 'ai-flashcard-generators',
            40 => 'ai-publishing-workflows',
            41 => 'the-lantern-maker',
            42 => 'words-for-feelings',
            43 => 'mountain-and-seed',
            44 => 'm3-macbook-air',
            45 => 'claude-vs-chatgpt',
            46 => 'sony-wh1000xm5',
            47 => 'mx-master-3s',
            48 => 'fix-unstable-wifi',
            49 => 'smartphone-battery-drain',
            50 => 'bluetooth-audio-delay',
            51 => 'on-device-ai',
            52 => 'lantern-maker-study',
            53 => 'mountain-seed-study',
            54 => 'top-5-speed-test-websites',
            55 => 'speedtest-fast-games-lag',
            56 => 'dns-speed-lookup-guide',
            57 => 'diagnose-network-tech-questions',
            58 => 'isp-throttling-tests',
            59 => 'wifi-7-vs-wifi-6e-testing',
            60 => 'eliminate-zoom-audio-jitter',
            61 => '5g-vs-fiber-speed-test',
            62 => 'eliminate-wifi-dead-zones',
            63 => 'speed-test-privacy-breakdown',
            64 => 'free-speed-test-multi-lang',
            65 => 'ai-network-routing-latency',
            66 => 'gamers-guide-ping-ip-lookup',
            67 => 'tech-english-vocabulary',
            68 => 'ai-english-language-revolution',
        ];

        $batchFiles = glob(base_path('content/articles/batch_*.json'));
        $articles = [];
        foreach ($batchFiles as $bf) {
            $batchData = json_decode(file_get_contents($bf), true);
            if (is_array($batchData)) {
                $articles = array_merge($articles, $batchData);
            }
        }
        usort($articles, fn ($a, $b) => $a['id'] <=> $b['id']);

        $categoryCache = [];

        foreach ($articles as $art) {
            $id = $art['id'];
            $catName = $art['category'];
            $subcatName = $art['subcategory'];
            $slug = $art['slug'];
            $shortSlug = $shortSlugMap[$id] ?? $slug;
            $title = $art['title'];

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

            $catSlug = $parentSlug;
            $subSlug = $subcatSlug;

            $markdown = $art['content'];
            $promptPatterns = [
                '/(?:###?\s*)?(?:IMAGE GENERATION PROMPT|OPTIMIZED MIDJOURNEY.*?PROMPT|MIDJOURNEY PROMPT|DALL-E PROMPT|IMAGEN PROMPT|PROMPT:).*?(?=(?:\n\n|\n#|$))/is',
                '/```(?:text|bash)?\s*(?:Studio Ghibli|cinematic|anime illustration|photo).*?```/is',
                '/\b(?:Studio Ghibli style|cinematic anime illustration|--ar 16:9).*?(?:\n|$)/i',
            ];
            foreach ($promptPatterns as $pattern) {
                $markdown = preg_replace($pattern, '', $markdown);
            }
            $markdown = trim($markdown);

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
                    $cls = $isHeader ? 'bg-slate-100 dark:bg-slate-800 font-bold p-3 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm' : 'p-3 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-sm';
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
            // Protect and format Code Blocks before splitting into paragraphs
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

            $content = preg_replace('/\[([^\]]+)\]\(([^)]+)\)/', '<a href="$2" class="text-red-600 hover:text-red-700 underline font-semibold">$1</a>', $content);

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

            // In-body images 2, 3, and 4
            $img2 = "<figure class=\"my-8\"><img src=\"/blog/{$catSlug}/{$subSlug}/{$shortSlug}/{$shortSlug}-2.webp?v=6\" alt=\"".htmlspecialchars($title).' - Section Overview" class="rounded-2xl shadow-lg w-full object-cover" loading="lazy" /></figure>';
            $img3 = "<figure class=\"my-8\"><img src=\"/blog/{$catSlug}/{$subSlug}/{$shortSlug}/{$shortSlug}-3.webp?v=6\" alt=\"".htmlspecialchars($title).' - Analysis and Insights" class="rounded-2xl shadow-lg w-full object-cover" loading="lazy" /></figure>';
            $img4 = "<figure class=\"my-8\"><img src=\"/blog/{$catSlug}/{$subSlug}/{$shortSlug}/{$shortSlug}-4.webp?v=6\" alt=\"".htmlspecialchars($title).' - Practical Takeaways" class="rounded-2xl shadow-lg w-full object-cover" loading="lazy" /></figure>';

            $totalParas = count($formattedParagraphs);
            if ($totalParas >= 6) {
                $pos1 = (int) ($totalParas * 0.25);
                $pos2 = (int) ($totalParas * 0.55) + 1;
                $pos3 = (int) ($totalParas * 0.85) + 2;
                array_splice($formattedParagraphs, $pos1, 0, [$img2]);
                array_splice($formattedParagraphs, $pos2, 0, [$img3]);
                array_splice($formattedParagraphs, $pos3, 0, [$img4]);
            } elseif ($totalParas >= 3) {
                array_splice($formattedParagraphs, 1, 0, [$img2]);
                array_splice($formattedParagraphs, 3, 0, [$img3]);
                $formattedParagraphs[] = $img4;
            } else {
                $formattedParagraphs[] = $img2;
                $formattedParagraphs[] = $img3;
                $formattedParagraphs[] = $img4;
            }

            $metaDesc = $art['meta_description'] ?? $art['excerpt'] ?? Str::limit(strip_tags($art['content'] ?? ''), 160);
            $seoTitle = $art['seo_meta_title'] ?? $title;

            $editorialH1 = '<h1 class="text-3xl sm:text-4xl font-black text-slate-950 mb-4 tracking-tight">'.htmlspecialchars($title).'</h1>';
            $editorialIntro = '<p class="lead text-lg sm:text-xl font-medium text-slate-700 leading-relaxed mb-6">'.htmlspecialchars($metaDesc).'</p>';
            $finalHtml = $editorialH1."\n".$editorialIntro."\n".implode("\n\n", $formattedParagraphs);

            $coverImageUrl = "/blog/{$catSlug}/{$subSlug}/{$shortSlug}/{$shortSlug}-1.webp?v=6";

            Article::updateOrCreate(
                ['slug' => $slug],
                [
                    'user_id' => $authorId,
                    'category_id' => $subCat->id,
                    'title' => $title,
                    'excerpt' => $metaDesc,
                    'content' => $finalHtml,
                    'content_raw' => null,
                    'status' => 'published',
                    'published_at' => now()->subDays(max(0, 63 - (int) $art['id'])),
                    'cover_image_url' => $coverImageUrl,
                    'cover_image_alt' => $title,
                    'meta_title' => $seoTitle,
                    'meta_description' => $metaDesc,
                    'reading_time' => max(5, (int) (str_word_count(strip_tags($art['content'] ?? '')) / 200)),
                    'featured' => in_array($art['id'], [1, 2, 6, 9, 14, 16, 22, 28, 35, 44, 54, 55, 58]),
                    'allow_comments' => true,
                    'ai_assisted' => ($art['id'] <= 53),
                ]
            );
        }
    }
}
