/**
 * Chicken Wings – Finanzen (Google Apps Script)
 * Stützpunktfeuerwehr Meilen
 * Version CW1.00
 *
 * Übernommen aus dem Chilbi-Tool (Teil «Finanzen / Abrechnung»).
 * Einrichten: Werte unten setzen, als Web-App bereitstellen (Zugriff: alle),
 * die Exec-URL in finanzen/index.html bei SCRIPT_URL eintragen.
 */
const ABRECHNUNG_SHEET_ID = 'HIER_SHEET_ID_EINTRAGEN';   // eigenes Sheet mit den Reitern Meta, Einnahmen, Ausgaben, Stock, Kasse, Rechnungen
const ABRECHNUNG_PW       = 'HIER_PASSWORT_EINTRAGEN';   // Vollzugriff
const ABRECHNUNG_PW_VIEW  = 'HIER_LESEPASSWORT';         // nur lesen

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

// ===== Finanzen / Abrechnung (separates Sheet ABRECHNUNG_SHEET_ID) =====
function _abrNum(v){ var n = parseFloat(String(v==null?'':v).replace(',', '.')); return isNaN(n) ? 0 : n; }
function _abrReadTab(ss, name){
  var sh = ss.getSheetByName(name); if(!sh) return [];
  var vals = sh.getDataRange().getValues(); if(vals.length < 2) return [];
  var head = vals[0].map(function(h){ return String(h).trim(); });
  var out = [];
  for(var i=1;i<vals.length;i++){ var o={}; for(var j=0;j<head.length;j++){ o[head[j]] = vals[i][j]; } out.push(o); }
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
  var meta = {};
  var mSheet = ss.getSheetByName('Meta');
  if(mSheet){ var mv = mSheet.getDataRange().getValues(); for(var i=1;i<mv.length;i++){ if(mv[i][0]) meta[String(mv[i][0]).trim()] = mv[i][1]; } }
  return { ok:true, readonly:!!readonly, meta:meta,
    einnahmen:_abrReadTab(ss,'Einnahmen'), ausgaben:_abrReadTab(ss,'Ausgaben'),
    stock:_abrReadTab(ss,'Stock'), kasse:_abrReadTab(ss,'Kasse'),
    rechnungen:_abrReadTab(ss,'Rechnungen') };
}
function abrSave(p){
  var ss = SpreadsheetApp.openById(ABRECHNUNG_SHEET_ID);
  var meta = p.meta || {};
  var mSheet = ss.getSheetByName('Meta') || ss.insertSheet('Meta');
  mSheet.clear();
  mSheet.getRange(1,1,21,2).setValues([
    ['Schlüssel','Wert'],
    ['Jahr', meta.jahr||''],
    ['Vorjahr', meta.vorjahr||''],
    ['VorjahrKasse', meta.vorjahrKasse||''],
    ['EinnahmenKategorien', (meta.einKat||[]).join(', ')],
    ['AusgabenKategorien', (meta.ausKat||[]).join(', ')],
    ['KostenKategorien', (meta.kostKat||[]).join(', ')],
    ['SollStock', meta.sollStock||''],
    ['SollKasse', meta.sollKasse||''],
    ['MuenzProRolle', meta.muenzProRolle||''],
    ['Spaetzli', meta.spaetzli||''],
    ['Helferstunden', meta.helferstunden||''],
    ['Twint', meta.twint||''],
    ['VorjahrJson', meta.vorjahrJson||''],
    ['RgAbsender', meta.rgAbsender||''],
    ['RgIntro', meta.rgIntro||''],
    ['RgVorPos', meta.rgVorPos||''],
    ['RgIban', meta.rgIban||''],
    ['RgGruss', meta.rgGruss||''],
    ['RgFooter', meta.rgFooter||''],
    ['RgNext', meta.rgNext||'']
  ]);
  _abrWriteTab(ss,'Einnahmen',['Nr','Kategorie','Beschreibung','Betrag','Vorjahr'],
    (p.einnahmen||[]).map(function(r,i){ return [i+1, r.kat||'', r.besch||'', _abrNum(r.betrag), _abrNum(r.vorjahr)]; }));
  _abrWriteTab(ss,'Ausgaben',['Nr','Zahlungsart','Beschreibung','Betrag','Vorjahr','Bemerkung','Kostenart','Vorschuss','Zurueckbezahlt'],
    (p.ausgaben||[]).map(function(r,i){ return [i+1, r.art||'', r.besch||'', _abrNum(r.betrag), _abrNum(r.vorjahr), r.bem||'', r.kostenart||'', r.vorschuss?1:'', r.rueck?1:'']; }));
  _abrWriteTab(ss,'Stock',['Wert','Einzeln','Rollen'],
    (p.stock||[]).map(function(r){ return [_abrNum(r.wert), _abrNum(r.einzeln), _abrNum(r.rollen)]; }));
  _abrWriteTab(ss,'Kasse',['Wert','Einzeln','Rollen'],
    (p.kasse||[]).map(function(r){ return [_abrNum(r.wert), _abrNum(r.einzeln), _abrNum(r.rollen)]; }));
  _abrWriteTab(ss,'Rechnungen',['Nr','Datum','Empfaenger','Email','Betreff','Total','JSON'],
    (p.rechnungen||[]).map(function(r){ return [r.nr||'', r.datum||'', r.empfaenger||'', r.email||'', r.betreff||'', _abrNum(r.total), r.json||'']; }));
  return { ok:true };
}
function rechnungMail(p){
  var opts = { from:'chilbi@feuerwehrmeilen.ch', name:'Chilbi Herrliberg', htmlBody:p.html };
  if(p.pdf) opts.attachments = [Utilities.newBlob(Utilities.base64Decode(p.pdf), 'application/pdf', p.pdfname||'Rechnung.pdf')];
  GmailApp.sendEmail(p.email, p.subject, p.text||'', opts);
  return { ok:true };
}

function kuerzelSave(p){
  _kzWrite(SS_KUERZEL,'Tabellenblatt1',['Kürzel','Vorname','Name','Email'],(p.feuerwehr||[]).map(function(r){ return [r.kuerzel||'', r.vorname||'', r.name||'', r.email||'']; }));
  _kzWrite(SS_KUERZEL,'Gast',['Kürzel','Vorname','Name','Email','Tel'],(p.gasthelfer||[]).map(function(r){ return [r.kuerzel||'', r.vorname||'', r.name||'', r.email||'', r.tel||'']; }));
  return { ok:true };
}
function _kzWrite(ss,name,headers,rows){
  var sh=ss.getSheetByName(name); if(!sh) sh=ss.insertSheet(name);
  sh.clearContents();
  sh.getRange(1,1,1,headers.length).setValues([headers]);
  if(rows.length) sh.getRange(2,1,rows.length,headers.length).setValues(rows);
}
function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
