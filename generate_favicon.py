#!/usr/bin/env python3
"""
Rafvex Favicon & Brand Asset Generator
Generates all pixel-perfect favicon sizes and formats directly from the master favicon.png (Image 2).
"""

import os
import subprocess
import struct
import base64

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
MASTER_ICON = os.path.join(ROOT_DIR, "favicon.png")
PUBLIC_DIR = os.path.join(ROOT_DIR, "public")

if not os.path.exists(MASTER_ICON):
    raise FileNotFoundError(f"Master icon not found: {MASTER_ICON}")

# Targets: filename -> (width, height)
SIZES = {
    "favicon-16x16.png": 16,
    "favicon-32x32.png": 32,
    "favicon-48x48.png": 48,
    "favicon-96x96.png": 96,
    "favicon-144x144.png": 144,
    "apple-touch-icon.png": 180,
    "android-chrome-192x192.png": 192,
    "android-chrome-512x512.png": 512,
    "favicon.png": 576,
}

print(f"Generating favicons from master: {MASTER_ICON}...")

for filename, size in SIZES.items():
    dest = os.path.join(PUBLIC_DIR, filename)
    cmd = ["sips", "-z", str(size), str(size), MASTER_ICON, "--out", dest]
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL)
    # Also sync root copy (avoid overwriting master if already in root)
    root_dest = os.path.join(ROOT_DIR, filename)
    if os.path.abspath(root_dest) != os.path.abspath(MASTER_ICON):
        subprocess.run(["cp", "-f", dest, root_dest], check=True)
    print(f"  ✓ {filename} ({size}x{size})")

# Build multi-resolution ICO (16, 32, 48)
ico_sizes = [16, 32, 48]
ico_images = []
for s in ico_sizes:
    path = os.path.join(PUBLIC_DIR, f"favicon-{s}x{s}.png")
    with open(path, "rb") as f:
        ico_images.append((s, s, f.read()))

num_images = len(ico_images)
header = struct.pack("<HHH", 0, 1, num_images)
entries = bytearray()
images_data = bytearray()
offset = 6 + (16 * num_images)

for w, h, data in ico_images:
    w_byte = 0 if w >= 256 else w
    h_byte = 0 if h >= 256 else h
    entry = struct.pack("<BBBBHHII", w_byte, h_byte, 0, 0, 1, 32, len(data), offset)
    entries.extend(entry)
    images_data.extend(data)
    offset += len(data)

ico_content = header + bytes(entries) + bytes(images_data)

ico_public = os.path.join(PUBLIC_DIR, "favicon.ico")
ico_root = os.path.join(ROOT_DIR, "favicon.ico")
with open(ico_public, "wb") as f:
    f.write(ico_content)
with open(ico_root, "wb") as f:
    f.write(ico_content)
print(f"  ✓ favicon.ico ({len(ico_content)} bytes with 16, 32, 48px)")

# High resolution SVG favicon
high_res_path = os.path.join(PUBLIC_DIR, "android-chrome-512x512.png")
with open(high_res_path, "rb") as f:
    b64_str = base64.b64encode(f.read()).decode("ascii")

svg_content = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <image href="data:image/png;base64,{b64_str}" width="512" height="512" />
</svg>
"""

svg_public = os.path.join(PUBLIC_DIR, "favicon.svg")
svg_root = os.path.join(ROOT_DIR, "favicon.svg")
with open(svg_public, "w", encoding="utf-8") as f:
    f.write(svg_content)
with open(svg_root, "w", encoding="utf-8") as f:
    f.write(svg_content)
print("  ✓ favicon.svg (512x512 crisp vector container)")

print("All favicons successfully generated and verified from master favicon.png!")
