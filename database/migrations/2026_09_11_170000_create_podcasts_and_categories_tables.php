<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasTable('podcast_categories')) {
            Schema::create('podcast_categories', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('slug')->unique();
                $table->text('description')->nullable();
                $table->string('cover_image_url', 1000)->nullable();
                $table->integer('sort_order')->default(0);
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('podcasts')) {
            Schema::create('podcasts', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('category_id')->nullable();
                $table->unsignedBigInteger('author_id')->nullable();
                $table->string('title');
                $table->string('slug')->unique();
                $table->text('summary')->nullable();
                $table->longText('description')->nullable();
                $table->string('audio_url', 1000)->nullable();
                $table->string('audio_path', 1000)->nullable();
                $table->string('audio_format', 20)->nullable()->default('mp3');
                $table->unsignedBigInteger('audio_size_bytes')->nullable()->default(0);
                $table->integer('duration_seconds')->default(0);
                $table->string('cover_image_url', 1000)->nullable();
                $table->string('host_name')->nullable()->default('Rafvex Tech Desk');
                $table->integer('episode_number')->nullable();
                $table->integer('season_number')->nullable()->default(1);
                $table->enum('status', ['draft', 'published', 'scheduled'])->default('published');
                $table->dateTime('published_at')->nullable();
                $table->boolean('is_featured')->default(false);
                $table->enum('live_status', ['none', 'upcoming', 'live', 'ended'])->default('none');
                $table->dateTime('live_started_at')->nullable();
                $table->dateTime('live_scheduled_at')->nullable();
                $table->dateTime('live_ended_at')->nullable();
                $table->integer('views_count')->default(0);
                $table->integer('plays_count')->default(0);
                $table->timestamps();

                $table->foreign('category_id')->references('id')->on('podcast_categories')->nullOnDelete();
                $table->foreign('author_id')->references('id')->on('users')->nullOnDelete();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('podcasts');
        Schema::dropIfExists('podcast_categories');
    }
};
