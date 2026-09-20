<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('articles')) {
            Schema::table('articles', function (Blueprint $table) {
                if (! Schema::hasColumn('articles', 'is_breaking')) {
                    $table->boolean('is_breaking')->default(false)->after('status');
                }
                if (! Schema::hasColumn('articles', 'breaking_until')) {
                    $table->dateTime('breaking_until')->nullable()->after('is_breaking');
                }
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('articles')) {
            Schema::table('articles', function (Blueprint $table) {
                if (Schema::hasColumn('articles', 'breaking_until')) {
                    $table->dropColumn('breaking_until');
                }
                if (Schema::hasColumn('articles', 'is_breaking')) {
                    $table->dropColumn('is_breaking');
                }
            });
        }
    }
};
