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
      to: TIL, replyTo: email, name: BUTIK + ' webformular', subject: emne,
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
