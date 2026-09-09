<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Article ↔ Tag pivot
        Schema::create('article_tag', function (Blueprint $table) {
            $table->foreignId('article_id')->constrained()->cascadeOnDelete();
            $table->foreignId('tag_id')->constrained()->cascadeOnDelete();
            $table->primary(['article_id', 'tag_id']);
        });

        // Article revisions
        Schema::create('article_revisions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('article_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title');
            $table->longText('content')->nullable();
            $table->longText('content_raw')->nullable();
            $table->text('excerpt')->nullable();
            $table->string('status');
            $table->string('summary')->nullable(); // revision note
            $table->unsignedInteger('revision_number')->default(1);
            $table->timestamp('created_at')->useCurrent();

            $table->index(['article_id', 'revision_number']);
        });

        // Related articles (manual selections)
        Schema::create('article_related', function (Blueprint $table) {
            $table->foreignId('article_id')->constrained()->cascadeOnDelete();
            $table->foreignId('related_article_id')->constrained('articles')->cascadeOnDelete();
            $table->integer('sort_order')->default(0);
            $table->primary(['article_id', 'related_article_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('article_related');
        Schema::dropIfExists('article_revisions');
        Schema::dropIfExists('article_tag');
    }
};
