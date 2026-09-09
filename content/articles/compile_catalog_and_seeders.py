import json
import os
import re
import html
import urllib.parse

# 1. Load All 53 Articles from Batches 1 to 8
all_articles = []
for i in range(1, 9):
    batch_file = f'/Applications/XAMPP/xamppfiles/htdocs/Rafelblog/content/articles/batch_{i}.json'
    if os.path.exists(batch_file):
        with open(batch_file) as f:
            all_articles.extend(json.load(f))

all_articles.sort(key=lambda x: x['id'])
print(f"Loaded {len(all_articles)} articles from batches.")

# Load articles manifest for image prompts and secondary metadata
with open('/Applications/XAMPP/xamppfiles/htdocs/Rafelblog/content/articles_manifest.json') as f:
    manifest = json.load(f)
manifest_map = {m['id']: m for m in manifest}

# Load article specs from generate_unwatermarked_clean_slug_images.php
with open('/Applications/XAMPP/xamppfiles/htdocs/Rafelblog/generate_unwatermarked_clean_slug_images.php') as f:
    php_spec = f.read()

specs = re.findall(r"(\d+)\s*=>\s*\[\s*'shortSlug'\s*=>\s*'([^']+)',\s*'category'\s*=>\s*'([^']+)',\s*'subcategory'\s*=>\s*'([^']+)'", php_spec)

def slugify(text):
    text = text.lower()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_]+", "-", text)
    return text.strip("-")

spec_map = {}
for aid, short, cat, subcat in specs:
    spec_map[int(aid)] = {
        "shortSlug": short,
        "category": cat,
        "subcategory": subcat,
        "catSlug": slugify(cat),
        "subcatSlug": slugify(subcat),
    }

# 2. Generate DEMO_ARTICLES_CATALOG_FOR_AI_REWRITE.md
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
    m_entry = manifest_map.get(a_id, {})
    title = art['title']
    seo_title = art.get('seo_meta_title') or m_entry.get('title', title)
    slug = art['slug']
    cat = art['category']
    subcat = art['subcategory']
    pri_kw = art.get('primary_keyword') or m_entry.get('primary_keyword', '')
    sec_kws = ", ".join(art.get('secondary_keywords') or m_entry.get('secondary_keywords', []))
    meta_desc = art.get('meta_description') or m_entry.get('meta_description', '')
    content = art['content']
    
    # Image prompts from manifest
    prompts = m_entry.get('image_prompts', [])

    md_lines.append(f"## Article #{a_id}: {title} <a id=\"article-{a_id}\"></a>\n")
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

# 3. HTML Content Compilation Engine
def format_caption(cap, fig_num):
    if isinstance(cap, dict):
        title = cap.get("title", f"Figure {fig_num}")
        desc = cap.get("desc", "")
        if not title.startswith("Figure"):
            title = f"Figure {fig_num}: {title}"
        return title, desc
    elif isinstance(cap, str):
        if ":" in cap:
            parts = cap.split(":", 1)
            return parts[0].strip(), parts[1].strip()
        return f"Figure {fig_num}", cap
    return f"Figure {fig_num}", ""

def format_comparison(comp):
    if not comp or not isinstance(comp, dict):
        return ""
    t_a = comp.get("title_a", "Approach A")
    t_b = comp.get("title_b", "Approach B")
    title = comp.get("title") or f"{t_a} vs {t_b}"
    p1_title = comp.get("title_a") or "Key Analysis Point A"
    p1_desc = comp.get("desc_a") or comp.get("point1", "")
    p2_title = comp.get("title_b") or "Key Analysis Point B"
    p2_desc = comp.get("desc_b") or comp.get("point2", "")
    
    return f"""<div class="comparison-card">
  <div class="comparison-item">
    <div class="comparison-item-header">
      <span class="dot bg-red-500"></span>
      <span>{html.escape(p1_title)}</span>
    </div>
    <p class="comparison-item-desc">{html.escape(p1_desc)}</p>
  </div>
  <div class="comparison-item">
    <div class="comparison-item-header">
      <span class="dot bg-emerald-500"></span>
      <span>{html.escape(p2_title)}</span>
    </div>
    <p class="comparison-item-desc">{html.escape(p2_desc)}</p>
  </div>
</div>"""

