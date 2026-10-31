# Bygger søgeindeks for Økologisk-Supermarked (site 26) via DanDomain API -> os-data/sog/indeks.json
import sys,json,re,time,os
sys.path.insert(0,'/root/vejl')
from dd import *
from concurrent.futures import ThreadPoolExecutor
SKIP=re.compile(r'^(HELSAM|3784|3806|3814|3846|146$|organic|3844)',re.I)
def page(o,inc):
    for t in range(4):
        try: return call('GET',f'/sites/26/products?limit=100&offset={o}&notHidden=true&currency=DKK&include={inc}')['items']
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
        try: return call('GET',f'/sites/26/categories?limit=100&offset={o}')['items']
        except Exception as e: err=e; time.sleep(2)
    raise err
with ThreadPoolExecutor(6) as ex: cp=list(ex.map(cpage,range(0,1300,100)))
catmap={}
for x in cp:
    for c in x:
        if c.get('hidden') or SKIP.match(str(c.get('id',''))) or not c.get('name') or not c.get('url'): continue
        catmap.setdefault(c['name'].strip(),c['url'].replace('https://www.okologisk-supermarked.dk',''))
brandmap={}
out=[];seen=set()
for i in items:
    nr=(i.get('productNumber') or '').strip()
    if not nr or nr in seen or i.get('isHidden'): continue
    seen.add(nr)
    pr=(i.get('prices') or {}).get('items') or [{}]
    p0=next((x for x in pr if str(x.get('b2BGroupId','0'))=='0' and x.get('amount',1)==1),pr[0])
    price=p0.get('specialOfferIncVAT') if p0.get('isSpecialOffer') else p0.get('incVAT')
    before=p0.get('incVAT') if p0.get('isSpecialOffer') and p0.get('incVAT',0)>(price or 0) else 0
    if not price and price!=0: continue
    m0=((i.get('manufacturers') or [{}])[0] or {}) if i.get('manufacturers') else {}
    brand=(m0.get('name') or '').strip()
    if brand and m0.get('link'): brandmap.setdefault(brand,m0['link'].replace('https://www.okologisk-supermarked.dk',''))
    cats=[c.get('name','') for c in ((i.get('categories') or {}).get('items') or []) if c.get('name') and not SKIP.match(str(c.get('id','')))]
    url=(i.get('url') or '').replace('https://www.okologisk-supermarked.dk','')
    img=i.get('image') or ''
    out.append([nr,i.get('name','').strip(),url,img,round(price or 0,2),round(before or 0,2),brand,'|'.join(dict.fromkeys(cats)),sales.get(nr,0),i.get('barcode') or '',1 if (i.get('stockCount') or 0)>0 else 0])
os.makedirs('/home/claude/os-data/sog',exist_ok=True)
meta={'v':1,'t':time.strftime('%Y-%m-%dT%H:%M:%S'),'n':len(out),'f':['nr','navn','url','billede','pris','for','brand','grupper','salg','ean','lager']}
json.dump({'meta':meta,'p':out,'k':catmap,'b':brandmap},open('/home/claude/os-data/sog/indeks.json','w'),ensure_ascii=False,separators=(',',':'))
print(meta, os.path.getsize('/home/claude/os-data/sog/indeks.json'))
