<?php

require __DIR__.'/vendor/autoload.php';

function cleanAndFormatContentV2($title, $metaDescription, $markdown, $shortSlug, $catSlug, $subcatSlug)
{
    // 1. Strip any prompt text or instructions
    $promptPatterns = [
        '/(?:###?\s*)?(?:IMAGE GENERATION PROMPT|OPTIMIZED MIDJOURNEY.*?PROMPT|MIDJOURNEY PROMPT|DALL-E PROMPT|IMAGEN PROMPT|PROMPT:).*?(?=(?:\n\n|\n#|$))/is',
        '/```(?:text|bash)?\s*(?:Studio Ghibli|cinematic|anime illustration|photo).*?```/is',
        '/\b(?:Studio Ghibli style|cinematic anime illustration|--ar 16:9).*?(?:\n|$)/i',
    ];
    foreach ($promptPatterns as $pattern) {
        $markdown = preg_replace($pattern, '', $markdown);
    }
    $markdown = trim($markdown);

    // 2. Extract and protect Code Blocks FIRST
    $codeBlocks = [];
    $markdown = preg_replace_callback('/```(\w+)?\n?(.*?)```/s', function ($match) use (&$codeBlocks) {
        $idx = count($codeBlocks);
        $lang = strtolower(trim($match[1] ?? 'code'));
        if (empty($lang)) {
            $lang = 'snippet';
        }
        $rawCode = trim($match[2]);
        $escaped = htmlspecialchars($rawCode, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');

        $card = '<div class="my-6 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-md">'
              .'<div class="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-xs text-slate-400 font-mono">'
              .'<div class="flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full bg-red-500/80"></span><span class="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span><span class="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span><span class="ml-2 font-bold uppercase tracking-wider text-[11px] text-slate-200">'.strtoupper($lang).'</span></div>'
              .'<span class="text-[11px] text-slate-500">Code Snippet</span>'
              .'</div>'
              .'<pre class="p-4 text-xs sm:text-sm font-mono leading-relaxed text-slate-100 overflow-x-auto selection:bg-red-900 selection:text-white"><code>'.$escaped.'</code></pre>'
              .'</div>';

        $placeholder = "___CODE_BLOCK_{$idx}___";
        $codeBlocks[$placeholder] = $card;

        return "\n\n".$placeholder."\n\n";
    }, $markdown);

    // 3. Extract and protect Tables
    $tableBlocks = [];
    $markdown = preg_replace_callback('/((?:\|[^\n]+\|\r?\n)+)/', function ($match) use (&$tableBlocks) {
        $lines = array_filter(array_map('trim', explode("\n", trim($match[1]))));
        if (count($lines) < 2) {
            return $match[0];
        }

        $idx = count($tableBlocks);
        $html = '<div class="overflow-x-auto my-6"><table class="min-w-full text-left border-collapse border border-slate-200 shadow-xs rounded-lg overflow-hidden">';
        $isHeader = true;
        foreach ($lines as $line) {
            if (preg_match('/^\|(?:\s*:?-+:?\s*\|)+$/', $line)) {
                $isHeader = false;

                continue;
            }
            $cells = array_slice(explode('|', $line), 1, -1);
            $tag = $isHeader ? 'th' : 'td';
            $cls = $isHeader ? 'bg-slate-100 font-bold p-3 border border-slate-200 text-slate-900 text-sm' : 'p-3 border border-slate-200 text-slate-700 text-sm';
            $html .= '<tr>';
            foreach ($cells as $cell) {
                $cellContent = trim($cell);
                $cellContent = preg_replace('/\*\*(.*?)\*\*/', '<strong>$1</strong>', $cellContent);
                $html .= "<{$tag} class=\"{$cls}\">".$cellContent."</{$tag}>";
            }
            $html .= '</tr>';
        }
        $html .= '</table></div>';

        $placeholder = "___TABLE_BLOCK_{$idx}___";
        $tableBlocks[$placeholder] = $html;

        return "\n\n".$placeholder."\n\n";
    }, $markdown);

    // 4. Format Headings & Text Styles
    $content = preg_replace('/^\*\*(\d+\.\s+[^*]+)\*\*$/m', '<h2 class="text-2xl font-bold text-slate-900 mt-8 mb-4">$1</h2>', $markdown);
    $content = preg_replace('/^### (.*?)$/m', '<h3 class="text-xl font-bold text-slate-900 mt-6 mb-3">$1</h3>', $content);
    $content = preg_replace('/^## (.*?)$/m', '<h2 class="text-2xl font-bold text-slate-900 mt-8 mb-4">$1</h2>', $content);
    $content = preg_replace('/\*\*(.*?)\*\*/', '<strong>$1</strong>', $content);
    $content = preg_replace('/`([^`]+)`/', '<code class="px-1.5 py-0.5 rounded bg-slate-100 text-red-600 font-mono text-xs sm:text-sm">$1</code>', $content);
    $content = preg_replace('/\[([^\]]+)\]\(([^)]+)\)/', '<a href="$2" class="text-red-600 hover:text-red-700 underline font-semibold">$1</a>', $content);

    // 5. Split Paragraphs
    $rawParagraphs = explode("\n\n", $content);
    $formattedParagraphs = [];
    foreach ($rawParagraphs as $para) {
        $para = trim($para);
        if (empty($para)) {
            continue;
        }
        if (str_starts_with($para, '___CODE_BLOCK_') || str_starts_with($para, '___TABLE_BLOCK_') || str_starts_with($para, '<h') || str_starts_with($para, '<figure')) {
            $formattedParagraphs[] = $para;
        } elseif (preg_match('/^(\*|-)\s/', $para)) {
            $listItems = explode("\n", $para);
            $listHtml = '<ul class="list-disc list-inside space-y-2 my-4 text-slate-700 leading-relaxed">';
            foreach ($listItems as $item) {
                $item = trim(preg_replace('/^(\*|-)\s+/', '', $item));
                if (! empty($item)) {
                    $listHtml .= '<li>'.$item.'</li>';
                }
            }
            $listHtml .= '</ul>';
            $formattedParagraphs[] = $listHtml;
        } else {
            $formattedParagraphs[] = '<p class="text-slate-700 leading-relaxed my-4">'.nl2br($para).'</p>';
        }
    }

    // 6. Embed 3 in-body images between genuine text paragraphs only (with aspect-video for zero layout shift/blink)
    $img2 = "<figure class=\"my-8 rounded-2xl overflow-hidden shadow-md bg-slate-100 border border-slate-200/80\"><img src=\"/blog/{$catSlug}/{$subcatSlug}/{$shortSlug}/{$shortSlug}-2.webp?v=6\" alt=\"".htmlspecialchars($title).' - Detailed Illustration" class="w-full h-auto aspect-video object-cover rounded-2xl block" loading="lazy" /></figure>';
    $img3 = "<figure class=\"my-8 rounded-2xl overflow-hidden shadow-md bg-slate-100 border border-slate-200/80\"><img src=\"/blog/{$catSlug}/{$subcatSlug}/{$shortSlug}/{$shortSlug}-3.webp?v=6\" alt=\"".htmlspecialchars($title).' - In-Depth Analysis" class="w-full h-auto aspect-video object-cover rounded-2xl block" loading="lazy" /></figure>';
    $img4 = "<figure class=\"my-8 rounded-2xl overflow-hidden shadow-md bg-slate-100 border border-slate-200/80\"><img src=\"/blog/{$catSlug}/{$subcatSlug}/{$shortSlug}/{$shortSlug}-4.webp?v=6\" alt=\"".htmlspecialchars($title).' - Practical Synthesis" class="w-full h-auto aspect-video object-cover rounded-2xl block" loading="lazy" /></figure>';

    // Find eligible text paragraph indexes (NOT headings, NOT code blocks, NOT tables)
    $eligibleIndexes = [];
    foreach ($formattedParagraphs as $idx => $p) {
        if (str_starts_with($p, '<p class="text-slate-700')) {
            $eligibleIndexes[] = $idx;
        }
    }

    $numEligible = count($eligibleIndexes);
    if ($numEligible >= 6) {
        $insert1 = $eligibleIndexes[(int) ($numEligible * 0.25)];
        $insert2 = $eligibleIndexes[(int) ($numEligible * 0.55)];
        $insert3 = $eligibleIndexes[(int) ($numEligible * 0.85)];

        // Insert in reverse order so indexes don't shift
        array_splice($formattedParagraphs, $insert3 + 1, 0, [$img4]);
        array_splice($formattedParagraphs, $insert2 + 1, 0, [$img3]);
        array_splice($formattedParagraphs, $insert1 + 1, 0, [$img2]);
    } else {
        $formattedParagraphs[] = $img2;
        $formattedParagraphs[] = $img3;
        $formattedParagraphs[] = $img4;
    }

    // 7. Restore placeholders
    $finalHtml = implode("\n\n", $formattedParagraphs);
    foreach ($codeBlocks as $placeholder => $html) {
        $finalHtml = str_replace($placeholder, $html, $finalHtml);
    }
    foreach ($tableBlocks as $placeholder => $html) {
        $finalHtml = str_replace($placeholder, $html, $finalHtml);
    }

    return $finalHtml;
}

// Test across ALL 53 articles
$batchFiles = glob(__DIR__.'/content/articles/batch_*.json');
$allArticles = [];
foreach ($batchFiles as $bf) {
    $batchData = json_decode(file_get_contents($bf), true);
    if (is_array($batchData)) {
        $allArticles = array_merge($allArticles, $batchData);
    }
}
usort($allArticles, fn ($a, $b) => $a['id'] <=> $b['id']);

$failedCount = 0;
foreach ($allArticles as $art) {
    $html = cleanAndFormatContentV2($art['title'], $art['meta_description'], $art['content'], 'test-slug', 'test-cat', 'test-sub');

    $hasImgInPre = preg_match('/<pre[^>]*>(?:(?!<\/pre>).)*?<img/is', $html);
    $hasPInPre = preg_match('/<pre[^>]*>(?:(?!<\/pre>).)*?<p/is', $html);
    $unclosedPre = substr_count($html, '<pre') !== substr_count($html, '</pre>');
    $hasImgInTable = preg_match('/<table[^>]*>(?:(?!<\/table>).)*?<img/is', $html);

    if ($hasImgInPre || $hasPInPre || $unclosedPre || $hasImgInTable) {
        echo "FAIL on Article {$art['id']} ({$art['title']}): ";
        if ($hasImgInPre) {
            echo '[IMG IN PRE] ';
        }
        if ($hasPInPre) {
            echo '[P IN PRE] ';
        }
        if ($unclosedPre) {
            echo '[UNCLOSED PRE] ';
        }
        if ($hasImgInTable) {
            echo '[IMG IN TABLE] ';
        }
        echo PHP_EOL;
        $failedCount++;
    }
}

if ($failedCount === 0) {
    echo 'SUCCESS: ALL '.count($allArticles)." articles passed validation with 0 errors!\n";
    echo "- 0 images inside <pre>\n";
    echo "- 0 <p> tags inside <pre>\n";
    echo "- 0 unclosed <pre> tags\n";
    echo "- 0 images inside tables\n";
} else {
    echo "FAILED: $failedCount articles had errors.\n";
}
