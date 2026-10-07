# Chicken Wings – Finanzen

Finanztool der Stützpunktfeuerwehr Meilen für den Anlass «Chicken Wings»,
übernommen aus dem Finanzteil des Chilbi-Tools.

## Aufbau
- `index.html` – Hauptseite: schwarz, Logo in der Mitte, Klick öffnet das Login
- `logo.png`, `favicon.png` – freigestelltes Logo
- `CNAME` – eigene Domain `chickenwings.feuerwehrmeilen.ch`
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

## Passwörter und Bankdaten
Das Repo ist öffentlich. Passwörter werden nur im Apps Script gesetzt und dort geprüft,
nie in diesem Repo. IBAN und Kontoinhaber werden in der Seite unter «Einstellungen»
erfasst und im Sheet gespeichert.

## Stand
CW1.02 – Exec-URL des Apps Scripts eingetragen (Seiten; `Code.gs` bleibt CW1.01).
CW1.01 – Design Schwarz/Gold mit Logo, Hauptseite mit Login, Rechnung angepasst
(Absender, Kontotext, Feld «Kontoinhaber»). Inhalte (Kategorien, Reiter) noch wie Chilbi.
