/* "Billigst i prismatch"-badge på Helsekost-Ekspres (Johnny 05-11-2026).
   Rundt orange badge i venstre side af produktbilledet (varelister, egne karruseller, varesiden) + forklaringsboks
   under prisen på varesiden. Data: prismatch/he.json (= varerne i kategori 3850), bygges af prismatch/byg_badge.py.
   Indlæses af sog/sog.js. Kun på HE. */
(function(){
if(window.__osPm)return;window.__osPm=1;
if(!/helsekost-ekspres/i.test(location.hostname))return;
var src=(document.currentScript&&document.currentScript.src)||"",BASE=(src.match(/^(.*os-data@[^\/]+\/)/)||[])[1];if(!BASE)return;
if(/order4|basket|checkout/i.test(location.pathname))return;
var KAT="/shop/billigst-i-prismatch-7486c1.html",N={},ANT=8;
var CSS=".os-pm{position:absolute;top:6px;left:6px;width:72px;height:72px;border-radius:50%;background:#1e5b3a;color:#fff;border:2px solid #fff;"+
"box-shadow:0 2px 6px rgba(0,0,0,.25);transform:rotate(-8deg);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;"+
"line-height:1;font-family:Roboto,Helvetica,Arial,sans-serif;z-index:5;box-sizing:border-box;pointer-events:none;overflow:hidden;padding:0}"+
".os-pm span{display:block;margin:0;padding:0;color:#fff;font-family:Roboto,Helvetica,Arial,sans-serif;line-height:1;text-transform:none;white-space:nowrap}"+
".os-pm .pa{font-size:10.5px;font-weight:900;letter-spacing:.3px}.os-pm .pb{font-size:7.7px;font-weight:800;letter-spacing:.4px;margin:2px 0 1px}.os-pm .pc{font-size:8.4px;font-weight:800;letter-spacing:0}"+
".os-pm-big{width:84px;height:84px;top:10px;left:10px}.os-pm-big .pa{font-size:12.3px}.os-pm-big .pb{font-size:9px}.os-pm-big .pc{font-size:9.8px}"+
"@media (max-width:640px){.os-pm{width:58px;height:58px;top:4px;left:4px}.os-pm .pa{font-size:8.5px}.os-pm .pb{font-size:6.5px}.os-pm .pc{font-size:6.8px}}"+
".os-pm-box{display:flex;gap:10px;align-items:flex-start;border:1px solid #1e5b3a;background:#eef6f1;border-radius:6px;padding:9px 11px;margin:10px 0 12px;font-size:13px;line-height:1.5;color:#173f29}"+
".os-pm-box .os-pm-ic{flex:0 0 34px;width:34px;height:34px;border-radius:50%;background:#1e5b3a;color:#fff;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:900}"+
".os-pm-box strong{font-weight:700}.os-pm-box a{color:#173f29;text-decoration:underline}";
function badge(big){var d=document.createElement("div");d.className="os-pm"+(big?" os-pm-big":"");d.setAttribute("aria-label","Billigst i prismatch");
  d.innerHTML="<span class=\"pa\">BILLIGST</span><span class=\"pb\">I</span><span class=\"pc\">PRISMATCH</span>";return d;}
function sat(box,big){if(!box||box.querySelector(".os-pm"))return;if(getComputedStyle(box).position==="static")box.style.position="relative";box.appendChild(badge(big));}
function nrOf(el){var i=el.querySelector("input[name=ProductID]");return i?i.value.trim():"";}
function scan(){
  // DanDomains varelister
  [].forEach.call(document.querySelectorAll("form[id^=productlistBuyForm]"),function(f){if(N[nrOf(f)])sat(f.querySelector(".image"));});
  // egne karruseller (karrusel.js)
  [].forEach.call(document.querySelectorAll(".osk-c[data-productno]"),function(c){if(N[(c.getAttribute("data-productno")||"").trim()])sat(c.querySelector(".prodImg"));});
  // varesiden
  var pf=document.querySelector("form.product-details-buy-form");
  if(pf&&N[nrOf(pf)]){
    sat(document.getElementById("Productinfo_Fancybox_Image_DIV"),true);
    var buy=pf.querySelector(".info .buy")||pf.querySelector(".buy");
    if(buy&&!document.querySelector(".os-pm-box")){var b=document.createElement("div");b.className="os-pm-box";
      b.innerHTML="<div class=\"os-pm-ic\">&#10003;</div><div><strong>Billigst i prismatch</strong><br>Billigst blandt "+ANT+" danske webshops i dag. Vi tjekker priserne hver morgen og følger med, hvis andre sætter prisen ned. <a href=\""+KAT+"\">Se alle varer</a></div>";
      buy.parentNode.insertBefore(b,buy);}
  }
}
function start(){
  fetch(BASE+"prismatch/he.json").then(function(r){if(!r.ok)throw 0;return r.json();}).then(function(D){
    (D.n||[]).forEach(function(n){N[n]=1;});if(D.butikker)ANT=D.butikker;if(!(D.n||[]).length)return;
    var st=document.createElement("style");st.textContent=CSS;document.head.appendChild(st);
    scan();var t=null;new MutationObserver(function(){clearTimeout(t);t=setTimeout(scan,150);}).observe(document.body,{childList:true,subtree:true});
  }).catch(function(){});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start);else start();
})();
