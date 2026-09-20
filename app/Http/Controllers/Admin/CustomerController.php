<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use App\Models\User;
use App\Models\UserFavorite;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class CustomerController extends Controller
{
    /**
     * Display a listing of registered customers / website members.
     */
    public function index(Request $request)
    {
        Role::firstOrCreate(['name' => 'Customer', 'guard_name' => 'web']);

        $staffRoles = ['Super Admin', 'Administrator', 'Editor', 'Writer', 'Author'];

        // Query customers: strictly registered public members/customers, excluding all CMS staff and admin accounts
        $query = User::where('id', '!=', 1)
            ->whereDoesntHave('roles', function ($q) use ($staffRoles) {
                $q->whereIn('name', $staffRoles);
            });

        // Search filter
        if ($request->filled('search')) {
            $search = trim($request->input('search'));
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Status filter
        if ($request->filled('status') && $request->status !== 'all') {
            $isActive = $request->status === 'active';
            $query->where('is_active', $isActive);
        }

        // Google connected filter
        if ($request->filled('google') && $request->google !== 'all') {
            if ($request->google === 'connected') {
                $query->whereNotNull('google_id');
            } else {
                $query->whereNull('google_id');
            }
        }

        // Metrics calculations (strictly customers only)
        $totalCustomers = User::where('id', '!=', 1)
            ->whereDoesntHave('roles', function ($q) use ($staffRoles) {
                $q->whereIn('name', $staffRoles);
            })->count();

        $activeToday = User::where('id', '!=', 1)
            ->whereDoesntHave('roles', function ($q) use ($staffRoles) {
                $q->whereIn('name', $staffRoles);
            })
            ->where('last_login_at', '>=', now()->startOfDay())
            ->count();

        $totalComments = Comment::whereNotNull('user_id')->count();
        $totalFavorites = UserFavorite::count();

        $customers = $query->withCount(['comments', 'favorites', 'readingHistory'])
            ->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        $customers->getCollection()->transform(function ($customer) {
            return [
                'id' => $customer->id,
                'name' => $customer->name,
                'email' => $customer->email,
                'avatar' => $customer->avatar,
                'google_avatar' => $customer->google_avatar,
                'is_google_linked' => ! empty($customer->google_id),
                'google_email' => $customer->google_email,
                'is_active' => (bool) $customer->is_active,
                'comments_count' => $customer->comments_count ?? 0,
                'favorites_count' => $customer->favorites_count ?? 0,
                'reading_history_count' => $customer->reading_history_count ?? 0,
                'last_login_at' => $customer->last_login_at?->diffForHumans() ?: 'Never',
                'last_login_ip' => $customer->last_login_ip ?: '—',
                'created_at' => $customer->created_at?->format('M d, Y'),
            ];
        });

        return Inertia::render('Admin/Customers/Index', [
            'customers' => $customers,
            'filters' => $request->only(['search', 'status', 'google']),
            'metrics' => [
                'total_customers' => $totalCustomers,
                'active_today' => $activeToday,
                'total_comments' => $totalComments,
                'total_favorites' => $totalFavorites,
            ],
        ]);
    }

    /**
     * Show customer details drawer / modal payload.
     */
    public function show(User $customer)
    {
        $staffRoles = ['Super Admin', 'Administrator', 'Editor', 'Writer', 'Author'];
        if ($customer->id === 1 || $customer->hasAnyRole($staffRoles)) {
            return response()->json(['error' => 'This account is a CMS administrator, not a customer.'], 404);
        }

        $customer->loadCount(['comments', 'favorites', 'readingHistory']);

        $recentComments = $customer->comments()
            ->with('article:id,title,slug')
            ->latest()
            ->take(8)
            ->get();

        $recentFavorites = $customer->favoriteArticles()
            ->with('category:id,name')
            ->take(8)
            ->get(['articles.id', 'articles.title', 'articles.slug', 'articles.cover_image_url', 'articles.published_at']);

        $recentReading = $customer->readingHistory()
            ->with('article:id,title,slug,cover_image_url')
            ->orderBy('read_at', 'desc')
            ->take(8)
            ->get();

        return response()->json([
            'customer' => [
                'id' => $customer->id,
                'name' => $customer->name,
                'email' => $customer->email,
                'avatar' => $customer->avatar,
                'google_avatar' => $customer->google_avatar,
                'is_google_linked' => ! empty($customer->google_id),
                'google_email' => $customer->google_email,
                'is_active' => (bool) $customer->is_active,
                'last_login_at' => $customer->last_login_at?->diffForHumans() ?: 'Never',
                'last_login_ip' => $customer->last_login_ip,
                'created_at' => $customer->created_at?->format('M d, Y \a\t H:i'),
                'comments_count' => $customer->comments_count,
                'favorites_count' => $customer->favorites_count,
                'reading_history_count' => $customer->reading_history_count,
            ],
            'recentComments' => $recentComments,
            'recentFavorites' => $recentFavorites,
            'recentReading' => $recentReading,
        ]);
    }

    /**
     * Toggle active/suspended status of a customer.
     */
    public function toggleStatus(User $customer)
    {
        $staffRoles = ['Super Admin', 'Administrator', 'Editor', 'Writer', 'Author'];
        if ($customer->id === 1 || $customer->hasAnyRole($staffRoles)) {
            return back()->with('error', 'Cannot perform action on an administrator account.');
        }

        $customer->is_active = ! $customer->is_active;
        $customer->save();

        $statusText = $customer->is_active ? 'activated' : 'suspended';

        return back()->with('message', "Customer {$customer->name} has been {$statusText}.");
    }

    /**
     * Update customer basic details or reset password.
     */
    public function update(Request $request, User $customer)
    {
        $staffRoles = ['Super Admin', 'Administrator', 'Editor', 'Writer', 'Author'];
        if ($customer->id === 1 || $customer->hasAnyRole($staffRoles)) {
            return back()->with('error', 'Cannot modify a CMS administrator account from All Users.');
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email,'.$customer->id],
            'password' => ['nullable', 'string', 'min:8'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $customer->name = $validated['name'];
        $customer->email = strtolower(trim($validated['email']));

        if (! empty($validated['password'])) {
            $customer->password = Hash::make($validated['password']);
        }

        if (isset($validated['is_active'])) {
            $customer->is_active = (bool) $validated['is_active'];
        }

        $customer->save();

        return back()->with('message', "Customer {$customer->name} updated successfully.");
    }

    /**
     * Delete customer account.
     */
    public function destroy(User $customer)
    {
        $staffRoles = ['Super Admin', 'Administrator', 'Editor', 'Writer', 'Author'];
        if ($customer->id === 1 || $customer->hasAnyRole($staffRoles)) {
            return back()->with('error', 'Cannot delete a CMS administrator account from All Users.');
        }

        $name = $customer->name;
        $customer->delete();

        return back()->with('message', "Customer {$name} was permanently removed.");
    }
}
