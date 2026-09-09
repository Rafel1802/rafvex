<?php

namespace App\Http\Controllers\Public;

use App\Events\CommentNotificationEvent;
use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\Comment;
use App\Models\User;
use App\Models\UserNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class CommentController extends Controller
{
    public function store(Request $request, Article $article)
    {
        $user = Auth::user();

        $rules = [
            'content'   => 'required|string|max:2000',
            'parent_id' => 'nullable|exists:comments,id',
        ];

        if (!$user) {
            $rules['author_name']  = 'required|string|max:255';
            $rules['author_email'] = 'required|email|max:255';
        } else {
            $rules['author_name']  = 'nullable|string|max:255';
            $rules['author_email'] = 'nullable|email|max:255';
        }

        $validated = $request->validate($rules);

        $authorName = $user ? $user->name : $validated['author_name'];
        $authorEmail = $user ? $user->email : $validated['author_email'];

        $comment = $article->comments()->create([
            'user_id'      => $user?->id,
            'author_name'  => $authorName,
            'author_email' => $authorEmail,
            'content'      => $validated['content'],
            'parent_id'    => $validated['parent_id'] ?? null,
            'author_ip'    => $request->ip(),
            'status'       => 'approved',
            'approved_at'  => now(),
            'approved_by'  => $user?->id,
        ]);

        $commentExcerpt = Str::limit(strip_tags($comment->content), 80);

        // 1. If it's a reply, notify the parent comment's author
        if ($comment->parent_id) {
            $parentComment = Comment::find($comment->parent_id);
            if ($parentComment) {
                $recipientId = $parentComment->user_id;

                // Fallback: try finding user by email if not set
                if (!$recipientId && !empty($parentComment->author_email)) {
                    $recipientId = User::where('email', $parentComment->author_email)->value('id');
                }

                if ($recipientId && (!$user || $user->id !== (int) $recipientId)) {
                    try {
                        $notification = UserNotification::create([
                            'user_id' => $recipientId,
                            'type'    => 'comment_reply',
                            'title'   => "💬 {$authorName} replied to your comment",
                            'message' => "\"{$commentExcerpt}\" on \"{$article->title}\"",
                            'link'    => "/article/{$article->slug}#comments-section",
                            'data'    => [
                                'article_id'   => $article->id,
                                'article_slug' => $article->slug,
                                'comment_id'   => $comment->id,
                                'author_name'  => $authorName,
                            ],
                        ]);

                        broadcast(new CommentNotificationEvent($recipientId, [
                            'id'         => $notification->id,
                            'type'       => $notification->type,
                            'title'      => $notification->title,
                            'message'    => $notification->message,
                            'link'       => $notification->link,
                            'created_at' => $notification->created_at->diffForHumans(),
                        ]));
                    } catch (\Throwable $e) {
                        Log::warning('Could not create comment_reply notification: ' . $e->getMessage());
                    }
                }
            }
        }

        // 2. Notify the article author (if author is registered and not the commenter)
        if ($article->user_id && (!$user || $user->id !== (int) $article->user_id)) {
            try {
                $authorNotification = UserNotification::create([
                    'user_id' => $article->user_id,
                    'type'    => 'comment_on_article',
                    'title'   => "💬 New comment on \"{$article->title}\"",
                    'message' => "{$authorName}: \"{$commentExcerpt}\"",
                    'link'    => "/article/{$article->slug}#comments-section",
                    'data'    => [
                        'article_id'   => $article->id,
                        'article_slug' => $article->slug,
                        'comment_id'   => $comment->id,
                        'author_name'  => $authorName,
                    ],
                ]);

                broadcast(new CommentNotificationEvent($article->user_id, [
                    'id'         => $authorNotification->id,
                    'type'       => $authorNotification->type,
                    'title'      => $authorNotification->title,
                    'message'    => $authorNotification->message,
                    'link'       => $authorNotification->link,
                    'created_at' => $authorNotification->created_at->diffForHumans(),
                ]));
            } catch (\Throwable $e) {
                Log::warning('Could not create author comment notification: ' . $e->getMessage());
            }
        }

        // 3. Trigger real-time Pusher Beams push notification
        try {
            \App\Services\PusherBeamsService::notifyNewComment($comment, $article);
        } catch (\Throwable $e) {
            Log::error('Pusher Beams comment error: ' . $e->getMessage());
        }

        return back()->with('message', 'Comment posted successfully!');
    }
}
