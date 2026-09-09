<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Article;
use App\Models\User;
use App\Models\Category;
use Illuminate\Support\Str;

class ArticleSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::first();
        if (!$admin) return;

        $category = Category::whereNotNull('parent_id')->first();

        // Sample Article 1
        Article::firstOrCreate(
            ['slug' => 'how-to-fix-android-storage-problems'],
            [
                'user_id' => $admin->id,
                'category_id' => $category?->id,
                'title' => 'How to Fix Android Storage Problems',
                'excerpt' => 'A practical step-by-step guide to clearing space on your Android device without losing important data.',
                'content' => '<h2>Introduction</h2><p>Running out of storage is one of the most common issues Android users face...</p>',
                'status' => 'published',
                'published_at' => now(),
                'reading_time' => 5,
            ]
        );

        // Sample Article 2
        Article::firstOrCreate(
            ['slug' => 'best-ai-tools-for-students-2026'],
            [
                'user_id' => $admin->id,
                'category_id' => Category::where('name', 'AI for Students')->first()?->id,
                'title' => 'Best AI Tools for Students in 2026',
                'excerpt' => 'Discover the top AI tools that can help you research faster, write better, and study more efficiently.',
                'content' => '<h2>Top Tools</h2><p>Here are the best tools available...</p>',
                'status' => 'draft',
            ]
        );
    }
}
