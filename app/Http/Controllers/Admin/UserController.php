<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    /**
     * Display a listing of CMS users.
     */
    public function index(Request $request)
    {
        // Ensure the two allowed CMS roles exist
        Role::firstOrCreate(['name' => 'Super Admin', 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'Writer', 'guard_name' => 'web']);

        // Ensure user #1 has Super Admin role if they do not have any staff role yet
        $firstUser = User::find(1);
        if ($firstUser && !$firstUser->hasAnyRole(['Super Admin', 'Writer', 'Administrator', 'Editor', 'Author'])) {
            $firstUser->assignRole('Super Admin');
        }

        // STRICTLY CMS Admin users (Super Admin or Writer) — never regular customers
        $cmsRoles = ['Super Admin', 'Writer', 'Administrator', 'Editor'];
        $query = User::where(function ($q) use ($cmsRoles) {
            $q->whereHas('roles', function ($rq) use ($cmsRoles) {
                $rq->whereIn('name', $cmsRoles);
            })->orWhere(function ($oq) {
                // If user #1 has no roles, include as Super Admin
                $oq->where('id', 1)->whereDoesntHave('roles', function ($crq) {
                    $crq->where('name', 'Customer');
                });
            });
        })
        ->whereDoesntHave('roles', function ($rq) use ($cmsRoles) {
            // Strictly exclude any account that only has Customer role
            $rq->where('name', 'Customer')->whereNotIn('name', $cmsRoles);
        })
        ->with(['roles'])
        ->withCount('articles');

        if ($request->filled('search')) {
            $search = trim($request->input('search'));
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->filled('role') && $request->input('role') !== 'all') {
            $role = strtolower(trim($request->input('role')));
            if ($role === 'superadmin' || $role === 'super admin') {
                $query->where(function ($q) {
                    $q->whereHas('roles', fn($rq) => $rq->where('name', 'Super Admin'))
                      ->orWhere(fn($oq) => $oq->where('id', 1)->doesntHave('roles'));
                });
            } elseif ($role === 'writer') {
                $query->whereHas('roles', fn($rq) => $rq->where('name', 'Writer'));
            }
        }

        $users = $query->orderBy('created_at', 'desc')->paginate(15)->withQueryString();

        $users->getCollection()->transform(function ($user) {
            $isSuperAdmin = $user->hasRole('Super Admin') || $user->hasRole('Administrator') || $user->id === 1;
            return [
                'id'              => $user->id,
                'name'            => $user->name,
                'email'           => $user->email,
                'avatar'          => $user->avatar,
                'google_avatar'   => $user->google_avatar,
                'role'            => $isSuperAdmin ? 'superadmin' : 'writer',
                'role_label'      => $isSuperAdmin ? 'Super Admin' : 'Writer',
                'is_active'       => (bool) $user->is_active,
                'articles_count'  => $user->articles_count ?? 0,
                'last_login_at'   => $user->last_login_at?->diffForHumans(),
                'created_at'      => $user->created_at?->format('M d, Y'),
            ];
        });

        return Inertia::render('Admin/Users/Index', [
            'users'   => $users,
            'filters' => $request->only(['search', 'role']),
        ]);
    }

    /**
     * Store a newly created user.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'       => 'required|string|max:255',
            'email'      => 'required|string|email|max:255|unique:users,email',
            'password'   => 'required|string|min:8|confirmed',
            'role'       => ['required', Rule::in(['superadmin', 'writer', 'Super Admin', 'Writer'])],
            'avatar_url' => 'nullable|string|max:1000',
            'avatar'     => 'nullable|image|max:2048',
            'is_active'  => 'nullable|boolean',
        ]);

        $avatarPath = $validated['avatar_url'] ?? null;

        if ($request->hasFile('avatar')) {
            $file = $request->file('avatar');
            $filename = 'avatar_' . time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('avatars', $filename, 'public');
            $avatarPath = Storage::url($path);
        }

        $user = User::create([
            'name'      => $validated['name'],
            'email'     => $validated['email'],
            'password'  => Hash::make($validated['password']),
            'avatar'    => $avatarPath,
            'is_active' => $request->boolean('is_active', true),
        ]);

        // Assign strictly one of the two allowed roles
        $targetRole = in_array(strtolower($validated['role']), ['superadmin', 'super admin']) ? 'Super Admin' : 'Writer';
        $user->syncRoles([$targetRole]);

        return redirect()->route('admin.users.index')->with('message', "User '{$user->name}' created successfully with role {$targetRole}.");
    }

    /**
     * Update the specified user.
     */
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name'       => 'required|string|max:255',
            'email'      => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'password'   => 'nullable|string|min:8|confirmed',
            'role'       => ['required', Rule::in(['superadmin', 'writer', 'Super Admin', 'Writer'])],
            'avatar_url' => 'nullable|string|max:1000',
            'avatar'     => 'nullable|image|max:2048',
            'is_active'  => 'nullable|boolean',
        ]);

        $user->name = $validated['name'];
        $user->email = $validated['email'];

        if ($request->has('is_active')) {
            $user->is_active = $request->boolean('is_active');
        }

        // Handle profile image update
        if ($request->hasFile('avatar')) {
            $file = $request->file('avatar');
            $filename = 'avatar_' . time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('avatars', $filename, 'public');
            $user->avatar = Storage::url($path);
        } elseif ($request->filled('avatar_url')) {
            $user->avatar = $validated['avatar_url'];
        }

        // Allow changing password
        if ($request->filled('password')) {
            $user->password = Hash::make($validated['password']);
        }

        $user->save();

        // Sync role: Super Admin or Writer
        $targetRole = in_array(strtolower($validated['role']), ['superadmin', 'super admin']) ? 'Super Admin' : 'Writer';
        $user->syncRoles([$targetRole]);

        return redirect()->back()->with('message', "User '{$user->name}' updated successfully.");
    }

    /**
     * Remove the specified user from storage.
     */
    public function destroy(Request $request, User $user)
    {
        if ($request->user() && $request->user()->id === $user->id) {
            return redirect()->back()->with('error', 'You cannot delete your own account while logged in.');
        }

        $name = $user->name;
        $user->delete();

        return redirect()->route('admin.users.index')->with('message', "User '{$name}' deleted successfully.");
    }

    /**
     * Show the CMS profile settings page for the authenticated admin.
     */
    public function showProfile(Request $request)
    {
        $user = $request->user();

        return Inertia::render('Admin/Profile/Index', [
            'profileUser' => [
                'id'               => $user->id,
                'name'             => $user->name,
                'email'            => $user->email,
                'avatar'           => $user->avatar,
                'google_id'        => $user->google_id,
                'google_email'     => $user->google_email,
                'google_avatar'    => $user->google_avatar,
                'google_linked_at' => $user->google_linked_at?->format('M d, Y'),
                'roles'            => $user->getRoleNames(),
                'created_at'       => $user->created_at?->format('M d, Y'),
            ],
            'google_client_id' => '424918974382-qbnphracdndii7vf9fhc1vf0n5e7qdgp.apps.googleusercontent.com',
        ]);
    }

    /**
     * Update current authenticated user profile (profile image, name, email, password).
     */

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name'       => 'required|string|max:255',
            'email'      => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'password'   => 'nullable|string|min:8|confirmed',
            'avatar_url' => 'nullable|string|max:1000',
            'avatar'     => 'nullable|image|max:5120',
        ]);

        $user->name = $validated['name'];
        $user->email = $validated['email'];

        if ($request->hasFile('avatar')) {
            $file = $request->file('avatar');
            $filename = 'avatar_' . time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('avatars', $filename, 'public');
            $user->avatar = Storage::url($path);
        } elseif ($request->filled('avatar_url')) {
            $user->avatar = $validated['avatar_url'];
        }

        if ($request->filled('password')) {
            $user->password = Hash::make($validated['password']);
        }

        $user->save();

        return redirect()->back()->with('message', 'Profile updated successfully.');
    }
}
