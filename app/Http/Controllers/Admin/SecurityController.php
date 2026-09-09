<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class SecurityController extends Controller
{
    /**
     * Display security management: blocked IPs and login activity logs.
     */
    public function index(Request $request): Response
    {
        // Auto-purge logs older than 7 days (weekly auto-clean)
        DB::table('login_logs')
            ->where('created_at', '<', now()->subDays(7))
            ->delete();

        DB::table('security_events')
            ->where('created_at', '<', now()->subDays(7))
            ->delete();

        $user = Auth::user();
        $isSuperAdmin = $user && ($user->hasRole('Super Admin') || $user->id === 1);

        // Fetch Blocked IPs
        $blockedIps = DB::table('blocked_ips')
            ->leftJoin('users', 'blocked_ips.created_by', '=', 'users.id')
            ->select(
                'blocked_ips.*',
                'users.name as creator_name',
                'users.email as creator_email'
            )
            ->orderBy('blocked_ips.active', 'desc')
            ->orderBy('blocked_ips.id', 'desc')
            ->get();

        // Fetch Login Logs (filtered or latest)
        $query = DB::table('login_logs')
            ->leftJoin('users', 'login_logs.user_id', '=', 'users.id')
            ->select(
                'login_logs.*',
                'users.name as user_name'
            );

        if ($request->filled('status')) {
            if ($request->status === 'success') {
                $query->where('login_logs.successful', true);
            } elseif ($request->status === 'failed') {
                $query->where('login_logs.successful', false);
            }
        }

        if ($request->filled('search')) {
            $search = '%' . $request->search . '%';
            $query->where(function ($q) use ($search) {
                $q->where('login_logs.email', 'like', $search)
                  ->orWhere('login_logs.ip_address', 'like', $search)
                  ->orWhere('login_logs.failure_reason', 'like', $search);
            });
        }

        $loginLogs = $query->orderBy('login_logs.id', 'desc')->paginate(30)->withQueryString();

        // Stats summary
        $stats = [
            'total_blocked' => DB::table('blocked_ips')->where('active', true)->count(),
            'failed_24h' => DB::table('login_logs')->where('successful', false)->where('created_at', '>=', now()->subHours(24))->count(),
            'success_24h' => DB::table('login_logs')->where('successful', true)->where('created_at', '>=', now()->subHours(24))->count(),
            'total_logs' => DB::table('login_logs')->count(),
        ];

        // Deactivate expired temporary bans
        DB::table('blocked_ips')
            ->where('active', true)
            ->where('permanent', false)
            ->whereNotNull('expires_at')
            ->where('expires_at', '<', now())
            ->update(['active' => false]);

        return Inertia::render('Admin/Security/Index', [
            'blockedIps' => $blockedIps,
            'loginLogs' => $loginLogs,
            'stats' => $stats,
            'isSuperAdmin' => $isSuperAdmin,
            'currentIp' => $request->ip(),
            'filters' => $request->only(['status', 'search']),
        ]);
    }

    /**
     * Block an IP address manually.
     */
    public function blockIp(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'ip_address' => ['required', 'string', 'max:50'],
            'reason' => ['nullable', 'string', 'max:255'],
            'duration' => ['nullable', 'string', 'in:permanent,24h,7d,30d'],
        ]);

        $ip = trim($validated['ip_address']);
        $reason = $validated['reason'] ?: 'Manually blocked by administrator';
        $duration = $validated['duration'] ?? 'permanent';

        $permanent = true;
        $expiresAt = null;

        if ($duration === '24h') {
            $permanent = false;
            $expiresAt = now()->addHours(24);
        } elseif ($duration === '7d') {
            $permanent = false;
            $expiresAt = now()->addDays(7);
        } elseif ($duration === '30d') {
            $permanent = false;
            $expiresAt = now()->addDays(30);
        }

        DB::table('blocked_ips')->updateOrInsert(
            ['ip_address' => $ip],
            [
                'reason' => $reason,
                'created_by' => Auth::id(),
                'active' => true,
                'permanent' => $permanent,
                'expires_at' => $expiresAt,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        DB::table('security_events')->insert([
            'user_id' => Auth::id(),
            'event_type' => 'ip_blocked_manually',
            'severity' => 'warning',
            'ip_address' => $ip,
            'user_agent' => substr((string)$request->userAgent(), 0, 500),
            'metadata' => json_encode([
                'reason' => $reason,
                'duration' => $duration,
                'expires_at' => $expiresAt ? $expiresAt->toDateTimeString() : null,
                'blocked_by' => Auth::user()->name ?? 'Admin',
            ]),
            'created_at' => now(),
        ]);

        return back()->with('success', "IP address {$ip} has been blocked successfully.");
    }

    /**
     * Unblock an IP address (Super Admin only).
     */
    public function unblockIp(Request $request, int $id): RedirectResponse
    {
        $user = Auth::user();
        $isSuperAdmin = $user && ($user->hasRole('Super Admin') || $user->id === 1);

        if (!$isSuperAdmin) {
            return back()->with('error', 'Only a Super Admin has authorization to unblock IP addresses.');
        }

        $blocked = DB::table('blocked_ips')->where('id', $id)->first();

        if ($blocked) {
            DB::table('blocked_ips')->where('id', $id)->delete();

            DB::table('security_events')->insert([
                'user_id' => Auth::id(),
                'event_type' => 'ip_unblocked',
                'severity' => 'info',
                'ip_address' => $blocked->ip_address,
                'user_agent' => substr((string)$request->userAgent(), 0, 500),
                'metadata' => json_encode(['unblocked_by' => $user->name]),
                'created_at' => now(),
            ]);

            return back()->with('success', "IP address {$blocked->ip_address} has been unblocked.");
        }

        return back()->with('error', 'Blocked IP record not found.');
    }

    /**
     * Clear all login activity logs manually.
     */
    public function clearLogs(Request $request): RedirectResponse
    {
        DB::table('login_logs')->delete();
        DB::table('security_events')->delete();

        return back()->with('success', 'All login activity logs have been cleared successfully.');
    }
}
