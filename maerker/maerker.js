/* Mærker under produktbilledet (ØS og HE). Koder i felt 7 (#M1#M2#E3#FSC#...); #FSC# i tekn. dok. 2 virker også stadig.
   Skabelonen skriver <div id="labels" data-f7="..." data-fsc="...">; ellers læses de gamle <img data-tt>.
   Logoer, navne og forklaringer i maerker/maerker.json – nyt mærke = ny linje dér + logo i mappen. */
(function(){
  var me=document.currentScript&&document.currentScript.src||"",base=me.replace(/maerker\.js.*$/,"");
  var st=document.createElement("style");st.textContent="#labels[data-osm]{display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:14px}#labels[data-osm]>div{margin:0!important}#labels[data-osm] img{height:64px!important;width:auto!important;max-width:110px!important;object-fit:contain}#labels[data-osm]{position:relative!important}#labels[data-osm]>div{position:static!important;cursor:pointer}#labels[data-osm]>div>span{display:none!important;position:absolute!important;left:50%!important;right:auto!important;top:100%!important;bottom:auto!important;transform:translateX(-50%)!important;width:340px!important;max-width:92vw!important;box-sizing:border-box!important;text-align:left!important;background:#4a4a4a!important;color:#fff!important;padding:12px 14px!important;border-radius:8px!important;font-size:13px!important;line-height:1.45!important;z-index:60!important;margin:8px 0 0!important;box-shadow:0 4px 14px rgba(0,0,0,.2)}#labels[data-osm]>div:hover>span,#labels[data-osm]>div.osm-on>span{display:block!important}@media(max-width:640px){#labels[data-osm] img{height:52px!important}#labels[data-osm]>div>span{font-size:14px!important}}";document.head.appendChild(st);
  function run(){
    var box=document.getElementById("labels");if(!box||box.getAttribute("data-osm"))return;
    var f7=box.getAttribute("data-f7"),codes={};
    if(f7!==null){
      (f7||"").split("#").forEach(function(c){c=c.replace(/\s/g,"").toUpperCase();if(c)codes[c]=1;});
      if(/#FSC#/i.test(box.getAttribute("data-fsc")||""))codes.FSC=1;
    }else{
      [].forEach.call(box.querySelectorAll("img[data-tt]"),function(i){codes[(i.getAttribute("data-tt")||"").toUpperCase()]=1;});
    }
    box.setAttribute("data-osm","1");
    var x=new XMLHttpRequest();x.open("GET",base+"maerker.json");
    x.onload=function(){
      var L;try{L=JSON.parse(x.responseText);}catch(e){return;}
      var h="";
      L.forEach(function(m){if(!codes[m.k]||!m.img)return;
        h+='<div><img data-mk="'+m.k+'" src="'+base+m.img+'" alt="'+m.n+'" title="'+m.n+'">'+(m.t?'<span>'+m.t+'</span>':'')+'</div>';});
      box.innerHTML=h;
      [].forEach.call(box.children,function(d){d.addEventListener("click",function(e){var on=!d.classList.contains("osm-on");[].forEach.call(box.children,function(o){o.classList.remove("osm-on");});if(on)d.classList.add("osm-on");e.stopPropagation();});});
      document.addEventListener("click",function(){[].forEach.call(box.children,function(o){o.classList.remove("osm-on");});});
    };
    x.send();
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",run);else run();
})();
