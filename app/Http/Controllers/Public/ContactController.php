<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Services\PusherBeamsService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ContactController extends Controller
{
    public function index()
    {
        return Inertia::render('Public/Contact');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'    => 'required|string|max:255',
            'email'   => 'required|email|max:255',
            'subject' => 'required|string|max:255',
            'message' => 'required|string|max:5000',
        ]);

        // Save message to database so it is visible in CMS
        try {
            \App\Models\ContactMessage::create([
                'name'       => $validated['name'],
                'email'      => $validated['email'],
                'subject'    => $validated['subject'],
                'message'    => $validated['message'],
                'is_read'    => false,
                'ip_address' => $request->ip(),
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('Failed to save contact message: ' . $e->getMessage());
        }

        // Trigger real-time Pusher Beams push notification for Get In Touch message
        try {
            PusherBeamsService::notifyGetInTouch(
                $validated['name'],
                $validated['email'],
                $validated['subject'],
                $validated['message']
            );
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('Pusher Beams contact error: ' . $e->getMessage());
        }

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Thank you! Your message has been sent to Mr. Soporadara Rin and the editorial desk.',
            ]);
        }

        return back()->with('success', 'Thank you! Your message has been received.');
    }
}
