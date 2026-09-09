<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;
use Spatie\Permission\Models\Role;

class AuthController extends Controller
{
    /**
     * Register a new public member / customer.
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name'     => ['required', 'string', 'max:255'],
            'email'    => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', Password::min(8), 'confirmed'],
        ]);

        // Ensure Customer role exists
        Role::firstOrCreate(['name' => 'Customer', 'guard_name' => 'web']);

        $user = User::create([
            'name'          => $validated['name'],
            'email'         => strtolower(trim($validated['email'])),
            'password'      => Hash::make($validated['password']),
            'is_active'     => true,
            'last_login_at' => now(),
            'last_login_ip' => $request->ip(),
        ]);

        $user->assignRole('Customer');

        Auth::login($user, true);
        $request->session()->regenerate();

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => "Welcome to Rafvex, {$user->name}!",
                'user'    => [
                    'id'     => $user->id,
                    'name'   => $user->name,
                    'email'  => $user->email,
                    'avatar' => $user->avatar,
                    'roles'  => $user->getRoleNames(),
                ],
            ]);
        }

        return back()->with('message', "Welcome to Rafvex, {$user->name}!");
    }

    /**
     * Authenticate an existing public customer or staff member.
     */
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email'    => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $clientIp = $request->ip();

        // Check if IP is blocked
        $blocked = \DB::table('blocked_ips')
            ->where('ip_address', $clientIp)
            ->where('active', true)
            ->first();

        if ($blocked) {
            if ($request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Your device / IP address has been blocked.',
                ], 403);
            }
            throw ValidationException::withMessages([
                'email' => 'Your device / IP address has been blocked.',
            ]);
        }

        $remember = $request->boolean('remember', true);

        if (!Auth::attempt($credentials, $remember)) {
            if ($request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'The provided credentials do not match our records.',
                ], 422);
            }
            throw ValidationException::withMessages([
                'email' => 'The provided credentials do not match our records.',
            ]);
        }

        $user = Auth::user();

        if (!$user->is_active) {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            if ($request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Your account has been deactivated. Please contact support.',
                ], 403);
            }
            throw ValidationException::withMessages([
                'email' => 'Your account has been deactivated. Please contact support.',
            ]);
        }

        $request->session()->regenerate();
        $user->last_login_at = now();
        $user->last_login_ip = $clientIp;
        $user->save();

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => "Welcome back, {$user->name}!",
                'user'    => [
                    'id'     => $user->id,
                    'name'   => $user->name,
                    'email'  => $user->email,
                    'avatar' => $user->avatar,
                    'roles'  => $user->getRoleNames(),
                ],
            ]);
        }

        return back()->with('message', "Welcome back, {$user->name}!");
    }

    /**
     * Authenticate or register via Google Identity Services (GSI) ID token.
     */
    public function googleLogin(Request $request)
    {
        $request->validate([
            'id_token' => ['required', 'string'],
        ]);

        $googleData = $this->verifyGoogleToken($request->id_token);

        if (!$googleData) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired Google authentication token. Please try again.',
            ], 422);
        }

        $googleId      = $googleData['sub'] ?? null;
        $googleEmail   = strtolower(trim($googleData['email'] ?? ''));
        $googleName    = $googleData['name'] ?? explode('@', $googleEmail)[0];
        $googleAvatar  = $googleData['picture'] ?? null;
        $emailVerified = filter_var($googleData['email_verified'] ?? false, FILTER_VALIDATE_BOOLEAN);

        if (!$googleId || !$googleEmail || !$emailVerified) {
            return response()->json([
                'success' => false,
                'message' => 'A verified Google account email is required to sign in.',
            ], 422);
        }

        Role::firstOrCreate(['name' => 'Customer', 'guard_name' => 'web']);

        // 1. Find by google_id
        $user = User::where('google_id', $googleId)->first();

        // 2. Find by google_email
        if (!$user) {
            $user = User::where('google_email', $googleEmail)->first();
            if ($user) {
                $user->google_id = $googleId;
                $user->save();
            }
        }

        // 3. Find by email (auto-link)
        if (!$user) {
            $user = User::where('email', $googleEmail)->first();
            if ($user) {
                $user->google_id        = $googleId;
                $user->google_email     = $googleEmail;
                $user->google_avatar    = $googleAvatar;
                $user->google_linked_at = now();
                if (empty($user->avatar) && $googleAvatar) {
                    $user->avatar = $googleAvatar;
                }
                $user->save();
            }
        }

        // 4. If no user exists, create new Customer account automatically!
        if (!$user) {
            $user = User::create([
                'name'             => $googleName,
                'email'            => $googleEmail,
                'password'         => Hash::make(Str::random(32)),
                'google_id'        => $googleId,
                'google_email'     => $googleEmail,
                'google_avatar'    => $googleAvatar,
                'avatar'           => $googleAvatar,
                'google_linked_at' => now(),
                'is_active'        => true,
                'last_login_at'    => now(),
                'last_login_ip'    => $request->ip(),
            ]);

            $user->assignRole('Customer');
        }

        if (!$user->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Your account has been deactivated. Please contact support.',
            ], 403);
        }

        Auth::login($user, true);
        $request->session()->regenerate();

        $user->last_login_at = now();
        $user->last_login_ip = $request->ip();
        if ($googleAvatar && empty($user->avatar)) {
            $user->avatar = $googleAvatar;
        }
        $user->save();

        return response()->json([
            'success' => true,
            'message' => "Welcome, {$user->name}!",
            'user'    => [
                'id'     => $user->id,
                'name'   => $user->name,
                'email'  => $user->email,
                'avatar' => $user->avatar,
                'roles'  => $user->getRoleNames(),
            ],
        ]);
    }

    /**
     * Log out current user.
     */
    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'You have been signed out.',
            ]);
        }

        return redirect('/')->with('message', 'You have been logged out.');
    }

    /**
     * Verify Google ID token via Google's official tokeninfo API.
     */
    private function verifyGoogleToken(string $idToken): ?array
    {
        try {
            $response = Http::timeout(6)->get('https://oauth2.googleapis.com/tokeninfo', [
                'id_token' => $idToken,
            ]);

            if ($response->successful()) {
                return $response->json();
            }

            Log::warning('Google public token verification failed: ' . $response->body());
        } catch (\Throwable $e) {
            Log::error('Exception verifying Google token: ' . $e->getMessage());
        }

        return null;
    }
}
