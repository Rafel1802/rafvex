<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Key-value settings store
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('group')->default('general')->index();
            $table->string('key')->unique();
            $table->longText('value')->nullable();
            $table->string('type')->default('string'); // string, boolean, integer, json, text
            $table->string('label')->nullable();
            $table->timestamps();
        });

        // 301/302 redirects
        Schema::create('redirects', function (Blueprint $table) {
            $table->id();
            $table->string('from_url')->unique();
            $table->string('to_url');
            $table->unsignedSmallInteger('status_code')->default(301);
            $table->boolean('active')->default(true)->index();
            $table->unsignedBigInteger('hits')->default(0);
            $table->timestamps();

            $table->index(['from_url', 'active']);
        });

        // Advertisement placements
        Schema::create('advertisements', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('placement')->unique(); // homepage_top, article_top, etc.
            $table->boolean('enabled')->default(false);
            $table->text('code')->nullable(); // ad script/HTML
            $table->string('ad_client')->nullable(); // AdSense client
            $table->string('ad_slot')->nullable();   // AdSense slot
            $table->string('ad_format')->nullable();
            $table->string('device')->default('all'); // all, desktop, mobile
            $table->timestamps();
        });

        // Static pages
        Schema::create('pages', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->longText('content')->nullable();
            $table->string('meta_title')->nullable();
            $table->string('meta_description', 500)->nullable();
            $table->string('status')->default('draft'); // draft, published
            $table->boolean('noindex')->default(false);
            $table->timestamps();
        });

        // Page view tracking (privacy-minimal)
        Schema::create('page_views', function (Blueprint $table) {
            $table->id();
            $table->string('viewable_type')->nullable(); // Article, Category, Page
            $table->unsignedBigInteger('viewable_id')->nullable();
            $table->string('url', 1000);
            $table->string('referrer', 1000)->nullable();
            $table->string('device_type', 50)->nullable(); // desktop, mobile, tablet
            $table->string('browser', 100)->nullable();
            $table->date('viewed_on')->index(); // no time, privacy-first
            $table->timestamps();

            $table->index(['viewable_type', 'viewable_id', 'viewed_on']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('page_views');
        Schema::dropIfExists('pages');
        Schema::dropIfExists('advertisements');
        Schema::dropIfExists('redirects');
        Schema::dropIfExists('settings');
    }
};
