/* Helsekost-Ekspres – tekster til nyhedsbrevstilmelding (Johnny 06-11-2026).
   Feltet i bunden: "Få besked, når vi bliver billigst" + undertekst.
   Fluebenet i kassen: "Ja tak, giv mig besked om nye varer og priser".
   Indlæses af sog/sog.js kun på HE. */
(function(){
if(window.__heNyhedTekst)return;window.__heNyhedTekst=1;
if(!/helsekost-ekspres/i.test(location.hostname))return;
function footer(){
  var f=document.querySelector('form[onsubmit*="newsletterSignup"]');if(!f)return;
  var li=f.parentElement,h=li&&li.querySelector("strong");
  if(h&&!h.getAttribute("data-he")){h.setAttribute("data-he","1");h.textContent="Få besked, når vi bliver billigst";
    var s=document.createElement("div");s.textContent="Vi tjekker priserne hos 8 webshops hver morgen";
    s.style.cssText="font-size:13px;opacity:.85;margin:4px 0 8px";h.parentNode.insertBefore(s,h.nextSibling);}
}
function kasse(){
  var cb=document.getElementById("subscription-maillist-subscribe");if(!cb)return;
  var box=cb.closest("#subscription-maillist")||cb.parentElement;if(!box||box.getAttribute("data-he"))return;
  var w=document.createTreeWalker(box,NodeFilter.SHOW_TEXT,null),n,done=false;
  while((n=w.nextNode())){if(/modtag nyhedsbrev/i.test(n.nodeValue)){n.nodeValue=n.nodeValue.replace(/modtag nyhedsbrev/i,"Ja tak, giv mig besked om nye varer og priser");done=true;break;}}
  if(done)box.setAttribute("data-he","1");
}
function run(){try{footer();}catch(e){}try{kasse();}catch(e){}}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",run);else run();
setTimeout(run,1500);setTimeout(run,4000);
})();
