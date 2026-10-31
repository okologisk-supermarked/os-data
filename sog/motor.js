// Søgemotor til Økologisk-Supermarked (kører i browseren; testes i node)
(function(root){
function norm(s){return String(s||"").toLowerCase().replace(/[éèêë]/g,"e").replace(/[áàâä]/g,"a").replace(/[óòôö]/g,"ø").replace(/[úùûü]/g,"u").replace(/[íìîï]/g,"i").replace(/ß/g,"ss");}
function words(s){return norm(s).split(/[^0-9a-zæøå]+/).filter(Boolean);}
function variants(t){var v=[t];if(/aa/.test(t))v.push(t.replace(/aa/g,"å"));if(/oe/.test(t))v.push(t.replace(/oe/g,"ø"));if(/ae/.test(t))v.push(t.replace(/ae/g,"æ"));return v;}
function lev1(a,b){if(Math.abs(a.length-b.length)>1)return false;var i=0,j=0,e=0;while(i<a.length&&j<b.length){if(a[i]===b[j]){i++;j++;continue;}if(++e>1)return false;if(a.length>b.length)i++;else if(b.length>a.length)j++;else{i++;j++;}}return e+(a.length-i)+(b.length-j)<=1;}
var STOP={"og":1,"i":1,"med":1,"til":1,"af":1,"for":1,"en":1,"et":1,"de":1,"den":1,"det":1,"på":1,"uden":0};
function Motor(data,cfg){
  cfg=cfg||{};this.cfg=cfg;this.P=data.p;this.K=data.k||{};this.B=data.b||{};
  this.syn={};var s=cfg.synonymer||{};for(var k in s){var a=[k].concat(s[k]).map(norm);for(var i=0;i<a.length;i++){this.syn[a[i]]=(this.syn[a[i]]||[]).concat(a.filter(function(x){return x!==a[i];}));}}
  this.skjul={};(cfg.skjul||[]).forEach(function(n){this.skjul[n]=1;},this);
  this.top=cfg.top||{};
  this.D=this.P.map(function(p){return {n:words(p[1]),b:words(p[6]),c:words(p[7]),nr:norm(p[0]),ean:p[9],s:Math.log(1+(p[8]||0))};});
}
Motor.prototype.tok=function(q,D){
  var best=0;
  for(var i=0;i<D.n.length;i++){var w=D.n[i];
    if(w===q){best=Math.max(best,12);}
    else if(w.indexOf(q)===0){best=Math.max(best,q.length>=3?9:6);}
    else if(q.length>=4&&w.length>q.length&&w.slice(-q.length)===q){best=Math.max(best,8);} // instantkaffe
    else if(q.length>=5&&w.indexOf(q)>0){best=Math.max(best,5);}}
  for(i=0;i<D.b.length;i++){var b=D.b[i];if(b===q)best=Math.max(best,8);else if(q.length>=3&&b.indexOf(q)===0)best=Math.max(best,6);}
  for(i=0;i<D.c.length;i++){var c=D.c[i];if(c===q)best=Math.max(best,5);else if(q.length>=3&&c.indexOf(q)===0)best=Math.max(best,4);else if(q.length>=4&&c.length>q.length&&c.slice(-q.length)===q)best=Math.max(best,3);}
  if(!best&&q.length>=5){for(i=0;i<D.n.length;i++){var w2=D.n[i];if(lev1(q,w2)||(w2.length>q.length&&lev1(q,w2.slice(0,q.length))))best=Math.max(best,4);}}
  if(!best&&q.length>=4&&(D.nr===q||D.ean===q))best=20;
  return best;
};
Motor.prototype.sog=function(qs,max){
  max=max||60;var raw=words(qs);if(!raw.length)return {varer:[],grupper:[],brands:[]};
  var toks=raw.filter(function(t){return !STOP[t];});if(!toks.length)toks=raw;
  var self=this,alts=toks.map(function(t){var v=variants(t);(self.syn[t]||[]).forEach(function(x){v=v.concat(words(x).length>1?[]:[x]);});return v;});
  var res=[];
  for(var i=0;i<this.P.length;i++){var p=this.P[i];if(this.skjul[p[0]])continue;var D=this.D[i],sum=0,hit=0;
    for(var j=0;j<alts.length;j++){var b=0;for(var k=0;k<alts[j].length;k++){var sc=this.tok(alts[j][k],D);if(k>0)sc*=0.9;if(sc>b)b=sc;}if(b){hit++;sum+=b;}}
    if(hit<alts.length&&!(alts.length>=3&&hit>=alts.length-1))continue;
    var score=sum/alts.length*(hit/alts.length);
    // varen ER det man søger (ordet står i varens kategori) -> samme niveau som når navnet starter med ordet
    var kat=0;for(j=0;j<alts.length&&!kat;j++)for(k=0;k<alts[j].length;k++){var t=alts[j][k];if(t.length>=3&&D.c.some(function(c){return c===t||c.indexOf(t)===0||(t.length>=4&&c.slice(-t.length)===t);})){kat=1;break;}}
    var forst=D.n.length&&alts[0].indexOf(D.n[0])>=0;
    if(kat)score+=4;else if(forst)score+=2;
    res.push([Math.round(score),i,p[11]==null?99999:p[11],D.s]);}
  // fremhævede varer for søgeordet
  var key=norm(qs).trim(),top=this.top[key]||[];
  res.sort(function(a,b){return b[0]-a[0]||a[2]-b[2]||b[3]-a[3];}); // 1) hvor godt ordet passer, 2) sorteringstallet (lavest først), 3) salg
  var out=res.slice(0,max).map(function(r){return self.P[r[1]];});
  if(top.length){var idx={};self.P.forEach(function(p,i){idx[p[0]]=i;});var tp=top.map(function(n){return self.P[idx[n]];}).filter(Boolean);out=tp.concat(out.filter(function(p){return top.indexOf(p[0])<0;})).slice(0,max);}
  var grupper=Object.keys(this.K).filter(function(n){var w=words(n);return toks.every(function(t){return w.some(function(x){return x.indexOf(t)===0||(t.length>=4&&x.slice(-t.length)===t);});});}).slice(0,8).map(function(n){return [n,self.K[n]];});
  var brands=Object.keys(this.B).filter(function(n){var w=words(n);return toks.every(function(t){return w.some(function(x){return x.indexOf(t)===0;});});}).slice(0,6).map(function(n){return [n,self.B[n]];});
  return {varer:out,grupper:grupper,brands:brands,antal:res.length};
};
Motor.prototype.foreslaa=function(qs){ // "mente du"
  var t=words(qs).pop();if(!t||t.length<4)return null;var best=null,bs=0,cnt={};
  this.D.forEach(function(D){D.n.forEach(function(w){if(w!==t&&lev1(t,w))cnt[w]=(cnt[w]||0)+1;});});
  for(var w in cnt)if(cnt[w]>bs){bs=cnt[w];best=w;}return best;
};
root.OSMotor=Motor;if(typeof module!=="undefined")module.exports=Motor;
})(typeof window!=="undefined"?window:this);
