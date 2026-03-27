#!/bin/bash
# Generate all 300 articles in parallel batches of 10
# Each batch runs as a separate process

cd /home/ubuntu/narcissist-cure

BATCH_SIZE=10
TOTAL=300
MAX_PARALLEL=5

for ((start=0; start<TOTAL; start+=BATCH_SIZE)); do
    end=$((start + BATCH_SIZE))
    if [ $end -gt $TOTAL ]; then
        end=$TOTAL
    fi
    
    # Wait if we have too many parallel jobs
    while [ $(jobs -r | wc -l) -ge $MAX_PARALLEL ]; do
        sleep 5
    done
    
    echo "[LAUNCHER] Starting batch $start-$end"
    python3 scripts/gen-batch.py $start $end > "content/log-${start}-${end}.txt" 2>&1 &
done

echo "[LAUNCHER] All batches launched. Waiting for completion..."
wait
echo "[LAUNCHER] All batches complete!"

# Merge all batch files
python3 -c "
import json, glob, os

all_articles = []
for f in sorted(glob.glob('content/batch-*.json')):
    data = json.load(open(f))
    all_articles.extend(data)
    print(f'{f}: {len(data)} articles')

# Sort by original index order (based on titles.json)
titles = json.load(open('scripts/titles.json'))
slug_order = {}
for i, t in enumerate(titles):
    import re
    s = t['title'].lower()
    s = re.sub(r'[^a-z0-9\s-]', '', s)
    s = re.sub(r'\s+', '-', s.strip())
    s = re.sub(r'-+', '-', s)[:80]
    slug_order[s] = i

all_articles.sort(key=lambda a: slug_order.get(a['slug'], 999))

# Save clean version (no prompts)
clean = []
for a in all_articles:
    c = {k: v for k, v in a.items() if k not in ('heroPrompt', 'ogPrompt')}
    clean.append(c)

with open('content/articles-index.json', 'w') as f:
    json.dump(clean, f, indent=2)

# Save full version with prompts
with open('content/articles-full.json', 'w') as f:
    json.dump(all_articles, f, indent=2)

print(f'Total articles merged: {len(all_articles)}')
"
