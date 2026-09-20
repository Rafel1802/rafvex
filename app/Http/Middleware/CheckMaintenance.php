<?php

namespace App\Http\Middleware;

use App\Models\Setting;
use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class CheckMaintenance
{
    public function handle(Request $request, Closure $next): Response
    {
        // Always allow CMS / admin routes, sitemaps, robots, privacy policy, and terms
        if ($request->is('ourcms*') || $request->is('sitemap.xml') || $request->is('robots.txt') || $request->is('privacy-policy') || $request->is('terms-of-service')) {
            return $next($request);
        }

        $config = $this->getMaintenanceConfig();

        // Global maintenance
        if (! empty($config['global_enabled'])) {
            return $this->renderMaintenance($request, $config);
        }

        // Per-page maintenance
        $currentPath = '/'.ltrim($request->path(), '/');
        $pages = $config['pages'] ?? [];

        foreach ($pages as $page) {
            $pattern = $page['path'] ?? '';
            if (! $pattern) {
                continue;
            }

            // Support wildcard matching (e.g. /category/*)
            $regex = '#^'.str_replace('\*', '.*', preg_quote($pattern, '#')).'$#';
            if (preg_match($regex, $currentPath)) {
                return $this->renderMaintenance($request, $config);
            }
        }

        return $next($request);
    }

    private function getMaintenanceConfig(): array
    {
        return cache()->remember('maintenance_config', 60, function () {
            $settings = Setting::whereIn('key', [
                'maintenance_global_enabled',
                'maintenance_pages',
                'maintenance_title',
                'maintenance_message',
                'maintenance_end_time',
                'maintenance_progress',
                'logo',
            ])->pluck('value', 'key')->toArray();

            $progress = isset($settings['maintenance_progress']) ? (int) $settings['maintenance_progress'] : 88;
            if ($progress < 10) {
                $progress = 10;
            }
            if ($progress > 100) {
                $progress = 100;
            }

            return [
                'global_enabled' => filter_var($settings['maintenance_global_enabled'] ?? false, FILTER_VALIDATE_BOOLEAN),
                'pages' => json_decode($settings['maintenance_pages'] ?? '[]', true) ?? [],
                'title' => $settings['maintenance_title'] ?? 'We\'ll Be Right Back',
                'message' => $settings['maintenance_message'] ?? 'We\'re performing scheduled maintenance. Please check back soon.',
                'end_time' => $settings['maintenance_end_time'] ?? null,
                'progress' => $progress,
                'logo' => ! empty($settings['logo']) ? $settings['logo'] : '/logo.png',
            ];
        });
    }

    private function renderMaintenance(Request $request, array $config): Response
    {
        if ($request->wantsJson()) {
            return response()->json(['message' => 'Service temporarily unavailable.'], 503);
        }

        return response(
            Inertia::render('Maintenance', [
                'title' => $config['title'],
                'message' => $config['message'],
                'end_time' => $config['end_time'],
                'progress' => $config['progress'] ?? 88,
                'logo' => $config['logo'] ?? '/logo.png',
            ])->toResponse($request)->getContent(),
            503
        );
    }
}
