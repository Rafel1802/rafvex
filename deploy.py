#!/usr/bin/env python3
import os
import sys
import subprocess

def print_header(msg):
    print(f"\n\033[1;36m{'='*50}\033[0m")
    print(f"\033[1;36m {msg} \033[0m")
    print(f"\033[1;36m{'='*50}\033[0m\n")

def run(cmd):
    result = subprocess.run(cmd, shell=True)
    if result.returncode != 0:
        print(f"\n\033[1;31mError running: {cmd}\033[0m")
        sys.exit(1)

def main():
    print_header("Rafelblog Deployment Helper")
    
    user = input("Enter Hostinger SSH Username (e.g. u123456789): ").strip()
    if not user:
        print("Username is required.")
        sys.exit(1)
        
    host = input("Enter SSH Host (e.g. 185.212.1.1 or domain.com): ").strip()
    if not host:
        print("Host is required.")
        sys.exit(1)
        
    port = input("Enter SSH Port [default: 2124]: ").strip()
    if not port:
        port = "2124"
        
    path = input("Enter Remote Path (e.g. domains/yourdomain.com/public_html): ").strip()
    if not path:
        print("Path is required.")
        sys.exit(1)

    print("\nStarting deployment process...")
    cmd = f"python3 upload_and_clear.py --user {user} --host {host} --port {port} --path {path}"
    run(cmd)

if __name__ == "__main__":
    main()
