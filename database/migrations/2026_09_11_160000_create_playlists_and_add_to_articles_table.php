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
        if (! Schema::hasTable('playlists')) {
            Schema::create('playlists', function (Blueprint $table) {
                $table->id();
                $table->string('title');
                $table->string('slug')->unique();
                $table->text('description')->nullable();
                $table->string('cover_image_url', 1000)->nullable();
                $table->timestamps();
            });
        }

        if (Schema::hasTable('articles')) {
            Schema::table('articles', function (Blueprint $table) {
                if (! Schema::hasColumn('articles', 'playlist_id')) {
                    $table->unsignedBigInteger('playlist_id')->nullable()->after('category_id');
                    $table->foreign('playlist_id')->references('id')->on('playlists')->nullOnDelete();
                }
                if (! Schema::hasColumn('articles', 'playlist_order')) {
                    $table->integer('playlist_order')->default(0)->after('playlist_id');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('articles')) {
            Schema::table('articles', function (Blueprint $table) {
                if (Schema::hasColumn('articles', 'playlist_id')) {
                    $table->dropForeign(['playlist_id']);
                    $table->dropColumn('playlist_id');
                }
                if (Schema::hasColumn('articles', 'playlist_order')) {
                    $table->dropColumn('playlist_order');
                }
            });
        }

        Schema::dropIfExists('playlists');
    }
};
