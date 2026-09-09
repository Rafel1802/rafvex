<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $mainCategories = [
            'Android & iPhone' => [
                'Android Tips', 'iPhone Tips', 'Android Apps', 'iPhone Apps', 'Battery & Charging',
                'Storage & Performance', 'Camera & Photos', 'Privacy & Security', 'Settings & Customization',
                'Buying Guides', 'Troubleshooting', 'Hidden Features', 'Accessories'
            ],
            'Windows & Mac' => [
                'Windows Tips', 'Windows 11', 'macOS Tips', 'MacBook Guides', 'Software', 'Drivers',
                'Performance', 'File Management', 'Networking', 'Troubleshooting', 'Security',
                'Keyboard Shortcuts', 'Productivity'
            ],
            'AI Tools' => [
                'ChatGPT', 'Google AI', 'AI Image Tools', 'AI Video Tools', 'AI Writing Tools',
                'AI Coding Tools', 'AI Productivity', 'AI Search', 'AI Automation', 'AI Tool Reviews',
                'AI Comparisons', 'AI Tutorials', 'Free AI Tools'
            ],
            'Websites & Apps' => [
                'Google', 'Microsoft', 'Social Media', 'Messaging Apps', 'Productivity Apps',
                'Cloud Storage', 'Browsers', 'Email', 'Online Tools', 'Website Guides', 'App Reviews',
                'App Comparisons', 'Free Online Tools'
            ],
            'Troubleshooting' => [
                'Android Problems', 'iPhone Problems', 'Windows Problems', 'Mac Problems', 'Wi-Fi & Internet',
                'Bluetooth', 'Printers', 'Audio', 'Video', 'Software Errors', 'App Errors', 'Login Problems',
                'Performance Problems'
            ],
            'Basic Online Security' => [
                'Account Security', 'Passwords', 'Two-Factor Authentication', 'Phishing Awareness',
                'Scam Awareness', 'Privacy', 'Browser Security', 'Phone Security', 'Computer Security',
                'Social Media Security', 'Safe Downloads', 'Data Protection'
            ],
            'AI for Students & Work' => [
                'AI for Students', 'AI for Teachers', 'AI for Developers', 'AI for Writers', 'AI for Designers',
                'AI for Business', 'AI for Productivity', 'AI for Research', 'AI Study Tools', 'AI Presentation Tools',
                'AI Resume/CV Tools', 'AI Office Tools', 'AI Workflows'
            ]
        ];

        foreach ($mainCategories as $parentName => $subCategories) {
            $parent = Category::firstOrCreate(
                ['slug' => Str::slug($parentName)],
                ['name' => $parentName]
            );

            foreach ($subCategories as $subName) {
                Category::firstOrCreate(
                    ['slug' => Str::slug($subName)],
                    [
                        'name' => $subName,
                        'parent_id' => $parent->id
                    ]
                );
            }
        }
    }
}
