<?php

namespace App\Services;

use App\Models\Setting;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PusherBeamsService
{
    /**
     * Get the Pusher Beams Instance ID.
     */
    public static function getInstanceId(): string
    {
        return config('services.pusher_beams.instance_id')
            ?? env('PUSHER_BEAMS_INSTANCE_ID')
            ?? Setting::where('key', 'pusher_beams_instance_id')->value('value')
            ?? '282c56a0-960e-404f-bf35-647dbc68722b';
    }

    /**
     * Get the Pusher Beams Primary Secret Key.
     */
    public static function getSecretKey(): ?string
    {
        return config('services.pusher_beams.secret_key')
            ?? env('PUSHER_BEAMS_SECRET_KEY')
            ?? Setting::where('key', 'pusher_beams_secret_key')->value('value');
    }

    /**
     * Publish a web push notification to specific interests.
     */
    public static function publishToInterests(
        array $interests,
        string $title,
        string $body,
        ?string $deepLink = null,
        ?string $icon = null
    ): bool {
        $instanceId = self::getInstanceId();
        $secretKey = self::getSecretKey();

        if (empty($instanceId)) {
            Log::warning('[PusherBeams] Cannot publish notification: Missing instance ID.');

            return false;
        }

        if (empty($secretKey)) {
            Log::info('[PusherBeams] Secret key not yet configured. Simulated push notification: '.$title, [
                'interests' => $interests,
                'body' => $body,
                'deep_link' => $deepLink,
            ]);

            return false;
        }

        $url = "https://{$instanceId}.pushnotifications.pusher.com/publish_api/v1/instances/{$instanceId}/publishes";

        $payload = [
            'interests' => array_values(array_unique($interests)),
            'web' => [
                'notification' => array_filter([
                    'title' => $title,
                    'body' => $body,
                    'icon' => $icon ?: url('/android-chrome-192x192.png'),
                    'deep_link' => $deepLink ?: url('/'),
                ]),
            ],
        ];

        try {
            $response = Http::timeout(4)
                ->withToken($secretKey)
                ->withHeaders(['Content-Type' => 'application/json'])
                ->post($url, $payload);

            if ($response->successful()) {
                Log::info('[PusherBeams] Push notification published successfully.', [
                    'publish_id' => $response->json('publishId'),
                    'interests' => $interests,
                    'title' => $title,
                ]);

                return true;
            } else {
                Log::error('[PusherBeams] Publish API error: '.$response->status(), [
                    'response' => $response->body(),
                ]);

                return false;
            }
        } catch (\Throwable $e) {
            Log::error('[PusherBeams] Connection error: '.$e->getMessage());

            return false;
        }
    }

    /**
     * Send real-time notification when a new comment is submitted.
     */
    public static function notifyNewComment($comment, $article): bool
    {
        $author = $comment->author_name ?? 'A reader';
        $articleTitle = $article->title ?? 'an article';
        $excerpt = mb_strimwidth(strip_tags($comment->content ?? ''), 0, 85, '...');

        return self::publishToInterests(
            ['hello', 'admin', 'comments'],
            '💬 New Comment on Rafvex',
            "{$author} on \"{$articleTitle}\": \"{$excerpt}\"",
            url('/ourcms/comments')
        );
    }

    /**
     * Send real-time notification when someone submits the Get In Touch / Contact form.
     */
    public static function notifyGetInTouch(string $name, string $email, string $subject, string $message): bool
    {
        $formattedSubject = ucwords(str_replace('_', ' ', $subject));
        $excerpt = mb_strimwidth(strip_tags($message), 0, 90, '...');

        return self::publishToInterests(
            ['hello', 'admin', 'contact'],
            "📬 New Message: {$formattedSubject}",
            "From {$name} ({$email}): \"{$excerpt}\"",
            url('/ourcms/dashboard')
        );
    }

    /**
     * Send real-time notification for high-importance administrative activities.
     */
    public static function notifyImportantActivity(string $title, string $description, ?string $deepLink = null): bool
    {
        return self::publishToInterests(
            ['hello', 'admin'],
            "⚡ {$title}",
            $description,
            $deepLink ?: url('/ourcms/dashboard')
        );
    }
}
