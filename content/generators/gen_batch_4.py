# content/generators/gen_batch_4.py
# Articles 22 - 28: Complete Long-Form Content Assembly
import json
import re
import sys
sys.path.append('content/generators')

from gen_batch_4_part1 import get_articles_22_23_24
from gen_batch_4_part2 import get_articles_25_26_27_28
from gen_batch_4_part3 import get_articles_27_28

def get_batch_4():
    articles = []
    articles.extend(get_articles_22_23_24())
    articles.extend(get_articles_25_26_27_28())
    articles.extend(get_articles_27_28())
    return articles

if __name__ == '__main__':
    arts = get_batch_4()
    print(f"Total articles in Batch 4: {len(arts)}")
    for a in arts:
        words = len(re.findall(r'\b\w+\b', a['content']))
        print(f"Article #{a['id']}: {a['title']} -> {words} words")

    with open('content/articles/batch_4.json', 'w') as f:
        json.dump(arts, f, indent=2)
    print("Successfully saved Batch 4 to content/articles/batch_4.json")
