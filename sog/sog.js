/* Økologisk-Supermarked – egen søgning (erstatter Plugly live search)
   Data: https://github.com/okologisk-supermarked/os-data  (sog/indeks.json, sog/config.json, sog/motor.js) */
(function(){
if(window.__osSog)return;window.__osSog=1;
var RAW="https://raw.githubusercontent.com/okologisk-supermarked/os-data/main/",CDN="https://cdn.jsdelivr.net/gh/okologisk-supermarked/os-data@";
var HE=/helsekost-ekspres/i.test(location.hostname),SITE=HE?"he":"os";
var M=null,CFG={},loading=null,ov=null,inp=null,lastQ="",gaT=null;
var LOG="https://script.google.com/macros/s/AKfycbwMFAsMPm7KFWa8JrEbZ-ZL4nZ9-Q4dU340nWvUjWDJ_z44GzKbde37SbcnfldfduS0/exec",POP=null,logged={},logT=null,pend=null;
function sid(){try{var x=sessionStorage.getItem("ossSid");if(!x){x=Math.random().toString(36).slice(2,12);sessionStorage.setItem("ossSid",x);}return x;}catch(e){return "x";}}
function logNu(){clearTimeout(logT);if(!pend)return;var q=pend.q,n=pend.n;pend=null;var k=q.toLowerCase();if(logged[k]||q.length<2||q.length>40||/@/.test(q))return;logged[k]=1;
  try{var b=JSON.stringify({type:"sog",q:q,n:n,sid:sid(),site:SITE});if(!(navigator.sendBeacon&&navigator.sendBeacon(LOG,b)))fetch(LOG,{method:"POST",body:b,keepalive:true,mode:"no-cors"});}catch(e){}}
function logSoon(q,n){pend={q:q,n:n};clearTimeout(logT);logT=setTimeout(logNu,4000);}
function hentPop(){try{var c=JSON.parse(localStorage.getItem("ossPop")||"null");if(c&&Date.now()-c.t<3600000){POP=c.pop;return;}}catch(e){}
  fetch(LOG+"?a=pop&s="+SITE).then(function(r){return r.json();}).then(function(j){if(j&&j.pop){POP=j.pop;try{localStorage.setItem("ossPop",JSON.stringify({t:Date.now(),pop:POP}));}catch(e){}if(ov&&ov.style.display!=="none"&&inp.value.trim().length<2)render(inp.value);}}).catch(function(){});}
var CSS=".oss{position:fixed;inset:0;z-index:2147483000;display:flex;flex-direction:column;background:rgba(255,255,255,.55);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px)}"+
".oss-top{background:#fff;box-shadow:0 2px 10px rgba(0,0,0,.08);padding:14px 16px}.oss-top-in{max-width:1180px;margin:0 auto;display:flex;align-items:center;gap:16px}"+
".oss-logo img{height:38px;display:block}.oss-f{flex:1;max-width:620px;margin:0 auto;position:relative}"+
".oss-f input{width:100%;height:46px;border:1px solid #ddd;border-radius:8px;padding:0 44px 0 14px;font-size:16px;margin:0;box-shadow:none}.oss-f svg{position:absolute;right:13px;top:13px;width:20px;height:20px;color:#333}"+
".oss-x{border:0;background:none;font-size:34px;line-height:1;cursor:pointer;color:#222;padding:0 4px}"+
".oss-body{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch}.oss-in{max-width:1180px;margin:0 auto;padding:22px 16px 60px;display:flex;gap:24px;align-items:flex-start}"+
".oss-main{flex:1;min-width:0}.oss-side{width:270px;flex:0 0 270px}"+
".oss h4{font-size:1.1rem;margin:0 0 12px;font-weight:700}.oss-note{margin:-4px 0 12px;font-size:.9rem;color:#555}.oss-note a{color:#2e7d32;text-decoration:underline;cursor:pointer}"+
".oss-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}"+
".oss-card{background:#fff;border:1px solid #e6e6e6;border-radius:8px;padding:10px;display:flex;flex-direction:column;position:relative}"+
".oss-card .prodImg{position:relative;text-align:center;height:150px;display:flex;align-items:center;justify-content:center;margin-bottom:8px}.oss-card .prodImg img{max-height:150px;max-width:100%;object-fit:contain}"+
".oss-card .prodName{color:#222;font-size:.86rem;line-height:1.3;min-height:3.4em;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;text-decoration:none;border-top:1px solid #eee;padding-top:8px}"+
".oss-card .priceouter{margin-top:auto;text-align:right;padding-top:1.5em}.oss-card .prodPrice{font-size:1.25rem;font-weight:400;color:#222}.oss-card .prodPrice span{font-size:.65em;vertical-align:super}"+
".oss-card form{margin:8px 0 0}.oss-card button{width:100%;background:"+(HE?"#1e5b3a":"#f7941d")+";color:#fff;border:0;border-radius:4px;padding:8px 4px;font-weight:700;cursor:pointer;font-size:.85rem}"+
".oss-list a{display:flex;justify-content:space-between;align-items:center;background:#fff;border:1px solid #e6e6e6;border-radius:6px;padding:10px 12px;margin-bottom:8px;color:#222;text-decoration:none;font-size:.9rem}.oss-list a:after{content:'\\203A';font-size:1.2rem;color:#888}"+
".oss-chips{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 16px}.oss-chips a{background:#fff;border:1px solid #ddd;border-radius:20px;padding:6px 12px;font-size:.85rem;color:#222;cursor:pointer;text-decoration:none}"+
".oss-more{display:block;margin:18px auto 0;background:#fff;border:1px solid #2e7d32;color:#2e7d32;border-radius:6px;padding:10px 18px;font-weight:700;cursor:pointer}"+
".oss-empty{background:#fff;border-radius:8px;padding:20px;text-align:center;color:#555}"+
"@media (max-width:900px){.oss-grid{grid-template-columns:repeat(3,1fr)}.oss-side{width:220px;flex-basis:220px}}"+
"@media (max-width:640px){.oss-top-in{gap:8px}.oss-logo{display:none}.oss-in{display:block;padding:14px 10px 60px}.oss-side{width:auto;margin-top:22px}.oss-grid{grid-template-columns:repeat(2,1fr);gap:10px}.oss-card .prodImg{height:120px}.oss-card .prodImg img{max-height:120px}}";
function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c];});}
function kr(n){var s=Number(n).toFixed(2).split(".");return s[0].replace(/\B(?=(\d{3})+(?!\d))/g,".")+"<span>"+s[1]+"</span> DKK";}
function krp(n){return Number(n).toFixed(2).replace(".",",");}
function js(u){return fetch(u).then(function(r){if(!r.ok)throw new Error(r.status);return r.json();});}
function load(){
  if(loading)return loading;
  loading=js(RAW+"sog/version.json?t="+Math.floor(Date.now()/300000)).catch(function(){return {sha:"main"};}).then(function(v){
    var base=CDN+(v.sha||"main")+"/sog/";
    return Promise.all([js(base+(HE?"indeks_he.json":"indeks.json")),js(base+"config.json").catch(function(){return {};}),window.OSMotor?1:new Promise(function(ok,no){var s=document.createElement("script");s.src=base+"motor.js";s.onload=ok;s.onerror=no;document.head.appendChild(s);})]);
  }).then(function(r){CFG=r[1]||{};M=new window.OSMotor(r[0],CFG);M.mest=r[0].mest||null;M.kat=r[0].kat||null;return M;});
  return loading;
}
function card(p){
  var ret=location.pathname+location.search;
  return "<div class=\"oss-card\" data-productno=\""+esc(p[0])+"\"><div class=\"prodImg\"><a href=\""+esc(p[2])+"\"><img src=\""+esc(p[3].replace(/(\.\w+)$/,"-t$1"))+"\" loading=\"lazy\" alt=\"\" onerror=\"this.onerror=null;this.src='"+esc(p[3])+"'\"></a></div>"+
  "<a class=\"prodName\" href=\""+esc(p[2])+"\">"+esc(p[1])+"</a><div class=\"priceouter\">"+(p[5]?"<del class=\"bp_lsaOldPrice\" style=\"color:#888;font-size:.85rem;margin-right:6px\">"+krp(p[5])+"</del>":"")+"<span class=\"prodPrice\">"+(p[4]===0?"Gratis":kr(p[4]))+"</span></div>"+
  "<form method=\"POST\" action=\"/shop/basket.asp\"><input type=\"hidden\" name=\"Add\" value=\"1\"><input type=\"hidden\" name=\"ProductID\" value=\""+esc(p[0])+"\"><input type=\"hidden\" name=\"AMOUNT\" value=\"1\"><input type=\"hidden\" name=\"BuyReturnUrl\" value=\""+esc(ret)+"\"><button type=\"submit\">Læg i indkøbsvogn</button></form></div>";
}
function list(t,arr){return arr.length?"<h4>"+t+"</h4><div class=\"oss-list\">"+arr.map(function(a){return "<a href=\""+esc(a[1])+"\">"+esc(a[0])+"</a>";}).join("")+"</div>":"";}
function ga(q,n){clearTimeout(gaT);gaT=setTimeout(function(){try{if(window.gtag){gtag("event","search",{search_term:q});if(!n)gtag("event","search_no_results",{search_term:q});}}catch(e){}},1500);}
function render(q,limit){
  var main=ov.querySelector(".oss-main"),side=ov.querySelector(".oss-side");limit=limit||40;
  if(!M){main.innerHTML="<div class=\"oss-empty\">Henter søgning…</div>";side.innerHTML="";return;}
  q=q.trim();
  if(q.length<2){
    var fast=(CFG.populaere||["Kaffe","Havregryn","D-vitamin","Kokosolie","Tandpasta","Glutenfri"]),skj=(CFG.skjul_sog||[]).map(function(x){return String(x).toLowerCase();}),seen={},pop=[];
    (POP||[]).concat(fast).forEach(function(w){var k=String(w).toLowerCase().trim();if(!k||seen[k]||skj.indexOf(k)>=0)return;seen[k]=1;pop.push(k.charAt(0).toUpperCase()+k.slice(1));});pop=pop.slice(0,10);
    var best;if(M.mest&&M.mest.length){var ix={};M.P.forEach(function(p){ix[p[0]]=p;});best=M.mest.map(function(n){return ix[n];}).filter(Boolean).slice(0,12);}if(!best||best.length<4)best=M.P.slice().sort(function(a,b){return b[8]-a[8];}).slice(0,12);
    main.innerHTML="<h4>Populære søgninger</h4><div class=\"oss-chips\">"+pop.map(function(s){return "<a data-q=\""+esc(s)+"\">"+esc(s)+"</a>";}).join("")+"</div><h4>Mest købte lige nu</h4><div class=\"oss-grid\">"+best.map(card).join("")+"</div>";
    side.innerHTML=M.kat&&M.kat.length?list("Populære kategorier lige nu",M.kat):"";return;}
  var r=M.sog(q,limit),note="";
  if(!r.antal){var f=M.foreslaa(q);if(f){var q2=q.replace(/\S+$/,f),r2=M.sog(q2,limit);if(r2.antal){note="<p class=\"oss-note\">Ingen resultater for “"+esc(q)+"”. Viser resultater for <b>"+esc(q2)+"</b>.</p>";r=r2;}}}
  ga(q,r.antal);logSoon(q,r.antal);
  main.innerHTML=r.antal?"<h4>Produkter <span style=\"font-weight:400;color:#777;font-size:.9rem\">("+r.antal+")</span></h4>"+note+"<div class=\"oss-grid\">"+r.varer.map(card).join("")+"</div>"+(r.antal>r.varer.length?"<button class=\"oss-more\" data-more=\""+(limit+40)+"\">Vis flere produkter</button>":""):
    "<div class=\"oss-empty\">Vi fandt ingen produkter for “"+esc(q)+"”.<br>Prøv et andet ord, eller skriv til os på info@okologisk-supermarked.dk – så hjælper vi.</div>";
  side.innerHTML=list("Kategorier",r.grupper)+list("Brands",r.brands);
}
function PH(){var i=document.querySelector("#Search_Form input[placeholder]");return i&&i.placeholder||"Søg blandt vores 12.000 produkter";}
function open(q0,fraIkon){
  if(!ov){
    var st=document.createElement("style");st.textContent=CSS;document.head.appendChild(st);
    var logo=document.querySelector("header img[src*=ogo],.logo img,a[href*=frontpage] img");
    ov=document.createElement("div");ov.className="oss";ov.setAttribute("role","dialog");
    ov.innerHTML="<div class=\"oss-top\"><div class=\"oss-top-in\"><a class=\"oss-logo\" href=\"/shop/frontpage.html\">"+(logo?"<img src=\""+esc(logo.getAttribute("src"))+"\" alt=\"\">":"")+"</a><div class=\"oss-f\"><input type=\"search\" autocomplete=\"off\" placeholder=\""+esc(PH())+"\" aria-label=\"Søg\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><circle cx=\"11\" cy=\"11\" r=\"7\"/><path d=\"m20 20-4-4\"/></svg></div><button class=\"oss-x\" aria-label=\"Luk\">&times;</button></div></div><div class=\"oss-body\"><div class=\"oss-in\"><div class=\"oss-main\"></div><div class=\"oss-side\"></div></div></div>";
    document.body.appendChild(ov);inp=ov.querySelector("input");
    var t;inp.addEventListener("input",function(){clearTimeout(t);t=setTimeout(function(){lastQ=inp.value;render(lastQ);},120);});
    inp.addEventListener("keydown",function(e){if(e.key==="Enter"){e.preventDefault();render(inp.value,80);inp.blur();logNu();}if(e.key==="Escape")close();});
    ov.querySelector(".oss-x").onclick=close;
    ov.addEventListener("click",function(e){if(e.target.closest("a[href],button[type=submit],form button"))logNu();var c=e.target.closest("[data-q]");if(c){inp.value=c.getAttribute("data-q");render(inp.value);}var m=e.target.closest("[data-more]");if(m)render(inp.value,parseInt(m.getAttribute("data-more"),10));});
  }
  ov.style.display="flex";document.documentElement.style.overflow="hidden";
  if(POP===null){POP=[];hentPop();}
  inp.value=q0||inp.value||"";render(inp.value);var touch=window.matchMedia&&matchMedia("(pointer:coarse)").matches;if(!(fraIkon&&touch))setTimeout(function(){inp.focus();},30);else{try{inp.blur();}catch(e){}}
  load().then(function(){if(ov.style.display!=="none")render(inp.value);}).catch(function(){ov.querySelector(".oss-main").innerHTML="<div class=\"oss-empty\">Søgningen kunne ikke hentes lige nu.</div>";});
}
function close(){logNu();if(ov)ov.style.display="none";document.documentElement.style.overflow="";}
window.addEventListener("pagehide",logNu);
window.osSog={open:open,close:close};
// overtag butikkens søgefelter
function isSearch(el){return el&&el.tagName==="INPUT"&&!el.closest(".oss")&&(el.closest("#Search_Form")||/søg|search/i.test(el.placeholder||"")||el.name==="keyword"||el.classList.contains("bp_lsaSearchinput"));}
function grab(e){var el=e.target;if(!isSearch(el))return;e.preventDefault();e.stopImmediatePropagation();var v=el.value;el.blur();open(v);}
document.addEventListener("click",function(e){var b=e.target.closest&&e.target.closest("#searchBtn");if(!b)return;e.preventDefault();e.stopImmediatePropagation();open("",1);},true);
document.addEventListener("focusin",grab,true);document.addEventListener("mousedown",grab,true);document.addEventListener("touchstart",grab,{capture:true,passive:false});
document.addEventListener("submit",function(e){var f=e.target;if(f&&f.id==="Search_Form"){e.preventDefault();e.stopImmediatePropagation();var i=f.querySelector("input[type=text],input[type=search],input[name=keyword]");open(i?i.value:"");}},true);
var hs=document.createElement("style");hs.textContent=".bp_lsaFullScreen,.bp_LiveSearchApp .bp_lsaResults{display:none!important}";document.head.appendChild(hs);
if(/[?&]keyword=/.test(location.search)&&/search-/.test(location.pathname)){var k=decodeURIComponent((location.search.match(/[?&]keyword=([^&]*)/)||[])[1]||"").replace(/\+/g," ");if(k)setTimeout(function(){open(k);},300);}
setTimeout(load,2500); // forvarm i baggrunden
})();
