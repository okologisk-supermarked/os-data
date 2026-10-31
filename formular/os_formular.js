(function(){
var URL="https://script.google.com/macros/s/AKfycbwMFAsMPm7KFWa8JrEbZ-ZL4nZ9-Q4dU340nWvUjWDJ_z44GzKbde37SbcnfldfduS0/exec";
var CSS=".osf-bg{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:100000;display:flex;align-items:flex-start;justify-content:center;overflow-y:auto;padding:4vh 12px}"+
".osf{background:#fff;border-radius:10px;max-width:520px;width:100%;padding:22px 22px 18px;box-shadow:0 10px 40px rgba(0,0,0,.3);position:relative;font-size:15px;color:#222}"+
".osf h3{margin:0 0 4px;font-size:1.35rem}.osf .osf-sub{margin:0 0 14px;color:#666;font-size:.9rem}"+
".osf label{display:block;font-weight:600;font-size:.85rem;margin:10px 0 4px}.osf input,.osf textarea,.osf select{width:100%;box-sizing:border-box;border:1px solid #ccc;border-radius:6px;padding:9px 10px;font-size:15px;margin:0;height:auto;box-shadow:none}"+
".osf textarea{min-height:80px;resize:vertical}.osf .osf-row{display:flex;gap:10px}.osf .osf-row>div{flex:1}"+
".osf .osf-x{position:absolute;top:8px;right:10px;border:0;background:none;font-size:26px;line-height:1;cursor:pointer;color:#666}"+
".osf .osf-btn{display:block;width:100%;margin-top:16px;background:#2e7d32;color:#fff;border:0;border-radius:6px;padding:12px;font-size:1rem;font-weight:700;cursor:pointer}.osf .osf-btn[disabled]{opacity:.6;cursor:wait}"+
".osf .osf-note{background:#fff8e1;border:1px solid #ffe08a;border-radius:6px;padding:8px 10px;font-size:.82rem;margin:8px 0 0;color:#5c4400}"+
".osf .osf-err{color:#c62828;font-size:.85rem;margin-top:8px;display:none}.osf .osf-ok{text-align:center;padding:20px 0}.osf .osf-ok b{display:block;font-size:1.2rem;margin:8px 0}"+
".osf .osf-hp{position:absolute;left:-5000px;width:1px;height:1px;overflow:hidden}.osf .osf-thumbs{display:flex;gap:6px;margin-top:6px;flex-wrap:wrap}.osf .osf-thumbs img{width:56px;height:56px;object-fit:cover;border-radius:4px;border:1px solid #ddd}"+
"@media (max-width:480px){.osf .osf-row{display:block}}";
function el(h){var d=document.createElement("div");d.innerHTML=h;return d.firstChild;}
function field(n,l,req,type,ph){return "<div><label>"+l+(req?" *":"")+"</label><input name=\""+n+"\" type=\""+(type||"text")+"\""+(req?" required":"")+(ph?" placeholder=\""+ph+"\"":"")+"></div>";}
function resize(file,cb){var r=new FileReader();r.onload=function(){var img=new Image();img.onload=function(){var m=1600,w=img.width,h=img.height,s=Math.min(1,m/Math.max(w,h));var c=document.createElement("canvas");c.width=Math.round(w*s);c.height=Math.round(h*s);c.getContext("2d").drawImage(img,0,0,c.width,c.height);cb(c.toDataURL("image/jpeg",.82));};img.onerror=function(){cb(null);};img.src=r.result;};r.readAsDataURL(file);}
function open(type){
var fortryd=type!=="reklamation";
var h="<div class=\"osf-bg\"><div class=\"osf\" role=\"dialog\" aria-modal=\"true\"><button type=\"button\" class=\"osf-x\" aria-label=\"Luk\">&times;</button>"+
"<h3>"+(fortryd?"Fortryd dit køb":"Reklamation")+"</h3><p class=\"osf-sub\">"+(fortryd?"Udfyld formularen, så vender vi tilbage med besked om returnering og tilbagebetaling.":"Beskriv fejlen, så finder vi en løsning hurtigst muligt.")+"</p>"+
"<form novalidate><div class=\"osf-hp\"><input name=\"website\" tabindex=\"-1\" autocomplete=\"off\"></div>"+
"<div class=\"osf-row\">"+field("fornavn","Fornavn",1)+field("efternavn","Efternavn",1)+"</div>"+
"<div class=\"osf-row\">"+field("email","E-mail",1,"email")+field("telefon","Telefon",0,"tel")+"</div>"+
field("ordre","Ordrenummer",1,"text","Fx 246519")+
"<div><label>"+(fortryd?"Hvilke varer vil du fortryde? *":"Hvilken vare drejer det sig om? *")+"</label><textarea name=\"varer\" required placeholder=\""+(fortryd?"Skriv varenavn og antal – eller &quot;hele ordren&quot;":"Varenavn")+"\"></textarea></div>"+
(fortryd?"<p class=\"osf-note\"><b>Bemærk:</b> Der er ingen fortrydelsesret på fødevarer. Er en vare fejlbehæftet, så brug i stedet reklamationsformularen.</p>":
"<div><label>Beskriv fejlen *</label><textarea name=\"beskrivelse\" required></textarea></div>"+
"<div><label>Ønsket løsning</label><select name=\"losning\"><option>Ny vare</option><option>Penge retur</option><option>Andet (skriv i kommentar)</option></select></div>"+
"<div><label>Billeder af fejlen (højst 4)</label><input name=\"billeder\" type=\"file\" accept=\"image/*\" multiple><div class=\"osf-thumbs\"></div></div>")+
"<div><label>Kommentar</label><textarea name=\"kommentar\" style=\"min-height:60px\"></textarea></div>"+
"<div class=\"osf-err\"></div><button type=\"submit\" class=\"osf-btn\">"+(fortryd?"Send fortrydelse":"Send reklamation")+"</button></form></div></div>";
var bg=el(h),box=bg.querySelector(".osf"),f=bg.querySelector("form"),err=bg.querySelector(".osf-err"),imgs=[];
function close(){bg.parentNode&&bg.parentNode.removeChild(bg);document.removeEventListener("keydown",esc);}
function esc(e){if(e.key==="Escape")close();}
bg.addEventListener("click",function(e){if(e.target===bg)close();});bg.querySelector(".osf-x").onclick=close;document.addEventListener("keydown",esc);
var fi=f.querySelector("input[type=file]");if(fi)fi.onchange=function(){imgs=[];var th=f.querySelector(".osf-thumbs");th.innerHTML="";var fs=[].slice.call(fi.files,0,4);fs.forEach(function(file){resize(file,function(u){if(!u)return;imgs.push(u);var i=document.createElement("img");i.src=u;th.appendChild(i);});});};
f.onsubmit=function(e){e.preventDefault();err.style.display="none";
var v=function(n){var x=f.elements[n];return x?String(x.value||"").trim():"";};
var miss=[].slice.call(f.querySelectorAll("[required]")).filter(function(x){return !String(x.value||"").trim();});
if(miss.length||!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v("email"))){err.textContent=miss.length?"Udfyld venligst alle felter med *.":"Tjek venligst din e-mail.";err.style.display="block";(miss[0]||f.elements.email).focus();return;}
var data={type:fortryd?"fortryd":"reklamation",website:v("website"),fornavn:v("fornavn"),efternavn:v("efternavn"),email:v("email"),telefon:v("telefon"),ordre:v("ordre"),varer:v("varer"),beskrivelse:v("beskrivelse"),losning:v("losning"),kommentar:v("kommentar"),
billeder:imgs.map(function(u){return {type:"image/jpeg",data:u.split(",")[1]};})};
var b=f.querySelector(".osf-btn");b.disabled=true;b.textContent="Sender…";
fetch(URL,{method:"POST",body:JSON.stringify(data)}).then(function(r){return r.json();}).then(function(j){
if(j&&j.ok){box.innerHTML="<button type=\"button\" class=\"osf-x\" aria-label=\"Luk\">&times;</button><div class=\"osf-ok\"><div style=\"font-size:2.4rem;color:#2e7d32\">✓</div><b>Tak, vi har modtaget din "+(fortryd?"fortrydelse":"reklamation")+"</b>Du får en kvittering på "+data.email.replace(/</g,"")+".<br>Vi vender tilbage hurtigst muligt.</div>";box.querySelector(".osf-x").onclick=close;}
else{throw new Error(j&&j.fejl||"fejl");}
}).catch(function(x){b.disabled=false;b.textContent=fortryd?"Send fortrydelse":"Send reklamation";err.textContent=(x&&x.message&&x.message!=="fejl"&&x.message.length<120&&!/fetch|JSON|network/i.test(x.message))?x.message:"Det lykkedes ikke at sende. Prøv igen, eller skriv til info@okologisk-supermarked.dk.";err.style.display="block";});};
document.body.appendChild(bg);setTimeout(function(){var x=f.elements.fornavn;x&&x.focus();},50);}
function which(href){href=String(href||"");if(/#(bp_form_4|os-fortryd)/.test(href))return "fortryd";if(/#(bp_form_3399|os-reklamation)/.test(href))return "reklamation";return null;}
document.addEventListener("click",function(e){var a=e.target.closest&&e.target.closest("a[href*='#']");if(!a)return;var t=which(a.getAttribute("href"));if(!t)return;e.preventDefault();e.stopImmediatePropagation();open(t);},true);
window.osOpenForm=open;
function start(){var st=document.createElement("style");st.textContent=CSS;document.head.appendChild(st);var t=which(location.hash);if(t)setTimeout(function(){open(t);},400);}
if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",start);}else{start();}
})();
