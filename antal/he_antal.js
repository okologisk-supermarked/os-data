/* HE: "Antal produkter: N" + sortering (Bedst sælgende / Pris stigende / Pris faldende) over produktlisten i kategorier, som på ØS. Kun HE.
   Sorteringen bruger DanDomains egen funktion (AjaxWrapper.asp?FC=changesortorder), som gemmer valget i kundens session. */
(function(){
var OPT=[["Default","Bedst sælgende"],["price_asc","Pris stigende"],["price_desc","Pris faldende"]];
function txt(n){return "Antal produkter: "+n;}
function gem(v){try{sessionStorage.setItem("heSort",v);}catch(e){}}
function hent(){try{return sessionStorage.getItem("heSort")||"Default";}catch(e){return "Default";}}
function run(){
if(!document.body||!document.body.classList.contains("webshop-productlist"))return;
if(document.getElementById("heAntal"))return;
var ul=document.querySelector("#Content_Productlist .ProductList_Custom_UL");
if(!ul)return;
var row=document.createElement("div");
row.id="heAntal";row.className="he-antal";
row.style.cssText="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:.6rem;margin:1.2rem 0 .8rem;font-size:15px;color:#333";
var d=document.createElement("span");row.appendChild(d);
var s=document.createElement("select");
s.setAttribute("aria-label","Sortér varer");
s.style.cssText="min-width:220px;height:36px;padding:0 .6rem;border:1px solid #ccc;border-radius:4px;background:#fff;font-size:15px;color:#333;cursor:pointer";
var cur=hent();
OPT.forEach(function(o){var op=document.createElement("option");op.value=o[0];op.textContent=o[1];if(o[0]===cur)op.selected=true;s.appendChild(op);});
s.onchange=function(){var v=s.value;gem(v);s.disabled=true;
fetch("/shop/AjaxWrapper.asp?FC=changesortorder&SortField="+encodeURIComponent(v),{credentials:"same-origin"}).then(function(){location.href=location.pathname.replace(/c\d+\.html$/,"c1.html");}).catch(function(){location.reload();});};
row.appendChild(s);
var osf=document.getElementById("osf");(osf&&osf.parentNode===ul.parentNode?osf:ul).parentNode.insertBefore(row,osf&&osf.parentNode===ul.parentNode?osf:ul);
var n=ul.children.length;
var pg=document.querySelector(".pager");
var m=pg&&pg.textContent.match(/Side\s*(\d+)\s*\/\s*(\d+)/);
var c=m?+m[1]:1,last=m?+m[2]:1;
if(last<=1){if(n>0)d.textContent=txt(n);return;}
var base=location.pathname.match(/^(.*c)\d+\.html$/);
if(!base)return;
function cnt(p){return fetch(base[1]+p+".html",{credentials:"same-origin"}).then(function(r){return r.text();}).then(function(h){var x=new DOMParser().parseFromString(h,"text/html").querySelector(".ProductList_Custom_UL");return x?x.children.length:0;});}
var size=c<last?Promise.resolve(n):cnt(1);
var lastN=c===last?Promise.resolve(n):cnt(last);
Promise.all([size,lastN]).then(function(v){if(v[0]>0)d.textContent=txt((last-1)*v[0]+v[1]);}).catch(function(){});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",run);else run();
})();
