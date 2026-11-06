// Økologisk-Supermarked: Fortryd dit køb / Reklamation
// Modtager formularen fra webshoppen og sender den til info@ + kvittering til kunden.
var TIL = 'info@okologisk-supermarked.dk';
var BUTIK = 'Økologisk-Supermarked';

function doGet(e) {
  if (e && e.parameter && e.parameter.a === 'pop') return svar(populaere(e.parameter.s === 'he' ? 'he' : 'os'));
  return ContentService.createTextOutput('OK');
}

// ---- Søgelog til den nye søgning (kun søgeord, antal resultater og et tilfældigt session-id) ----
function logSog(d) {
  var q = rens(d.q).toLowerCase().replace(/\s+/g, ' ').slice(0, 40);
  if (q.length < 2 || /@/.test(q)) return svar({ ok: true });
  var sid = rens(d.sid).replace(/[^a-z0-9]/gi, '').slice(0, 16) || 'x';
  var n = parseInt(d.n, 10) || 0;
  var site = d.site === 'he' ? 'he' : 'os';
  var lock = LockService.getScriptLock();
  try { lock.waitLock(5000); sogArk().appendRow([new Date(), q, n, sid, site]); } catch (x) {} finally { try { lock.releaseLock(); } catch (y) {} }
  return svar({ ok: true });
}

// ---- Karruseller: klik og salg pr. karrusel pr. dag (fanen "Karrusel" i søgelog-arket) ----
// Én række pr. dag, shop og karrusel: Dato | Shop | Karrusel | Klik | Ordrer | Stk | Beløb. Ingen persondata.
function logKar(d) {
  var site = d.site === 'he' ? 'he' : 'os';
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(5000);
    var sh = karArk(), dato = Utilities.formatDate(new Date(), 'Europe/Copenhagen', 'yyyy-MM-dd');
    var add = {};
    function plus(k, kl, o, stk, kr) {
      k = rens(k).replace(/[^a-z0-9_-]/gi, '').slice(0, 20); if (!k) return;
      var a = add[k] = add[k] || [0, 0, 0, 0]; a[0] += kl; a[1] += o; a[2] += stk; a[3] += kr;
    }
    if (d.e === 'klik') plus(d.k, 1, 0, 0, 0);
    else if (d.e === 'salg' && d.linjer && d.linjer.length) {
      var set = {};
      d.linjer.slice(0, 50).forEach(function (l) {
        var kr = Math.max(0, Math.min(100000, Number(l.beloeb) || 0)), stk = Math.max(0, Math.min(1000, parseInt(l.antal, 10) || 0));
        plus(l.k, 0, set[l.k] ? 0 : 1, stk, kr); set[l.k] = 1;
      });
    }
    var n = sh.getLastRow(), fra = Math.max(2, n - 80), vals = n >= 2 ? sh.getRange(fra, 1, n - fra + 1, 7).getValues() : [];
    Object.keys(add).forEach(function (k) {
      var a = add[k], hit = -1;
      for (var i = vals.length - 1; i >= 0; i--) {
        var dv = vals[i][0] instanceof Date ? Utilities.formatDate(vals[i][0], 'Europe/Copenhagen', 'yyyy-MM-dd') : String(vals[i][0]);
        if (dv === dato && vals[i][1] === site && String(vals[i][2]) === k) { hit = i; break; }
      }
      if (hit >= 0) {
        var r = vals[hit]; sh.getRange(fra + hit, 4, 1, 4).setValues([[Number(r[3]) + a[0], Number(r[4]) + a[1], Number(r[5]) + a[2], Math.round((Number(r[6]) + a[3]) * 100) / 100]]);
      } else {
        sh.appendRow([dato, site, k, a[0], a[1], a[2], Math.round(a[3] * 100) / 100]);
        vals.push([dato, site, k, a[0], a[1], a[2], a[3]]);
      }
    });
    karKomprimer(sh);
  } catch (x) {} finally { try { lock.releaseLock(); } catch (y) {} }
  return svar({ ok: true });
}

