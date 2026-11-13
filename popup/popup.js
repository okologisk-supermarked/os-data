/* Popup (erstatter Plugly Popup) – ØS og HE. Ét popup ad gangen pr. shop fra karrusel/config.json → popup (Shopstyring), ellers popup/config.json.
   Vises efter X sekunder, én gang pr. besøg (lukket huskes). Ikke i kurv/kasse. Klik logges som type "kar" med k = "p-<id>". */
(function(){
  if(/basket|checkout|order|kurv|kasse/i.test(location.pathname))return;
  var HE=/helsekost-ekspres/i.test(location.hostname),K=HE?"he":"os";
  var LOG="https://script.google.com/macros/s/AKfycbwMFAsMPm7KFWa8JrEbZ-ZL4nZ9-Q4dU340nWvUjWDJ_z44GzKbde37SbcnfldfduS0/exec";
  var me=document.currentScript&&document.currentScript.src||"",base=me.replace(/popup\/popup\.js.*$/,"");
  function esc(s){return String(s||"").replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c];});}
  function log(id){try{var b=JSON.stringify({type:"kar",e:"klik",k:("p-"+id).slice(0,20),nr:"",site:K});if(!(navigator.sendBeacon&&navigator.sendBeacon(LOG,b)))fetch(LOG,{method:"POST",body:b,keepalive:true,mode:"no-cors"});}catch(e){}}
  function ok(c){if(!c||!c.aktiv||!(c.titel||c.tekst||c.billede))return false;var n=Date.now();
    if(c.start&&n<Date.parse(c.start))return false;if(c.slut&&n>Date.parse(c.slut))return false;
    try{if(sessionStorage.getItem("ospop-set")===c.id)return false;}catch(e){}return true;}
  function vis(c){
    if(document.getElementById("ospop"))return;
    try{sessionStorage.setItem("ospop-set",c.id);}catch(e){}
    var st=document.createElement("style");st.textContent=
     "#ospop{position:fixed;inset:0;z-index:2147483000;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;padding:16px;font-family:inherit}"+
     "#ospop .ospop-box{position:relative;background:#fff;border-radius:8px;max-width:520px;width:100%;max-height:92vh;overflow:auto;box-shadow:0 10px 40px rgba(0,0,0,.3);text-align:center}"+
     "#ospop img{display:block;width:100%;height:auto;border-radius:8px 8px 0 0}"+
     "#ospop .ospop-in{padding:20px 24px 24px}"+
     "#ospop h2{margin:0 0 10px;font-size:"+(c.titel_str||26)+"px;line-height:1.2;color:"+(c.titel_farve||"#000")+"}"+
     "#ospop p{margin:0 0 10px;font-size:"+(c.tekst_str||16)+"px;line-height:1.5;color:"+(c.tekst_farve||"#545454")+"}"+
     "#ospop .ospop-knap{display:inline-block;margin-top:8px;padding:10px 26px;border-radius:4px;font-weight:600;text-decoration:none!important;font-size:"+(c.knap_str||20)+"px}"+
     "#ospop .ospop-x{position:absolute;top:8px;right:8px;width:32px;height:32px;border-radius:50%;border:0;background:rgba(0,0,0,.6);color:#fff;font-size:20px;line-height:32px;cursor:pointer;padding:0}"+
     "@media(max-width:480px){#ospop h2{font-size:22px}#ospop .ospop-in{padding:16px}}";
    document.head.appendChild(st);
    var img=c.billede?(/^https?:/.test(c.billede)?c.billede:base+c.billede):"";
    var d=document.createElement("div");d.id="ospop";d.setAttribute("role","dialog");d.setAttribute("aria-modal","true");
    d.innerHTML="<div class=\"ospop-box\"><button type=\"button\" class=\"ospop-x\" aria-label=\"Luk\">&times;</button>"+(img?"<img src=\""+esc(img)+"\" alt=\"\">":"")+
      "<div class=\"ospop-in\">"+(c.titel?"<h2>"+esc(c.titel)+"</h2>":"")+String(c.tekst||"").split(/\n+/).filter(Boolean).map(function(l){return "<p>"+esc(l)+"</p>";}).join("")+
      (c.knap&&c.link?"<a class=\"ospop-knap\" href=\""+esc(c.link)+"\" style=\"background:"+esc(c.knap_bg||"#2b7e2a")+";color:"+esc(c.knap_fg||"#fff")+"!important\">"+esc(c.knap)+"</a>":"")+"</div></div>";
    function luk(){d.remove();document.removeEventListener("keydown",kd);}
    function kd(e){if(e.key==="Escape")luk();}
    d.addEventListener("click",function(e){if(e.target===d||e.target.closest(".ospop-x"))luk();else if(e.target.closest(".ospop-knap"))log(c.id);});
    document.addEventListener("keydown",kd);document.body.appendChild(d);
  }
  fetch(base+"karrusel/config.json").then(function(r){return r.json();}).then(function(k){if(k&&k.popup)return k.popup;throw 0;}).catch(function(){return fetch(base+"popup/config.json").then(function(r){return r.json();});}).then(function(cfg){
    var c=cfg&&cfg[K];if(!ok(c))return;
    setTimeout(function(){if(document.body)vis(c);},Math.max(0,(c.forsinkelse==null?3:c.forsinkelse))*1000);
  }).catch(function(){});
})();
