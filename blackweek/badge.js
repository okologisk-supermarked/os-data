/* "Black Week"-badge på Økologisk-Supermarked (Johnny 17-11-2026).
   Rundt sort badge i venstre side af produktbilledet (varelister, egne karruseller, søgning, varesiden) + boks under prisen på varesiden.
   Data: blackweek/os.json (bygges af blackweek/byg_badge.py): alle varer i kategori 3852 (Johnny 18-11-2026: tilknytningen til 3852 udløser badget).
   Vises kun fra "start" til og med "slut" i os.json. Test før start: tilføj ?bwtest=1 til adressen. Indlæses af sog/sog.js. Kun på ØS. */
(function(){
if(window.__osBw)return;window.__osBw=1;
if(!/okologisk-supermarked/i.test(location.hostname))return;
var src=(document.currentScript&&document.currentScript.src)||"",BASE=(src.match(/^(.*os-data@[^\/]+\/)/)||[])[1];if(!BASE)return;
if(/order4|basket|checkout/i.test(location.pathname))return;
var TEST=/[?&]bwtest=1/.test(location.search)||(function(){try{return sessionStorage.getItem("bwtest")==="1";}catch(e){return false;}})();
if(/[?&]bwtest=1/.test(location.search)){try{sessionStorage.setItem("bwtest","1");}catch(e){}}
var KAT="/shop/black-week-7489c1.html",N={},SLUT="30. november";
var CSS=".os-bw{position:absolute;top:6px;left:6px;width:72px;height:72px;border-radius:50%;background:#111;color:#fff;border:2px solid #f2c94c;"+
"box-shadow:0 2px 6px rgba(0,0,0,.3);transform:rotate(-8deg);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;"+
"line-height:1;font-family:Roboto,Helvetica,Arial,sans-serif;z-index:5;box-sizing:border-box;pointer-events:none;overflow:hidden;padding:0}"+
".os-bw span{display:block;margin:0;padding:0;font-family:Roboto,Helvetica,Arial,sans-serif;line-height:1;text-transform:none;white-space:nowrap}"+
".os-bw .ba{font-size:12px;font-weight:900;letter-spacing:.6px;color:#fff}.os-bw .bb{font-size:12px;font-weight:900;letter-spacing:.6px;color:#f2c94c;margin:2px 0 3px}.os-bw .bc{font-size:8px;font-weight:800;letter-spacing:.5px;color:#fff}"+
".os-bw.os-bw-big{width:130px;height:130px;top:12px;left:12px;border-width:3px}.os-bw-big .ba,.os-bw-big .bb{font-size:22px;letter-spacing:1px}.os-bw-big .bb{margin:4px 0 6px}.os-bw-big .bc{font-size:14px}"+
"@media (max-width:640px){.os-bw{width:58px;height:58px;top:4px;left:4px}.os-bw .ba,.os-bw .bb{font-size:9.5px}.os-bw .bc{font-size:6.5px}"+
".os-bw.os-bw-big{width:96px;height:96px;top:8px;left:8px}.os-bw-big .ba,.os-bw-big .bb{font-size:16px}.os-bw-big .bc{font-size:10.5px}}"+
".os-bw-box{text-align:left;display:flex;gap:10px;align-items:flex-start;border:1px solid #111;background:#f7f4ea;border-radius:6px;padding:9px 11px;margin:10px 0 12px;font-size:13px;line-height:1.5;color:#111}"+
".os-bw-box .os-bw-ic{flex:0 0 34px;width:34px;height:34px;border-radius:50%;background:#111;color:#f2c94c;display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:900}"+
".os-bw-box strong{font-weight:700}.os-bw-box a{color:#111;text-decoration:underline}";
function badge(big){var d=document.createElement("div");d.className="os-bw"+(big?" os-bw-big":"");d.setAttribute("aria-label","Black Week-tilbud");
  d.innerHTML="<span class=\"ba\">BLACK</span><span class=\"bb\">WEEK</span><span class=\"bc\">TILBUD</span>";return d;}
function sat(box,big){if(!box||box.querySelector(".os-bw"))return;if(getComputedStyle(box).position==="static")box.style.position="relative";box.appendChild(badge(big));}
function har(nr){return !!N[(nr||"").trim().toLowerCase()];}
function nrOf(el){var i=el.querySelector("input[name=ProductID]");return i?i.value:"";}
function scan(){
  [].forEach.call(document.querySelectorAll("form[id^=productlistBuyForm]"),function(f){if(har(nrOf(f)))sat(f.querySelector(".prodImg")||f.querySelector(".image"));});
  [].forEach.call(document.querySelectorAll(".osk-c[data-productno],.oss-card[data-productno]"),function(c){if(har(c.getAttribute("data-productno")))sat(c.querySelector(".prodImg"));});
  var pf=document.querySelector("form.product-details-buy-form");
  if(pf&&har(nrOf(pf))){
    sat(document.getElementById("Productinfo_Fancybox_Image_DIV"),true);
    var buy=pf.querySelector(".buyWrapper")||pf.querySelector(".info .buy")||pf.querySelector(".buy");
    if(buy&&!document.querySelector(".os-bw-box")){var b=document.createElement("div");b.className="os-bw-box";
      b.innerHTML="<div class=\"os-bw-ic\">%</div><div><strong>Black Week-tilbud</strong><br>Tilbuddet gælder til og med "+SLUT+", så længe lager haves. <a href=\""+KAT+"\">Se alle Black Week-tilbud</a></div>";
      buy.parentNode.insertBefore(b,buy);}
  }
}
function start(){
  fetch(BASE+"blackweek/os.json").then(function(r){if(!r.ok)throw 0;return r.json();}).then(function(D){
    var dag=new Date(Date.now()+3600000).toISOString().slice(0,10);if(!TEST&&(!D.start||dag<D.start||dag>D.slut))return;
    ((TEST?D.alle:D.n)||[]).forEach(function(n){N[String(n).trim().toLowerCase()]=1;});
    if(!Object.keys(N).length)return;
    var st=document.createElement("style");st.textContent=CSS;document.head.appendChild(st);
    scan();var t=null;new MutationObserver(function(){clearTimeout(t);t=setTimeout(scan,150);}).observe(document.body,{childList:true,subtree:true});
  }).catch(function(){});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start);else start();
})();
