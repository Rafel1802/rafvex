<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('media', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('filename');          // stored safe filename
            $table->string('original_filename'); // original upload name
            $table->string('disk')->default('public');
            $table->string('path');
            $table->string('url');
            $table->string('mime_type', 100);
            $table->string('extension', 20);
            $table->unsignedBigInteger('size'); // bytes
            $table->unsignedInteger('width')->nullable();
            $table->unsignedInteger('height')->nullable();
            $table->string('alt')->nullable();
            $table->string('caption')->nullable();
            $table->text('description')->nullable();
            $table->json('variants')->nullable(); // thumbnail paths
            $table->timestamps();

            $table->index(['mime_type']);
            $table->index(['created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('media');
    }
};
