# Badge-data til "Black Week" på Økologisk-Supermarked (Johnny 17-11-2026): varerne i kategori 3852 -> blackweek/os.json.
# "n" = varer med aktivt Black Week-tilbud (DKK-tilbudspris i periode P11 BlackFriday) – kun de får badge.
# "alle" = alle varer i 3852 (vises kun med ?bwtest=1 i adressen, til test). Læser kun fra DanDomain. Køres af sog/opdater.sh.
import json, os, sys, time, concurrent.futures as cf
D = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(os.path.dirname(D), 'sog'))
from dd import call, q
KAT, PER = '3852', 'P11'
nrs, off = [], 0
while True:
    r = call('GET', f'/categories/{KAT}/products?limit=100&offset={off}')
    nrs += [x['number'].strip() for x in r.get('items', [])]
    if not r.get('hasMore'): break
    off += 100
def aktiv(nr):
    try:
        for p in call('GET', f'/products/{q(nr)}/prices')['items']:
            if p['currencyCode'] == 'DKK' and str(p['b2bGroupId']) == '0' and p['quantity'] == 1 and p.get('specialOfferPeriodId') == PER and (p.get('specialOfferPrice') or 0) > 0:
                return nr
    except Exception: pass
    return None
with cf.ThreadPoolExecutor(6) as ex: n = [x for x in ex.map(aktiv, sorted(set(nrs))) if x]
json.dump({'t': time.strftime('%Y-%m-%dT%H:%M:%S'), 'n': n, 'alle': sorted(set(nrs)), 'start': '2026-11-23', 'slut': '2026-11-30'},
          open(os.path.join(D, 'os.json'), 'w'), ensure_ascii=False, separators=(',', ':'))
print('blackweek-badge', len(n), 'aktive af', len(set(nrs)))
