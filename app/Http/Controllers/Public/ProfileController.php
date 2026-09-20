<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\UserFavorite;
use App\Models\UserReadingHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class ProfileController extends Controller
{
    /**
     * Display member profile and activity dashboard.
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        $stats = [
            'read_count' => UserReadingHistory::where('user_id', $user->id)->count(),
            'favorites_count' => UserFavorite::where('user_id', $user->id)->count(),
            'comments_count' => $user->comments()->count(),
        ];

        // Recent Saved Articles (limit 12)
        $savedArticles = $user->favoriteArticles()
            ->with(['category:id,name,slug', 'author:id,name'])
            ->where('status', 'published')
            ->orderBy('user_favorites.created_at', 'desc')
            ->take(12)
            ->get(['articles.id', 'articles.title', 'articles.slug', 'articles.excerpt', 'articles.cover_image_url', 'articles.reading_time', 'articles.published_at', 'articles.category_id', 'articles.user_id']);

        // Recent Reading History (limit 15)
        $readingHistory = $user->readingHistory()
            ->with(['article' => function ($q) {
                $q->select('id', 'title', 'slug', 'excerpt', 'cover_image_url', 'reading_time', 'published_at', 'category_id', 'user_id')
                    ->with('category:id,name,slug');
            }])
            ->orderBy('read_at', 'desc')
            ->take(15)
            ->get();

        // Recent Notifications (limit 20)
        $notifications = $user->notifications()
            ->take(20)
            ->get();

        return Inertia::render('Public/Profile/Index', [
            'profile' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'avatar' => $user->avatar,
                'google_avatar' => $user->google_avatar,
                'google_email' => $user->google_email,
                'google_linked' => ! empty($user->google_id),
                'member_since' => $user->created_at?->format('F Y'),
                'created_at' => $user->created_at?->toIso8601String(),
                'has_password' => ! empty($user->password),
            ],
            'stats' => $stats,
            'savedArticles' => $savedArticles,
            'readingHistory' => $readingHistory,
            'notifications' => $notifications,
        ]);
    }

    /**
     * Update user profile information (name, avatar).
     */
    public function update(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'avatar_file' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp,gif', 'max:4096'],
            'remove_avatar' => ['nullable', 'boolean'],
        ]);

        $user->name = $validated['name'];

        if ($request->boolean('remove_avatar')) {
            $user->avatar = null;
        } elseif ($request->hasFile('avatar_file')) {
            $file = $request->file('avatar_file');
            $filename = 'user_'.$user->id.'_'.time().'.'.$file->getClientOriginalExtension();
            $destPath = public_path('uploads/avatars');
            if (! file_exists($destPath)) {
                mkdir($destPath, 0755, true);
            }
            $file->move($destPath, $filename);
            $user->avatar = '/uploads/avatars/'.$filename;
        }

        $user->save();

        return back()->with('message', 'Profile updated successfully!');
    }

    /**
     * Update user password.
     */
    public function updatePassword(Request $request)
    {
        $user = Auth::user();

        $rules = [
            'password' => ['required', 'string', Password::min(8), 'confirmed'],
        ];

        // If user already has a password and wasn't solely Google SSO, require current password
        if (! empty($user->password)) {
            $rules['current_password'] = ['required', 'current_password'];
        }

        $validated = $request->validate($rules);

        $user->password = Hash::make($validated['password']);
        $user->save();

        return back()->with('message', 'Your password has been changed successfully.');
    }

    /**
     * Remove all reading history for current user.
     */
    public function clearReadingHistory()
    {
        $user = Auth::user();
        UserReadingHistory::where('user_id', $user->id)->delete();

        return back()->with('message', 'Reading history cleared.');
    }

    /**
     * Remove a single article from reading history.
     */
    public function removeHistoryItem(Article $article)
    {
        $user = Auth::user();
        UserReadingHistory::where('user_id', $user->id)
            ->where('article_id', $article->id)
            ->delete();

        return back()->with('message', 'Removed from reading history.');
    }
}
