<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class GoogleAuthController extends Controller
{
    /**
     * Authenticate or log in with Google ID Token.
     */
    public function loginWithGoogle(Request $request)
    {
        $request->validate([
            'id_token' => 'required|string',
        ]);

        $googleData = $this->verifyGoogleToken($request->id_token);

        if (!$googleData) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired Google authentication token. Please try again.',
            ], 422);
        }

        $googleId = $googleData['sub'] ?? null;
        $googleEmail = $googleData['email'] ?? null;
        $googleAvatar = $googleData['picture'] ?? null;
        $emailVerified = filter_var($googleData['email_verified'] ?? false, FILTER_VALIDATE_BOOLEAN);

        if (!$googleId || !$googleEmail || !$emailVerified) {
            return response()->json([
                'success' => false,
                'message' => 'Google account email must be verified to sign in.',
            ], 422);
        }

        // 1. Search for user by linked google_id
        $user = User::where('google_id', $googleId)->first();

        // 2. Search for user by linked google_email
        if (!$user) {
            $user = User::where('google_email', $googleEmail)->first();
            if ($user) {
                $user->google_id = $googleId;
                $user->save();
            }
        }

        // 3. Fallback: Search for user by primary email if matching an existing admin
        if (!$user) {
            $user = User::where('email', $googleEmail)->first();
            if ($user) {
                // Auto-link Google credentials to this matching administrator
                $user->google_id = $googleId;
                $user->google_email = $googleEmail;
                $user->google_avatar = $googleAvatar;
                $user->google_linked_at = now();
                $user->save();
            }
        }

        // If no user found, deny login with helpful instructions
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => "The Google account ({$googleEmail}) is not linked to any administrator profile. Please log in with your email & password first, then connect your Google account in Site Settings.",
            ], 403);
        }

        // Strictly verify staff privilege
        if (!$user->isStaff()) {
            return response()->json([
                'success' => false,
                'message' => "Access denied. The Google account ({$googleEmail}) is registered as a website reader, not a CMS administrator.",
            ], 403);
        }

        // Check active status
        if (!$user->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Your administrator account has been disabled. Please contact the site owner.',
            ], 403);
        }

        // Log the user in
        Auth::login($user, $request->boolean('remember', true));
        $request->session()->regenerate();

        // Update login stats
        $user->last_login_at = now();
        $user->last_login_ip = $request->ip();
        if ($googleAvatar && !$user->avatar) {
            $user->avatar = $googleAvatar;
        }
        $user->save();

        // Record in login logs
        try {
            DB::table('login_logs')->insert([
                'user_id' => $user->id,
                'email' => $googleEmail,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'successful' => true,
                'created_at' => now(),
            ]);
        } catch (\Throwable $e) {
            Log::warning('Could not write login_logs for Google auth: ' . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => "Welcome back, {$user->name}!",
            'redirect' => '/ourcms/dashboard',
        ]);
    }

    /**
     * Connect Google account for currently authenticated administrator.
     */
    public function connectGoogle(Request $request)
    {
        $request->validate([
            'id_token' => 'required|string',
        ]);

        $googleData = $this->verifyGoogleToken($request->id_token);

        if (!$googleData) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired Google authentication token.',
            ], 422);
        }

        $googleId = $googleData['sub'] ?? null;
        $googleEmail = $googleData['email'] ?? null;
        $googleAvatar = $googleData['picture'] ?? null;

        if (!$googleId || !$googleEmail) {
            return response()->json([
                'success' => false,
                'message' => 'Could not retrieve Google profile details.',
            ], 422);
        }

        $currentUser = Auth::user();

        // Verify if another user is already linked with this Google ID
        $existing = User::where('google_id', $googleId)
            ->where('id', '!=', $currentUser->id)
            ->first();

        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => "This Google account ({$googleEmail}) is already linked to another administrator ({$existing->email}).",
            ], 422);
        }

        $currentUser->google_id = $googleId;
        $currentUser->google_email = $googleEmail;
        $currentUser->google_avatar = $googleAvatar;
        $currentUser->google_linked_at = now();
        if (!$currentUser->avatar && $googleAvatar) {
            $currentUser->avatar = $googleAvatar;
        }
        $currentUser->save();

        return response()->json([
            'success' => true,
            'message' => "Google account ({$googleEmail}) successfully linked!",
            'google_email' => $currentUser->google_email,
            'google_avatar' => $currentUser->google_avatar,
            'google_linked_at' => $currentUser->google_linked_at?->toDateString(),
        ]);
    }

    /**
     * Disconnect Google account for currently authenticated administrator.
     */
    public function disconnectGoogle(Request $request)
    {
        $user = Auth::user();
        $user->google_id = null;
        $user->google_email = null;
        $user->google_avatar = null;
        $user->google_linked_at = null;
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Google account disconnected successfully.',
        ]);
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

            Log::warning('Google token verification failed: ' . $response->body());
        } catch (\Throwable $e) {
            Log::error('Exception verifying Google token: ' . $e->getMessage());
        }

        return null;
    }
}