// Én gang i døgnet: dagsrækker ældre end 35 dage lægges sammen til månedsrækker (Dato = 'ÅÅÅÅ-MM'),
// og måneder ældre end 13 måneder slettes. Så holder arket sig lille (ca. 1.000 rækker).
function karKomprimer(sh) {
  var p = PropertiesService.getScriptProperties(), idag = Utilities.formatDate(new Date(), 'Europe/Copenhagen', 'yyyy-MM-dd');
  if (p.getProperty('KAR_KOMP') === idag) return;
  p.setProperty('KAR_KOMP', idag);
  var n = sh.getLastRow(); if (n < 2) return;
  var rows = sh.getRange(2, 1, n - 1, 7).getValues();
  var graense = Utilities.formatDate(new Date(Date.now() - 35 * 864e5), 'Europe/Copenhagen', 'yyyy-MM-dd');
  var slet = Utilities.formatDate(new Date(Date.now() - 400 * 864e5), 'Europe/Copenhagen', 'yyyy-MM');
  var dag = [], md = {}, ordenM = [];
  rows.forEach(function (r) {
    var dv = r[0] instanceof Date ? Utilities.formatDate(r[0], 'Europe/Copenhagen', 'yyyy-MM-dd') : String(r[0]);
    if (dv.length === 10 && dv >= graense) { dag.push([dv, r[1], r[2], r[3], r[4], r[5], r[6]]); return; }
    var m = dv.slice(0, 7); if (m < slet) return;
    var key = m + '|' + r[1] + '|' + r[2];
    if (!md[key]) { md[key] = [m, r[1], String(r[2]), 0, 0, 0, 0]; ordenM.push(key); }
    for (var i = 3; i < 7; i++) md[key][i] += Number(r[i]) || 0;
  });
  var ud = ordenM.map(function (k) { var x = md[k]; x[6] = Math.round(x[6] * 100) / 100; return x; }).concat(dag);
  sh.getRange(2, 1, n - 1, 7).clearContent();
  if (ud.length) sh.getRange(2, 1, ud.length, 7).setValues(ud);
}

function karArk() {
  var ss = sogArk().getParent(), sh = ss.getSheetByName('Karrusel');
  if (!sh) { sh = ss.insertSheet('Karrusel'); sh.appendRow(['Dato', 'Shop', 'Karrusel', 'Klik', 'Ordrer', 'Stk', 'Beløb']); sh.getRange('A:A').setNumberFormat('@'); }
  return sh;
}

function sogArk() {
  var p = PropertiesService.getScriptProperties(), id = p.getProperty('SOG'), ss;
  if (id) { ss = SpreadsheetApp.openById(id); }
  else {
    ss = SpreadsheetApp.create('Søgelog – Økologisk-Supermarked');
    ss.getSheets()[0].appendRow(['Tid', 'Søgeord', 'Resultater', 'Session', 'Shop']);
    p.setProperty('SOG', ss.getId());
  }
  return ss.getSheets()[0];
}

function populaere(site) {
  site = site || 'os';
  var cache = CacheService.getScriptCache(), c = cache.get('pop_' + site);
  if (c) return JSON.parse(c);
  var sh = sogArk(), rows = sh.getLastRow() > 1 ? sh.getRange(2, 1, sh.getLastRow() - 1, 5).getValues() : [];
  var nu = Date.now(), uge = 7 * 864e5, gammel = 35 * 864e5, med = {}, nul = {}, slet = 0;
  rows.forEach(function (r, i) {
    var t = new Date(r[0]).getTime();
    if (nu - t > gammel) { slet = i + 1; return; }
    if (nu - t > uge) return;
    if ((r[4] || 'os') !== site) return;
    var q = String(r[1]), key = q + '|' + r[3];
    var m = Number(r[2]) > 0 ? med : nul;
    (m[q] = m[q] || {})[key] = 1;
  });
  if (slet > 0) { try { sh.deleteRows(2, slet); } catch (x) {} }
  function top(m, min, max) {
    return Object.keys(m).map(function (q) { return [q, Object.keys(m[q]).length]; })
      .filter(function (a) { return a[1] >= min; }).sort(function (a, b) { return b[1] - a[1]; }).slice(0, max);
  }
  var res = { pop: top(med, 3, 12).map(function (a) { return a[0]; }), nul: top(nul, 1, 100), t: new Date().toISOString() };
  cache.put('pop_' + site, JSON.stringify(res), 3600);
  return res;
}


