/* Kassen (checkout.html) på ØS og HE: "Modtag nyhedsbrev"-fluebenet → Klaviyo-listen for shoppen.
   Erstatter Plugly's Klaviyo-app (slået fra). Bruger samme vej som nyhedsbrevsfeltet i bunden af siden:
   Bewise' /Respons/bewise/klaviyo.asp med listen fra newsletterConfig.klaviyoListId (ØS SEZXEr, HE TV44TF).
   Sendes, når kunden trykker "Godkend og betal" med fluebenet sat og handelsbetingelserne accepteret. */
(function(){
if(window.__osNyhed)return;window.__osNyhed=1;
if(!/checkout/i.test(location.pathname))return;
var LISTE=(window.newsletterConfig&&window.newsletterConfig.klaviyoListId)||(/helsekost-ekspres/i.test(location.hostname)?"TV44TF":"SEZXEr");
function v(id){var e=document.getElementById(id);return e?String(e.value||"").trim():"";}
function chk(id){var e=document.getElementById(id);return !!(e&&e.checked);}
function send(){
  if(!chk("subscription-maillist-subscribe"))return;
  var t=document.getElementById("acceptTermsBit");if(t&&!t.checked)return;
  var email=v("checkout_customer_email").toLowerCase();if(!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/.test(email))return;
  try{if(sessionStorage.getItem("osNyhed")===email)return;sessionStorage.setItem("osNyhed",email);}catch(e){}
  var n=v("checkout_customer_name").split(/\s+/),fn=n.shift()||"",ln=n.join(" ");
  var q="list="+encodeURIComponent(LISTE)+"&email="+encodeURIComponent(email)+"&fname="+encodeURIComponent(fn)+"&lname="+encodeURIComponent(ln)+"&country=Denmark";
  try{fetch("/Respons/bewise/klaviyo.asp?"+q,{method:"POST",keepalive:true,credentials:"same-origin"}).catch(function(){});}catch(e){}
}
document.addEventListener("click",function(e){if(e.target&&e.target.closest&&e.target.closest("#confirm-complete-button"))send();},true);
document.addEventListener("submit",function(e){if(e.target&&e.target.querySelector&&e.target.querySelector("#confirm-complete-button"))send();},true);
})();
