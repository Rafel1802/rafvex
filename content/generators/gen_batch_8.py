# content/generators/gen_batch_8.py
# Articles 49 - 53: Complete Long-Form Content Assembly
import json
import re
import sys
sys.path.append('content/generators')

from gen_batch_8_part1 import get_articles_49_50
from gen_batch_8_part2 import get_article_51
from gen_batch_8_part3 import get_articles_52_53

def get_batch_8():
    articles = []
    articles.extend(get_articles_49_50())
    articles.extend(get_article_51())
    articles.extend(get_articles_52_53())
    return articles

if __name__ == '__main__':
    arts = get_batch_8()
    print(f"Total articles in Batch 8: {len(arts)}")
    for a in arts:
        words = len(re.findall(r'\b\w+\b', a['content']))
        print(f"Article #{a['id']}: {a['title']} -> {words} words (Pillar: {a.get('is_pillar', False)})")

    with open('content/articles/batch_8.json', 'w') as f:
        json.dump(arts, f, indent=2)
    print("Successfully saved Batch 8 to content/articles/batch_8.json")