def format_table_cell(text):
    text = text.strip()
    # Escape HTML special chars first
    text = html.escape(text)
    # Convert bold **text** to <strong>text</strong>
    text = re.sub(r"\*\*([^\*\n]+)\*\*", r'<strong>\1</strong>', text)
    # Convert italic *text* to <em>text</em>
    text = re.sub(r"(?<!\*)\*([^\*\n]+)\*(?!\*)", r'<em>\1</em>', text)
    # Convert inline code `text` to <code>
    text = re.sub(r"`([^`\n]+)`", r'<code class="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-xs font-mono font-semibold">\1</code>', text)
    # Convert links [text](url)
    text = re.sub(r"\[([^\]]+)\]\((https?://[^\)]+)\)", r'<a href="\2" class="text-red-600 dark:text-red-400 font-medium underline" target="_blank" rel="noopener noreferrer">\1</a>', text)
    return text

def markdown_table_to_html(table_text):
    lines = [l.strip() for l in table_text.strip().split("\n") if l.strip()]
    if len(lines) < 2:
        return table_text
    
    header_cols = [c.strip() for c in lines[0].strip("|").split("|")]
    rows = []
    for line in lines[2:]:
        line = line.strip()
        if "|" in line:
            cols = [c.strip() for c in line.strip("|").split("|")]
            rows.append(cols)
            
    th_html = "".join(f'<th class="px-4 py-3 bg-slate-100/80 dark:bg-slate-800 font-bold text-slate-800 dark:text-slate-100 text-xs sm:text-sm border-b border-slate-200 dark:border-slate-700 whitespace-nowrap">{format_table_cell(c)}</th>' for c in header_cols)
    rows_html = ""
    for r in rows:
        while len(r) < len(header_cols):
            r.append('')
        if len(r) > len(header_cols):
            r = r[:len(header_cols)]
        td_html = "".join(f'<td class="px-4 py-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800 whitespace-nowrap sm:whitespace-normal">{format_table_cell(c)}</td>' for c in r)
        rows_html += f'<tr class="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">{td_html}</tr>'
        
    return f"""<div class="overflow-x-auto my-8 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs bg-white dark:bg-slate-900">
  <table class="w-full text-left border-collapse">
    <thead><tr>{th_html}</tr></thead>
    <tbody>{rows_html}</tbody>
  </table>
</div>"""

