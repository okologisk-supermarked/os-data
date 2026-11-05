/* Egne produktkarruseller for Økologisk-Supermarked og Helsekost-Ekspres (erstatter Plugly-karrusellerne
   og DanDomains "Andre købte også"). Ingen automatisk drejning – pile i begge sider og swipe på mobil.
   Data: os-data/karrusel (bygges af karrusel/byg_karrusel.py sammen med søgeindekset).
   Indlæses af sog/sog.js. Kører kun, når "live" er slået til i data – eller i test med ?oskar=1 i adressen. */
(function(){
if(window.__osKar)return;window.__osKar=1;
var src=(document.currentScript&&document.currentScript.src)||"",BASE=(src.match(/^(.*os-data@[^\/]+\/)/)||[])[1];if(!BASE)return;
var HE=/helsekost-ekspres/i.test(location.hostname),K=HE?"he":"os",SHARDS=32;
var TEST=false;try{if(/[?&]oskar=1/.test(location.search))sessionStorage.setItem("oskar","1");if(/[?&]oskar=0/.test(location.search))sessionStorage.removeItem("oskar");TEST=sessionStorage.getItem("oskar")==="1";}catch(e){}
if(/order4|basket|checkout/i.test(location.pathname))return;

var CSS=".osk{position:relative;margin:2.2rem 0 1.4rem;clear:both}.osk h2.osk-t{text-align:center;margin:0 0 1rem}"+
".osk-w{position:relative}.osk-tr{display:flex;gap:16px;overflow-x:auto;scroll-snap-type:x mandatory;scroll-behavior:smooth;-webkit-overflow-scrolling:touch;scrollbar-width:none;padding:2px 2px 6px;margin:0}.osk-tr::-webkit-scrollbar{display:none}"+
".osk-c{flex:0 0 calc((100% - 48px)/4);scroll-snap-align:start;min-width:0;background:#fff;border:1px solid #e6e6e6;border-radius:8px;padding:12px;display:flex;flex-direction:column;position:relative;box-sizing:border-box}"+
".osk-c .prodWrapper{display:flex;flex-direction:column;height:100%}"+
".osk-c .prodImg{position:relative;height:240px;display:flex;align-items:center;justify-content:center;margin:0 0 10px;text-align:center}"+
".osk-c .prodImg>a{display:flex;align-items:center;justify-content:center;width:100%;height:100%}.osk-c .prodImg img.osk-i{max-height:240px;max-width:100%;width:auto;height:auto;object-fit:contain}"+
".osk-c .prodImg .lbl.dkOko{position:absolute;left:4px;bottom:4px;width:44px;height:auto}"+
".osk-c .prodName{margin:0;border-top:1px solid #eee;padding-top:10px;font-size:.92rem;line-height:1.3;min-height:3.9em;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}.osk-c .prodName a{color:#222;text-decoration:none}"+
".osk-c .priceouter{margin-top:auto;text-align:right;padding-top:1.6em}.osk-c .prodPrice{margin:0;font-size:1.5rem;line-height:1.1;color:#222;font-weight:700}.osk-c .prodPrice span{font-size:.6em;vertical-align:super}"+
".osk-c form{margin:10px 0 0}.osk-c form .button{width:100%;margin:0}"+
".osk-a{position:absolute;top:110px;z-index:6;width:44px;height:44px;border-radius:50%;border:1px solid #ddd;background:#fff;box-shadow:0 2px 8px rgba(0,0,0,.15);cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;color:#222;transition:opacity .2s}"+
".osk-a svg{width:20px;height:20px}.osk-a:hover{background:#f4f4f4}.osk-a[disabled]{opacity:0;pointer-events:none}.osk-p{left:-14px}.osk-n{right:-14px}"+
"@media (max-width:1024px){.osk-c{flex-basis:calc((100% - 32px)/3)}}"+
"@media (max-width:640px){.osk-tr{gap:10px}.osk-c{flex-basis:calc((100% - 10px)/2.15);padding:8px}.osk-c .prodImg{height:170px}.osk-c .prodImg img.osk-i{max-height:170px}.osk-c .prodName{font-size:.82rem}.osk-c .prodPrice{font-size:1.2rem}.osk-a{width:36px;height:36px;top:80px}.osk-p{left:-6px}.osk-n{right:-6px}.osk-c form .button{font-size:.78rem;padding:.6rem .2rem}}"+
".osk-f3 .osk-c{flex-basis:calc((100% - 32px)/3)}@media (max-width:640px){.osk-f3 .osk-c{flex-basis:calc((100% - 10px)/2.15)}}.osk-c form .button{font-size:.88rem;line-height:1.2;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}"+
".osk-skjul{display:none!important}"+(HE?".osk h2.osk-t{font-size:2.1rem;font-weight:400;line-height:1.2;color:#333;margin-bottom:1.1rem}@media (max-width:640px){.osk h2.osk-t{font-size:1.5rem}}.osk-c form .button{background:#1e5b3a;color:#fff;border:0;border-radius:4px;font-weight:700;padding:.75rem .4rem}.osk-c form .button:hover{background:#174a2f}":"");

var esc=function(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c];});};
function get(u){return fetch(BASE+u).then(function(r){if(!r.ok)throw 0;return r.json();});}
function kr(n){var s=n.toFixed(2).split(".");return s[0].replace(/\B(?=(\d{3})+(?!\d))/g,".")+"<span>"+s[1]+"</span>";}
function fmt(n){return n.toFixed(2).replace(".",",");}
var ARR="<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M15 18l-6-6 6-6\"/></svg>";

