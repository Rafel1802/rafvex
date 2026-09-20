<?php

use App\Models\Category;
use Illuminate\Support\Str;

/**
 * Automatically creates all Category and Subcategory folders inside the Media Library ($ROOT_FOLDER = "blog").
 * Works both standalone and with Laravel if available.
 */
$baseDir = __DIR__.'/public/medialibrary/blog';

if (! is_dir($baseDir)) {
    mkdir($baseDir, 0755, true);
}

// 1. Comprehensive mapping of all Categories & Subcategories
$categoriesMap = [
    'android-iphone' => [
        'android-tips', 'iphone-tips', 'android-apps', 'iphone-apps', 'battery-charging',
        'storage-performance', 'camera-photos', 'privacy-security', 'settings-customization',
        'buying-guides', 'troubleshooting', 'hidden-features', 'accessories',
        'cross-platform-utilities', 'mobile-security', 'field-operations',
        'mobile-automation', 'ios-optimization', 'android-utilities', 'focus-ergonomics',
    ],
    'windows-mac' => [
        'windows-tips', 'windows-11', 'macos-tips', 'macbook-guides', 'software', 'drivers',
        'performance', 'file-management', 'networking', 'security', 'keyboard-shortcuts',
        'productivity', 'desktop-os-comparison', 'terminal-automation', 'data-integrity',
        'windows-optimization', 'macos-workflows', 'open-source-stacks',
    ],
    'ai-tools' => [
        'chatgpt', 'google-ai', 'ai-image-tools', 'ai-video-tools', 'ai-writing-tools',
        'ai-coding-tools', 'ai-productivity', 'ai-search', 'ai-automation', 'ai-tool-reviews',
        'ai-comparisons', 'ai-tutorials', 'free-ai-tools', 'local-ai-models',
        'literature-discovery', 'advanced-prompting', 'prompt-engineering',
        'model-comparison', 'writing-workflows', 'free-ai-stacks', 'ai-model-comparisons',
    ],
    'websites-apps' => [
        'google', 'microsoft', 'social-media', 'messaging-apps', 'productivity-apps',
        'cloud-storage', 'browsers', 'email', 'online-tools', 'website-guides', 'app-reviews',
        'app-comparisons', 'free-online-tools', 'reference-management',
        'personal-knowledge-management', 'pkm-systems', 'cloud-backups', 'web-utilities',
    ],
    'troubleshooting-how-to' => [
        'android-problems', 'iphone-problems', 'windows-problems', 'mac-problems',
        'wi-fi-internet', 'bluetooth', 'printers', 'audio', 'video', 'software-errors',
        'app-errors', 'login-problems', 'performance-problems', 'network-engineering',
        'mobile-diagnostics', 'hardware-troubleshooting',
    ],
    'troubleshooting' => [
        'android-problems', 'iphone-problems', 'windows-problems', 'mac-problems',
        'wi-fi-internet', 'bluetooth', 'printers', 'audio', 'video', 'software-errors',
        'app-errors', 'login-problems', 'performance-problems',
    ],
    'basic-online-security' => [
        'account-security', 'passwords', 'two-factor-authentication', 'phishing-awareness',
        'scam-awareness', 'privacy', 'browser-security', 'phone-security', 'computer-security',
        'social-media-security', 'safe-downloads', 'data-protection', 'travel-opsec',
        'multi-factor-authentication', 'threat-modeling', 'authentication-hardening',
        'password-architecture',
    ],
    'ai-for-students-work' => [
        'ai-for-students', 'ai-for-teachers', 'ai-for-developers', 'ai-for-writers',
        'ai-for-designers', 'ai-for-business', 'ai-for-productivity', 'ai-for-research',
        'ai-study-tools', 'ai-presentation-tools', 'ai-resumecv-tools', 'ai-office-tools',
        'ai-workflows', 'academic-integrity', 'workflow-automation', 'academic-funding',
        'literature-automation', 'grant-engineering',
    ],
    'english-reading-stories' => [
        'short-stories', 'vocabulary-life', 'inspirational-stories',
    ],
    'reviews' => [
        'tech-reviews', 'ai-software-reviews', 'hardware-gadgets', 'smartphone-reviews',
    ],
    'technology' => [
        'future-tech', 'ai-hardware', 'gadgets', 'emerging-tech',
    ],
    'education' => [
        'tutorials', 'study-guides', 'academic-skills',
    ],
    'tips-tricks' => [
        'quick-tips', 'shortcuts', 'productivity-hacks',
    ],
    'websites' => [
        'web-design', 'useful-websites', 'online-tools',
    ],
    'internet' => [
        'networking', 'online-services', 'privacy',
    ],
    'interesting' => [
        'stories', 'curiosities', 'discoveries',
    ],
];

// 2. If database is accessible, fetch any newly created dynamic categories too
try {
    if (file_exists(__DIR__.'/vendor/autoload.php') && file_exists(__DIR__.'/bootstrap/app.php')) {
        require_once __DIR__.'/vendor/autoload.php';
        $app = require_once __DIR__.'/bootstrap/app.php';
        $app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

        if (class_exists('\App\Models\Category')) {
            $parents = Category::with('children')->whereNull('parent_id')->get();
            foreach ($parents as $p) {
                $pSlug = $p->slug ?: Str::slug($p->name);
                if (! isset($categoriesMap[$pSlug])) {
                    $categoriesMap[$pSlug] = [];
                }
                foreach ($p->children as $c) {
                    $cSlug = $c->slug ?: Str::slug($c->name);
                    if (! in_array($cSlug, $categoriesMap[$pSlug])) {
                        $categoriesMap[$pSlug][] = $cSlug;
                    }
                }
            }
        }
    }
} catch (Throwable $e) {
    // Continue with defined dictionary
}

$createdCount = 0;
$parentCount = 0;

foreach ($categoriesMap as $parentSlug => $subSlugs) {
    $parentPath = $baseDir.'/'.$parentSlug;
    if (! is_dir($parentPath)) {
        mkdir($parentPath, 0755, true);
        $parentCount++;
    }

    // Also add an index.html protection file
    if (! file_exists($parentPath.'/index.html')) {
        file_put_contents($parentPath.'/index.html', '<!DOCTYPE html><html><head><title>403 Forbidden</title></head><body><p>Access Denied</p></body></html>');
    }

    foreach ($subSlugs as $subSlug) {
        $subPath = $parentPath.'/'.$subSlug;
        if (! is_dir($subPath)) {
            mkdir($subPath, 0755, true);
            $createdCount++;
        }
        if (! file_exists($subPath.'/index.html')) {
            file_put_contents($subPath.'/index.html', '<!DOCTYPE html><html><head><title>403 Forbidden</title></head><body><p>Access Denied</p></body></html>');
        }
    }
}

echo 'Created/verified '.count($categoriesMap)." parent category folders and {$createdCount} new subcategory folders in {$baseDir}!\n";
