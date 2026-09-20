<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('news') && ! Schema::hasColumn('news', 'breaking_until')) {
            Schema::table('news', function (Blueprint $table) {
                $table->dateTime('breaking_until')->nullable()->after('is_breaking');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('news') && Schema::hasColumn('news', 'breaking_until')) {
            Schema::table('news', function (Blueprint $table) {
                $table->dropColumn('breaking_until');
            });
        }
    }
};
