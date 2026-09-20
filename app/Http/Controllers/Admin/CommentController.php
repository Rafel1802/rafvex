<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CommentController extends Controller
{
    public function index(Request $request)
    {
        $query = Comment::with('article')
            ->orderBy('created_at', 'desc');

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $comments = $query->paginate(20)->withQueryString();

        return Inertia::render('Admin/Comments/Index', [
            'comments' => $comments,
            'filters' => $request->only(['status']),
        ]);
    }

    public function update(Request $request, Comment $comment)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,approved,rejected,spam,trash',
        ]);

        $comment->status = $validated['status'];

        if ($validated['status'] === 'approved' && ! $comment->approved_at) {
            $comment->approved_at = now();
            $comment->approved_by = auth()->id();
        }

        $comment->save();

        return back()->with('success', 'Comment status updated successfully.');
    }

    public function destroy(Comment $comment)
    {
        $comment->forceDelete();

        return back()->with('success', 'Comment deleted successfully.');
    }

    public function reply(Request $request, Comment $comment)
    {
        $validated = $request->validate([
            'content' => 'required|string|max:2000',
        ]);

        $reply = $comment->article->comments()->create([
            'author_name' => auth()->user()->name,
            'author_email' => auth()->user()->email,
            'content' => $validated['content'],
            'parent_id' => $comment->id,
            'author_ip' => $request->ip(),
            'status' => 'approved',
            'approved_at' => now(),
            'approved_by' => auth()->id(),
        ]);

        return back()->with('success', 'Reply posted successfully.');
    }
}
