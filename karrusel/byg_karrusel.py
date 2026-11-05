# Bygger data til de egne produktkarruseller på Økologisk-Supermarked (site 26) og Helsekost-Ekspres (site 27).
# Erstatter Plugly-karrusellerne og DanDomains "Andre købte også". Kræver API-nøglen i ~/.dd/key og at
# sog/indeks.json + sog/indeks_he.json er bygget først (kortdata: navn, url, billede, pris, lager).
# Ud: karrusel/{os,he}.json (faste karruseller), karrusel/{os,he}_kat.json (kategorisider),
#     karrusel/{os,he}_v/NN.json (varesider: andre købte også + samme kategori), 32 filer pr. shop.
import sys, os, json, re, time, zlib, datetime, collections
D = os.path.dirname(os.path.abspath(__file__))
R = os.path.dirname(D)
sys.path.insert(0, os.path.join(R, 'sog'))
from dd import call
from concurrent.futures import ThreadPoolExecutor

CFG = json.load(open(os.path.join(D, 'config.json')))
LIVE = CFG.pop('live', {})  # {'os': bool, 'he': bool} – karrusellerne vises kun for kunder, når live er true
SHARDS = 32
DOM = re.compile(r'^https?://[^/]+')
SKIP = re.compile(r'^(HELSAM|3784|3806|3814|3846|146$|organic|3844|brand-)', re.I)
INTERN = re.compile(r'^lager |tilbud|discount|stop madspild|outlet|køb europæisk|nyhed|bedst|kampagne|black ?friday|gratis|kopi|julevarer', re.I)
KOPI = re.compile(r'\(KOPI\)', re.I)


def hent(path, tries=4):
    for t in range(tries):
        try: return call('GET', path)
        except Exception as e: err = e; time.sleep(2 * (t + 1))
    raise err


# ---------- 1. Ordrer (begge shops, 365 dage): salg pr. dag og køb sammen ----------
nu = datetime.datetime.now()
start = (nu - datetime.timedelta(days=365)).date().isoformat()
qs = lambda o: f'/orders?start={start}T00:00:00&limit=100&offset={o}&include=lines'
first = hent(qs(0)); n = first['count']
with ThreadPoolExecutor(4) as ex: pages = [first] + list(ex.map(lambda o: hent(qs(o)), range(100, n, 100)))
ordrer = [o for p in pages for o in p['items']]
assert len(ordrer) >= n * 0.98, f'kun {len(ordrer)} af {n} ordrer hentet'
salg = collections.defaultdict(list)      # nr -> [(alder i dage, stk)]
sammen = collections.defaultdict(collections.Counter)
for o in ordrer:
    st = o.get('orderStateInfo') or {}
    if o.get('incomplete') or st.get('dontUseInStatistics') or (st.get('name') or '').strip().lower() == 'afviste': continue
    alder = (nu - datetime.datetime.fromisoformat(o['createdDate'][:19])).total_seconds() / 86400
    L = (o.get('lines') or {}).get('items', [])
    nrs = []
    for l in L:
        pn = (l.get('productNumber') or '').strip()
        if not pn or l.get('lineType') or l.get('isCredited'): continue
        salg[pn].append((alder, int(l.get('quantity') or 0)))
        nrs.append(KOPI.sub('', pn).strip())   # KOPI-køb tæller som den almindelige vare i "køb sammen"
    u = list(dict.fromkeys(nrs))
    if 2 <= len(u) <= 40:
        for a in u:
            for b in u:
                if a != b: sammen[a][b] += 1
print('ordrer', len(ordrer), 'varer med salg', len(salg))


def solgt(nr, dage):
    return sum(q for a, q in salg.get(nr, ()) if a <= dage)


