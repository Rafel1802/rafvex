<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('articles') && !Schema::hasColumn('articles', 'video_url')) {
            Schema::table('articles', function (Blueprint $table) {
                $table->string('video_url')->nullable()->after('cover_image_alt');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('articles') && Schema::hasColumn('articles', 'video_url')) {
            Schema::table('articles', function (Blueprint $table) {
                $table->dropColumn('video_url');
            });
        }
    }
};
