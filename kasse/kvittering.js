/* Ordrebekræftelsen (order4.html) på ØS og HE: pæn kvittering bygget ud fra DanDomains tabel.
   Den gamle tabel skjules kun (bliver i siden), så sporing/konverteringsscripts ikke påvirkes. */
(function(){
if(window.__osKvit)return;window.__osKvit=1;
if(!/order4/i.test(location.pathname))return;
var HE=/helsekost-ekspres/i.test(location.hostname);
var C=HE?{a:"#1e5b3a",l:"#f2f7f4",b:"#d5e5da",btn:"#1e5b3a",btnh:"#16452c",mail:"info@helsekost-ekspres.dk",tlf:"42 47 93 90"}
        :{a:"#2e7d32",l:"#f1f8f1",b:"#d3e8d4",btn:"#f7941d",btnh:"#e0820f",mail:"info@okologisk-supermarked.dk",tlf:"50 42 77 72"};
function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c];});}
function txt(e){return e?(e.innerText||e.textContent||"").replace(/ /g," ").trim():"";}
function one(s){return String(s||"").replace(/\s+/g," ").trim();}
var CHK='<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
var css=
".osq{max-width:960px;margin:10px auto 40px;font-size:15px;line-height:1.5;color:#222}"+
".osq *{box-sizing:border-box}"+
".osq-top{text-align:center;padding:26px 16px 22px}"+
".osq-ok{width:58px;height:58px;border-radius:50%;background:"+C.a+";display:flex;align-items:center;justify-content:center;margin:0 auto 14px}"+
".osq-top h1{font-size:28px;line-height:1.2;margin:0 0 8px;color:#222;font-weight:700}"+
".osq-top p{margin:0;color:#555;font-size:16px}"+
".osq-nr{display:inline-block;margin-top:14px;background:"+C.l+";border:1px solid "+C.b+";border-radius:999px;padding:6px 16px;font-size:14px;color:#333}"+
".osq-nr b{color:"+C.a+"}"+
".osq-grid{display:grid;grid-template-columns:minmax(0,1.6fr) minmax(0,1fr);gap:18px;align-items:start}"+
"@media (max-width:760px){.osq-grid{grid-template-columns:minmax(0,1fr)}.osq-top h1{font-size:23px}}"+
".osq-card{background:#fff;border:1px solid #e6e6e6;border-radius:10px;padding:18px 20px;margin:0 0 18px}"+
".osq-card h2{font-size:17px;margin:0 0 12px;color:#222;font-weight:700}"+
".osq-line{display:flex;gap:12px;align-items:center;padding:10px 0;border-bottom:1px solid #f0f0f0}"+
".osq-line:last-child{border-bottom:0}"+
".osq-img{flex:0 0 56px;height:56px;display:flex;align-items:center;justify-content:center}"+
".osq-img img{max-width:56px;max-height:56px;object-fit:contain}"+
".osq-name{flex:1 1 auto;min-width:0}"+
".osq-name small{display:block;color:#888;font-size:12px}"+
".osq-qty{flex:0 0 auto;color:#666;font-size:14px;white-space:nowrap}"+
".osq-pr{flex:0 0 auto;font-weight:600;white-space:nowrap;text-align:right;min-width:80px}"+
".osq-disc .osq-name,.osq-disc .osq-pr{color:"+C.a+"}"+
".osq-disc .osq-img{font-size:22px;color:"+C.a+"}"+
".osq-sum{margin-top:8px;border-top:1px solid #e6e6e6;padding-top:10px}"+
".osq-sum div{display:flex;justify-content:space-between;padding:3px 0;color:#444}"+
".osq-sum .osq-tot{border-top:1px solid #e6e6e6;margin-top:6px;padding-top:9px;font-size:18px;font-weight:700;color:#222}"+
".osq-sum .osq-moms{font-size:13px;color:#777}"+
".osq-adr{white-space:pre-line;color:#333;font-size:14px;margin:0 0 12px}"+
".osq-adr:last-child{margin-bottom:0}"+
".osq-lbl{font-size:12px;text-transform:uppercase;letter-spacing:.05em;color:#888;margin:0 0 3px;font-weight:600}"+
".osq-steps{list-style:none;margin:0;padding:0;counter-reset:s}"+
".osq-steps li{position:relative;padding:0 0 12px 36px;color:#333;font-size:14px}"+
".osq-steps li:before{counter-increment:s;content:counter(s);position:absolute;left:0;top:0;width:24px;height:24px;border-radius:50%;background:"+C.l+";border:1px solid "+C.b+";color:"+C.a+";font-weight:700;font-size:13px;display:flex;align-items:center;justify-content:center}"+
".osq-steps a{color:"+C.a+"}"+
".osq-btns{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin-top:6px}"+
".osq-btn{display:inline-block;background:"+C.btn+";color:#fff!important;text-decoration:none!important;font-weight:700;border-radius:8px;padding:13px 26px;font-size:16px}"+
".osq-btn:hover{background:"+C.btnh+"}"+
".osq-btn2{display:inline-block;background:#fff;color:#333!important;border:1px solid #ccc;text-decoration:none!important;border-radius:8px;padding:12px 20px;font-size:15px;cursor:pointer}"+
"@media print{.osq-btns{display:none}}";
function addCss(){if(document.getElementById("osq-css"))return;var s=document.createElement("style");s.id="osq-css";s.textContent=css;document.head.appendChild(s);}
function byg(){
  var t=document.querySelector(".TableLines_OrderStep4");if(!t||document.querySelector(".osq"))return;
  var rows=[].slice.call(t.querySelectorAll("tr"));
  var nr="",dato="",kunde=[],lev=[],linjer=[],info={},gebyr=[],tot={};
  rows.forEach(function(r){
    var c=r.children,t1=txt(r);
    if(!nr){var m=t1.match(/Ordrenr\.?:\s*(\d+)/);if(m&&!r.querySelector("table")){nr=m[1];var d=t1.match(/Ordredato:\s*([\d\-]+)/);if(d)dato=d[1];}}
    if(!kunde.length&&c.length===2&&!r.querySelector("table")&&/@/.test(txt(c[0]))){
      var p=txt(c[0]).split(/\n\s*Leveres til:\s*\n/);
      kunde=p[0].split("\n").map(one).filter(Boolean);lev=(p[1]||"").split("\n").map(one).filter(Boolean);}
    if(r.classList.contains("basket-line")){
      var img=r.querySelector("img"),cs=[].slice.call(c).map(txt);
      linjer.push({rabat:r.classList.contains("basket-line-sales-discount")||/discount/.test(r.className),
        antal:cs[0]||"",varenr:cs[2]||"",navn:one(txt(c[4])),img:img?img.getAttribute("src"):"",
        pris:txt(r.querySelector(".order-line-total-price"))||cs[cs.length-1]||""});return;}
    if(r.querySelector("table"))return;
    var m2=t1.match(/^\s*(Betalingsmetode|Korttype|Forsendelsesmetode):\s*(.+)$/);if(m2){info[m2[1]]=one(m2[2]);return;}
    var cl=[].slice.call(c).map(txt).filter(Boolean);
    if(cl.length===2&&/gebyr/i.test(cl[0])&&/^-?[\d.]+,\d{2}$/.test(cl[1])){if(!/^0,00$/.test(cl[1]))gebyr.push([cl[0],cl[1]]);return;}
    var m3=one(t1).match(/Total eksl\. moms\s*([\d.,]+)\s*DKK.*Moms udgør\s*([\d.,]+)\s*DKK.*Total inkl\. moms\s*([\d.,]+)\s*DKK/i);
    if(m3){tot={ex:m3[1],moms:m3[2],ink:m3[3]};}
  });
  if(!nr||!linjer.length||!tot.ink)return; // ukendt opbygning: rør intet
  var mail=(kunde.filter(function(x){return /@/.test(x);})[0])||"";
  var adr=kunde.filter(function(x){return !/@/.test(x);});
  var navnGeb={"Forsendelsesgebyr":"Fragt","Betalingsgebyr":"Betalingsgebyr","Kortgebyr":"Kortgebyr"};
  var h='<div class="osq">'+
    '<div class="osq-top"><div class="osq-ok">'+CHK+'</div><h1>Tak for din ordre!</h1>'+
    '<p>Vi har modtaget din bestilling og går i gang med at pakke den.</p>'+
    '<div class="osq-nr">Ordrenummer <b>'+esc(nr)+'</b>'+(dato?' &middot; '+esc(dato):'')+'</div></div>'+
    '<div class="osq-grid"><div>'+
    '<div class="osq-card"><h2>Din ordre</h2>';
  linjer.forEach(function(l){
    h+='<div class="osq-line'+(l.rabat?' osq-disc':'')+'"><div class="osq-img">'+(l.img?'<img src="'+esc(l.img)+'" alt="">':(l.rabat?'%':''))+'</div>'+
      '<div class="osq-name">'+esc(l.navn)+(l.varenr?'<small>Varenr. '+esc(l.varenr)+'</small>':'')+'</div>'+
      '<div class="osq-qty">'+(l.rabat?'':esc(l.antal)+' stk.')+'</div><div class="osq-pr">'+esc(l.pris)+' kr.</div></div>';});
  h+='<div class="osq-sum">';
  gebyr.forEach(function(g){h+='<div><span>'+esc(navnGeb[g[0]]||g[0])+'</span><span>'+esc(g[1])+' kr.</span></div>';});
  h+='<div class="osq-tot"><span>I alt</span><span>'+esc(tot.ink)+' kr.</span></div>'+
     '<div class="osq-moms"><span>Heraf moms</span><span>'+esc(tot.moms)+' kr.</span></div></div></div></div>'+
    '<div><div class="osq-card"><h2>Levering og betaling</h2>';
  if(lev.length)h+='<p class="osq-lbl">Leveres til</p><p class="osq-adr">'+esc(lev.join("\n"))+'</p>';
  h+='<p class="osq-lbl">Faktura til</p><p class="osq-adr">'+esc(adr.join("\n"))+'</p>';
  var bet=[info["Betalingsmetode"],info["Korttype"]?info["Korttype"].replace(/^./,function(x){return x.toUpperCase();}):""].filter(Boolean).join(" – ");
  if(info["Forsendelsesmetode"])h+='<p class="osq-lbl">Forsendelse</p><p class="osq-adr">'+esc(info["Forsendelsesmetode"])+'</p>';
  if(bet)h+='<p class="osq-lbl">Betaling</p><p class="osq-adr">'+esc(bet)+'</p>';
  h+='</div><div class="osq-card"><h2>Hvad sker der nu?</h2><ol class="osq-steps">'+
    '<li>Du får en ordrebekræftelse på mail'+(mail?' til <b>'+esc(mail)+'</b>':'')+'.</li>'+
    '<li>Vi pakker og sender din ordre hurtigst muligt.</li>'+
    '<li>Spørgsmål? Skriv til <a href="mailto:'+C.mail+'">'+C.mail+'</a> eller ring på '+C.tlf+'.</li></ol></div></div></div>'+
    '<div class="osq-btns"><a class="osq-btn" href="/">Fortsæt med at handle</a><a class="osq-btn2" href="#" onclick="window.print();return false;">Udskriv kvittering</a></div></div>';
  var box=document.createElement("div");box.innerHTML=h;
  var start=document.querySelector(".Heading_Order4")||document.querySelector(".step4")||t;
  start.parentNode.insertBefore(box.firstChild,start);
  // skjul den gamle visning (bliver i siden)
  [".Heading_Order4",".step4",".TableLines_OrderStep4"].forEach(function(s){var e=document.querySelector(s);if(e)e.style.display="none";});
  var mc=document.getElementById("mainContent");
  if(mc){var h2=mc.querySelector(":scope > h2");if(h2&&/godkendt/i.test(txt(h2)))h2.style.display="none";
    [].slice.call(mc.querySelectorAll(":scope > a")).forEach(function(a){if(/^Tilbage$/i.test(txt(a)))a.style.display="none";});
    [].slice.call(mc.querySelectorAll(":scope > br")).slice(0,8).forEach(function(b){b.style.display="none";});}
}
function start(){addCss();try{byg();}catch(e){}}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start);else start();
})();
