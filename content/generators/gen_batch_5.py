# content/generators/gen_batch_5.py
# Articles 29 - 35: Complete Long-Form Content Assembly
import json
import re
import sys
sys.path.append('content/generators')

from gen_batch_5_part1 import get_articles_29_30_31
from gen_batch_5_part2 import get_articles_32_33_34
from gen_batch_5_part3 import get_article_35

def get_batch_5():
    articles = []
    articles.extend(get_articles_29_30_31())
    articles.extend(get_articles_32_33_34())
    articles.extend(get_article_35())
    return articles

if __name__ == '__main__':
    arts = get_batch_5()
    print(f"Total articles in Batch 5: {len(arts)}")
    for a in arts:
        words = len(re.findall(r'\b\w+\b', a['content']))
        print(f"Article #{a['id']}: {a['title']} -> {words} words (Pillar: {a.get('is_pillar', False)})")

    with open('content/articles/batch_5.json', 'w') as f:
        json.dump(arts, f, indent=2)
    print("Successfully saved Batch 5 to content/articles/batch_5.json")
