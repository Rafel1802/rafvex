<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use App\Models\AuthorProfile;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::firstOrCreate(
            ['email' => 'admin@rafvex.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('password123'),
                'is_active' => true,
            ]
        );

        $user->assignRole('Super Admin');

        AuthorProfile::firstOrCreate(
            ['user_id' => $user->id],
            [
                'slug' => 'admin-user',
                'display_name' => 'Administrator',
                'bio' => 'Site Administrator for Rafvex.',
            ]
        );
    }
}
