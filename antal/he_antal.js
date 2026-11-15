/* HE: "Antal produkter: N" over produktlisten i kategorier (som på ØS). Kun HE. */
(function(){
function txt(n){return "Antal produkter: "+n;}
function run(){
if(!document.body||!document.body.classList.contains("webshop-productlist"))return;
if(document.getElementById("heAntal"))return;
var ul=document.querySelector("#Content_Productlist .ProductList_Custom_UL");
if(!ul)return;
var d=document.createElement("div");
d.id="heAntal";d.className="he-antal";
d.style.cssText="margin:1.2rem 0 .8rem;font-size:15px;color:#333";
ul.parentNode.insertBefore(d,ul);
var n=ul.children.length;
var pg=document.querySelector(".pager");
var m=pg&&pg.textContent.match(/Side\s*(\d+)\s*\/\s*(\d+)/);
var cur=m?+m[1]:1,last=m?+m[2]:1;
if(last<=1){if(n>0)d.textContent=txt(n);else d.remove();return;}
var base=location.pathname.match(/^(.*c)\d+\.html$/);
if(!base){d.remove();return;}
function cnt(p){return fetch(base[1]+p+".html",{credentials:"same-origin"}).then(function(r){return r.text();}).then(function(h){var x=new DOMParser().parseFromString(h,"text/html").querySelector(".ProductList_Custom_UL");return x?x.children.length:0;});}
var size=cur<last?Promise.resolve(n):cnt(1);
var lastN=cur===last?Promise.resolve(n):cnt(last);
Promise.all([size,lastN]).then(function(v){if(v[0]>0)d.textContent=txt((last-1)*v[0]+v[1]);else d.remove();}).catch(function(){d.remove();});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",run);else run();
})();
