/* Økologisk-Supermarked – egen Klaviyo-sporing (erstatter Plugly)
   Indlæses af sog/sog.js på alle ØS-sider (ikke Helsekost-Ekspres).
   - Henter Klaviyos script (onsite: popup + sporing), hvis det ikke allerede er der.
   - Sender Viewed Product, Added to Cart og Started Checkout med samme feltnavne som Plugly brugte,
     så flows (tabt kurv, browse abandonment m.m.) virker uændret.
   - Identificerer kunden ud fra e-mail i kassen.
   - Så længe Plugly stadig er aktiv på siden, sender scriptet IKKE egne events (undgår dobbelt-tælling). */
(function(){
if(window.__osKlav)return;window.__osKlav=1;
var COMPANY="YqREzg",SHOP="https://www.okologisk-supermarked.dk";
var BASE=(function(){var s=document.currentScript&&document.currentScript.src||"";var m=s.match(/^(.*os-data@[^\/]+\/)/);return m?m[1]:null;})();

function samtykke(){ // DanDomains cookie-banner: kræver samtykke til tracking-cookies, hvis banneret er slået til
  var C=window.CookiePolicy; if(!C||!C.cookiesRequireConsent)return true; return !!C.allowTrackingCookies;
}
function plugly(){return !!document.querySelector('script[src*="app.plugly.io"],script[src*="plus.bewise.dk/script"]');}
function harKlaviyo(){return !!document.querySelector('script[src*="static.klaviyo.com/onsite/js/klaviyo.js"]');}
function hentKlaviyo(){
  if(harKlaviyo())return;
  var s=document.createElement("script");s.async=true;s.type="text/javascript";
  s.src="https://static.klaviyo.com/onsite/js/klaviyo.js?company_id="+COMPANY;document.head.appendChild(s);
}
// Klaviyos officielle kø-stub (så klaviyo.push virker før scriptet er hentet)
!function(){if(!window.klaviyo){window._klOnsite=window._klOnsite||[];try{window.klaviyo=new Proxy({},{get:function(n,i){return"push"===i?function(){var n;(n=window._klOnsite).push.apply(n,arguments)}:function(){for(var n=arguments.length,o=new Array(n),w=0;w<n;w++)o[w]=arguments[w];var t="function"==typeof o[o.length-1]?o.pop():void 0,e=new Promise((function(n){window._klOnsite.push([i].concat(o,[function(i){t&&t(i),n(i)}]))}));return e}}})}catch(n){window.klaviyo=window.klaviyo||[],window.klaviyo.push=function(){var n;(n=window._klOnsite).push.apply(n,arguments)}}}}();

function abs(u){if(!u)return"";if(/^https?:/i.test(u))return u;return SHOP+(u.charAt(0)=="/"?"":"/")+u;}
function txt(el){return el?(el.textContent||"").replace(/\s+/g," ").trim():"";}
function num(x){var n=parseFloat(String(x).replace(/\./g,"").replace(",","."));return isNaN(n)?0:n;}
function rund(n){return Math.round(n*100)/100;}

// DanDomains egne gtag-events ligger i dataLayer som [ "event", navn, {items:[...]} ]
function gtagEvent(navn){
  var dl=window.dataLayer||[];
  for(var i=0;i<dl.length;i++){var a=dl[i];
    if(a&&a[0]==="event"&&a[1]===navn&&a[2]&&a[2].items&&a[2].items.length&&a[2].items[0].name)return a[2].items;}
  return null;
}

var IDX=null;
function indeks(){ // produktdata (billede, url) fra søgeindekset – kun når der er brug for det
  if(IDX)return IDX;
  IDX=new Promise(function(ok){
    if(!BASE)return ok({});
    fetch(BASE+"sog/indeks.json").then(function(r){return r.json();}).then(function(d){
      var m={};(d.p||[]).forEach(function(p){m[String(p[0]).toLowerCase()]={url:abs(p[2]),img:abs(p[3]),brand:p[6]||"",kat:p[7]||""};});ok(m);
    }).catch(function(){ok({});});
  });
  return IDX;
}
function vare(it,m){
  var x=m[String(it.id).toLowerCase()]||{};var q=Number(it.quantity)||1,pr=rund(Number(it.price)||0);
  return {ProductID:String(it.id),SKU:String(it.id),ProductName:it.name,Quantity:q,ItemPrice:pr,RowTotal:rund(pr*q),
    ProductURL:x.url||(SHOP+"/shop/default.asp?productid="+encodeURIComponent(it.id)),ImageURL:x.img||"",
    Brand:it.brand||x.brand||"",ProductCategories:[it.category||x.kat].filter(Boolean)};
}

function seteVare(){
  var items=gtagEvent("view_item");if(!items)return;var it=items[0];
  var og=document.querySelector('meta[property="og:image"]');
  var kat=[].map.call(document.querySelectorAll('.BreadCrumb_ProductInfo [itemprop="itemListElement"] [itemprop="name"]'),txt).filter(Boolean);
  var pr=rund(Number(it.price)||num(txt(document.querySelector('[itemprop="price"]'))));
  var url=(document.querySelector('meta[property="og:url"]')||{}).content||location.href.split("?")[0];
  var img=abs(og&&og.content);
  var ev={ProductName:it.name,ProductID:String(it.id),SKU:String(it.id),Categories:kat.length?kat:[it.category].filter(Boolean),
    ImageURL:img,URL:url,Brand:it.brand||"",Price:pr};
  klaviyo.push(["track","Viewed Product",ev]);
  klaviyo.push(["trackViewedItem",{Title:ev.ProductName,ItemId:ev.ProductID,Categories:ev.Categories,ImageUrl:img,Url:url,Metadata:{Brand:ev.Brand,Price:pr}}]);
}

function kurvEvents(addLive){
  var add=addLive||gtagEvent("add_to_cart"),co=addLive?null:(/\/checkout/i.test(location.pathname)?gtagEvent("begin_checkout"):null);
  if(!add&&!co)return;
  indeks().then(function(m){
    var ref=co||add,items=ref.map(function(it){return vare(it,m);});
    var tot=rund(items.reduce(function(s,i){return s+i.RowTotal;},0));
    var base={$value:tot,ItemNames:items.map(function(i){return i.ProductName;}),Items:items,CheckoutURL:SHOP+"/shop/checkout.html"};
    if(add&&!co){ // Added to Cart: kun ét event pr. side
      var a=vare(add[0],m),k=Object.assign({},base,{AddedItemProductName:a.ProductName,AddedItemProductID:a.ProductID,AddedItemSKU:a.SKU,
        AddedItemImageURL:a.ImageURL,AddedItemURL:a.ProductURL,AddedItemPrice:a.ItemPrice,AddedItemQuantity:a.Quantity,AddedItemCategories:a.ProductCategories});
      klaviyo.push(["track","Added to Cart",k]);
    }
    if(co){ // kun når kunden er kendt (ellers sendes det, når e-mailen er tastet)
      var sig=items.map(function(i){return i.ProductID+"x"+i.Quantity;}).join(",");
      Promise.resolve(klaviyo.isIdentified?klaviyo.isIdentified():false).then(function(kendt){
        if(!kendt)return;
        try{if(sessionStorage.getItem("osKlavCo")===sig)return;sessionStorage.setItem("osKlavCo",sig);}catch(e){}
        base.$event_id="co_"+sig.replace(/[^\w,]/g,"")+"_"+Math.floor(Date.now()/3600000);
        klaviyo.push(["track","Started Checkout",base]);
      });
    }
  });
}

function kasseIdentify(){ // e-mail i kassen → kendt profil (så tabt kurv kan sendes)
  if(!/\/checkout/i.test(location.pathname))return;
  var sendt="";
  function tjek(){
    var e=document.getElementById("checkout_customer_email");if(!e)return;
    var v=(e.value||"").trim().toLowerCase();if(!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/.test(v)||v===sendt)return;sendt=v;
    var p={email:v},n=document.getElementById("checkout_customer_name");
    if(n&&n.value.trim()){var d=n.value.trim().split(/\s+/);p.first_name=d.shift();if(d.length)p.last_name=d.join(" ");}
    Promise.resolve(klaviyo.identify(p)).then(function(){setTimeout(kurvEvents,500);});
  }
  document.addEventListener("change",function(ev){if(ev.target&&/checkout_customer_(email|name)/.test(ev.target.id))tjek();},true);
  document.addEventListener("blur",function(ev){if(ev.target&&ev.target.id==="checkout_customer_email")tjek();},true);
  setTimeout(tjek,1500);
}

function start(){
  if(window.__osKlavStart||!samtykke())return;window.__osKlavStart=1;
  if(plugly())return; // Plugly henter stadig Klaviyo og sender events – vi gør intet, før Plugly er slået fra
  hentKlaviyo();
  try{seteVare();}catch(e){}
  try{kurvEvents();}catch(e){}
  try{kasseIdentify();}catch(e){}
  try{ // læg-i-kurv uden sideskift (ajax): DanDomain kalder gtag('event','add_to_cart',…) → dataLayer.push
    var dl=window.dataLayer=window.dataLayer||[],org=dl.push;
    dl.push=function(a){try{if(a&&a[0]==="event"&&a[1]==="add_to_cart"&&a[2]&&a[2].items&&a[2].items.length)kurvEvents(a[2].items);}catch(e){}return org.apply(dl,arguments);};
  }catch(e){}
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){setTimeout(start,300);});else setTimeout(start,300);
// Hvis kunden accepterer cookies senere på siden
document.addEventListener("click",function(e){if(e.target&&e.target.closest&&e.target.closest(".cookie-policy-accept,.cookie-policy-button,#cookie-policy-accept-button"))setTimeout(start,800);},true);
})();
