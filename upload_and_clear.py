#!/usr/bin/env python3
import os
import sys
import subprocess
import argparse
import ftplib

# Config
# Hostinger typically puts sites in /home/u123456789/domains/yourdomain.com/public_html
# and allows SSH access. We use rsync for reliable delta-transfers with automatic FTP fallback.

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

def print_warning(msg):
    print(f"\033[1;33m⚠ {msg}\033[0m")

def print_error(msg):
    print(f"\033[1;31m✗ {msg}\033[0m")
    sys.exit(1)

def run_cmd(cmd, shell=True, check=True):
    try:
        subprocess.run(cmd, shell=shell, check=check)
    except subprocess.CalledProcessError as e:
        print_error(f"Command failed: {cmd}\nError: {e}")

def deploy_via_ftp(host, user, password, remote_base_path):
    print_step("Deploying via high-speed Hostinger FTP fallback...")
    try:
        ftp = ftplib.FTP()
        ftp.connect(host, 21, timeout=30)
        ftp.login(user, password)
        ftp.voidcmd('TYPE I')
        print_success("Connected to Hostinger FTP successfully.")
    except Exception as e:
        print_error(f"FTP connection failed: {e}")

    created_dirs = set()

    def make_dirs(rem_dir):
        if not rem_dir or rem_dir in created_dirs:
            return
        parts = rem_dir.strip('/').split('/')
        cur = ''
        for p in parts:
            cur += '/' + p if cur else p
            if cur not in created_dirs:
                try:
                    ftp.mkd(cur)
                except Exception:
                    pass
                created_dirs.add(cur)

    def upload(local_p, rem_p):
        make_dirs(os.path.dirname(rem_p))
        with open(local_p, 'rb') as f:
            ftp.storbinary(f'STOR {rem_p}', f)

    # 1. Gather git modified and untracked files
    p = subprocess.run(['git', 'status', '-s'], capture_output=True, text=True)
    files = []
    for line in p.stdout.splitlines():
        path = line[3:].strip().strip('"')
        if os.path.isfile(path) and not any(skip in path for skip in ['.git', 'node_modules', 'vendor', '.tar.gz', '.zip', '.DS_Store', '._', 'scratch']):
            files.append(path)

    # 1b. Always ensure crucial article, story, and route files are synced
    essential_files = [
        'routes/web.php',
        'routes/api.php',
        'app/Http/Controllers/Public/ArticleController.php',
        'content/articles/the_lost_wallet.json',
        'content/articles_manifest.json',
        'content/compiled_articles_cache.json',
        'post_the_lost_wallet_story.php',
    ]
    for ef in essential_files:
        if os.path.isfile(ef):
            files.append(ef)

    # 1c. Add committed files ahead of origin/main
    try:
        p2 = subprocess.run(['git', 'diff', '--name-only', 'origin/main', 'HEAD'], capture_output=True, text=True)
        for path in p2.stdout.splitlines():
            path = path.strip().strip('"')
            if os.path.isfile(path) and not any(skip in path for skip in ['.git', 'node_modules', 'vendor', '.tar.gz', '.zip', '.DS_Store', '._', 'scratch']):
                files.append(path)
    except Exception:
        pass

    # 2. Add public/build manifest and assets
    if os.path.exists('public/build/manifest.json'):
        files.append('public/build/manifest.json')
    if os.path.exists('public/build/assets'):
        for a in os.listdir('public/build/assets'):
            ap = os.path.join('public/build/assets', a)
            if os.path.isfile(ap) and not a.startswith('.'):
                files.append(ap)

    # Deduplicate while preserving order
    seen = set()
    unique_files = [f for f in files if not (f in seen or seen.add(f))]
    total = len(unique_files)
    print(f"Syncing {total} modified & compiled project files...")

    for idx, f in enumerate(unique_files, 1):
        rem = f"{remote_base_path}/{f}"
        try:
            upload(f, rem)
            if f.startswith('public/') and any(f.endswith(ext) for ext in ['.ico', '.png', '.webmanifest', '.txt']):
                root_f = f.replace('public/', '')
                if '/' not in root_f:
                    upload(f, f"{remote_base_path}/{root_f}")
            print(f"  [{idx}/{total}] ✓ {f}")
        except Exception as e:
            print(f"  [{idx}/{total}] ✗ Error {f}: {e}")

    # Remove legacy favicon.svg
    for p in [f"{remote_base_path}/favicon.svg", f"{remote_base_path}/public/favicon.svg", f"{remote_base_path}/storage/app/public/settings/favicon/favicon.svg"]:
        try:
            ftp.delete(p)
            print(f"  ✓ Purged legacy: {p}")
        except Exception:
            pass

    # Clear remote view and bootstrap caches
    print_step("Clearing compiled view & bootstrap caches on remote...")
    for c_dir in [f"{remote_base_path}/bootstrap/cache", f"{remote_base_path}/storage/framework/views"]:
        try:
            for entry in ftp.nlst(c_dir):
                if entry.endswith('.php'):
                    try:
                        ftp.delete(entry)
                        print(f"  ✓ Purged cache: {entry.split('/')[-1]}")
                    except Exception:
                        pass
        except Exception:
            pass

    ftp.quit()
    print_success("Files synced & caches cleared successfully via FTP! 🚀")

