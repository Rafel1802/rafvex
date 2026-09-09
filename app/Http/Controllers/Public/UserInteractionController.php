<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\UserFavorite;
use App\Models\UserReadingHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserInteractionController extends Controller
{
    /**
     * Toggle bookmark/favorite status for an article.
     */
    public function toggleFavorite(Request $request, Article $article)
    {
        if (!Auth::check()) {
            return response()->json([
                'success' => false,
                'require_auth' => true,
                'message' => 'Please sign in to save articles to your favorites.',
            ], 401);
        }

        $userId = Auth::id();

        $existing = UserFavorite::where('user_id', $userId)
            ->where('article_id', $article->id)
            ->first();

        if ($existing) {
            $existing->delete();
            $favorited = false;
            $message = 'Article removed from your saved list.';
        } else {
            UserFavorite::create([
                'user_id'    => $userId,
                'article_id' => $article->id,
            ]);
            $favorited = true;
            $message = 'Article saved to your favorites!';
        }

        $totalFavorites = UserFavorite::where('article_id', $article->id)->count();

        return response()->json([
            'success'         => true,
            'favorited'       => $favorited,
            'total_favorites' => $totalFavorites,
            'message'         => $message,
        ]);
    }

    /**
     * Record article read in history.
     */
    public function recordRead(Request $request, Article $article)
    {
        if (Auth::check()) {
            $userId = Auth::id();
            $history = UserReadingHistory::firstOrNew([
                'user_id'    => $userId,
                'article_id' => $article->id,
            ]);

            $history->read_at = now();
            $history->read_count = ($history->read_count ?? 0) + 1;
            $history->save();
        }

        return response()->json([
            'success' => true,
            'article_id' => $article->id,
        ]);
    }

    /**
     * Return list of read article IDs and favorited article IDs for the current session.
     */
    public function getUserInteractions(Request $request)
    {
        if (!Auth::check()) {
            return response()->json([
                'read_ids'     => [],
                'favorite_ids' => [],
            ]);
        }

        $userId = Auth::id();

        $readIds = UserReadingHistory::where('user_id', $userId)
            ->pluck('article_id')
            ->toArray();

        $favoriteIds = UserFavorite::where('user_id', $userId)
            ->pluck('article_id')
            ->toArray();

        return response()->json([
            'read_ids'     => array_values(array_unique($readIds)),
            'favorite_ids' => array_values(array_unique($favoriteIds)),
        ]);
    }
}