function card(nr,c){ // c = [navn,url,billede,pris,for,lager,oko]
  var ret=location.pathname+location.search,kopi=/\(KOPI\)/i.test(nr),tb=(c[4]&&c[4]>c[3])?Math.floor((1-c[3]/c[4])*100+1e-6):0;
  return "<div class=\"osk-c\" data-productno=\""+esc(nr)+"\"><div class=\"prodWrapper\">"+
   "<div class=\"prodImg\"><a href=\""+esc(c[1])+"\"><img class=\"osk-i\" loading=\"lazy\" src=\""+esc(c[2])+"\" alt=\""+esc(c[0])+"\"></a>"+(c[6]?"<img class=\"lbl dkOko\" src=\"/Respons/assets/logo_M1.svg\" alt=\"\">":"")+"</div>"+
   (tb>=1&&!kopi?"<div class=\"bp_relatedproductsSavingBadge osk-skjul\">-"+tb+"%</div>":"")+
   "<p class=\"prodName\"><a href=\""+esc(c[1])+"\">"+esc(c[0])+"</a></p>"+
   "<div class=\"priceouter\">"+(tb>=1&&!kopi?"<span class=\"os-for\">Før <s>"+fmt(c[4])+" kr.</s></span>":"")+"<p class=\"prodPrice\">"+kr(c[3])+" DKK</p></div>"+
   "<form method=\"POST\" action=\"/shop/basket.asp\"><input type=\"hidden\" name=\"Add\" value=\"1\"><input type=\"hidden\" name=\"ProductID\" value=\""+esc(nr)+"\"><input type=\"hidden\" name=\"AMOUNT\" value=\"1\"><input type=\"hidden\" name=\"BuyReturnUrl\" value=\""+esc(ret)+"\">"+
   "<button class=\"button primary small expanded\" type=\"submit\">"+(HE?"Læg i kurv":"Læg i indkøbsvogn")+"</button></form></div></div>";
}
function render(anchor,titel,nrs,C,place,cls){
  nrs=(nrs||[]).filter(function(n){return C[n];});if(nrs.length<3)return null;
  var w=document.createElement("div");w.className="osk row column"+(cls?" "+cls:"");
  w.innerHTML="<h2 class=\"osk-t mt2\">"+esc(titel)+"</h2><div class=\"osk-w\"><button type=\"button\" class=\"osk-a osk-p\" aria-label=\"Forrige varer\" disabled>"+ARR+"</button><div class=\"osk-tr\">"+
    nrs.map(function(n){return card(n,C[n]);}).join("")+"</div><button type=\"button\" class=\"osk-a osk-n\" aria-label=\"Næste varer\" style=\"transform:scaleX(-1)\">"+ARR+"</button></div>";
  if(place==="before")anchor.parentNode.insertBefore(w,anchor);else anchor.parentNode.insertBefore(w,anchor.nextSibling);
  var tr=w.querySelector(".osk-tr"),p=w.querySelector(".osk-p"),n=w.querySelector(".osk-n");
  function upd(){var max=tr.scrollWidth-tr.clientWidth-4;p.disabled=tr.scrollLeft<=4;n.disabled=tr.scrollLeft>=max;}
  function step(d){var c=tr.querySelector(".osk-c");var cw=c?c.getBoundingClientRect().width+parseFloat(getComputedStyle(tr).columnGap||16):tr.clientWidth;var per=Math.max(1,Math.floor((tr.clientWidth+8)/cw));tr.scrollBy({left:d*per*cw,behavior:"smooth"});}
  p.onclick=function(){step(-1);};n.onclick=function(){step(1);};
  tr.addEventListener("scroll",function(){clearTimeout(tr._t);tr._t=setTimeout(upd,60);},{passive:true});window.addEventListener("resize",upd);setTimeout(upd,50);
  return w;
}
function hide(el){if(el)el.classList.add("osk-skjul");}
function pid(){var i=document.querySelector("form.product-details-buy-form input[name=ProductID]")||document.querySelector("#mainProduct input[name=ProductID]");return i?i.value.trim():"";}
function crc32(s){var c,t=window.__crcT;if(!t){t=window.__crcT=[];for(var n=0;n<256;n++){c=n;for(var k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0;}}var crc=0^-1,b=unescape(encodeURIComponent(s));for(var i=0;i<b.length;i++)crc=(crc>>>8)^t[(crc^b.charCodeAt(i))&0xFF];return (crc^-1)>>>0;}

function start(){
 get("karrusel/"+K+".json").then(function(D){
  if(!(D.live||TEST))return;
  var st=document.createElement("style");st.textContent=CSS;document.head.appendChild(st);
  var M=D.m||{},ph=[].slice.call(document.querySelectorAll("div[id^=bp_ProductCarousel_]"));
  // 1) faste karruseller (forside m.m.)
  ph.forEach(function(el){var id=el.id.replace("bp_ProductCarousel_","");var L=D.l&&D.l[id];if(!L)return;if(render(el,L.t,L.v,D.c,"after"))hide(el);});
  // DanDomains egen forsideliste (fx "Stærke tilbud" på HE) -> karrusel
  Object.keys(M).forEach(function(id){if(M[id].s!=="dd_forside"||!D.l[id])return;var ul=document.querySelector("ul.Frontpage_Custom_UL");if(!ul){var f=M[id].f&&document.getElementById("bp_ProductCarousel_"+M[id].f);if(f)render(f,D.l[id].t,D.l[id].v,D.c,"before");return;}var hd=ul.previousElementSibling&&/headline/.test(ul.previousElementSibling.className)?ul.previousElementSibling:null;
    if(render(hd||ul,D.l[id].t,D.l[id].v,D.c,"before")){hide(ul);hide(hd);}});
  // karruseller uden egen plads (fx ØS-kopier på HE): lægges før karrusellen i "foer"
  Object.keys(M).forEach(function(id){var m=M[id];if(m.s==="dd_forside"||!m.f||!D.l[id]||document.getElementById("bp_ProductCarousel_"+id))return;var a=document.getElementById("bp_ProductCarousel_"+m.f);if(a)render(a,D.l[id].t,D.l[id].v,D.c,"before");});
  var sammeId=Object.keys(M).filter(function(k){return M[k].k==="samme";})[0],sideId=Object.keys(M).filter(function(k){return M[k].k==="side";})[0],andre=M.andre;
  var body=document.body.classList;
  // 2) varekort: andre købte også + samme kategori
  var nr=pid();
  if(nr&&(sammeId||andre)){
   var sh=("0"+(crc32(nr.replace(/\(KOPI\)/i,"").trim())%SHARDS)).slice(-2);
   Promise.all([get("karrusel/"+K+"_v/"+sh+".json"),get("karrusel/"+K+"_kort.json")]).then(function(r){
    var V=r[0],C=r[1].c,e=V.p[nr.replace(/\(KOPI\)/i,"").trim()]||{};
    var sEl=sammeId&&document.getElementById("bp_ProductCarousel_"+sammeId);
    var dd=document.querySelector(".CustomersAlsoBought_Custom_DIV"),ddRow=dd&&dd.closest(".row"),ddHead=ddRow&&ddRow.previousElementSibling;
    var aw=null;
    if(andre&&e.a){var anchor=ddRow||sEl;if(anchor){aw=render(anchor,andre.t,e.a,C,"before");if(aw&&ddRow){hide(ddRow);if(ddHead&&/købte også/i.test(ddHead.textContent))hide(ddHead);}}}
    if(sEl&&e.s&&V.k[e.s]){var lst=V.k[e.s].filter(function(x){return x!==nr;});if(render(aw||sEl,M[sammeId].t,lst,C,"after"))hide(sEl);}
   }).catch(function(){});
  }
  // 3) kategoriside: populært i denne kategori
  var kEl=sideId&&document.getElementById("bp_ProductCarousel_"+sideId);
  if(kEl&&!nr){Promise.all([get("karrusel/"+K+"_kat.json"),get("karrusel/"+K+"_kort.json")]).then(function(r){var l=r[0].u[location.pathname];if(l&&render(kEl,M[sideId].t,l,r[1].c,"after","osk-f3"))hide(kEl);}).catch(function(){});}
 }).catch(function(){});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start);else start();
})();
