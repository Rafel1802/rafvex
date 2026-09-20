<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Kernel::class);
$kernel->bootstrap();

use App\Models\News;
use Illuminate\Contracts\Console\Kernel;

$newsItems = [
    [
        'title' => 'Anthropic Unveils Claude 3.7 Sonnet with Hybrid Instant & Extended Reasoning',
        'slug' => 'anthropic-unveils-claude-3-7-sonnet-hybrid-reasoning',
        'summary' => 'SAN FRANCISCO — Anthropic has officially rolled out Claude 3.7 Sonnet, introducing a groundbreaking hybrid inference architecture that allows developers to seamlessly dial reasoning tokens from instantaneous responses to comprehensive deep multi-step verification.',
        'content' => '<p>In a significant milestone for generative artificial intelligence models, Anthropic has officially unveiled Claude 3.7 Sonnet. The model marks an industry hybrid reasoning architecture, capable of producing near-zero latency standard answers while dynamically switching to deep chain-of-thought verification when presented with complex mathematical or algorithmic coding dilemmas.</p>
<h3>Dual-Mode Reasoning Architecture</h3>
<p>Unlike previous generational models which required hard forks between "fast" chat models and "slow" reasoning models, Claude 3.7 unifies both capabilities under a single model weight footprint. Developers interacting through the API can set a precise <code>max_thinking_tokens</code> parameter to control reasoning depth.</p>
<blockquote><p>"The boundary between conversational responsiveness and deep deliberate reasoning is dissolving," stated Anthropic research leads in their technical documentation. "Engineers should not be forced to choose between interactive speed and deep logical rigor."</p></blockquote>
<h3>Benchmark Performance & Enterprise Impact</h3>
<p>Internal benchmarks show dramatic improvements across SWE-bench Verified coding tests, achieving state-of-the-art accuracy on real-world GitHub bug resolutions and complex automated security audits.</p>
<p>Major cloud platforms including AWS Bedrock and Google Cloud Vertex AI have announced immediate preview availability for enterprise customers beginning this week.</p>',
        'cover_image_url' => 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
        'cover_image_alt' => 'Futuristic artificial intelligence neural grid visualization',
        'video_url' => 'https://www.youtube.com/watch?v=kYqD6Q17Fas',
        'source' => 'Rafvex Technology Desk',
        'source_url' => 'https://rafvex.com/news',
        'is_breaking' => true,
        'views_count' => 0,
        'status' => 'published',
        'published_at' => now()->subMinutes(42),
    ],
    [
        'title' => 'Federal Cyber Agency Issues Emergency Directive Over Critical Edge Router Vulnerabilities',
        'slug' => 'federal-cyber-agency-emergency-directive-edge-router-vulnerability',
        'summary' => 'WASHINGTON — The Cybersecurity and Infrastructure Security Agency (CISA) issued an urgent binding operational directive ordering all federal civilian agencies to patch or isolate internet-facing enterprise routing gateways within 72 hours.',
        'content' => '<p>The Cybersecurity and Infrastructure Security Agency (CISA) published an emergency binding directive following active zero-day exploitation targeting peripheral routing hardware across key communications infrastructure providers.</p>
<h3>Immediate Mitigation Protocol</h3>
<p>The directive requires network administrators to audit administrative management interfaces exposed to the public internet, disable legacy remote access protocols, and deploy the vendor-supplied hotfix without standard maintenance delay windows.</p>
<p>Network security researchers discovered proof-of-concept exploits actively circulating in cybersecurity research channels, prompting the expedited federal intervention.</p>',
        'cover_image_url' => 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80',
        'cover_image_alt' => 'Cyber security server rack with illuminated status indicators',
        'video_url' => 'https://www.youtube.com/watch?v=inWWhr5tnEA',
        'source' => 'Rafvex Security Desk',
        'source_url' => 'https://rafvex.com/news',
        'is_breaking' => false,
        'views_count' => 0,
        'status' => 'published',
        'published_at' => now()->subHours(3),
    ],
    [
        'title' => 'Open-Source Mixture-of-Experts Architecture Shatters Cost-Performance Milestones',
        'slug' => 'open-source-moe-architecture-shatters-cost-performance',
        'summary' => 'Open foundation model benchmarks highlight a 65% reduction in training and inference costs, driven by sparse activation patterns and advanced speculative decoding routines.',
        'content' => '<p>Global technology researchers and open-source practitioners received a major efficiency boost this week as benchmark datasets for next-generation Mixture-of-Experts (MoE) architectures revealed unprecedented price-to-performance efficiency.</p>
<p>By routing individual tokens exclusively to specialized parameter sub-networks, the architecture achieves the reasoning throughput of dense models three times its active memory footprint.</p>
<p>Financial analysts note the breakthrough significantly lowers the capital barrier for startups training domain-specific models in healthcare and legal analytics.</p>',
        'cover_image_url' => 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=80',
        'cover_image_alt' => 'Data center hardware processing high-throughput computational workloads',
        'video_url' => 'https://www.youtube.com/watch?v=aircAruvnKk',
        'source' => 'Rafvex AI Research',
        'source_url' => 'https://rafvex.com/news',
        'is_breaking' => false,
        'views_count' => 0,
        'status' => 'published',
        'published_at' => now()->subHours(6),
    ],
];

foreach ($newsItems as $item) {
    News::firstOrCreate(
        ['slug' => $item['slug']],
        $item
    );
    echo "Seeded news dispatch if missing: {$item['title']}\n";
}

echo "News seeding complete!\n";
