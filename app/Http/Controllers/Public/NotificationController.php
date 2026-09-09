<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\UserNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    /**
     * Get recent notifications for authenticated user.
     */
    public function index(Request $request)
    {
        if (!Auth::check()) {
            return response()->json([
                'notifications' => [],
                'unread_count'  => 0,
            ]);
        }

        $user = Auth::user();

        $notifications = UserNotification::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->take(30)
            ->get();

        $unreadCount = UserNotification::where('user_id', $user->id)
            ->whereNull('read_at')
            ->count();

        return response()->json([
            'notifications' => $notifications,
            'unread_count'  => $unreadCount,
        ]);
    }

    /**
     * Mark a single notification as read.
     */
    public function markAsRead(Request $request, UserNotification $notification)
    {
        if (!Auth::check() || $notification->user_id !== Auth::id()) {
            return response()->json(['success' => false], 403);
        }

        $notification->markAsRead();

        return response()->json([
            'success'      => true,
            'unread_count' => UserNotification::where('user_id', Auth::id())->whereNull('read_at')->count(),
        ]);
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllAsRead(Request $request)
    {
        if (!Auth::check()) {
            return response()->json(['success' => false], 401);
        }

        UserNotification::where('user_id', Auth::id())
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json([
            'success'      => true,
            'unread_count' => 0,
        ]);
    }
}
