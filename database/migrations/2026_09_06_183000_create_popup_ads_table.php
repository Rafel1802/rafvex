<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('popup_ads', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('subtitle')->nullable();
            $table->string('sponsor_name')->nullable();
            $table->enum('media_type', ['image', 'video', 'gif'])->default('image');
            $table->text('media_url')->nullable();
            $table->text('video_url')->nullable();
            $table->string('aspect_ratio')->default('auto'); // auto, landscape, portrait, square
            $table->string('button_text')->nullable()->default('Visit Sponsor');
            $table->text('button_url')->nullable();
            $table->string('button_color')->nullable()->default('#dc2626');
            $table->boolean('is_active')->default(true);
            $table->integer('delay_seconds')->default(3);
            $table->string('show_on_pages')->default('all'); // all, home, articles
            $table->string('show_frequency')->default('once_per_session'); // once_per_session, always, once_per_day
            $table->timestamp('start_at')->nullable();
            $table->timestamp('end_at')->nullable();
            $table->unsignedBigInteger('impressions_count')->default(0);
            $table->unsignedBigInteger('clicks_count')->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('popup_ads');
    }
};
