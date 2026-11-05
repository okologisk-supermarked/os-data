# Badge-data til "Billigst i prismatch" på Helsekost-Ekspres: varerne i kategori 3850 -> prismatch/he.json.
# Læser kun fra DanDomain. Køres af sog/opdater.sh (søgeindeks-opgaven, 5 gange om dagen).
import json, os, sys, time
D = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(os.path.dirname(D), 'sog'))
from dd import call
nrs, off = [], 0
while True:
    r = call('GET', f'/categories/3850/products?limit=100&offset={off}')
    nrs += [x['number'].strip() for x in r.get('items', [])]
    if not r.get('hasMore'): break
    off += 100
json.dump({'t': time.strftime('%Y-%m-%dT%H:%M:%S'), 'n': sorted(set(nrs)), 'butikker': 8},
          open(os.path.join(D, 'he.json'), 'w'), ensure_ascii=False, separators=(',', ':'))
print('prismatch-badge', len(set(nrs)), 'varer')
