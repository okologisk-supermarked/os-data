/* Helsekost-Ekspres – forbedret "Varen er lagt i kurven"-popup (som på ØS, uden fri fragt)
   viser varens pris, fragt + bæredygtig emballage i opgørelsen og 3 populære varer. */
(function(){
if(window.__heKurv)return;window.__heKurv=1;
var RAW="https://raw.githubusercontent.com/okologisk-supermarked/os-data/main/sog/version.json",CDN="https://cdn.jsdelivr.net/gh/okologisk-supermarked/os-data@";
var EMB="10,00 DKK",LAST=null,DATA=null;
function clean(s){return String(s||"").replace(/\s+/g," ").trim();}
function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c];});}
function kr(n){return Number(n).toFixed(2).replace(".",",").replace(/\B(?=(\d{3})+(?!\d))/g,".")+" DKK";}
function leafPrice(root){var els=root.querySelectorAll("*");for(var i=0;i<els.length;i++){var e=els[i];if(e.children.length===0&&/\d+,\d{2}/.test(e.textContent)&&!/line-through/.test(getComputedStyle(e).textDecoration)&&!/vejl|før/i.test(e.parentElement?e.parentElement.textContent:""))return clean(e.textContent).replace(/^DKK\s*(.*)$/,"$1 DKK");}return "";}
function capture(ev){try{var t=ev.target;if(!t||!t.closest)return;var f=t.closest("form[action*='basket.asp']");if(!f||f.closest(".he-recs"))return;
  var card=f.closest("li")||f.closest(".product")||f;var pr=leafPrice(card);
  if(!pr){var ph=document.querySelector(".priceHolder,.ProductInfo_Price,[itemprop=price]");if(ph)pr=clean(ph.textContent);}
  if(pr){LAST={price:pr,t:Date.now()};try{sessionStorage.setItem("heLastAdded",JSON.stringify(LAST));}catch(e){}}}catch(e){}}
document.addEventListener("click",capture,true);document.addEventListener("submit",capture,true);
function lastAdded(){var x=LAST;if(!x){try{x=JSON.parse(sessionStorage.getItem("heLastAdded")||"null");}catch(e){}}return x&&Date.now()-x.t<60000?x:null;}
function data(cb){if(DATA)return cb(DATA);try{var c=JSON.parse(sessionStorage.getItem("heRecs1")||"null");if(c&&Date.now()-c.t<1800000){DATA=c.l;return cb(DATA);}}catch(e){}
  fetch(RAW+"?t="+Math.floor(Date.now()/300000),{cache:"no-cache"}).then(function(r){return r.json();}).then(function(v){return fetch(CDN+v.sha+"/kurv/kurv_he.json");}).then(function(r){return r.json();}).then(function(l){DATA=l||[];try{sessionStorage.setItem("heRecs1",JSON.stringify({t:Date.now(),l:DATA}));}catch(e){}cb(DATA);})["catch"](function(){cb([]);});}
function recs(box){data(function(l){var navn=(document.querySelector(".basketPopupName")||{}).textContent||"",pool=l.filter(function(p){return clean(p[1])!==clean(navn);}),pick=[];
  for(var i=0;i<pool.length&&pick.length<3;i++){var j=i+Math.floor(Math.random()*Math.min(8,pool.length-i));var t=pool[i];pool[i]=pool[j];pool[j]=t;pick.push(pool[i]);}
  if(!pick.length){box.style.display="none";return;}var ret=location.pathname+location.search;
  var h="<div class=\"he-recs-t\">Populært lige nu</div><div class=\"he-recs-g\">";
  pick.forEach(function(p){h+="<form method=\"POST\" action=\"/shop/basket.asp\"><input type=\"hidden\" name=\"Add\" value=\"1\"><input type=\"hidden\" name=\"ProductID\" value=\""+esc(p[0])+"\"><input type=\"hidden\" name=\"AMOUNT\" value=\"1\"><input type=\"hidden\" name=\"BuyReturnUrl\" value=\""+esc(ret)+"\">"+
    "<a href=\""+esc(p[2])+"\"><img src=\""+esc(p[3])+"\" alt=\"\"><span>"+esc(p[1])+"</span></a><div class=\"he-recs-p\">"+(p[5]?"<del>"+kr(p[5])+"</del> ":"")+kr(p[4])+"</div><button type=\"submit\">Læg i kurv</button></form>";});
  box.innerHTML=h+"</div>";});}
