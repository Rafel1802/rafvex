<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ContactMessageController extends Controller
{
    public function index(Request $request)
    {
        $query = ContactMessage::query()->latest('created_at');

        if ($request->filled('search')) {
            $search = trim($request->input('search'));
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('subject', 'like', "%{$search}%")
                    ->orWhere('message', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            if ($request->input('status') === 'unread') {
                $query->where('is_read', false);
            } elseif ($request->input('status') === 'read') {
                $query->where('is_read', true);
            }
        }

        $messages = $query->paginate(20)->withQueryString();
        $unreadCount = ContactMessage::where('is_read', false)->count();

        return Inertia::render('Admin/Messages/Index', [
            'messages' => $messages,
            'unreadCount' => $unreadCount,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function markAsRead(ContactMessage $message)
    {
        $message->update(['is_read' => true]);

        return back()->with('message', 'Message marked as read.');
    }

    public function markAllAsRead()
    {
        ContactMessage::where('is_read', false)->update(['is_read' => true]);

        return back()->with('message', 'All messages marked as read.');
    }

    public function destroy(ContactMessage $message)
    {
        $message->delete();

        return back()->with('message', 'Message deleted successfully.');
    }
}
