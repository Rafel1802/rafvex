<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CommentNotificationEvent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public int $userId;
    public array $notification;

    public function __construct(int $userId, array $notification)
    {
        $this->userId = $userId;
        $this->notification = $notification;
    }

    public function broadcastOn()
    {
        // Broadcast on both private and user-specific channel for maximum compatibility
        return [
            new PrivateChannel('user.' . $this->userId),
            'user-notif-' . $this->userId,
        ];
    }

    public function broadcastAs(): string
    {
        return 'comment.notification';
    }
}
