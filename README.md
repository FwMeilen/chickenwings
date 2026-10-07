# Chicken Wings – Finanzen

Finanztool der Stützpunktfeuerwehr Meilen für den Anlass «Chicken Wings»,
übernommen aus dem Finanzteil des Chilbi-Tools.

## Aufbau
- `finanzen/index.html` – die Seite: Einnahmen, Ausgaben, Stock, Kasse, Rechnungen, Auswertung
- `Code.gs` – Google Apps Script als Server, liest und schreibt ein eigenes Abrechnungs-Sheet

## Einrichten
1. **Sheet** anlegen mit den Reitern `Meta`, `Einnahmen`, `Ausgaben`, `Stock`, `Kasse`, `Rechnungen`
   (die Kopfzeilen legt das Script beim ersten Speichern selbst an).
2. **Apps Script** anlegen, `Code.gs` einfügen und oben eintragen:
   `ABRECHNUNG_SHEET_ID`, `ABRECHNUNG_PW` (Vollzugriff), `ABRECHNUNG_PW_VIEW` (nur lesen).
3. Als **Web-App bereitstellen**: Ausführen als «ich», Zugriff «alle».
4. Die Exec-URL in `finanzen/index.html` bei `SCRIPT_URL` eintragen.
5. GitHub Pages aktivieren (Branch `main`, Ordner `/`), danach ist die Seite unter
   `…/finanzen/` erreichbar. Eigene Domain optional über eine `CNAME`-Datei.

## Stand
CW1.00 – unverändert übernommen, noch nicht an den Anlass angepasst.
