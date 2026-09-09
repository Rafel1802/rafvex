# content/generators/gen_batch_6.py
# Articles 36 - 42: Complete Long-Form Content Assembly
import json
import re
import sys
sys.path.append('content/generators')

from gen_batch_6_part1 import get_articles_36_37_38
from gen_batch_6_part2 import get_articles_39_40
from gen_batch_6_part3 import get_articles_41_42

def get_batch_6():
    articles = []
    articles.extend(get_articles_36_37_38())
    articles.extend(get_articles_39_40())
    articles.extend(get_articles_41_42())
    return articles

if __name__ == '__main__':
    arts = get_batch_6()
    print(f"Total articles in Batch 6: {len(arts)}")
    for a in arts:
        words = len(re.findall(r'\b\w+\b', a['content']))
        print(f"Article #{a['id']}: {a['title']} -> {words} words (Pillar: {a.get('is_pillar', False)})")

    with open('content/articles/batch_6.json', 'w') as f:
        json.dump(arts, f, indent=2)
    print("Successfully saved Batch 6 to content/articles/batch_6.json")
