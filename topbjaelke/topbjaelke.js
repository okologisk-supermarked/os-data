/* Topbjælke (erstatter Plugly alert bar) – ØS og HE. Ét budskab ad gangen fra topbjaelke/config.json.
   Klik logges som type "kar" med k = "t-<id>" (fanen Karrusel i søgelog-arket). Lukket bjælke huskes i resten af besøget. */
(function(){
  var HE=/helsekost-ekspres/i.test(location.hostname),K=HE?"he":"os";
  var LOG="https://script.google.com/macros/s/AKfycbwMFAsMPm7KFWa8JrEbZ-ZL4nZ9-Q4dU340nWvUjWDJ_z44GzKbde37SbcnfldfduS0/exec";
  var me=document.currentScript&&document.currentScript.src||"",base=me.replace(/topbjaelke\.js.*$/,"");
  // skjul Plugly's bjælke med det samme, så der ikke vises to
  var st=document.createElement("style");st.textContent=".bp_announcementBarContainer{display:none!important}"+
   ".os-tb{display:flex;align-items:center;justify-content:center;gap:14px;min-height:50px;padding:8px 44px;color:#fff;font-family:inherit;position:relative;box-sizing:border-box;text-align:center;flex-wrap:wrap}"+
   ".os-tb-badge{background:#0d0202;color:#fff;font-weight:700;font-size:15px;padding:3px 7px;border-radius:1px;letter-spacing:.02em}"+
   ".os-tb-tekst{font-size:"+(HE?"16px":"20px")+";line-height:1.25}"+
   ".os-tb-knap{display:inline-block;color:#fff!important;text-decoration:none!important;font-weight:700;font-size:"+(HE?"12px":"14px")+";padding:7px 14px;border-radius:2px;white-space:nowrap}"+
   ".os-tb-knap:hover{filter:brightness(1.1)}"+
   ".os-tb-x{position:absolute;right:12px;top:50%;transform:translateY(-50%);width:24px;height:24px;border-radius:50%;background:rgba(0,0,0,.55);color:#fff;border:0;cursor:pointer;font-size:15px;line-height:24px;padding:0}"+
   "@media(max-width:640px){.os-tb{gap:8px;padding:7px 38px 7px 10px;min-height:44px}.os-tb-tekst{font-size:14px}.os-tb-badge{font-size:12px}.os-tb-knap{font-size:12px;padding:6px 10px}}";
  (document.head||document.documentElement).appendChild(st);
  function ok(c){if(!c||!c.aktiv||!c.tekst)return false;var n=Date.now();
    if(c.start&&n<Date.parse(c.start))return false;if(c.slut&&n>Date.parse(c.slut))return false;
    try{if(sessionStorage.getItem("os-tb-luk")===c.id)return false;}catch(e){}return true;}
  function log(id){try{var b=JSON.stringify({type:"kar",e:"klik",k:("t-"+id).slice(0,20),nr:"",site:K});if(!(navigator.sendBeacon&&navigator.sendBeacon(LOG,b)))fetch(LOG,{method:"POST",body:b,keepalive:true,mode:"no-cors"});}catch(e){}}
  function esc(s){return String(s||"").replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c];});}
  function vis(c){
    if(document.getElementById("os-tb"))return;
    var d=document.createElement("div");d.id="os-tb";d.className="os-tb";d.style.background=c.bg||"#3f7e0c";
    d.innerHTML=(c.badge?"<span class=\"os-tb-badge\">"+esc(c.badge)+"</span>":"")+"<span class=\"os-tb-tekst\">"+esc(c.tekst)+"</span>"+
      (c.link&&c.knap?"<a class=\"os-tb-knap\" href=\""+esc(c.link)+"\" style=\"background:"+esc(c.knap_bg||"#e2231a")+"\">"+esc(c.knap)+"</a>":"")+
      "<button type=\"button\" class=\"os-tb-x\" aria-label=\"Luk\">&times;</button>";
    d.addEventListener("click",function(e){
      if(e.target.closest(".os-tb-x")){d.remove();try{sessionStorage.setItem("os-tb-luk",c.id);}catch(x){}return;}
      if(c.link&&!e.target.closest("a")){log(c.id);location.href=c.link;return;}
      if(e.target.closest("a"))log(c.id);
    });
    if(c.link)d.style.cursor="pointer";
    document.body.insertBefore(d,document.body.firstChild);
  }
  fetch(base+"config.json").then(function(r){return r.json();}).then(function(cfg){
    var c=cfg&&cfg[K];if(!ok(c))return;
    if(document.body)vis(c);else document.addEventListener("DOMContentLoaded",function(){vis(c);});
  }).catch(function(){});
})();
