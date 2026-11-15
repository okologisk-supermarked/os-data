/* Filterknapper i kategorierne (ØS og HE): Økologisk, Vegansk, Glutenfri, Sukkerfri, På lager, Discount.
   Data: sog/filter.json (ØS) / sog/filter_he.json (HE) – varenr -> bogstaver, bygges hver nat sammen med søgeindekset.
   o = Ø-mærket/EU-økologi, v = vegansk, g = glutenfri, s = sukkerfri (felt 7), l = på lager, d = i varegruppen Discount.
   Filtrerer varerne på siden uden genindlæsning. Har kategorien flere sider, hentes de øvrige sider, når et filter vælges. */
(function(){
var HE=/helsekost-ekspres/i.test(location.hostname);
var me=document.currentScript&&document.currentScript.src||"",base=me.replace(/filter\/kat_filter\.js.*$/,"");
var FN=[["o","Økologisk"],["v","Vegansk"],["g","Glutenfri"],["s","Sukkerfri"],["l","På lager"],["d","Discount"]];
var M=null,FILT="",box=null,alle=false,henter=false;
function cont(){return HE?document.querySelector("#Content_Productlist .ProductList_Custom_UL"):document.querySelector(".ProductList_Custom_DIV");}
function varer(c){return [].slice.call(c.children).filter(function(e){return e.querySelector&&e.querySelector("input[name=ProductID]");});}
function nr(e){var i=e.querySelector("input[name=ProductID]");return i?i.value.trim():"";}
function flag(e){return M[nr(e)]||"";}
function sider(){var pg=document.querySelector(".pager"),t=pg?pg.textContent:"",m=t.match(/Side\s*(\d+)\s*\/\s*(\d+)/);
  if(m)return {cur:+m[1],last:+m[2]};
  var a=[].slice.call(document.querySelectorAll("a[href]")).map(function(x){var h=x.getAttribute("href")||"",k=h.match(/c(\d+)\.html$/);return k&&h.split("/").pop().replace(/c\d+\.html$/,"")===location.pathname.split("/").pop().replace(/c\d+\.html$/,"")?+k[1]:0;});
  var last=Math.max.apply(null,[1].concat(a)),c=(location.pathname.match(/c(\d+)\.html$/)||[])[1];return {cur:+(c||1),last:last};}
function css(){if(document.getElementById("osf-css"))return;var s=document.createElement("style");s.id="osf-css";
  var g=HE?"#1e5b3a":"#2e7d32";
  s.textContent=".osf{display:flex;flex-wrap:nowrap;overflow-x:auto;white-space:nowrap;align-items:center;gap:8px;height:34px;margin:6px 0 14px;width:100%;scrollbar-width:none}.osf::-webkit-scrollbar{display:none}.osf a{background:#fff;border:1px solid #cfcfcf;border-radius:20px;padding:6px 12px;font-size:.85rem;line-height:1.2;color:#222;cursor:pointer;text-decoration:none;user-select:none}.osf a:hover{border-color:"+g+"}.osf a.on{background:"+g+";border-color:"+g+";color:#fff}.osf a.on:after{content:' \\00d7'}.osf .osf-n{font-size:.85rem;color:#666;margin-left:4px}";
  document.head.appendChild(s);}
function tegn(){
  var c=cont();if(!c||!box||!M)return;var L=varer(c),vis=0,t={};FN.forEach(function(f){t[f[0]]=0;});
  L.forEach(function(e){var fl=flag(e),ok=true;for(var i=0;i<FILT.length;i++)if(fl.indexOf(FILT[i])<0){ok=false;break;}
    e.style.display=ok?"":"none";if(ok){vis++;for(var k in t)if(fl.indexOf(k)>=0)t[k]++;}});
  var s=sider(),flere=s.last>1&&!alle;
  box.innerHTML=FN.filter(function(f){return FILT.indexOf(f[0])>=0||t[f[0]]>0||flere;}).map(function(f){var on=FILT.indexOf(f[0])>=0;
    return "<a data-f=\""+f[0]+"\" class=\""+(on?"on":"")+"\">"+f[1]+(on||flere?"":" ("+t[f[0]]+")")+"</a>";}).join("")+
    (FILT?"<span class=\"osf-n\">"+(henter?"Henter alle varer…":"Viser "+vis+" af "+L.length+" varer")+"</span>":"");
  [].forEach.call(document.querySelectorAll(".pager,.paging"),function(pg){pg.style.visibility=FILT&&alle?"hidden":"";});
}
function hentAlle(){
  var s=sider();if(alle||s.last<=1){alle=true;return Promise.resolve();}
  var m=location.pathname.match(/^(.*c)\d+\.html$/);if(!m){alle=true;return Promise.resolve();}
  henter=true;tegn();var c=cont(),sid=[];for(var i=1;i<=Math.min(s.last,10);i++)if(i!==s.cur)sid.push(i);
  return Promise.all(sid.map(function(p){return fetch(m[1]+p+".html",{credentials:"same-origin"}).then(function(r){return r.text();}).then(function(h){
      var d=new DOMParser().parseFromString(h,"text/html"),x=HE?d.querySelector("#Content_Productlist .ProductList_Custom_UL"):d.querySelector(".ProductList_Custom_DIV");
      return {p:p,el:x?varer(x):[]};}).catch(function(){return {p:p,el:[]};});}))
  .then(function(R){R.sort(function(a,b){return a.p-b.p;});var foer=document.createDocumentFragment(),efter=document.createDocumentFragment();
    R.forEach(function(r){r.el.forEach(function(e){[].forEach.call(e.querySelectorAll("img[loading]"),function(i){i.loading="lazy";});(r.p<s.cur?foer:efter).appendChild(document.importNode(e,true));});});
    c.insertBefore(foer,c.firstChild);c.appendChild(efter);alle=true;henter=false;});
}
function start(){
  if(!document.body||!document.body.classList.contains("webshop-productlist"))return;
  var c=cont();if(!c||document.getElementById("osf"))return;
  css();box=document.createElement("div");box.id="osf";box.className="osf";var ha=document.getElementById("heAntal");if(ha&&ha.parentNode===c.parentNode)ha.parentNode.insertBefore(box,ha.nextSibling);else c.parentNode.insertBefore(box,c);
  try{document.documentElement.classList.add("osf-klar");}catch(e){} // fjerner den reserverede plads (CLS)
  box.addEventListener("click",function(e){var a=e.target.closest("[data-f]");if(!a)return;e.preventDefault();var f=a.getAttribute("data-f");
    FILT=FILT.indexOf(f)>=0?FILT.replace(f,""):FILT+f;
    if(FILT&&!alle)hentAlle().then(tegn);else tegn();});
  fetch(base+"sog/"+(HE?"filter_he.json":"filter.json")).then(function(r){return r.json();}).then(function(d){M=d.m||{};tegn();}).catch(function(){box.style.display="none";});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start);else start();
})();
