# Laver status-dokumentet til kontrolsiden "Shopstyring ØS & HE".
# Brug: python3 sog/status.py <søgelog.json fra Google Sheets get_values> <ud.json>
import sys, json, os, time, datetime, collections
D = os.path.dirname(os.path.abspath(__file__))
def idx(f):
    d = json.load(open(os.path.join(D, f)))
    ix = {p[0]: p for p in d['p']}
    return {'varer': d['meta']['n'], 'opdateret': d['meta']['t'],
            'mest': [ix[n][1] for n in d.get('mest', [])[:10] if n in ix],
            'kat': [k for k, u in d.get('kat', [])[:10]]}
rows = []
try:
    raw = json.load(open(sys.argv[1]))
    rows = (raw.get('values') or [])[1:]
except Exception:
    pass
nu = datetime.datetime.now()
def parse(t):
    for f in ('%d/%m/%Y %H.%M.%S', '%d/%m/%Y %H:%M:%S', '%Y-%m-%dT%H:%M:%S'):
        try: return datetime.datetime.strptime(t[:19], f)
        except Exception: pass
    return None
sog = {'os': {'med': collections.defaultdict(set), 'nul': collections.defaultdict(set)},
       'he': {'med': collections.defaultdict(set), 'nul': collections.defaultdict(set)}}
antal = {'os': 0, 'he': 0}
# drop halvt skrevne ord: et søgeord der er starten på et længere søgeord fra samme kunde
pr_sess = collections.defaultdict(set)
for r in rows:
    r = list(r) + [''] * 5
    pr_sess[str(r[3])].add(str(r[1]).strip().lower())
def halv(q, sid): return any(o != q and o.startswith(q) for o in pr_sess[sid])
for r in rows:
    r = list(r) + [''] * 5
    if halv(str(r[1]).strip().lower(), str(r[3])): continue
    t = parse(str(r[0]))
    if not t or (nu - t).days >= 7: continue
    site = 'he' if str(r[4]).strip() == 'he' else 'os'
    q = str(r[1]).strip().lower()
    if not q: continue
    antal[site] += 1
    try: n = int(float(r[2] or 0))
    except Exception: n = 0
    sog[site]['med' if n > 0 else 'nul'][q].add(str(r[3]))
def top(m, k): return [[q, len(s)] for q, s in sorted(m.items(), key=lambda x: -len(x[1]))[:k]]
ud = {'opdateret': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
      'os': idx('indeks.json'), 'he': idx('indeks_he.json'),
      'soeg': {s: {'antal': antal[s], 'top': top(sog[s]['med'], 25), 'nul': top(sog[s]['nul'], 50)} for s in sog}}
json.dump(ud, open(sys.argv[2], 'w'), ensure_ascii=False)
print('status', ud['os']['varer'], ud['he']['varer'], antal)
