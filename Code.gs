/**
 * Chicken Wings – Finanzen (Google Apps Script)
 * Feuerwehr Hockeyteam Chicken Wings
 * Version CW1.03
 *
 * Einfache Einnahmen-/Ausgabenrechnung: Einnahmen, Ausgaben, Rechnungen, Abrechnung.
 * Einrichten: Werte unten setzen, als Web-App bereitstellen (Ausführen als «ich», Zugriff «alle»),
 * die Exec-URL in finanzen/index.html bei SCRIPT_URL eintragen.
 * Sheet-ID und Passwörter NIE ins öffentliche Repo schreiben.
 */
const ABRECHNUNG_SHEET_ID = 'HIER_SHEET_ID_EINTRAGEN';   // eigenes Sheet; die Reiter Meta, Einnahmen, Ausgaben, Rechnungen legt das Script selbst an
const ABRECHNUNG_PW       = 'HIER_PASSWORT_EINTRAGEN';   // Vollzugriff
const ABRECHNUNG_PW_VIEW  = 'HIER_LESEPASSWORT';         // nur lesen
const CW_VERSION          = 'CW1.03';

function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.action === 'abrLoad') {
    if (p.pw === ABRECHNUNG_PW) return jsonResponse(abrLoad(false));
    if (p.pw === ABRECHNUNG_PW_VIEW) return jsonResponse(abrLoad(true));
    return jsonResponse({ok: false, error: 'auth'});
  }
  return jsonResponse({ok: false, error: 'unbekannt'});
}
function doPost(e) {
  let p = {};
  try { p = JSON.parse((e && e.postData && e.postData.contents) || '{}'); } catch (err) { p = {}; }
  if (p.action === 'abrSave') {
    if (p.pw !== ABRECHNUNG_PW) return jsonResponse({ok: false, error: 'auth'});
    return jsonResponse(abrSave(p));
  }
  return jsonResponse({ok: false, error: 'unbekannt'});
}
function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// ===== Finanzen (Sheet ABRECHNUNG_SHEET_ID) =====
function _abrNum(v){ var n = parseFloat(String(v==null?'':v).replace(',', '.')); return isNaN(n) ? 0 : n; }
// Datum als Text JJJJ-MM-TT. Sheets macht aus Datumstexten echte Datumswerte; beim Lesen
// werden sie in der Zeitzone des Sheets zurückgewandelt (sonst verschiebt sich der Tag).
function _abrCell(v, tz){ return (v instanceof Date) ? Utilities.formatDate(v, tz, 'yyyy-MM-dd') : v; }
function _abrIso(v){ var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(v==null?'':v).trim()); return m ? m[0] : ''; }
function _abrReadTab(ss, name){
  var sh = ss.getSheetByName(name); if(!sh) return [];
  var vals = sh.getDataRange().getValues(); if(vals.length < 2) return [];
  var tz = ss.getSpreadsheetTimeZone();
  var head = vals[0].map(function(h){ return String(h).trim(); });
  var out = [];
  for(var i=1;i<vals.length;i++){ var o={}; for(var j=0;j<head.length;j++){ o[head[j]] = _abrCell(vals[i][j], tz); } out.push(o); }
  return out;
}
function _abrWriteTab(ss, name, header, rows){
  var sh = ss.getSheetByName(name) || ss.insertSheet(name);
  sh.clear();
  sh.getRange(1,1,1,header.length).setValues([header]);
  if(rows.length) sh.getRange(2,1,rows.length,header.length).setValues(rows);
}
function abrLoad(readonly){
  var ss = SpreadsheetApp.openById(ABRECHNUNG_SHEET_ID);
  var tz = ss.getSpreadsheetTimeZone();
  var meta = {};
  var mSheet = ss.getSheetByName('Meta');
  if(mSheet){ var mv = mSheet.getDataRange().getValues(); for(var i=1;i<mv.length;i++){ if(mv[i][0]) meta[String(mv[i][0]).trim()] = _abrCell(mv[i][1], tz); } }
  return { ok:true, v:CW_VERSION, readonly:!!readonly, meta:meta,
    einnahmen:_abrReadTab(ss,'Einnahmen'), ausgaben:_abrReadTab(ss,'Ausgaben'),
    rechnungen:_abrReadTab(ss,'Rechnungen') };
}
function abrSave(p){
  var ss = SpreadsheetApp.openById(ABRECHNUNG_SHEET_ID);
  var meta = p.meta || {};
  var rows = [
    ['Schlüssel','Wert'],
    ['Version', CW_VERSION],
    ['Anfangsbestand', _abrNum(meta.anfang)],
    ['KatEinnahmen', (meta.einKat||[]).join(', ')],
    ['KatAusgaben', (meta.ausKat||[]).join(', ')],
    ['RgAbsender', meta.rgAbsender||''],
    ['RgIntro', meta.rgIntro||''],
    ['RgIban', meta.rgIban||''],
    ['RgKontoinhaber', meta.rgKontoinhaber||''],
    ['RgGruss', meta.rgGruss||''],
    ['RgFooter', meta.rgFooter||''],
    ['RgNext', meta.rgNext||'']
  ];
  var mSheet = ss.getSheetByName('Meta') || ss.insertSheet('Meta');
  mSheet.clear();
  mSheet.getRange(1,1,rows.length,2).setValues(rows);
  _abrWriteTab(ss,'Einnahmen',['Nr','Datum','Kategorie','Beschreibung','Betrag'],
    (p.einnahmen||[]).map(function(r,i){ return [i+1, _abrIso(r.datum), r.kat||'', r.besch||'', _abrNum(r.betrag)]; }));
  _abrWriteTab(ss,'Ausgaben',['Nr','Datum','Kategorie','Beschreibung','Betrag','Bemerkung'],
    (p.ausgaben||[]).map(function(r,i){ return [i+1, _abrIso(r.datum), r.kat||'', r.besch||'', _abrNum(r.betrag), r.bem||'']; }));
  _abrWriteTab(ss,'Rechnungen',['Nr','Datum','Empfaenger','Email','Betreff','Total','BezahltAm','JSON'],
    (p.rechnungen||[]).map(function(r){ return [r.nr||'', r.datum||'', r.empfaenger||'', r.email||'', r.betreff||'', _abrNum(r.total), _abrIso(r.bezahltAm), r.json||'']; }));
  return { ok:true, v:CW_VERSION };
}

// Rechnungsversand per Mail: noch nicht angeschlossen (doPost leitet «rechnungMail» nicht weiter,
// Absenderadresse ist noch offen).
function rechnungMail(p){
  var opts = { htmlBody:p.html };
  if(p.pdf) opts.attachments = [Utilities.newBlob(Utilities.base64Decode(p.pdf), 'application/pdf', p.pdfname||'Rechnung.pdf')];
  GmailApp.sendEmail(p.email, p.subject, p.text||'', opts);
  return { ok:true };
}
