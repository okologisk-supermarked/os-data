# HE: "label scannet" -> Klaviyo-event "HE Order Fulfilled" (Johnny 06-11-2026).
# ØS får "Order Fulfilled" fra Bewise; HE gør ikke. Dette script finder HE-ordrer (site 27), der har fået
# GLS-label (status "YouWe Print Finished" + trackNumber) inden for de seneste DAGE dage, og bygger
# body til Klaviyos bulk_create_events. Læser kun fra DanDomain.
# Brug: python3 -I he_fulfilled.py <indeks_he.json> <allerede_sendt.txt> <ud.json> [dage=3]
#   allerede_sendt.txt = OrderId'er (én pr. linje), der allerede har et "HE Order Fulfilled"-event i Klaviyo.
# Udskriver antal ordrer og skriver ud.json (tom liste = intet at sende).
import json, base64, urllib.request, urllib.parse, datetime, sys, os, time
from zoneinfo import ZoneInfo
B = 'https://www.okologisk-supermarked.dk/admin/WebAPI/v2'
K = open(os.path.expanduser('~/.dd/key')).read().strip()
H = {'Authorization': 'Basic ' + base64.b64encode(f'c:{K}'.encode()).decode(), 'Accept': 'application/json'}
SHOP = 'https://helsekost-ekspres.dk'
TZ = ZoneInfo('Europe/Copenhagen')

def get(p):
    for f in range(4):
        try:
            with urllib.request.urlopen(urllib.request.Request(B + p, headers=H), timeout=90) as r:
                return json.load(r)
        except Exception:
            if f == 3: raise
            time.sleep(3)

idx_fil, sendt_fil, ud = sys.argv[1], sys.argv[2], sys.argv[3]
dage = int(sys.argv[4]) if len(sys.argv) > 4 else 3
idx = {}
for p in json.load(open(idx_fil)).get('p', []):
    idx[str(p[0]).strip().lower()] = {'url': SHOP + p[2] if p[2] else '', 'img': SHOP + p[3] if p[3] else '', 'brand': p[6] or ''}
sendt = set()
if os.path.exists(sendt_fil):
    sendt = {l.strip() for l in open(sendt_fil) if l.strip()}

nu = datetime.datetime.now(TZ)
start = (nu - datetime.timedelta(days=30)).strftime('%Y-%m-%dT00:00:00')
slut = nu.strftime('%Y-%m-%dT23:59:59')
n = get(f'/orders?start={start}&end={slut}&limit=1')['count']
ordrer = []
for off in range(0, n, 100):
    ordrer += get(f'/orders?start={start}&end={slut}&include=lines&limit=100&offset={off}')['items']
if len(ordrer) != n:
    sys.exit(f'FEJL: kun {len(ordrer)} af {n} ordrer hentet')

graense = (nu - datetime.timedelta(days=dage)).replace(tzinfo=None)
data = []
for o in ordrer:
    if o.get('siteID') != 27 or o.get('incomplete'): continue
    if (o.get('orderStateInfo') or {}).get('name') != 'YouWe Print Finished': continue
    if not (o.get('trackNumber') or '').strip(): continue
    mod = datetime.datetime.fromisoformat(o['modifiedDate'][:19])
    if mod < graense: continue
    oid = str(o['id'])
    if oid in sendt: continue
    email = ((o.get('customerInfo') or {}).get('email') or '').strip().lower()
    if '@' not in email: continue
    items = []
    for l in (o.get('lines') or {}).get('items', []):
        if l.get('isCredited'): continue
        nr = (l.get('productNumber') or '').strip()
        if not nr or nr.lower().startswith('loyalty') or (l.get('quantity') or 0) <= 0: continue
        x = idx.get(nr.lower(), {})
        items.append({'ProductID': nr, 'ProductName': l.get('productName', ''), 'Quantity': l.get('quantity', 1),
                      'ProductURL': x.get('url') or f'{SHOP}/shop/default.asp?productid={urllib.parse.quote(nr)}',
                      'ImageURL': x.get('img', '')})
    navn = ((o.get('customerInfo') or {}).get('attention') or (o.get('customerInfo') or {}).get('name') or '').split()
    prof = {'email': email}
    if navn: prof['first_name'] = navn[0]
    data.append({'type': 'event-bulk-create', 'attributes': {
        'profile': {'data': {'type': 'profile', 'attributes': prof}},
        'events': {'data': [{'type': 'event', 'attributes': {
            'metric': {'data': {'type': 'metric', 'attributes': {'name': 'HE Order Fulfilled'}}},
            'value': round(o.get('totalPrice') or 0, 2),  # ingen 'time' = nu, så flowet altid udløses (labeltid ligger i LabelTid)
            'unique_id': 'he_ful_' + oid,
            'properties': {'Shop': 'HE', 'OrderId': oid, 'TrackNumber': o['trackNumber'].strip(), 'LabelTid': mod.isoformat(),
                           'Items': items}}}]}}})
body = {'data': {'type': 'event-bulk-create-job', 'attributes': {'events-bulk-create': {'data': data}}}}
json.dump(body if data else [], open(ud, 'w'), ensure_ascii=False, separators=(',', ':'))
print(f'HE-ordrer med label de seneste {dage} dage, ikke sendt før: {len(data)}', ' '.join(d['attributes']['events']['data'][0]['attributes']['properties']['OrderId'] for d in data))
