<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RoleAndPermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // Create permissions
        $permissions = [
            'articles.view', 'articles.create', 'articles.edit', 'articles.publish', 'articles.delete', 'articles.restore', 'articles.manage_revisions',
            'categories.view', 'categories.manage',
            'media.view', 'media.upload', 'media.delete',
            'users.view', 'users.create', 'users.edit', 'users.delete',
            'security.view', 'security.manage', 'security.block_ip',
            'settings.view', 'settings.manage',
            'ads.view', 'ads.manage',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // Create roles and assign created permissions

        // Writer (can only write drafts)
        $writer = Role::findOrCreate('Writer');
        $writer->givePermissionTo(['articles.view', 'articles.create', 'articles.edit', 'media.view', 'media.upload']);

        // Author (can write and publish own, edit own)
        $author = Role::findOrCreate('Author');
        $author->givePermissionTo(['articles.view', 'articles.create', 'articles.edit', 'articles.publish', 'media.view', 'media.upload']);

        // Editor (can review and publish anyone's, manage categories and tags)
        $editor = Role::findOrCreate('Editor');
        $editor->givePermissionTo([
            'articles.view', 'articles.create', 'articles.edit', 'articles.publish', 'articles.manage_revisions',
            'categories.view', 'categories.manage',
            'media.view', 'media.upload', 'media.delete',
        ]);

        // Administrator (can manage users and settings)
        $admin = Role::findOrCreate('Administrator');
        $admin->givePermissionTo(Permission::all()->reject(function ($p) {
            return str_starts_with($p->name, 'security.');
        }));

        // Super Admin (all permissions)
        $superAdmin = Role::findOrCreate('Super Admin');
        $superAdmin->givePermissionTo(Permission::all());
    }
}
