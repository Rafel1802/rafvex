<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('home_ads', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('sponsor_name')->nullable();
            $table->text('subtitle')->nullable();
            $table->enum('media_type', ['image', 'video', 'gif'])->default('image');
            $table->text('media_url')->nullable();
            $table->text('video_url')->nullable();
            $table->text('link_url')->nullable();
            $table->string('aspect_ratio')->default('landscape'); // landscape (16:9), square (1:1), auto
            $table->string('badge_text')->nullable()->default('Sponsored');
            $table->integer('order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->unsignedBigInteger('impressions_count')->default(0);
            $table->unsignedBigInteger('clicks_count')->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('home_ads');
    }
};
