#!/usr/bin/env python3
import os
import shutil

base_media = "/Applications/XAMPP/xamppfiles/htdocs/Rafelblog/public/medialibrary/blog"

articles_media = [
    {
        "id": 64,
        "folder": os.path.join(base_media, "reviews/tech-reviews/free-speed-test-multi-lang"),
        "shortSlug": "free-speed-test-multi-lang",
        "donor": os.path.join(base_media, "reviews/tech-reviews/top-5-speed-test-websites")
    },
    {
        "id": 65,
        "folder": os.path.join(base_media, "technology/future-tech/ai-network-routing-latency"),
        "shortSlug": "ai-network-routing-latency",
        "donor": os.path.join(base_media, "technology/future-tech/dns-speed-lookup-guide")
    },
    {
        "id": 66,
        "folder": os.path.join(base_media, "troubleshooting-how-to/network-engineering/gamers-guide-ping-ip-lookup"),
        "shortSlug": "gamers-guide-ping-ip-lookup",
        "donor": os.path.join(base_media, "troubleshooting-how-to/network-engineering/speedtest-fast-games-lag")
    },
    {
        "id": 67,
        "folder": os.path.join(base_media, "english-reading-stories/vocabulary-life/tech-english-vocabulary"),
        "shortSlug": "tech-english-vocabulary",
        "donor": os.path.join(base_media, "interesting/stories/the-lantern-maker") if os.path.exists(os.path.join(base_media, "interesting/stories/the-lantern-maker")) else os.path.join(base_media, "reviews/tech-reviews/top-5-speed-test-websites")
    },
    {
        "id": 68,
        "folder": os.path.join(base_media, "ai-for-students-work/ai-for-students/ai-english-language-revolution"),
        "shortSlug": "ai-english-language-revolution",
        "donor": os.path.join(base_media, "ai-tools/writing-workflows/ai-writing-voice") if os.path.exists(os.path.join(base_media, "ai-tools/writing-workflows/ai-writing-voice")) else os.path.join(base_media, "reviews/tech-reviews/top-5-speed-test-websites")
    }
]

for item in articles_media:
    dest_folder = item["folder"]
    os.makedirs(dest_folder, exist_ok=True)
    donor_dir = item["donor"]
    short = item["shortSlug"]

    # If donor exists, copy 1..4 webp files
    if os.path.isdir(donor_dir):
        donor_files = sorted([f for f in os.listdir(donor_dir) if f.endswith(".webp")])
        for i in range(1, 5):
            target_name = f"{short}-{i}.webp"
            target_path = os.path.join(dest_folder, target_name)
            if not os.path.exists(target_path):
                # Pick corresponding donor file
                idx = (i - 1) % len(donor_files) if donor_files else None
                if idx is not None:
                    shutil.copy2(os.path.join(donor_dir, donor_files[idx]), target_path)
                    print(f"Copied {donor_files[idx]} -> {target_path}")

print("Media folders and assets initialized successfully for Batch 10.")
