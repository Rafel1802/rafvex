<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MaintenanceController extends Controller
{
    private array $keys = [
        'maintenance_global_enabled',
        'maintenance_pages',
        'maintenance_title',
        'maintenance_message',
        'maintenance_end_time',
        'maintenance_progress',
    ];

    public function index()
    {
        $raw = Setting::whereIn('key', $this->keys)
            ->pluck('value', 'key')
            ->toArray();

        $progress = isset($raw['maintenance_progress']) ? (int) $raw['maintenance_progress'] : 88;
        if ($progress < 10) $progress = 10;
        if ($progress > 100) $progress = 100;

        $cfgData = [
            'global_enabled' => filter_var($raw['maintenance_global_enabled'] ?? false, FILTER_VALIDATE_BOOLEAN),
            'pages'          => json_decode($raw['maintenance_pages'] ?? '[]', true) ?? [],
            'title'          => $raw['maintenance_title'] ?? "We'll Be Right Back",
            'message'        => $raw['maintenance_message'] ?? "We're performing scheduled maintenance. Please check back soon.",
            'end_time'       => $raw['maintenance_end_time'] ?? '',
            'progress'       => $progress,
        ];

        return Inertia::render('Admin/Maintenance/Index', [
            'maintenance' => $cfgData,
            'config'      => $cfgData,
        ]);
    }


    public function update(Request $request)
    {
        $request->validate([
            'global_enabled' => 'boolean',
            'pages'          => 'array',
            'pages.*.path'   => 'required_with:pages|string',
            'pages.*.label'  => 'nullable|string',
            'title'          => 'nullable|string|max:200',
            'message'        => 'nullable|string|max:1000',
            'end_time'       => 'nullable|string',
            'progress'       => 'nullable|integer|min:10|max:100',
        ]);

        $progress = $request->has('progress') ? max(10, min(100, (int) $request->input('progress', 88))) : 88;

        $data = [
            'maintenance_global_enabled' => $request->boolean('global_enabled') ? 'true' : 'false',
            'maintenance_pages'          => json_encode($request->input('pages', [])),
            'maintenance_title'          => $request->input('title', "We'll Be Right Back"),
            'maintenance_message'        => $request->input('message', "We're performing scheduled maintenance."),
            'maintenance_end_time'       => $request->input('end_time', ''),
            'maintenance_progress'       => (string) $progress,
        ];

        foreach ($data as $key => $value) {
            Setting::updateOrCreate(
                ['key' => $key],
                ['value' => $value, 'group' => 'maintenance', 'label' => ucwords(str_replace('_', ' ', $key))]
            );
        }

        // Bust maintenance cache immediately
        cache()->forget('maintenance_config');

        return response()->json([
            'success' => true,
            'message' => 'Maintenance settings saved.',
            'global_enabled' => $request->boolean('global_enabled'),
        ]);
    }

    /**
     * Quick toggle global maintenance on/off via single POST
     */
    public function toggle(Request $request)
    {
        $current = Setting::where('key', 'maintenance_global_enabled')->value('value');
        $newVal = filter_var($current, FILTER_VALIDATE_BOOLEAN) ? 'false' : 'true';

        Setting::updateOrCreate(
            ['key' => 'maintenance_global_enabled'],
            ['value' => $newVal, 'group' => 'maintenance', 'label' => 'Maintenance Global Enabled']
        );

        cache()->forget('maintenance_config');

        return response()->json([
            'success'        => true,
            'global_enabled' => $newVal === 'true',
            'message'        => $newVal === 'true' ? 'Site is now in maintenance mode.' : 'Site is now live.',
        ]);
    }
}
