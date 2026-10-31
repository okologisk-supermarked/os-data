import os,base64,urllib.request,urllib.parse,json
B='https://www.okologisk-supermarked.dk/admin/WebAPI/v2'
K=open(os.path.expanduser('~/.dd/key')).read().strip()
H={'Authorization':'Basic '+base64.b64encode(f'claude:{K}'.encode()).decode(),'Accept':'application/json','Content-Type':'application/json'}
q=lambda nr: urllib.parse.quote(str(nr),safe='')
def call(m,p,body=None):
    r=urllib.request.Request(B+p,method=m,headers=H,data=json.dumps(body).encode() if body is not None else None)
    with urllib.request.urlopen(r,timeout=120) as x:
        t=x.read(); return json.loads(t) if t else None
