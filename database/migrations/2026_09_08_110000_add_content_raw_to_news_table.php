<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('news') && ! Schema::hasColumn('news', 'content_raw')) {
            Schema::table('news', function (Blueprint $table) {
                $table->longText('content_raw')->nullable()->after('content');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('news') && Schema::hasColumn('news', 'content_raw')) {
            Schema::table('news', function (Blueprint $table) {
                $table->dropColumn('content_raw');
            });
        }
    }
};
