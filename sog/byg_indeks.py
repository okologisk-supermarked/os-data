# Bygger søgeindeks for Økologisk-Supermarked (site 26) via DanDomain API -> os-data/sog/indeks.json
import sys,json,re,time,os
D=os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0,D)
from dd import *
from concurrent.futures import ThreadPoolExecutor
SITE=int(sys.argv[1]) if len(sys.argv)>1 else 26  # 26 = Økologisk-Supermarked, 27 = Helsekost-Ekspres
CUR='DKK' if SITE==26 else 'DKK2'
UD='indeks.json' if SITE==26 else 'indeks_he.json'
DOM=re.compile(r'^https?://[^/]+')
SKIP=re.compile(r'^(HELSAM|3784|3806|3814|3846|146$|organic|3844)',re.I)
def page(o,inc):
    for t in range(4):
        try: return call('GET',f'/sites/{SITE}/products?limit=100&offset={o}&notHidden=true&currency={CUR}&include={inc}')['items']
        except Exception as e: err=e; time.sleep(2)
    raise err
with ThreadPoolExecutor(6) as ex: pages=list(ex.map(lambda o:page(o,'prices,manufacturers,categories'),range(0,9500,100)))
items=[i for p in pages for i in p]
# salgstal fra /products
def ppage(o):
    for t in range(4):
        try: return call('GET',f'/products?limit=100&offset={o}')['items']
        except Exception as e: err=e; time.sleep(2)
    raise err
with ThreadPoolExecutor(6) as ex: pp=list(ex.map(ppage,range(0,11500,100)))
sales={p['number'].strip():p.get('salesCount') or 0 for x in pp for p in x}
def cpage(o):
    for t in range(4):
        try: return call('GET',f'/sites/{SITE}/categories?limit=100&offset={o}')['items']
        except Exception as e: err=e; time.sleep(2)
    raise err
with ThreadPoolExecutor(6) as ex: cp=list(ex.map(cpage,range(0,1300,100)))
catmap={}
for x in cp:
    for c in x:
        if c.get('hidden') or SKIP.match(str(c.get('id',''))) or not c.get('name') or not c.get('url'): continue
        catmap.setdefault(c['name'].strip(),DOM.sub('',c['url']))
brandmap={}
out=[];seen=set()
for i in items:
    nr=(i.get('productNumber') or '').strip()
    if not nr or nr in seen or i.get('isHidden'): continue
    if SITE==27 and '(KOPI)' in nr.upper(): continue  # ingen stop madspild på HE
    seen.add(nr)
    pr=(i.get('prices') or {}).get('items') or [{}]
    p0=next((x for x in pr if str(x.get('b2BGroupId','0'))=='0' and x.get('amount',1)==1),pr[0])
    price=p0.get('specialOfferIncVAT') if p0.get('isSpecialOffer') else p0.get('incVAT')
    before=p0.get('incVAT') if p0.get('isSpecialOffer') and p0.get('incVAT',0)>(price or 0) else 0
    if not price and price!=0: continue
    if SITE==27 and not price: continue
    m0=((i.get('manufacturers') or [{}])[0] or {}) if i.get('manufacturers') else {}
    brand=(m0.get('name') or '').strip()
    if brand and m0.get('link'): brandmap.setdefault(brand,DOM.sub('',m0['link']))
    cats=[c.get('name','') for c in ((i.get('categories') or {}).get('items') or []) if c.get('name') and not SKIP.match(str(c.get('id','')))]
    url=DOM.sub('',i.get('url') or '')
    img=i.get('image') or ''
    out.append([nr,i.get('name','').strip(),url,img,round(price or 0,2),round(before or 0,2),brand,'|'.join(dict.fromkeys(cats)),sales.get(nr,0),i.get('barcode') or '',1 if (i.get('stockCount') or 0)>0 else 0,i.get('sortOrder') if i.get('sortOrder') is not None else 99999])
# "Mest købte lige nu": antal ordrer pr. vare på ØS de seneste 3 dage, fyldt op med de seneste 30 dage
import datetime
def opage(start,o):
    for t in range(4):
        try: return call('GET',f'/orders?start={start}&limit=100&offset={o}&include=lines')
        except Exception as e: err=e; time.sleep(2)
    raise err
nu=datetime.datetime.now(); start=(nu-datetime.timedelta(days=30)).date().isoformat(); ordrer=[]; off=0
while True:
    d=opage(start,off); ordrer+=d['items']
    if not d.get('hasMore'): break
    off+=100
c3,c30={},{}
for o in ordrer:
    if o.get('siteID')!=SITE or o.get('incomplete') or o['orderStateInfo']['name'].strip().lower()=='afviste': continue
    ny=(nu-datetime.datetime.fromisoformat(o['createdDate'][:19])).total_seconds()<=3*86400
    for nr in {(l.get('productNumber') or '').strip() for l in o['lines']['items'] if not l.get('lineType') and not l.get('isCredited')}:
        c30[nr]=c30.get(nr,0)+1
        if ny: c3[nr]=c3.get(nr,0)+1
paa=[r for r in out if r[10]==1]
mest=[r[0] for r in sorted([r for r in paa if c3.get(r[0])],key=lambda r:(-c3[r[0]],-c30.get(r[0],0),-r[8]))][:24]
if len(mest)<24: mest+=[r[0] for r in sorted([r for r in paa if c30.get(r[0]) and r[0] not in mest],key=lambda r:(-c30[r[0]],-r[8]))][:24-len(mest)]
print('ordrer',len(ordrer),'mest',len(mest),'heraf 3 dage',sum(1 for n in mest if c3.get(n)))
# "Populære kategorier lige nu": ordrer pr. kategori de seneste 3 dage (fyldt op med 30 dage)
INTERN=re.compile(r'^lager |tilbud|discount|stop madspild|outlet|køb europæisk|nyhed|bedst|kampagne|black ?friday|gratis|kopi',re.I)
def katcount(cc):
    k={}
    for nr,n in cc.items():
        r=ix.get(nr)
        if not r: continue
        for g in dict.fromkeys(x for x in r[7].split('|') if x):
            if INTERN.search(g) or g not in catmap: continue
            k[g]=k.get(g,0)+n
    return k
ix={r[0]:r for r in out}
k3,k30=katcount(c3),katcount(c30)
kat=[g for g in sorted(k3,key=lambda g:(-k3[g],-k30.get(g,0)))][:10]
if len(kat)<10: kat+=[g for g in sorted(k30,key=lambda g:-k30[g]) if g not in kat][:10-len(kat)]
kat=[[g,catmap[g]] for g in kat]
print('kat',[g for g,u in kat])
meta={'v':1,'t':time.strftime('%Y-%m-%dT%H:%M:%S'),'n':len(out),'f':['nr','navn','url','billede','pris','for','brand','grupper','salg','ean','lager','sort']}
json.dump({'meta':meta,'p':out,'k':catmap,'b':brandmap,'mest':mest,'kat':kat},open(os.path.join(D,UD),'w'),ensure_ascii=False,separators=(',',':'))
print(meta, os.path.getsize(os.path.join(D,UD)))
