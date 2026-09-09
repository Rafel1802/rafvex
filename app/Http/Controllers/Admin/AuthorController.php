<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuthorProfile;
use App\Models\User;
use App\Models\Article;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class AuthorController extends Controller
{
    public function index(Request $request)
    {
        $staffRoles = ['Super Admin', 'Administrator', 'Editor', 'Writer', 'Author'];

        // Strictly fetch users that have staff/editorial roles or an author profile (never regular customers/readers)
        $authors = User::where(function ($query) use ($staffRoles) {
                $query->whereHas('roles', function ($q) use ($staffRoles) {
                    $q->whereIn('name', $staffRoles);
                })->orWhereHas('profile');
            })
            ->with(['profile', 'roles'])
            ->withCount('articles')
            ->orderBy('id', 'asc')
            ->get()
            ->map(function ($u) {
                return [
                    'id'             => $u->id,
                    'name'           => $u->profile?->display_name ?: $u->name,
                    'email'          => $u->email,
                    'avatar'         => $u->profile?->avatar ?: $u->avatar,
                    'job_title'      => $u->profile?->job_title ?: ($u->roles->first()?->name ?? 'Author'),
                    'bio'            => $u->profile?->bio ?: 'Author',
                    'articles_count' => $u->articles_count,
                    'created_at'     => $u->created_at?->format('M d, Y'),
                ];
            });

        return Inertia::render('Admin/Authors/Index', [
            'authors' => $authors,
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Authors/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'       => 'required|string|max:255',
            'job_title'  => 'nullable|string|max:255',
            'bio'        => 'nullable|string|max:1000',
            'email'      => 'nullable|string|email|max:255|unique:users,email',
            'avatar_url' => 'nullable|string|max:1000',
            'avatar'     => 'nullable|image|max:5120',
        ]);

        $avatarPath = $validated['avatar_url'] ?? null;

        if ($request->hasFile('avatar')) {
            $file = $request->file('avatar');
            $filename = 'author_' . time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('authors', $filename, 'public');
            $avatarPath = Storage::url($path);
        }

        $slug = Str::slug($validated['name']) ?: 'author';
        $email = $validated['email'] ?? ($slug . '_' . uniqid() . '@author.rafvex.com');

        $user = User::create([
            'name'      => $validated['name'],
            'email'     => $email,
            'password'  => Hash::make(Str::random(32)),
            'avatar'    => $avatarPath,
            'is_active' => true,
        ]);

        // Assign Author role if exists
        try {
            $role = Role::firstOrCreate(['name' => 'Author', 'guard_name' => 'web']);
            $user->syncRoles([$role]);
        } catch (\Throwable $e) {}

        AuthorProfile::create([
            'user_id'      => $user->id,
            'slug'         => $slug . '-' . uniqid(),
            'display_name' => $validated['name'],
            'job_title'    => $validated['job_title'] ?: 'Author',
            'bio'          => $validated['bio'] ?: 'Author',
            'avatar'       => $avatarPath,
            'is_public'    => true,
        ]);

        return redirect()->route('admin.authors.index')->with('message', "Author '{$validated['name']}' created successfully.");
    }

    public function edit($id)
    {
        $user = User::with('profile')->findOrFail($id);

        return Inertia::render('Admin/Authors/Edit', [
            'author' => [
                'id'        => $user->id,
                'name'      => $user->profile?->display_name ?: $user->name,
                'email'     => $user->email,
                'avatar'    => $user->profile?->avatar ?: $user->avatar,
                'job_title' => $user->profile?->job_title ?: 'Author',
                'bio'       => $user->profile?->bio ?: 'Author',
            ],
        ]);
    }

    public function update(Request $request, $id)
    {
        $user = User::with('profile')->findOrFail($id);

        $validated = $request->validate([
            'name'       => 'required|string|max:255',
            'job_title'  => 'nullable|string|max:255',
            'bio'        => 'nullable|string|max:1000',
            'avatar_url' => 'nullable|string|max:1000',
            'avatar'     => 'nullable|image|max:5120',
        ]);

        // Keep author_profiles.avatar separate from users.avatar (CMS profile).
        // Start from the existing author profile avatar (not user.avatar).
        $avatarPath = $user->profile?->avatar;

        if ($request->hasFile('avatar')) {
            $file = $request->file('avatar');
            $filename = 'author_' . time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('authors', $filename, 'public');
            $avatarPath = Storage::url($path);
        } elseif ($request->filled('avatar_url')) {
            $avatarPath = $request->input('avatar_url');
        }

        // Do NOT touch users.name or users.avatar here —
        // those belong to the CMS login profile (Admin users page).
        // Only update the public author profile record.
        if ($user->profile) {
            $user->profile->update([
                'display_name' => $validated['name'],
                'avatar'       => $avatarPath,
                'job_title'    => $validated['job_title'] ?: 'Author',
                'bio'          => $validated['bio'] ?: 'Author',
            ]);
        } else {
            AuthorProfile::create([
                'user_id'      => $user->id,
                'slug'         => Str::slug($validated['name']) . '-' . uniqid(),
                'display_name' => $validated['name'],
                'avatar'       => $avatarPath,
                'job_title'    => $validated['job_title'] ?: 'Author',
                'bio'          => $validated['bio'] ?: 'Author',
                'is_public'    => true,
            ]);
        }

        return redirect()->route('admin.authors.index')->with('message', "Author '{$validated['name']}' updated successfully.");
    }

    public function destroy($id)
    {
        if ($id == 1) {
            return back()->with('error', 'The primary administrator account cannot be deleted.');
        }

        $user = User::findOrFail($id);

        // Reassign articles to primary admin to protect foreign keys
        Article::where('user_id', $user->id)->update(['user_id' => 1]);

        // Delete author profile
        AuthorProfile::where('user_id', $user->id)->delete();

        // Remove author/staff roles
        try {
            $user->removeRole('Author');
            $user->removeRole('Writer');
            $user->removeRole('Editor');
        } catch (\Throwable $e) {}

        // If user is not a customer, delete user account
        if (!$user->hasRole('Customer')) {
            $user->delete();
        }

        return redirect()->route('admin.authors.index')->with('message', 'Author removed successfully.');
    }
}
