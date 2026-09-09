<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('news')) {
            Schema::create('news', function (Blueprint $table) {
                $table->id();
                $table->string('title');
                $table->string('slug')->unique();
                $table->text('summary')->nullable();
                $table->longText('content');
                $table->string('cover_image_url')->nullable();
                $table->string('cover_image_alt')->nullable();
                $table->string('video_url')->nullable();
                $table->string('source')->nullable()->default('Rafvex News Wire');
                $table->string('source_url')->nullable();
                $table->boolean('is_breaking')->default(false);
                $table->unsignedBigInteger('views_count')->default(0);
                $table->enum('status', ['published', 'draft'])->default('published');
                $table->dateTime('published_at')->nullable();
                $table->timestamps();
                $table->softDeletes();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('news');
    }
};
