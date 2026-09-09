<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('article_id')->constrained()->cascadeOnDelete();
            $table->unsignedBigInteger('parent_id')->nullable()->index();
            $table->string('author_name');
            $table->string('author_email');
            $table->string('author_ip', 45)->nullable();
            $table->text('content');
            // pending | approved | rejected | spam | trash
            $table->string('status')->default('pending')->index();
            $table->timestamp('approved_at')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('parent_id')->references('id')->on('comments')->nullOnDelete();
            $table->index(['article_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('comments');
    }
};
