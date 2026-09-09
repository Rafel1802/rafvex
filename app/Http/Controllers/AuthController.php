<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Show the login form.
     */
    public function showLoginForm(): Response|RedirectResponse
    {
        if (Auth::check()) {
            $user = Auth::user();
            if ($user && $user->isStaff()) {
                return redirect()->route('admin.dashboard');
            }
            // Visitor is signed in as a website reader/customer.
            // Allow them to view the CMS login form to authenticate with an admin account.
        }

        return Inertia::render('Auth/Login');
    }

    /**
     * Handle an authentication attempt.
     */
    public function login(Request $request): RedirectResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        $clientIp = $request->ip();

        // 1. Check if IP address is currently blocked
        $blocked = \DB::table('blocked_ips')
            ->where('ip_address', $clientIp)
            ->where('active', true)
            ->first();

        if ($blocked) {
            throw ValidationException::withMessages([
                'email' => 'Your device / IP address (' . $clientIp . ') has been blocked. Reason: ' . ($blocked->reason ?: 'Security policy') . '. Only a Super Admin can unblock your access.',
            ]);
        }

        // 2. Count recent failed login attempts from this IP in the past 24 hours
        $recentFailedAttempts = \DB::table('login_logs')
            ->where('ip_address', $clientIp)
            ->where('successful', false)
            ->where('created_at', '>=', now()->subHours(24))
            ->count();

        // If this attempt would reach or exceed 7 failed attempts:
        if ($recentFailedAttempts >= 6) {
            \DB::table('blocked_ips')->updateOrInsert(
                ['ip_address' => $clientIp],
                [
                    'reason' => 'Automatically blocked: 7 failed login attempts.',
                    'active' => true,
                    'permanent' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );

            \DB::table('security_events')->insert([
                'event_type' => 'brute_force_blocked',
                'severity' => 'critical',
                'ip_address' => $clientIp,
                'user_agent' => substr((string)$request->userAgent(), 0, 500),
                'metadata' => json_encode(['email' => $request->email, 'failed_attempts' => $recentFailedAttempts + 1]),
                'created_at' => now(),
            ]);

            \DB::table('login_logs')->insert([
                'email' => $request->email,
                'ip_address' => $clientIp,
                'user_agent' => substr((string)$request->userAgent(), 0, 500),
                'successful' => false,
                'failure_reason' => 'Blocked: 7 failed attempts reached',
                'created_at' => now(),
            ]);

            throw ValidationException::withMessages([
                'email' => 'Too many failed login attempts (7). Your IP (' . $clientIp . ') has been blocked. Only a Super Admin can unblock your access.',
            ]);
        }

        // 3. Strictly verify that the user is an Administrator / Staff member before authenticating
        $attemptUser = User::where('email', $credentials['email'])->first();
        if ($attemptUser && !$attemptUser->isStaff()) {
            \DB::table('login_logs')->insert([
                'email' => $request->email,
                'ip_address' => $clientIp,
                'user_agent' => substr((string)$request->userAgent(), 0, 500),
                'successful' => false,
                'failure_reason' => 'Denied: Public reader account attempted CMS login',
                'created_at' => now(),
            ]);

            throw ValidationException::withMessages([
                'email' => 'Access denied. This login portal is strictly reserved for CMS administrators and editorial staff. Public reader accounts cannot sign in here.',
            ]);
        }

        if (Auth::attempt($credentials, $request->boolean('remember'))) {
            $request->session()->regenerate();
            
            // Log successful login
            $user = Auth::user();
            $user->last_login_at = now();
            $user->last_login_ip = $clientIp;
            $user->save();
            
            \DB::table('login_logs')->insert([
                'user_id' => $user->id,
                'email' => $request->email,
                'ip_address' => $clientIp,
                'user_agent' => substr((string)$request->userAgent(), 0, 500),
                'successful' => true,
                'created_at' => now(),
            ]);

            // Redirect safely to dashboard without getting trapped by a stale /ourcms intended url
            $intended = session()->pull('url.intended', route('admin.dashboard'));
            if (empty($intended) || str_contains($intended, '/ourcms/login') || str_ends_with(rtrim($intended, '/'), '/ourcms') || str_ends_with(rtrim($intended, '/'), '/login')) {
                $intended = route('admin.dashboard');
            }

            return redirect()->to($intended);
        }

        // Log failed login
        \DB::table('login_logs')->insert([
            'email' => $request->email,
            'ip_address' => $clientIp,
            'user_agent' => substr((string)$request->userAgent(), 0, 500),
            'successful' => false,
            'failure_reason' => 'Invalid credentials',
            'created_at' => now(),
        ]);

        $remainingAttempts = max(0, 7 - ($recentFailedAttempts + 1));

        throw ValidationException::withMessages([
            'email' => 'The provided credentials do not match our records. (' . $remainingAttempts . ' attempt(s) remaining before IP lockout)',
        ]);
    }

    /**
     * Log the user out of the application.
     */
    public function logout(Request $request): RedirectResponse
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }
}
