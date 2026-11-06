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
# Karruseller (Johnny 06-11-2026): klik og salg pr. karrusel fra fanen "Karrusel" (valgfrit 3. argument = get_values-svaret).
# Rækker: Dato (ÅÅÅÅ-MM-DD, eller ÅÅÅÅ-MM for ældre sammenlagte måneder) | Shop | Karrusel | Klik | Ordrer | Stk | Beløb (inkl. moms).
# Perioder: dag = i dag, uge = 7 dage, maaned = 30 dage, aar = 12 måneder (alle inkl. i dag).
def tal(x):
    # Arket er dansk: punktum = tusindtal, komma = decimal ("1.234,50")
    try: return float(x) if isinstance(x, (int, float)) else float(str(x).strip().replace('.', '').replace(',', '.') or 0)
    except Exception: return 0.0
kar = {'os': {}, 'he': {}}
if len(sys.argv) > 3:
    try:
        kraw = (json.load(open(sys.argv[3])).get('values') or [])[1:]
    except Exception:
        kraw = []
    idag = datetime.date.today()
    GR = {'dag': idag, 'uge': idag - datetime.timedelta(days=6), 'maaned': idag - datetime.timedelta(days=29), 'aar': idag.replace(year=idag.year - 1) + datetime.timedelta(days=1)}
    for r in kraw:
        r = list(r) + [''] * 7
        d, site, k = str(r[0]).strip(), str(r[1]).strip(), str(r[2]).strip()
        if site not in kar or not k: continue
        try:
            if len(d) == 10: fra = til = datetime.date.fromisoformat(d)
            else:
                fra = datetime.date.fromisoformat(d[:7] + '-01')
                til = (fra.replace(day=28) + datetime.timedelta(days=4)).replace(day=1) - datetime.timedelta(days=1)
        except Exception: continue
        v = [tal(r[3]), tal(r[4]), tal(r[5]), tal(r[6])]
        e = kar[site].setdefault(k, {p: [0, 0, 0, 0.0] for p in GR})
        for p, g in GR.items():
            if len(d) == 10 and fra >= g or len(d) != 10 and p == 'aar' and til >= g:
                for i in range(4): e[p][i] += v[i]
    for site in kar:
        for k, e in kar[site].items():
            for p in e: e[p] = {'klik': int(e[p][0]), 'ordrer': int(e[p][1]), 'stk': int(e[p][2]), 'kr': round(e[p][3], 2)}
ud['kar'] = kar
json.dump(ud, open(sys.argv[2], 'w'), ensure_ascii=False)
print('status', ud['os']['varer'], ud['he']['varer'], antal)