function doPost(e) {
  try {
    var d = JSON.parse(e.postData.contents || '{}');
    if (d.type === 'sog') return logSog(d);
    if (d.type === 'kar') return logKar(d);
    if (d.website) return svar({ ok: true }); // honeypot: bots udfylder skjult felt
    var type = d.type === 'reklamation' ? 'reklamation' : 'fortryd';
    var he = d.site === 'he';
    var BUTIK = he ? 'Helsekost-Ekspres' : 'Økologisk-Supermarked';
    var SHOPMAIL = he ? 'info@helsekost-ekspres.dk' : 'info@okologisk-supermarked.dk';
    var navn = rens(d.fornavn) + ' ' + rens(d.efternavn);
    var email = rens(d.email).toLowerCase();
    var ordre = rens(d.ordre).replace(/[^0-9A-Za-z-]/g, '');
    if (!rens(d.fornavn) || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || !ordre) {
      return svar({ ok: false, fejl: 'Udfyld venligst alle felter med *.' });
    }
    // simpel spærre mod gentagne indsendelser
    var cache = CacheService.getScriptCache();
    var key = 'k_' + Utilities.base64EncodeWebSafe((he ? 'he' : 'os') + email + type + ordre).slice(0, 200);
    if (cache.get(key)) return svar({ ok: true, igen: true });
    cache.put(key, '1', 120);

    var titel = type === 'fortryd' ? 'Fortrydelse' : 'Reklamation';
    var emne = (he ? 'HE – ' : '') + titel + ' – ordre ' + ordre + ' – ' + navn.trim();
    var linjer = [
      '<h2 style="margin:0 0 10px">' + titel + (he ? ' – Helsekost-Ekspres' : '') + '</h2>',
      '<table cellpadding="4" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px">',
      rk('Navn', navn), rk('E-mail', email), rk('Telefon', d.telefon), rk('Ordrenummer', ordre),
      rk(type === 'fortryd' ? 'Varer der fortrydes' : 'Vare(r) det drejer sig om', d.varer),
      type === 'reklamation' ? rk('Beskrivelse af fejlen', d.beskrivelse) : '',
      type === 'reklamation' ? rk('Ønsket løsning', d.losning) : '',
      rk('Kommentar', d.kommentar),
      rk('Modtaget', Utilities.formatDate(new Date(), 'Europe/Copenhagen', 'dd-MM-yyyy HH:mm')),
      '</table>'
    ].join('');

    var bilag = [];
    (d.billeder || []).slice(0, 4).forEach(function (b, i) {
      if (!b || !b.data) return;
      var bytes = Utilities.base64Decode(b.data);
      if (bytes.length > 4 * 1024 * 1024) return;
      bilag.push(Utilities.newBlob(bytes, b.type || 'image/jpeg', 'billede_' + (i + 1) + '.jpg'));
    });

    MailApp.sendEmail({
      to: SHOPMAIL, replyTo: email, name: BUTIK + ' webformular', subject: emne,
      htmlBody: linjer + (bilag.length ? '<p>' + bilag.length + ' billede(r) vedhæftet.</p>' : ''),
      attachments: bilag
    });

    var kvit = type === 'fortryd'
      ? 'Vi har modtaget din fortrydelse af ordre <b>' + esc(ordre) + '</b> den ' + Utilities.formatDate(new Date(), 'Europe/Copenhagen', 'dd-MM-yyyy \'kl.\' HH:mm') + '.<br><br>Vi vender tilbage hurtigst muligt med information om returnering og tilbagebetaling.'
      : 'Vi har modtaget din reklamation vedrørende ordre <b>' + esc(ordre) + '</b> den ' + Utilities.formatDate(new Date(), 'Europe/Copenhagen', 'dd-MM-yyyy \'kl.\' HH:mm') + '.<br><br>Vi ser på sagen og vender tilbage hurtigst muligt.';
    MailApp.sendEmail({
      to: email, replyTo: SHOPMAIL, name: BUTIK,
      subject: 'Kvittering: ' + titel.toLowerCase() + ' af ordre ' + ordre + ' er modtaget',
      htmlBody: '<div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.5">Kære ' + esc(rens(d.fornavn)) + '<br><br>' + kvit +
        '<br><br>Har du spørgsmål, kan du blot svare på denne mail.<br><br>Venlig hilsen<br>' + BUTIK + '<br>' + SHOPMAIL + '</div>' +
        '<hr style="border:0;border-top:1px solid #ddd;margin:16px 0"><div style="font-family:Arial,sans-serif;font-size:12px;color:#666">Dine oplysninger:</div>' + linjer
    });

    logArk([new Date(), (he ? 'HE ' : '') + titel, ordre, navn.trim(), email, rens(d.telefon), rens(d.varer), rens(d.beskrivelse), rens(d.losning), rens(d.kommentar), bilag.length]);
    return svar({ ok: true });
  } catch (err) {
    return svar({ ok: false, fejl: 'Der skete en fejl. Skriv venligst til os på mail.' });
  }
}

function logArk(row) {
  try {
    var p = PropertiesService.getScriptProperties();
    var id = p.getProperty('ARK');
    var ss;
    if (id) { ss = SpreadsheetApp.openById(id); }
    else {
      ss = SpreadsheetApp.create('Fortrydelser og reklamationer – Økologisk-Supermarked');
      ss.getSheets()[0].appendRow(['Modtaget', 'Type', 'Ordre', 'Navn', 'E-mail', 'Telefon', 'Varer', 'Beskrivelse', 'Ønsket løsning', 'Kommentar', 'Billeder']);
      p.setProperty('ARK', ss.getId());
    }
    ss.getSheets()[0].appendRow(row);
  } catch (e) {}
}

function rens(s) { return String(s == null ? '' : s).replace(/[\u0000-\u0009\u000b-\u001f]/g, ' ').trim().slice(0, 3000); }
function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function rk(k, v) { v = rens(v); return v ? '<tr><td style="color:#666;vertical-align:top;white-space:nowrap"><b>' + k + '</b></td><td>' + esc(v).replace(/\n/g, '<br>') + '</td></tr>' : ''; }
function svar(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

// Kør én gang i editoren for at godkende adgang til mail og ark.
function godkend() { MailApp.getRemainingDailyQuota(); logArk([new Date(), 'Test', '', 'Opsætning', '', '', '', '', '', '', 0]); }