# ---------- 2. Pr. shop ----------
def byg(site, kode):
    cfg = CFG[kode]
    cur = 'DKK' if site == 26 else 'DKK2'
    ix = json.load(open(os.path.join(R, 'sog', 'indeks.json' if site == 26 else 'indeks_he.json')))
    rows = {r[0]: r for r in ix['p']}
    # kategorier pr. vare + kategoriernes url
    def pg(o): return hent(f'/sites/{site}/products?limit=100&offset={o}&notHidden=true&currency={cur}&include=categories')['items']
    with ThreadPoolExecutor(6) as ex: pp = list(ex.map(pg, range(0, 9500, 100)))
    def cp(o): return hent(f'/sites/{site}/categories?limit=100&offset={o}')['items']
    with ThreadPoolExecutor(6) as ex: cc = list(ex.map(cp, range(0, 1300, 100)))
    kat = {}
    for x in cc:
        for c in x:
            kat[str(c['id'])] = {'navn': (c.get('name') or '').strip(), 'url': DOM.sub('', c.get('url') or ''), 'skjult': bool(c.get('hidden'))}
    pkat, oko = {}, set()
    for x in pp:
        for p in x:
            nr = (p.get('productNumber') or '').strip()
            if nr not in rows: continue
            ids = [str(c['id']) for c in ((p.get('categories') or {}).get('items') or [])]
            if any(i.lower() == 'organic' for i in ids): oko.add(nr)
            pkat[nr] = ids
    def blad(nr):  # varens "egen" kategori til "samme kategori"
        for i in pkat.get(nr, []):
            k = kat.get(i)
            if k and not k['skjult'] and k['url'] and not SKIP.match(i) and not INTERN.search(k['navn']): return i
        return None
    def ok(nr, lager): return nr in rows and (not lager or rows[nr][10] == 1)
    def rang(nrs, dage, lager, antal, udelad=()):
        c = [n for n in dict.fromkeys(nrs) if ok(n, lager) and n not in udelad]
        c.sort(key=lambda n: (-solgt(n, dage), -(rows[n][8] or 0), rows[n][11]))
        return c[:antal]

    brugt = set()
    def kort(nrs):
        brugt.update(nrs); return nrs

    faste, meta = {}, {}
    medlem = collections.defaultdict(list)
    for nr, ids in pkat.items():
        for i in ids: medlem[i].append(nr)
    alle_ej_kopi = [n for n in rows if not KOPI.search(n)]
    for cid, c in cfg.items():
        meta[cid] = {'t': c['titel'], 'k': c['kilde']}
        if c['kilde'] == 'alle':
            faste[cid] = {'t': c['titel'], 'v': kort(rang(alle_ej_kopi, c.get('dage', 30), c.get('lager'), c['antal']))}
        elif c['kilde'] == 'kategori':
            faste[cid] = {'t': c['titel'], 'v': kort(rang(medlem.get(str(c['kategori']), []), c.get('dage', 30), c.get('lager'), c['antal']))}
        elif c['kilde'] == 'varer':
            faste[cid] = {'t': c['titel'], 'v': kort([n for n in c.get('varer', []) if ok(n, c.get('lager'))][:c['antal']])}

    def cardsfor(nrs):
        out = {}
        for n in nrs:
            r = rows[n]
            out[n] = [r[1], r[2], r[3], r[4], r[5], r[10], 1 if n in oko else 0]
        return out

    stamp = time.strftime('%Y-%m-%dT%H:%M:%S')
    json.dump({'t': stamp, 'live': bool(LIVE.get(kode)), 'm': meta, 'l': faste, 'c': cardsfor(brugt)},
              open(os.path.join(D, f'{kode}.json'), 'w'), ensure_ascii=False, separators=(',', ':'))

    # kategorisider ("side") og samme kategori ("samme")
    side = next((c for c in cfg.values() if c['kilde'] == 'side'), None)
    samme = next((c for c in cfg.values() if c['kilde'] == 'samme'), None)
    katlist = {}
    for i, k in kat.items():
        if k['skjult'] or not k['url'] or SKIP.match(i) or INTERN.search(k['navn']): continue
        ref = side or samme
        if not ref: break
        lst = rang([n for n in medlem.get(i, []) if not KOPI.search(n)], ref.get('dage', 90), ref.get('lager'), max(ref['antal'], (samme or ref)['antal']) + 1)
        if len(lst) >= 4: katlist[i] = lst
    alle_kort = set()
    if side:
        u = {}
        for i, lst in katlist.items():
            u[kat[i]['url']] = lst[:side['antal']]; alle_kort.update(u[kat[i]['url']])
        json.dump({'t': stamp, 'u': u}, open(os.path.join(D, f'{kode}_kat.json'), 'w'), ensure_ascii=False, separators=(',', ':'))

    # varesider: andre købte også + samme kategori, delt i 32 filer efter varenummer
    andre = next((c for c in cfg.values() if c['kilde'] == 'andre'), None)
    mappe = os.path.join(D, f'{kode}_v'); os.makedirs(mappe, exist_ok=True)
    shards = [{'p': {}, 'k': {}} for _ in range(SHARDS)]
    n_andre = 0
    for nr in rows:
        if KOPI.search(nr): continue
        s = shards[zlib.crc32(nr.encode()) % SHARDS]
        e = {}
        b = blad(nr)
        if andre:
            co = [x for x, _ in sammen.get(nr, collections.Counter()).most_common(80) if x != nr and not KOPI.search(x) and ok(x, andre.get('lager'))]
            co = co[:andre['antal']]
            if co: n_andre += 1
            if len(co) < 6 and b in katlist:   # fyld op med de mest solgte i samme kategori
                co += [x for x in katlist[b] if x != nr and x not in co][:andre['antal'] - len(co)]
            if co: e['a'] = co; alle_kort.update(co)
        if samme and b in katlist:
            e['s'] = b
            if b not in s['k']:
                s['k'][b] = katlist[b][:samme['antal'] + 1]; alle_kort.update(s['k'][b])
        if e: s['p'][nr] = e
    for i, s in enumerate(shards):
        json.dump({'t': stamp, 'p': s['p'], 'k': s['k']},
                  open(os.path.join(mappe, f'{i:02d}.json'), 'w'), ensure_ascii=False, separators=(',', ':'))
    # fælles kortdata til varesider og kategorisider (én fil, caches af browseren)
    json.dump({'t': stamp, 'c': cardsfor(alle_kort)}, open(os.path.join(D, f'{kode}_kort.json'), 'w'), ensure_ascii=False, separators=(',', ':'))
    print(kode, 'kort', len(alle_kort), 'faste', {k: len(v['v']) for k, v in faste.items()}, 'kategorier', len(katlist), 'varer med køb-sammen', n_andre, 'af', len(rows))


byg(26, 'os')
byg(27, 'he')