def main():
    parser = argparse.ArgumentParser(description='Upload code to Hostinger via Rsync/SSH or FTP and clear caches')
    parser.add_argument('--user', default='u881038410', help='SSH/FTP username')
    parser.add_argument('--host', default='82.29.199.147', help='SSH/FTP host')
    parser.add_argument('--port', default='65002', help='SSH port (Hostinger is usually 2124 or 22 or 65002)')
    parser.add_argument('--path', default='/home/u881038410/domains/rafvex.com/public_html', help='Remote path')
    parser.add_argument('--no-build', action='store_true', help='Skip npm run build')
    args = parser.parse_args()

    ssh_target = f"{args.user}@{args.host}"
    remote_dir = f"{args.path}"
    if not remote_dir.endswith('/'):
        remote_dir += '/'

    if not args.no_build:
        print_step("Building front-end assets...")
        run_cmd("npm run build")
        print_success("Front-end built.")

    print_step("Checking SSH connection to Hostinger...")
    try:
        ssh_test = subprocess.run(
            f"sshpass -p 'Mvm@168$' ssh -o StrictHostKeyChecking=no -p {args.port} {ssh_target} 'echo SSH_OK'",
            shell=True,
            capture_output=True,
            text=True,
            timeout=8
        )
        ssh_available = (ssh_test.returncode == 0 and 'SSH_OK' in ssh_test.stdout)
    except Exception:
        ssh_available = False

    if ssh_available:
        print_success("SSH is active. Using Rsync over SSH...")
        excludes = ' '.join([f"--exclude='{e}'" for e in EXCLUDE_LIST])
        
        print("Wiping old remote migrations to prevent conflicts...")
        pre_cmd = f"sshpass -p 'Mvm@168$' ssh -o StrictHostKeyChecking=no -p {args.port} {ssh_target} 'rm -rf {remote_dir}database/migrations/* {remote_dir}bootstrap/cache/*.php'"
        subprocess.run(pre_cmd, shell=True)
        
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
            "/opt/alt/php84/usr/bin/php sync_and_repair_all_articles.php",
            "/opt/alt/php84/usr/bin/php post_the_lost_wallet_story.php",
            "/opt/alt/php84/usr/bin/php seed_wrldu_speedtest_blogs.php",
            "/opt/alt/php84/usr/bin/php clean_all_article_markdown.php",
            "/opt/alt/php84/usr/bin/php update_settings.php",
            "rm -f public/favicon.svg favicon.svg 2>/dev/null || true",
            "mkdir -p storage/app/public/settings/favicon && cp -f public/favicon* storage/app/public/settings/favicon/ 2>/dev/null || true",
            "cp -f public/favicon* . 2>/dev/null || true",
            "cp -f public/apple-touch-icon.png . 2>/dev/null || true",
            "cp -f public/android-chrome* . 2>/dev/null || true",
            "cp -f public/site.webmanifest . 2>/dev/null || true",
            "cp -f public/robots.txt . 2>/dev/null || true",
            "cp -f public/logo.png . 2>/dev/null || true",
            "cp -f public/*.txt . 2>/dev/null || true",
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
    else:
        err_msg = (ssh_test.stderr.strip() or ssh_test.stdout.strip()) if 'ssh_test' in locals() else 'Connection timed out'
        print_warning(f"Hostinger SSH is currently disabled ({err_msg}).")
        deploy_via_ftp(args.host, args.user, 'Mvm@168$', 'domains/rafvex.com/public_html')
        print_success("Deployment complete! 🚀")

if __name__ == "__main__":
    main()
