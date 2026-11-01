/* Kassen (checkout.html) på ØS og HE: pænere og mere troværdig "Godkend ordre"-boks,
   skjuler "(0,00 DKK …)" ved betalingsmetoderne og forklarer kortgebyret. */
(function(){
if(window.__osKasse)return;window.__osKasse=1;
if(!/checkout/i.test(location.pathname))return;
var HE=/helsekost-ekspres/i.test(location.hostname);
var C=HE?{a:"#1e5b3a",ah:"#16452c",l:"#f2f7f4",b:"#d5e5da",btn:"#1e5b3a",btnh:"#16452c"}
        :{a:"#2e7d32",ah:"#1b5e20",l:"#f1f8f1",b:"#d3e8d4",btn:"#f7941d",btnh:"#e0820f"};
var LOCK="data:image/svg+xml;utf8,"+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>');
var CHK='<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="'+C.a+'" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
var SHIELD='<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="'+C.a+'" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/></svg>';
var css=
"#order-confirm{font-size:14px;line-height:1.45;color:#222}"+
"#acceptLoyaltyCreationContainer{display:none!important}"+
"#order-confirm>h2{border-radius:8px}"+
"#confirm-termsandconditions-text,#confirm-termsandconditions-link-text,#confirm-terms-gdpr-link-text{display:none!important}"+
".osk-intro{margin:12px 2px 12px;color:#444}"+
"#confirm-accepterms,#order-confirm #subscription-maillist{display:flex!important;align-items:flex-start;gap:10px;border:1px solid #dcdcdc;border-radius:8px;padding:12px 14px!important;margin:0 0 10px!important;background:#fff;cursor:pointer;transition:border-color .15s,background .15s;width:auto!important;float:none!important}"+
"#confirm-accepterms{border-color:"+C.b+";background:"+C.l+"}"+
"#confirm-accepterms.osk-ok{border-color:"+C.a+"}"+
"#confirm-accepterms.osk-fejl{border-color:#c62828;background:#fdecea;animation:oskRyst .35s}"+
"@keyframes oskRyst{0%,100%{transform:none}25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}"+
"#confirm-accepterms input,#order-confirm #subscription-maillist input{width:20px!important;height:20px!important;margin:1px 0 0!important;flex:0 0 20px;accent-color:"+C.a+";cursor:pointer}"+
"#confirm-accepterms-link,#order-confirm #subscription-maillist label{margin:0!important;padding:0!important;font-size:14px!important;line-height:1.4!important;color:#222!important;font-weight:600;cursor:pointer;float:none!important;text-align:left!important}"+
"#order-confirm #subscription-maillist label{font-weight:400}"+
"#confirm-accepterms-link a{color:"+C.a+"!important;text-decoration:underline!important}"+
".osk-fejltekst{display:none;color:#c62828;font-size:13px;margin:-4px 2px 10px}"+
"#confirm-accepterms.osk-fejl+.osk-fejltekst{display:block}"+
"#confirm-checkout{margin:6px 0 0!important;padding:0!important;text-align:center}"+
"#column-order-summary #order-summary>table:not(.order-summary)>tbody{display:table;width:100%}"+
"#column-order-summary #order-summary>table td.right-align{text-align:right!important;white-space:nowrap}"+
"#confirm-complete-button{display:block!important;width:100%!important;max-width:none!important;margin:0!important;border:0!important;border-radius:8px!important;background:"+C.btn+" url(\""+LOCK+"\") no-repeat 18px center/20px!important;color:#fff!important;font-size:18px!important;font-weight:700!important;letter-spacing:.02em;text-transform:none!important;padding:15px 18px 15px 46px!important;line-height:1.2!important;height:auto!important;cursor:pointer;box-shadow:0 2px 6px rgba(0,0,0,.15);transition:background-color .15s}"+
"#confirm-complete-button:hover{background-color:"+C.btnh+"!important}"+
".osk-trust{margin:14px 0 4px;padding:12px 14px;border-radius:8px;background:#fafafa;border:1px solid #ececec;font-size:13px;color:#333}"+
".osk-sikker{display:flex;align-items:center;gap:8px;font-weight:600;margin-bottom:8px}"+
".osk-kort{display:block;max-width:190px;height:auto;margin:0 0 10px}"+
".osk-trust ul{list-style:none;margin:0;padding:0}"+
".osk-trust li{display:flex;align-items:center;gap:7px;margin:4px 0}"+
".osk-trust a{color:"+C.a+"!important}"+
".osk-gebyr{display:block;font-weight:400!important;font-size:11px;line-height:1.35;color:#666;margin-top:3px}label.checkout-payment-method,label.checkout-payment-method table{height:auto!important;max-height:none!important;overflow:visible!important}"+
"label[for=res3]{display:grid!important;grid-template-columns:minmax(0,1fr) auto;align-items:stretch;background:#f9f6ec;border:1px solid #eee;border-radius:3px;padding:12px 20px 14px!important;margin:10px 0!important;font-weight:400;float:none!important;width:auto!important;height:auto!important}"+
"label[for=res3] .salesdiscountcode-label{grid-column:1/-1;font-weight:700;color:"+C.a+";font-size:15px;margin:0 0 8px}"+
"label[for=res3] .salesdiscountcode-container{min-width:0;float:none!important;width:auto!important;margin:0!important;padding:0!important}"+
"#res3{display:block;min-width:0!important;height:44px!important;margin:0!important;border:1px solid #b9b1a8!important;border-right:0!important;border-radius:3px 0 0 3px!important;background:#fff!important;font-size:16px!important;padding:0 12px!important;width:100%!important;box-sizing:border-box!important;box-shadow:none!important}"+
"#res3:focus{outline:2px solid "+C.a+";outline-offset:-2px}"+
"label[for=res3] .salesdiscountcode-button-container{float:none!important;width:auto!important;margin:0!important;padding:0!important}"+
"#res3_salesdiscountcode_button{display:block;height:44px!important;margin:0!important;padding:0 22px!important;border:0!important;border-radius:0 3px 3px 0!important;background:"+(HE?C.a:"#095a3e")+"!important;color:#fff!important;font-weight:700!important;font-size:16px!important;line-height:44px!important;cursor:pointer;text-transform:none!important;box-shadow:none!important}"+
"#res3_salesdiscountcode_button:hover{background:"+(HE?C.ah:"#07472f")+"!important}"+
"label[for=res3] .clear{display:none!important}"+
"#res3_errormessage{margin-top:6px}label[for=res3]>#res3_errormessage{grid-column:1/-1}"+
".osk-anden{display:flex!important;align-items:center;gap:8px;margin:2px 0 14px!important;padding:0!important;float:none!important;width:auto!important;clear:both}"+
".osk-anden .div-checkout-checkbox,.osk-anden .div-checkout-checkbox-label{float:none!important;width:auto!important;margin:0!important;padding:0!important}"+
".osk-anden input{width:18px!important;height:18px!important;margin:0!important;accent-color:"+C.a+";cursor:pointer}"+
".osk-anden label{margin:0!important;padding:0!important;cursor:pointer;font-size:15px!important}";
function addCss(){if(document.getElementById("osk-css"))return;var s=document.createElement("style");s.id="osk-css";s.textContent=css;document.head.appendChild(s);}
function boks(){var b=document.getElementById("order-confirm");if(!b||b.getAttribute("data-osk"))return;b.setAttribute("data-osk","1");
  var h=b.querySelector("h2");
  if(h&&!b.querySelector(".osk-intro")){var p=document.createElement("p");p.className="osk-intro";p.textContent="Næsten færdig. Godkend betingelserne, og gå videre til sikker betaling.";h.parentNode.insertBefore(p,h.nextSibling);}
  var acc=document.getElementById("confirm-accepterms"),cb=document.getElementById("acceptTermsBit"),sp=document.getElementById("confirm-accepterms-link");
  if(acc&&cb&&sp){
    sp.innerHTML='Jeg accepterer <a href="/shop/terms.html" target="_blank" rel="noopener">handelsbetingelserne</a> og <a href="/shop/terms.html#persondata" target="_blank" rel="noopener">persondatapolitikken</a>';
    var ft=document.createElement("div");ft.className="osk-fejltekst";ft.textContent="Sæt flueben for at godkende betingelserne, før du betaler.";acc.parentNode.insertBefore(ft,acc.nextSibling);
    var sync=function(){acc.classList.toggle("osk-ok",cb.checked);if(cb.checked)acc.classList.remove("osk-fejl");};
    acc.addEventListener("click",function(e){if(e.target===cb||e.target.closest("a"))return;var f=cb.checked;setTimeout(function(){if(cb.checked===f)cb.click();sync();},0);},true);
    cb.addEventListener("change",sync);sync();}
  var nl=document.getElementById("subscription-maillist");
  var fe=b.querySelector(".osk-fejltekst");if(nl&&fe&&fe.nextElementSibling!==nl)fe.parentNode.insertBefore(nl,fe.nextSibling);
  if(nl){var ni=nl.querySelector("input"),nlab=nl.querySelector("label");if(ni&&nlab){if(ni.id)nlab.htmlFor=ni.id;nl.addEventListener("click",function(e){if(e.target===ni||e.target===nlab)return;var f=ni.checked;setTimeout(function(){if(ni.checked===f)ni.click();},0);},true);}}
  var btn=document.getElementById("confirm-complete-button");
  if(btn){btn.value="Godkend og betal";
    btn.addEventListener("click",function(){if(cb&&!cb.checked&&acc&&btn.offsetParent){acc.classList.remove("osk-fejl");void acc.offsetWidth;acc.classList.add("osk-fejl");}},true);}
  var cc=document.getElementById("confirm-checkout");
  if(cc&&!b.querySelector(".osk-trust")){var t=document.createElement("div");t.className="osk-trust";
    t.innerHTML='<div class="osk-sikker">'+SHIELD+'<span>Sikker betaling via OnPay. Dine kortoplysninger er krypteret.</span></div>'+
      '<img class="osk-kort" src="/images/template/payments-dk.png" alt="Dankort, Visa, Mastercard, MobilePay">'+
      '<ul><li>'+CHK+'<span>14 dages fortrydelsesret</span></li><li>'+CHK+'<span>2 års reklamationsret</span></li>'+
      '<li>'+CHK+'<span>Autoriseret forhandler, kun originale varer</span></li>'+
      '<li>'+CHK+'<span>Dansk virksomhed, CVR 32787339</span></li></ul>';
    cc.parentNode.insertBefore(t,cc.nextSibling);}
}
function nulGebyr(){var tr=document.querySelectorAll("tr");for(var i=0;i<tr.length;i++){var c=tr[i].children;if(c.length>=2&&/^\s*(Kortgebyr|Betalingsgebyr):?\s*$/i.test(c[0].textContent)&&/^\s*0,00(\s*DKK)?\s*$/i.test(c[c.length-1].textContent))tr[i].style.setProperty("display","none","important");else if(c.length>=2&&/^\s*(Kortgebyr|Betalingsgebyr):?\s*$/i.test(c[0].textContent))tr[i].style.removeProperty("display");}}
function betaling(){nulGebyr();var fs=document.querySelectorAll("span.payment-fee");for(var i=0;i<fs.length;i++){var f=fs[i];if(f.getAttribute("data-osk"))continue;f.setAttribute("data-osk","1");
  var t=f.textContent;if(/^\s*\(\s*0,00\s*DKK/i.test(t)){f.style.display="none";
    if(/Kortgebyr/i.test(t)){var g=document.createElement("span");g.className="osk-gebyr";g.textContent="Gebyrfrit for private kort fra EU/EØS. Gebyr på firmakort og kort udstedt uden for EU/EØS oplyses i betalingsvinduet.";var pm=f.parentNode.querySelector(".payment-message");f.parentNode.insertBefore(g,pm?pm.nextSibling:f.nextSibling);}}}
  if(!HE){var w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,null,false),n,l=[];while((n=w.nextNode()))l.push(n);
    l.forEach(function(n){if(/^\s*Forsendelsesgebyr:?\s*$/i.test(n.nodeValue))n.nodeValue=n.nodeValue.replace(/Forsendelsesgebyr/i,"Fragt");});}
}
function kode(){var ls=document.querySelectorAll("#customer-data label");for(var i=0;i<ls.length;i++){if(/^\s*Vælg kodeord/i.test(ls[i].textContent))ls[i].style.setProperty("display","none","important");}}

function rabat(){var l=document.querySelector("label[for=res3] .salesdiscountcode-label");if(l&&!l.getAttribute("data-osk")){l.setAttribute("data-osk","1");l.textContent="Har du en rabatkode?";}
  var i=document.getElementById("res3");if(i&&!i.placeholder)i.placeholder="Indsæt din kode";
  var box=document.querySelector("label[for=res3]"),col=document.getElementById("column-order-summary");if(!box||!col)return;
  var ref=document.getElementById("usePointsContainer")||document.getElementById("order-summary");if(!ref||ref.parentNode!==col)return;
  if(ref.nextElementSibling!==box)col.insertBefore(box,ref.nextSibling);}
function anden(){var cb=document.getElementById("checkout_use_alternative_delivery_address");if(!cb)return;var row=cb.closest(".checkout-row");if(!row)return;
  var land=document.querySelector("label[for=checkout_customer_country]");if(!land)return;
  row.classList.add("osk-anden");if(land.nextElementSibling!==row)land.parentNode.insertBefore(row,land.nextSibling);}
function kør(){addCss();boks();betaling();kode();rabat();anden();}
var tm=null;function snart(){if(tm)return;tm=setTimeout(function(){tm=null;kør();},120);}
function start(){kør();new MutationObserver(snart).observe(document.body,{childList:true,subtree:true});}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start);else start();
})();
