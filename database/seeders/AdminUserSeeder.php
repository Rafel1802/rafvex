<?php

namespace Database\Seeders;

use App\Models\AuthorProfile;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

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