def compile_article_html(art):
    aid = art['id']
    spec = spec_map.get(aid, {
        "shortSlug": art['slug'],
        "catSlug": slugify(art['category']),
        "subcatSlug": slugify(art['subcategory']),
    })
    
    cat_slug = spec["catSlug"]
    subcat_slug = spec["subcatSlug"]
    short = spec["shortSlug"]
    
    img2_url = f"/blog/{cat_slug}/{subcat_slug}/{short}/{short}-2.webp"
    img3_url = f"/blog/{cat_slug}/{subcat_slug}/{short}/{short}-3.webp"
    img4_url = f"/blog/{cat_slug}/{subcat_slug}/{short}/{short}-4.webp"
    
    caps = art.get('image_captions', {})
    comps = art.get('comparison_cards', {})
    
    f2_title, f2_desc = format_caption(caps.get('img2', caps.get('image_2')), 2)
    f3_title, f3_desc = format_caption(caps.get('img3', caps.get('image_3')), 3)
    f4_title, f4_desc = format_caption(caps.get('img4', caps.get('image_4')), 4)
    
    comp_card_html = format_comparison(comps.get('img2', comps.get('image_2')))
    
    # Figure 2 HTML
    fig2_html = f"""<figure class="my-10 rounded-2xl overflow-hidden shadow-sm border border-slate-200/70 bg-slate-100">
  <div class="aspect-video w-full overflow-hidden">
    <img src="{img2_url}" alt="{html.escape(f2_title)}" class="w-full h-full object-cover" loading="lazy" />
  </div>
  <figcaption class="text-xs sm:text-sm text-slate-600 py-3 px-4 bg-slate-50 border-t border-slate-100 flex flex-col gap-1">
    <strong class="text-slate-900 font-bold">{html.escape(f2_title)}</strong>
    <span class="text-slate-600 leading-relaxed">{html.escape(f2_desc)}</span>
  </figcaption>
</figure>"""
    if comp_card_html:
        fig2_html += f"\n\n{comp_card_html}"
        
    # Figure 3 HTML
    fig3_html = f"""<figure class="my-10 rounded-2xl overflow-hidden shadow-sm border border-slate-200/70 bg-slate-100">
  <div class="aspect-video w-full overflow-hidden">
    <img src="{img3_url}" alt="{html.escape(f3_title)}" class="w-full h-full object-cover" loading="lazy" />
  </div>
  <figcaption class="text-xs sm:text-sm text-slate-600 py-3 px-4 bg-slate-50 border-t border-slate-100 flex flex-col gap-1">
    <strong class="text-slate-900 font-bold">{html.escape(f3_title)}</strong>
    <span class="text-slate-600 leading-relaxed">{html.escape(f3_desc)}</span>
  </figcaption>
</figure>"""

    # Figure 4 HTML
    fig4_html = f"""<figure class="my-10 rounded-2xl overflow-hidden shadow-sm border border-slate-200/70 bg-slate-100">
  <div class="aspect-video w-full overflow-hidden">
    <img src="{img4_url}" alt="{html.escape(f4_title)}" class="w-full h-full object-cover" loading="lazy" />
  </div>
  <figcaption class="text-xs sm:text-sm text-slate-600 py-3 px-4 bg-slate-50 border-t border-slate-100 flex flex-col gap-1">
    <strong class="text-slate-900 font-bold">{html.escape(f4_title)}</strong>
    <span class="text-slate-600 leading-relaxed">{html.escape(f4_desc)}</span>
  </figcaption>
</figure>"""

    # Topic Cluster Banner
    cluster_name = art.get('cluster_name', f"{art['category']} Engineering")
    is_pillar = art.get('is_pillar', False)
    pillar_slug = art.get('pillar_slug', '')
    
    if not is_pillar and pillar_slug:
        cluster_banner = f"""<div class="topic-cluster-banner mb-8">
  <div class="cluster-icon">
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
  </div>
  <div>
    <span class="text-xs font-bold uppercase tracking-wider text-red-600 block mb-0.5">Topic Cluster Architecture</span>
    <p class="text-xs sm:text-sm text-slate-700 dark:text-slate-300 m-0">Part of our research cluster on <strong>{cluster_name}</strong>. For foundational benchmarks, explore our flagship pillar: <a href="/article/{pillar_slug}" class="text-red-600 dark:text-red-400 font-bold hover:underline">Read the Pillar Guide &rarr;</a></p>
  </div>
</div>"""
    else:
        cluster_banner = f"""<div class="topic-cluster-banner mb-8">
  <div class="cluster-icon">
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
  </div>
  <div>
    <span class="text-xs font-bold uppercase tracking-wider text-red-600 block mb-0.5">Flagship Pillar Publication</span>
    <p class="text-xs sm:text-sm text-slate-700 dark:text-slate-300 m-0">This comprehensive masterclass serves as the primary cornerstone guide for our <strong>{cluster_name}</strong> research cluster, establishing standard production benchmarks.</p>
  </div>
</div>"""

    content = art['content']
    
    # Process code blocks into interactive copyable terminal blocks with placeholder tokens to avoid paragraph splitting
    code_blocks = {}
    def code_repl(match):
        token = f"___CODE_TERMINAL_BLOCK_{len(code_blocks)}___"
        lang = match.group(1) or 'terminal'
        code_text = match.group(2).strip()
        encoded = urllib.parse.quote(code_text)
        escaped_code = html.escape(code_text)
        block_html = f"""<div class="code-terminal-block my-6 rounded-2xl overflow-hidden border border-slate-800 bg-[#0f172a] shadow-xl">
  <div class="flex items-center justify-between px-4 py-2.5 bg-[#1e293b] border-b border-slate-700/60">
    <div class="flex items-center gap-2">
      <span class="w-2.5 h-2.5 rounded-full bg-red-500/80"></span>
      <span class="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
      <span class="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
      <span class="text-xs font-mono text-slate-400 ml-2 font-medium">{lang}</span>
    </div>
    <button class="copy-code-btn" data-code="{encoded}">
      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
      <span>Copy</span>
    </button>
  </div>
  <pre class="p-4 text-xs sm:text-sm font-mono text-slate-100 overflow-x-auto leading-relaxed"><code>{escaped_code}</code></pre>
</div>"""
        code_blocks[token] = block_html
        return f"\n\n{token}\n\n"

    content = re.sub(r"```([a-zA-Z0-9_-]*)\r?\n([\s\S]*?)```", code_repl, content)
    
    # Process markdown tables with placeholders
    table_blocks = {}
    def table_repl(match):
        token = f"___TABLE_BLOCK_{len(table_blocks)}___"
        table_html = markdown_table_to_html(match.group(0))
        table_blocks[token] = table_html
        return f"\n\n{token}\n\n"
    content = re.sub(r"(\|.+?\|\r?\n\|[-: |]+\|\r?\n(?:\|[^\n]+\|\r?\n?)+)", table_repl, content)
    
    # Convert markdown headers (**N. Title**)
    content = re.sub(r"\*\*([0-9]+\.\s+[^\*\n]+)\*\*", r'<h2 class="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 mt-12 mb-5 font-[\'Outfit\']">\1</h2>', content)
    content = re.sub(r"^###\s+([^\n]+)", r'<h3 class="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mt-8 mb-4 font-[\'Outfit\']">\1</h3>', content, flags=re.MULTILINE)
    content = re.sub(r"^####\s+([^\n]+)", r'<h4 class="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 mt-6 mb-3 font-[\'Outfit\']">\1</h4>', content, flags=re.MULTILINE)
    
    # Convert inline code
    content = re.sub(r"`([^`\n]+)`", r'<code class="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-mono font-semibold border border-slate-200 dark:border-slate-700">\1</code>', content)
    
    # Convert bold / italics / links
    content = re.sub(r"\[([^\]]+)\]\((https?://[^\)]+)\)", r'<a href="\2" class="text-red-600 dark:text-red-400 font-medium underline hover:text-red-700 dark:hover:text-red-300 transition-colors" target="_blank" rel="noopener noreferrer">\1</a>', content)
    content = re.sub(r"\*\*([^\*\n]+)\*\*", r'<strong>\1</strong>', content)
    content = re.sub(r"\*([^\*\n]+)\*", r'<em>\1</em>', content)
    
    # Helper function to format ordered numbered lists with nested subitems
    def format_ordered_list(block):
        lines = block.split('\n')
        items = []
        current_item = None
        for line in lines:
            m = re.match(r'^\s*(\d+)\.\s+(.*)', line)
            if m:
                if current_item:
                    items.append(current_item)
                current_item = {'num': m.group(1), 'text': m.group(2).strip(), 'subitems': []}
            elif current_item:
                stripped = line.strip()
                if stripped.startswith('- ') or stripped.startswith('* '):
                    current_item['subitems'].append(stripped[2:].strip())
                elif stripped:
                    if current_item['subitems']:
                        current_item['subitems'][-1] += ' ' + stripped
                    else:
                        current_item['text'] += ' ' + stripped
        if current_item:
            items.append(current_item)
            
        li_html_list = []
        for it in items:
            sub_html = ''
            if it['subitems']:
                sub_lis = ''.join(f'<li class="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed mb-1">{sub}</li>' for sub in it['subitems'])
                sub_html = f'<ul class="list-disc pl-5 mt-2 mb-1 space-y-1">{sub_lis}</ul>'
            li_html_list.append(f'<li class="mb-3.5 pl-1 leading-relaxed"><div class="text-slate-800 dark:text-slate-200 font-normal">{it["text"]}</div>{sub_html}</li>')
            
        return f'<ol class="list-decimal pl-6 my-6 text-slate-700 dark:text-slate-300 space-y-2 text-base sm:text-lg">{ "".join(li_html_list) }</ol>'

    # Helper function to format unordered bullet lists with nested subitems
    def format_unordered_list(block):
        lines = block.split('\n')
        items = []
        current_item = None
        for line in lines:
            stripped = line.strip()
            if not stripped:
                continue
            is_sub = (line.startswith('  ') or line.startswith('\t')) and (stripped.startswith('- ') or stripped.startswith('* '))
            if not is_sub and (stripped.startswith('- ') or stripped.startswith('* ')):
                if current_item:
                    items.append(current_item)
                current_item = {'text': stripped[2:].strip(), 'subitems': []}
            elif current_item:
                if is_sub:
                    current_item['subitems'].append(stripped[2:].strip())
                else:
                    if current_item['subitems']:
                        current_item['subitems'][-1] += ' ' + stripped
                    else:
                        current_item['text'] += ' ' + stripped
            else:
                current_item = {'text': stripped.lstrip('- *').strip(), 'subitems': []}
        if current_item:
            items.append(current_item)
            
        li_html_list = []
        for it in items:
            sub_html = ''
            if it['subitems']:
                sub_lis = ''.join(f'<li class="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed mb-1">{sub}</li>' for sub in it['subitems'])
                sub_html = f'<ul class="list-disc pl-5 mt-2 mb-1 space-y-1">{sub_lis}</ul>'
            li_html_list.append(f'<li class="mb-2 leading-relaxed text-slate-700 dark:text-slate-300">{it["text"]}{sub_html}</li>')
            
        return f'<ul class="list-disc pl-6 my-6 text-slate-700 dark:text-slate-300 space-y-2 text-base sm:text-lg">{ "".join(li_html_list) }</ul>'

    # Split paragraphs and separate leading introductory text from attached lists
    raw_paragraphs = content.split("\n\n")
    paragraphs = []
    for p in raw_paragraphs:
        p = p.strip()
        if not p:
            continue
        is_ordered = bool(re.match(r'^\s*\d+\.\s+', p))
        is_unordered = p.startswith('- ') or p.startswith('* ')
        if not is_ordered and not is_unordered:
            if re.search(r'\n\s*\d+\.\s+', p):
                parts = re.split(r'\n(?=\s*\d+\.\s+)', p, maxsplit=1)
                paragraphs.append(parts[0].strip())
                p = parts[1].strip()
            elif re.search(r'\n\s*[-|\*]\s+', p):
                parts = re.split(r'\n(?=\s*[-|\*]\s+)', p, maxsplit=1)
                paragraphs.append(parts[0].strip())
                p = parts[1].strip()
        paragraphs.append(p)

    processed_p = []
    i = 0
    while i < len(paragraphs):
        p = paragraphs[i].strip()
        if not p:
            i += 1
            continue
        if p in code_blocks:
            processed_p.append(code_blocks[p])
            i += 1
        elif p in table_blocks:
            processed_p.append(table_blocks[p])
            i += 1
        elif p.startswith("<div") or p.startswith("<h2") or p.startswith("<h3") or p.startswith("<h4") or p.startswith("<pre") or p.startswith("<figure") or p.startswith("<table"):
            processed_p.append(p)
            i += 1
        elif p == "---" or p == "***":
            processed_p.append('<hr class="my-10 border-slate-200" />')
            i += 1
        elif p.startswith("> "):
            lines = [line.lstrip("> ").strip() for line in p.split("\n")]
            processed_p.append(f'<blockquote class="my-8 pl-5 py-3 border-l-4 border-red-500 bg-red-50/40 rounded-r-xl text-slate-800 italic font-serif text-lg leading-relaxed">{"<br>".join(lines)}</blockquote>')
            i += 1
        elif re.match(r'^\s*\d+\.\s+', p):
            ol_blocks = [p]
            while i + 1 < len(paragraphs) and re.match(r'^\s*\d+\.\s+', paragraphs[i + 1].strip()):
                i += 1
                ol_blocks.append(paragraphs[i].strip())
            processed_p.append(format_ordered_list("\n".join(ol_blocks)))
            i += 1
        elif p.startswith("* ") or p.startswith("- "):
            ul_blocks = [p]
            while i + 1 < len(paragraphs) and (paragraphs[i + 1].strip().startswith("* ") or paragraphs[i + 1].strip().startswith("- ")):
                i += 1
                ul_blocks.append(paragraphs[i].strip())
            processed_p.append(format_unordered_list("\n".join(ul_blocks)))
            i += 1
        else:
            processed_p.append(f'<p class="mb-6 leading-relaxed text-slate-700 dark:text-slate-300 text-base sm:text-lg font-normal">{p}</p>')
            i += 1
            
    # Inject Figures 2, 3, 4 at structured intervals
    # Find h2 indices
    h2_indices = [i for i, p in enumerate(processed_p) if "<h2" in p]
    
    # Figure 2 after Section 2
    if len(h2_indices) >= 2 and len(processed_p) > h2_indices[1] + 1:
        processed_p.insert(h2_indices[1] + 1, fig2_html)
    else:
        processed_p.insert(min(4, len(processed_p)), fig2_html)
        
    # Re-calculate h2 indices after insertion
    h2_indices = [i for i, p in enumerate(processed_p) if "<h2" in p]
    
    # Figure 3 after Section 4
    if len(h2_indices) >= 4 and len(processed_p) > h2_indices[3] + 1:
        processed_p.insert(h2_indices[3] + 1, fig3_html)
    else:
        processed_p.insert(min(len(processed_p) // 2, len(processed_p)), fig3_html)
        
    # Re-calculate h2 indices
    h2_indices = [i for i, p in enumerate(processed_p) if "<h2" in p]
    
    # Figure 4 before last section
    if len(h2_indices) >= 5:
        processed_p.insert(h2_indices[-1], fig4_html)
    else:
        processed_p.insert(max(0, len(processed_p) - 3), fig4_html)
        
    final_html = cluster_banner + "\n\n" + "\n\n".join(processed_p)

    # Final safeguard replacement in case tokens were inline
    for tok, b_html in code_blocks.items():
        if tok in final_html:
            final_html = final_html.replace(tok, b_html)
    for tok, b_html in table_blocks.items():
        if tok in final_html:
            final_html = final_html.replace(tok, b_html)

    return final_html

# 4. Generate seed_all_53_articles.php
# Pre-compile each article HTML and save into a compact json cache so PHP seeder runs instantly!
compiled_cache = []
for art in all_articles:
    aid = art['id']
    html_body = compile_article_html(art)
    spec = spec_map.get(aid, {
        "shortSlug": art['slug'],
        "catSlug": slugify(art['category']),
        "subcatSlug": slugify(art['subcategory']),
    })
    
    cover_url = f"/blog/{spec['catSlug']}/{spec['subcatSlug']}/{spec['shortSlug']}/{spec['shortSlug']}-1.webp"
    caps = art.get('image_captions', {})
    f1_title, f1_desc = format_caption(caps.get('img1', caps.get('image_1')), 1)
    cover_alt = f"{f1_title}: {f1_desc}".strip(": ")
    m_entry = manifest_map.get(aid, {})
    
    compiled_cache.append({
        "id": aid,
        "title": art['title'],
        "seo_meta_title": art.get('seo_meta_title') or m_entry.get('title', art['title']),
        "slug": art['slug'],
        "category": art['category'],
        "subcategory": art['subcategory'],
        "primary_keyword": art.get('primary_keyword') or m_entry.get('primary_keyword', ''),
        "meta_description": art.get('meta_description') or m_entry.get('meta_description', ''),
        "is_pillar": art.get('is_pillar', False),
        "cover_image_url": cover_url,
        "cover_image_alt": cover_alt,
        "html_content": html_body,
    })

compiled_json_path = '/Applications/XAMPP/xamppfiles/htdocs/Rafelblog/content/compiled_articles_cache.json'
with open(compiled_json_path, 'w', encoding='utf-8') as f:
    json.dump(compiled_cache, f)

print(f"Generated compiled_articles_cache.json with all 53 articles ({os.path.getsize(compiled_json_path) / 1024:.1f} KB).")

php_code = r"""<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Category;
use App\Models\Article;
use App\Models\User;
use Illuminate\Support\Str;

echo "====================================================================\\n";
echo "       RAFVEX 53 ARTICLES MASTER DATABASE SYNC / SEEDER              \\n";
echo "====================================================================\\n";

$author = User::first();
if (!$author) {
    echo "Creating default author user...\\n";
    $author = User::create([
        'name' => 'Dr. Elena Vance',
        'email' => 'editor@rafvex.com',
        'password' => bcrypt('RafvexResearch2026!'),
        'email_verified_at' => now(),
    ]);
}
$authorId = $author->id;

// Load precompiled articles cache
$cacheFile = __DIR__ . '/content/compiled_articles_cache.json';
if (!file_exists($cacheFile)) {
    die("Error: compiled_articles_cache.json not found! Run compile_catalog_and_seeders.py first.\\n");
}
$articles = json_decode(file_get_contents($cacheFile), true);
echo "Loaded " . count($articles) . " precompiled articles from cache.\\n";

$categoryCache = [];

foreach ($articles as $art) {
    $catName = $art['category'];
    $subcatName = $art['subcategory'];
    $slug = $art['slug'];
    $title = $art['title'];

    // 1. Ensure Parent Category
    $parentSlug = Str::slug($catName);
    if (!isset($categoryCache[$parentSlug])) {
        $parentCat = Category::firstOrCreate(
            ['slug' => $parentSlug],
            [
                'name' => $catName,
                'description' => "Comprehensive research and guides on {$catName}.",
                'status' => 'active',
                'featured' => true,
            ]
        );
        $categoryCache[$parentSlug] = $parentCat;
    } else {
        $parentCat = $categoryCache[$parentSlug];
    }

    // 2. Ensure Subcategory
    $subcatSlug = Str::slug($subcatName);
    if (!isset($categoryCache[$subcatSlug])) {
        $subCat = Category::firstOrCreate(
            ['slug' => $subcatSlug],
            [
                'parent_id' => $parentCat->id,
                'name' => $subcatName,
                'description' => "In-depth guides and analysis in {$subcatName}.",
                'status' => 'active',
                'featured' => false,
            ]
        );
        $categoryCache[$subcatSlug] = $subCat;
    } else {
        $subCat = $categoryCache[$subcatSlug];
    }

    $htmlContent = $art['html_content'];
    $coverImageUrl = $art['cover_image_url'];
    $coverImageAlt = $art['cover_image_alt'];

    // 3. Update or Create Article in Database
    $dbArticle = Article::updateOrCreate(
        ['slug' => $slug],
        [
            'user_id' => $authorId,
            'category_id' => $subCat->id,
            'title' => $title,
            'excerpt' => $art['meta_description'],
            'content' => $htmlContent,
            'content_raw' => null,
            'status' => 'published',
            'published_at' => now()->subDays(53 - $art['id']),
            'cover_image_url' => $coverImageUrl,
            'cover_image_alt' => $coverImageAlt,
            'meta_title' => $art['seo_meta_title'],
            'meta_description' => $art['meta_description'],
            'reading_time' => max(8, (int)(str_word_count(strip_tags($htmlContent)) / 200)),
            'featured' => in_array($art['id'], [1, 2, 6, 9, 14, 16, 22, 28, 35, 41, 44, 48, 51]),
            'allow_comments' => true,
            'ai_assisted' => true,
        ]
    );

    echo "Synced Article #{$art['id']}: {$title} [ID: {$dbArticle->id}]\\n";
}

echo "====================================================================\\n";
echo "✓ All 53 Articles Successfully Seeded / Updated in Database!        \\n";
echo "====================================================================\\n";
"""

with open('/Applications/XAMPP/xamppfiles/htdocs/Rafelblog/seed_all_53_articles.php', 'w') as f:
    f.write(php_code)

print("Generated seed_all_53_articles.php successfully.")
