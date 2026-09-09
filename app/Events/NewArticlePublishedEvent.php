<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewArticlePublishedEvent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public array $article;

    public function __construct(array $article)
    {
        $this->article = $article;
    }

    public function broadcastOn()
    {
        return [
            new Channel('public-articles'),
            'public-articles',
        ];
    }

    public function broadcastAs(): string
    {
        return 'article.published';
    }
}
