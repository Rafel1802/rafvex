<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Login attempt logs
        Schema::create('login_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('email')->nullable();
            $table->string('ip_address', 45);
            $table->string('user_agent', 500)->nullable();
            $table->boolean('successful')->default(false);
            $table->string('failure_reason')->nullable();
            $table->string('country')->nullable();
            $table->timestamp('created_at')->useCurrent()->index();

            $table->index(['ip_address', 'created_at']);
            $table->index(['user_id', 'created_at']);
            $table->index(['successful', 'created_at']);
        });

        // Security events
        Schema::create('security_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('event_type'); // brute_force, ip_blocked, 2fa_failed, etc.
            $table->string('severity')->default('info'); // info, warning, critical
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent', 500)->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('created_at')->useCurrent()->index();

            $table->index(['event_type', 'created_at']);
            $table->index(['severity', 'created_at']);
        });

        // Blocked IPs
        Schema::create('blocked_ips', function (Blueprint $table) {
            $table->id();
            $table->string('ip_address', 50)->index(); // supports CIDR
            $table->string('reason')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('expires_at')->nullable()->index();
            $table->boolean('permanent')->default(false);
            $table->boolean('active')->default(true)->index();
            $table->timestamps();

            $table->index(['ip_address', 'active']);
        });

        // 2FA secrets
        Schema::create('two_factor_secrets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->text('secret'); // encrypted
            $table->json('recovery_codes')->nullable(); // encrypted
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('two_factor_secrets');
        Schema::dropIfExists('blocked_ips');
        Schema::dropIfExists('security_events');
        Schema::dropIfExists('login_logs');
    }
};
