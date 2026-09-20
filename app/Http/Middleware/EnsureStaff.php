<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureStaff
{
    /**
     * Handle an incoming request.
     * Ensure user has a staff role before entering CMS.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! Auth::check()) {
            return redirect()->route('login');
        }

        $user = Auth::user();

        // Ensure user #1 has Super Admin role if missing
        if ((int) $user->id === 1 && ! $user->hasRole('Super Admin')) {
            try {
                $user->assignRole('Super Admin');
            } catch (\Throwable $e) {
            }
        }

        // Strictly enforce staff privileges for CMS access
        if (! $user->isStaff()) {
            return redirect()->route('login')->withErrors([
                'email' => 'Access denied. The CMS portal is strictly reserved for Administrators and Staff. Readers must sign in on the main website.',
            ]);
        }

        return $next($request);
    }
}
