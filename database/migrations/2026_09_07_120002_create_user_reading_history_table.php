<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('user_reading_history')) {
            Schema::create('user_reading_history', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained()->cascadeOnDelete();
                $table->foreignId('article_id')->constrained()->cascadeOnDelete();
                $table->timestamp('read_at')->useCurrent();
                $table->unsignedInteger('read_count')->default(1);
                $table->timestamps();

                $table->unique(['user_id', 'article_id']);
                $table->index(['user_id', 'read_at']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('user_reading_history');
    }
};
