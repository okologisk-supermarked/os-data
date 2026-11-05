# "Billigst i prismatch" (Helsekost-Ekspres): synkroniserer kategori 3850 ud fra dagens priskontrol.
# Kører i priskontrol-opgaven EFTER at priserne er sat og fanen Prisposition er skrevet.
# Brug: python3 opdater_3850.py prismatch_input.json [--upload]
#   prismatch_input.json = {"dato":"ÅÅÅÅ-MM-DD","varer":[{"varenr":"...","vist":109,"laveste":115.0,"antal_paa_lager":4}, ...]}
#     vist = vores VISTE HE-pris efter dagens upload (hel krone), laveste = laveste konkurrentpris PÅ LAGER,
#     antal_paa_lager = antal konkurrenter med EAN-match (eller godkendt navnematch) og varen på lager.
#     Alle tjekkede varer skal med (også dem uden badge) – varer der ikke er tjekket i dag beholder deres status.
# Krav (Johnny 05-11-2026): vist pris mindst 1 % under laveste, mindst 3 konkurrenter på lager, højst 40 % billigere
#   (ellers sandsynligvis forkert match), synlig på HE, ikke KOPI. En vare, der ikke er tjekket i 3 dage, tages ud.
# Uden --upload: tør kørsel. Fortryd-fil: fortryd_3850_<stempel>.csv (varenr;handling;kategorier_foer).
import json, sys, os, base64, urllib.request, urllib.parse, time, datetime, csv
B = 'https://www.okologisk-supermarked.dk/admin/WebAPI/v2'; KAT = '3850'
K = open(os.path.expanduser('~/.dd/key')).read().strip()
H = {'Authorization': 'Basic ' + base64.b64encode(f'claude:{K}'.encode()).decode(), 'Accept': 'application/json', 'Content-Type': 'application/json'}
q = lambda n: urllib.parse.quote(n, safe='')
def req(m, p, b=None):
    for f in range(4):
        try:
            r = urllib.request.urlopen(urllib.request.Request(B + p, method=m, headers=H, data=json.dumps(b).encode() if b is not None else None), timeout=90).read()
            return json.loads(r) if r else {}
        except urllib.error.HTTPError as e:
            if e.code < 500 or f == 3: raise
        except Exception:
            if f == 3: raise
        time.sleep(2 * (f + 1))
MIN_SHOPS, MIN_UNDER, MAX_UNDER, MAX_ALDER = 3, 0.01, 0.40, 3
inp = json.load(open(sys.argv[1])); upload = '--upload' in sys.argv
dato = inp['dato']; tjek = {v['varenr'].strip(): v for v in inp['varer']}
STATE = os.path.join(os.path.dirname(os.path.abspath(sys.argv[1])), 'prismatch_status.json')
state = json.load(open(STATE)) if os.path.exists(STATE) else {}   # varenr -> sidst tjekket (dato) når den var billigst
def ok(v):
    try: vist, lav, n = float(v['vist']), float(v['laveste']), int(v['antal_paa_lager'])
    except (TypeError, ValueError, KeyError): return False
    return n >= MIN_SHOPS and lav > 0 and vist <= lav * (1 - MIN_UNDER) and vist >= lav * (1 - MAX_UNDER)
# nuværende medlemmer
nu, off = {}, 0
while True:
    r = req('GET', f'/categories/{KAT}/products?limit=100&offset={off}')
    for x in r.get('items', []): nu[x['number'].strip()] = x['number']
    if not r.get('hasMore'): break
    off += 100
idag = datetime.date.fromisoformat(dato); onsket = set(); mistanke = []
for nr, v in tjek.items():
    if ok(v): onsket.add(nr); state[nr] = dato
    else:
        state.pop(nr, None)
        try:
            if float(v['vist']) < float(v['laveste']) * (1 - MAX_UNDER) and int(v['antal_paa_lager']) >= MIN_SHOPS: mistanke.append(nr)
        except Exception: pass
for nr in nu:   # ikke tjekket i dag: beholdes, hvis den var billigst inden for 3 dage
    if nr not in tjek and nr in state and (idag - datetime.date.fromisoformat(state[nr])).days <= MAX_ALDER: onsket.add(nr)
tilfoej, fjern = sorted(onsket - set(nu)), sorted(set(nu) - onsket)
if len(tilfoej) + len(fjern) > 600: print('SIKKERHEDSSTOP: over 600 ændringer – intet ændret'); sys.exit(2)
stamp = datetime.datetime.now().strftime('%Y%m%d_%H%M')
F = open(f'fortryd_3850_{stamp}.csv', 'w', encoding='utf-8-sig') if upload else None
if F: F.write('varenr;handling;kategorier_foer\n')
res = {'tilfoejet': [], 'fjernet': [], 'sprunget': [], 'fejl': []}
for nr, handling in [(n, '+') for n in tilfoej] + [(n, '-') for n in fjern]:
    rnr = nu.get(nr, nr)
    try:
        if handling == '+':
            p = req('GET', f'/products/{q(rnr)}')
            if p is None or '(KOPI)' in rnr.upper(): res['sprunget'].append(nr); continue
            s27 = req('GET', f'/products/{q(rnr)}/sites/27/settings')
            if s27.get('isHidden'): res['sprunget'].append(nr); continue
        kat = [c['number'] for c in req('GET', f'/products/{q(rnr)}/categories?limit=100')['items']]
        ny = kat + [KAT] if handling == '+' else [c for c in kat if c != KAT]
        if ny == kat: continue
        if not upload: res['tilfoejet' if handling == '+' else 'fjernet'].append(nr); continue
        F.write(f"{rnr};{handling};{'|'.join(kat)}\n"); F.flush()
        req('PATCH', f'/products/{q(rnr)}', {'categoriesIds': ny})
        efter = [c['number'] for c in req('GET', f'/products/{q(rnr)}/categories?limit=100')['items']]
        if (KAT in efter) == (handling == '+'): res['tilfoejet' if handling == '+' else 'fjernet'].append(nr)
        else: res['fejl'].append(nr)
    except Exception as e: res['fejl'].append(f'{nr}: {e}')
if upload: json.dump(state, open(STATE, 'w'))
print(('UPLOAD' if upload else 'TØR KØRSEL'), '| i 3850 før', len(nu), '| ønsket', len(onsket), '| +', len(res['tilfoejet']), '| -', len(res['fjernet']),
      '| sprunget', len(res['sprunget']), '| fejl', len(res['fejl']), '| over 40 % billigere (tjek match)', len(mistanke))
if mistanke: print('MISTÆNKELIGE (over 40 % under laveste):', ' '.join(mistanke[:30]))
if res['fejl']: print('FEJL:', res['fejl'][:20])
