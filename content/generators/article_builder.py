# content/generators/article_builder.py
import re

def build_pro_article(
    id_num,
    title,
    seo_title,
    slug,
    category,
    subcategory,
    primary_kw,
    secondary_kws,
    meta_desc,
    is_pillar,
    cluster_name,
    pillar_slug,
    sections,
    image_captions,
    comparison_card=None,
    image_prompts=None
):
    """
    Builds a professional long-form article (>2,100 to 2,800 words)
    with strict Markdown formatting, code blocks, tables, and internal/external links.
    """
    content_blocks = []

    for idx, sec in enumerate(sections, 1):
        sec_title = sec["title"]
        content_blocks.append(f"**{idx}. {sec_title}**\n")
        
        # Lead paragraphs
        for para in sec.get("paragraphs", []):
            content_blocks.append(para.strip() + "\n")

        # Optional Code Block
        if "code" in sec:
            lang = sec["code"].get("lang", "bash")
            code_str = sec["code"]["content"].strip()
            content_blocks.append(f"```{lang}\n{code_str}\n```\n")
            if "code_analysis" in sec["code"]:
                content_blocks.append(sec["code"]["code_analysis"].strip() + "\n")

        # Optional Table
        if "table" in sec:
            tbl = sec["table"]
            headers = tbl["headers"]
            header_line = "| " + " | ".join(headers) + " |"
            sep_line = "| " + " | ".join([":---" for _ in headers]) + " |"
            row_lines = []
            for r in tbl["rows"]:
                row_lines.append("| " + " | ".join(r) + " |")
            
            table_md = header_line + "\n" + sep_line + "\n" + "\n".join(row_lines) + "\n"
            content_blocks.append(table_md)
            if "table_analysis" in tbl:
                content_blocks.append(tbl["table_analysis"].strip() + "\n")

        # Optional Checklist
        if "checklist" in sec:
            content_blocks.append("To ensure operational integrity, implement the following requirements:")
            for item in sec["checklist"]:
                content_blocks.append(f"* **{item['label']}**: {item['desc']}")
            content_blocks.append("")

        # Sub-paragraphs
        for sub_para in sec.get("sub_paragraphs", []):
            content_blocks.append(sub_para.strip() + "\n")

    full_content = "\n".join(content_blocks).strip()
    words = len(re.findall(r'\b\w+\b', full_content))

    return {
        "id": id_num,
        "title": title,
        "seo_meta_title": seo_title,
        "slug": slug,
        "category": category,
        "subcategory": subcategory,
        "primary_keyword": primary_kw,
        "secondary_keywords": secondary_kws,
        "meta_description": meta_desc,
        "is_pillar": is_pillar,
        "cluster_name": cluster_name,
        "pillar_slug": pillar_slug,
        "image_captions": image_captions,
        "comparison_cards": { "img2": comparison_card } if comparison_card else {},
        "content": full_content,
        "image_prompts": image_prompts or []
    }
