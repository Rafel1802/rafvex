import json
import os

all_articles = []
for i in range(1, 9):
    batch_file = f'/Applications/XAMPP/xamppfiles/htdocs/Rafelblog/content/articles/batch_{i}.json'
    if os.path.exists(batch_file):
        with open(batch_file) as f:
            all_articles.extend(json.load(f))

all_articles.sort(key=lambda x: x['id'])
print(f"Loaded {len(all_articles)} articles.")

# Generate DEMO_ARTICLES_CATALOG_FOR_AI_REWRITE.md
md_lines = []
md_lines.append("# Rafvex Master Catalog: 53 Comprehensive SEO Articles & Assets\n")
md_lines.append("> **Total Published Articles:** 53  ")
md_lines.append("> **Audience Demographic:** Academic researchers, data scientists, field investigators, students, and knowledge workers (US & EU)  ")
md_lines.append("> **Editorial Standard:** Authoritative, zero-filler, practical code/hardware workflows, benchmark tables, internal links, and Studio Ghibli 16:9 image prompts.\n")
md_lines.append("## Table of Contents\n")

for art in all_articles:
    md_lines.append(f"{art['id']}. [**#{art['id']}** - {art['title']}](#article-{art['id']}) | *{art['category']} > {art['subcategory']}*")

md_lines.append("\n---\n")

for art in all_articles:
    a_id = art['id']
    title = art['title']
    seo_title = art['seo_meta_title']
    slug = art['slug']
    cat = art['category']
    subcat = art['subcategory']
    pri_kw = art['primary_keyword']
    sec_kws = ", ".join(art['secondary_keywords'])
    meta_desc = art['meta_description']
    content = art['content']
    prompts = art['image_prompts']

    md_lines.append(f"## Article #{a_id}: {title} <a id=\"article-{a_id}\">\n")
    md_lines.append("### 1. METADATA HEADER\n")
    md_lines.append("| Attribute | Specification |")
    md_lines.append("| :--- | :--- |")
    md_lines.append(f"| **Article ID** | `#{a_id}` |")
    md_lines.append(f"| **Blog Title** | {title} |")
    md_lines.append(f"| **SEO Meta Title** | {seo_title} |")
    md_lines.append(f"| **Target Slug** | `{slug}` |")
    md_lines.append(f"| **Main Category** | **{cat}** |")
    md_lines.append(f"| **Subcategory** | **{subcat}** |")
    md_lines.append(f"| **Primary Focus Keyword** | `{pri_kw}` |")
    md_lines.append(f"| **Secondary Keywords** | {sec_kws} |")
    md_lines.append(f"| **Meta Description** | {meta_desc} |")
    md_lines.append(f"| **Live URL** | [https://rafvex.com/article/{slug}](https://rafvex.com/article/{slug}) |")
    md_lines.append(f"| **Media Library Directory** | `Media Library/blog/{cat}/{subcat}/{slug}/` |")
    md_lines.append("\n### 2. ARTICLE BODY CONTENT\n")
    md_lines.append(content)
    md_lines.append("\n### 3. 16:9 IMAGE GENERATION PROMPTS (1920x1080 - Studio Ghibli Style)\n")
    for p_idx, prompt in enumerate(prompts, 1):
        md_lines.append(f"**Prompt #{p_idx} (Asset: `{slug}-img-{p_idx}.webp`):**  ")
        md_lines.append(f"> {prompt}\n")
    md_lines.append("\n---\n")

catalog_path = '/Applications/XAMPP/xamppfiles/htdocs/Rafelblog/DEMO_ARTICLES_CATALOG_FOR_AI_REWRITE.md'
with open(catalog_path, 'w', encoding='utf-8') as f:
    f.write("\n".join(md_lines))

print(f"Updated DEMO_ARTICLES_CATALOG_FOR_AI_REWRITE.md with all 53 articles ({len(md_lines)} lines).")