function fix(){var p=document.querySelector(".basketPopup");if(!p||p.offsetParent===null&&getComputedStyle(p).display==="none"||p.getAttribute("data-he"))return;p.setAttribute("data-he","1");
  var hd=p.querySelector(".basketPopupHeaderLeft");if(hd)hd.textContent="Varen er lagt i kurven";
  var nm=p.querySelector(".basketPopupName"),la=lastAdded();try{sessionStorage.removeItem("heLastAdded");}catch(e){}LAST=null;
  if(nm&&la&&la.price&&!p.querySelector(".he-pris")){var d=document.createElement("div");d.className="he-pris";d.textContent=la.price;nm.parentNode.insertBefore(d,nm.nextSibling);}
  var b=p.querySelector(".basketPopupBasket");if(b&&!b.querySelector(".he-emb")){var ds=b.children;for(var i=0;i<ds.length;i++){if(/^\s*Levering\s*$/i.test(ds[i].textContent)){ds[i].textContent="Fragt";var v=document.createElement("div");v.className="he-emb";v.textContent=EMB;var l=document.createElement("div");l.className="he-emb-l";l.textContent="Bæredygtig emballage";ds[i].parentNode.insertBefore(l,ds[i].nextSibling);ds[i].parentNode.insertBefore(v,l);break;}}}
  var top=p.querySelector(".basketPopupContentTop");if(top&&!p.querySelector(".he-recs")){var rb=document.createElement("div");rb.className="he-recs";rb.innerHTML="<div style=\"height:150px\"></div>";top.parentNode.insertBefore(rb,top.nextSibling);recs(rb);}}
var CSS=".basketPopup .he-pris{font-weight:700;font-size:1.05rem;margin-top:.3rem;text-align:center}"+
".he-recs{clear:both;border-top:1px solid #eee;margin-top:12px;padding:12px 16px 14px;background:#fff;text-align:left}.he-recs-t{font-weight:700;font-size:1rem;margin:0 0 8px}"+
".he-recs-g{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.he-recs form{margin:0;border:1px solid #e6e6e6;border-radius:6px;padding:8px;display:flex;flex-direction:column;justify-content:space-between;text-align:center;background:#fff}"+
".he-recs a{color:#333;text-decoration:none}.he-recs img{width:100%;height:90px;object-fit:contain}.he-recs span{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;font-size:.78rem;line-height:1.25;margin:6px 0;min-height:2rem}"+
".he-recs-p{font-weight:700;font-size:.9rem;margin-bottom:6px}.he-recs-p del{font-weight:400;color:#888;font-size:.78rem}"+
".he-recs button{width:100%;background:#1e5b3a;color:#fff;border:0;border-radius:4px;padding:8px 4px;font-weight:700;font-size:.8rem;cursor:pointer;text-transform:uppercase}"+
"@media (max-width:640px){.basketPopupOverlay .basketPopup{position:fixed!important;top:0!important;left:0!important;right:0!important;width:100%!important;max-width:100%!important;max-height:100vh;max-height:100dvh;overflow-y:auto;-webkit-overflow-scrolling:touch;margin:0!important;transform:none!important;border-radius:0}.he-recs{padding:10px}.he-recs-g{gap:6px}.he-recs img{height:64px}}";
function start(){var st=document.createElement("style");st.textContent=CSS;document.head.appendChild(st);fix();
  if(window.MutationObserver){var t;new MutationObserver(function(){clearTimeout(t);t=setTimeout(function(){var p=document.querySelector(".basketPopup");if(p&&p.getAttribute("data-he")&&!p.querySelector(".he-recs"))p.removeAttribute("data-he");fix();},60);}).observe(document.body,{childList:true,subtree:true});}}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start);else start();
})();
