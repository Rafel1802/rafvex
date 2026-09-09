<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('articles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->restrictOnDelete(); // author
            $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('cover_image_id')->nullable()->constrained('media')->nullOnDelete();

            // Content
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('excerpt')->nullable();
            $table->longText('content')->nullable();      // sanitized HTML
            $table->longText('content_raw')->nullable();  // Tiptap JSON for editor

            // Status pipeline
            // draft | review | approved | scheduled | published | archived | trash
            $table->string('status')->default('draft')->index();

            // Dates
            $table->timestamp('published_at')->nullable()->index();
            $table->timestamp('scheduled_at')->nullable();
            $table->timestamps();
            $table->softDeletes(); // for trash

            // Cover image
            $table->string('cover_image_url')->nullable();
            $table->string('cover_image_alt')->nullable();

            // SEO
            $table->string('meta_title')->nullable();
            $table->string('meta_description', 500)->nullable();
            $table->string('canonical_url')->nullable();
            $table->boolean('noindex')->default(false);
            $table->boolean('nofollow')->default(false);
            $table->string('og_title')->nullable();
            $table->string('og_description', 500)->nullable();
            $table->string('og_image')->nullable();

            // Metrics
            $table->unsignedInteger('reading_time')->default(0); // minutes
            $table->unsignedBigInteger('views_count')->default(0);

            // Flags
            $table->boolean('featured')->default(false);
            $table->boolean('allow_comments')->default(true);
            $table->boolean('ai_assisted')->default(false); // internal flag

            // Revision tracking
            $table->unsignedInteger('revision_count')->default(0);

            // Indexes
            $table->index(['status', 'published_at']);
            $table->index(['user_id', 'status']);
            $table->index(['category_id', 'status', 'published_at']);
            $table->index(['featured', 'status', 'published_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('articles');
    }
};
