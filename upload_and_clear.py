#!/usr/bin/env python3
import os
import sys
import subprocess
import argparse

# Config
# Hostinger typically puts sites in /home/u123456789/domains/yourdomain.com/public_html
# and allows SSH access. We use rsync for reliable delta-transfers.

EXCLUDE_LIST = [
    '.git',
    'node_modules',
    'vendor',
    'storage/framework/cache/data/*',
    'storage/framework/sessions/*',
    'storage/framework/views/*',
    'storage/logs/*',
    'public/storage',
    'storage/app/*.json',
    'storage/app/home_ads.json',
    'storage/app/home_sections.json',
    'storage/app/photo_cache/*',
    'storage/app/tmp_*',
    'storage/app/test_free_photo.*',
    'tests',
    '.phpunit.cache',
    'bootstrap/cache/*.php',
    '*.tar.gz',
    '*.zip',
    '.DS_Store',
    '._*',
]

def print_step(msg):
    print(f"\n\033[1;34m>>> {msg}\033[0m")

def print_success(msg):
    print(f"\033[1;32m✓ {msg}\033[0m")

def print_error(msg):
    print(f"\033[1;31m✗ {msg}\033[0m")
    sys.exit(1)

def run_cmd(cmd, shell=True, check=True):
    try:
        subprocess.run(cmd, shell=shell, check=check)
    except subprocess.CalledProcessError as e:
        print_error(f"Command failed: {cmd}\nError: {e}")

def main():
    parser = argparse.ArgumentParser(description='Upload code to Hostinger via Rsync/SSH and clear caches')
    parser.add_argument('--user', default='u881038410', help='SSH username')
    parser.add_argument('--host', default='145.79.25.215', help='SSH host')
    parser.add_argument('--port', default='65002', help='SSH port (Hostinger is usually 2124 or 22 or 65002)')
    parser.add_argument('--path', default='/home/u881038410/domains/rafvex.com/public_html', help='Remote path (e.g., domains/yourdomain.com/public_html)')
    args = parser.parse_args()

    ssh_target = f"{args.user}@{args.host}"
    remote_dir = f"{args.path}"
    if not remote_dir.endswith('/'):
        remote_dir += '/'

    print_step("Building front-end assets...")
    run_cmd("npm run build")
    print_success("Front-end built.")

    print_step("Syncing files to Hostinger...")
    excludes = ' '.join([f"--exclude='{e}'" for e in EXCLUDE_LIST])
    
    # Wipe old migrations from previous accidental deployment
    print("Wiping old remote migrations to prevent conflicts...")
    pre_cmd = f"sshpass -p 'Mvm@168$' ssh -o StrictHostKeyChecking=no -p {args.port} {ssh_target} 'rm -rf {remote_dir}database/migrations/* {remote_dir}bootstrap/cache/*.php'"
    subprocess.run(pre_cmd, shell=True) # ignoring errors if directory doesn't exist
    
    # Using rsync over SSH with sshpass
    rsync_cmd = f"sshpass -p 'Mvm@168$' rsync -avz -e 'ssh -o StrictHostKeyChecking=no -p {args.port}' {excludes} ./ {ssh_target}:{remote_dir}"
    run_cmd(rsync_cmd)
    print_success("Files synced successfully.")

    print_step("Clearing caches and optimizing on remote server...")
    remote_commands = [
        f"cd {remote_dir}",
        "mkdir -p bootstrap/cache storage/framework/views storage/framework/cache/data storage/framework/sessions storage/logs public/build",
        "rm -rf bootstrap/cache/*.php",
        "/opt/alt/php84/usr/bin/php /usr/local/bin/composer install --optimize-autoloader --no-dev --no-scripts",
        "/opt/alt/php84/usr/bin/php artisan package:discover --ansi",
        "/opt/alt/php84/usr/bin/php artisan config:clear",
        "/opt/alt/php84/usr/bin/php artisan migrate --force",
        "/opt/alt/php84/usr/bin/php artisan optimize:clear",
        "/opt/alt/php84/usr/bin/php artisan config:cache",
        "/opt/alt/php84/usr/bin/php artisan route:cache",
        "rm -rf public/storage && ln -sfn ../storage/app/public public/storage",
        "/opt/alt/php84/usr/bin/php create_media_category_folders.php",
        "mkdir -p storage/app/public/settings/favicon && cp -f public/favicon* storage/app/public/settings/favicon/ 2>/dev/null || true",
        "cp -f public/favicon* . 2>/dev/null || true",
        "cp -f public/apple-touch-icon.png . 2>/dev/null || true",
        "cp -f public/android-chrome* . 2>/dev/null || true",
        "cp -f public/site.webmanifest . 2>/dev/null || true",
        "cp -f public/logo.png . 2>/dev/null || true",
        "ln -sfn public/medialibrary/blog public/blog",
        "ln -sfn public/medialibrary/blog blog",
        "ln -sfn public/images images",
        "/opt/alt/php84/usr/bin/php artisan view:clear",
        "/opt/alt/php84/usr/bin/php artisan cache:clear",
    ]
    
    joined_cmds = " && ".join(remote_commands)
    ssh_cmd = f"sshpass -p 'Mvm@168$' ssh -o StrictHostKeyChecking=no -p {args.port} {ssh_target} '{joined_cmds}'"
    run_cmd(ssh_cmd)
    
    print_success("Deployment & Optimization complete! 🚀")

if __name__ == "__main__":
    main()
