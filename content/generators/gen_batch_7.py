# content/generators/gen_batch_7.py
# Articles 43 - 48: Complete Long-Form Content Assembly
import json
import re
import sys
sys.path.append('content/generators')

from gen_batch_7_part1 import get_articles_43_44
from gen_batch_7_part2 import get_articles_45_46
from gen_batch_7_part3 import get_articles_47_48

def get_batch_7():
    articles = []
    articles.extend(get_articles_43_44())
    articles.extend(get_articles_45_46())
    articles.extend(get_articles_47_48())
    return articles

if __name__ == '__main__':
    arts = get_batch_7()
    print(f"Total articles in Batch 7: {len(arts)}")
    for a in arts:
        words = len(re.findall(r'\b\w+\b', a['content']))
        print(f"Article #{a['id']}: {a['title']} -> {words} words (Pillar: {a.get('is_pillar', False)})")

    with open('content/articles/batch_7.json', 'w') as f:
        json.dump(arts, f, indent=2)
    print("Successfully saved Batch 7 to content/articles/batch_7.json")
