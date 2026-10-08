# Chicken Wings

Website und Finanztool des Feuerwehr Hockeyteams Chicken Wings.
Live: https://chickenwings.feuerwehrmeilen.ch

## Aufbau
- `index.html` – Hauptseite: schwarz, Logo in der Mitte, Klick öffnet das Login; Fusszeile mit Sponsoren
- `sponsoren/*.png` – Sponsorenlogos in Graustufen, alle 112 px hoch. Liste, Links und Reihenfolge (zufällig) stehen in `index.html` bei `SPONSOREN`
- `logo.png`, `favicon.png` – freigestelltes Logo
- `CNAME` – eigene Domain
- `finanzen/index.html` – Einnahmen-/Ausgabenrechnung: Abrechnung, Einnahmen, Ausgaben, Rechnungen, Einstellungen
- `Code.gs` – Google Apps Script als Server, liest und schreibt das Abrechnungs-Sheet

## Finanzen in Kürze
- Durchgehende Rechnung in einem Sheet, jede Buchung mit Datum; Abrechnung gesamt oder pro Jahr
- Anfangsbestand und Kategorien in den Einstellungen
- Rechnungen zählen als Einnahme, sobald «bezahlt am» gesetzt ist
- Seite und Script müssen zusammenpassen: meldet das Script eine ältere Version als die Seite verlangt, ist Speichern gesperrt

## Einrichten
1. Leeres Google Sheet anlegen (die Reiter legt das Script beim ersten Speichern an), nicht öffentlich freigeben.
2. Apps Script im selben Konto anlegen, `Code.gs` einfügen und oben eintragen:
   `ABRECHNUNG_SHEET_ID`, `ABRECHNUNG_PW` (Vollzugriff), `ABRECHNUNG_PW_VIEW` (nur lesen).
3. Als Web-App bereitstellen: Ausführen als «ich», Zugriff «alle». Nach jeder Änderung an `Code.gs` eine neue Version bereitstellen.
4. Die Exec-URL steht in `finanzen/index.html` bei `SCRIPT_URL`.

## Passwörter und Bankdaten
Das Repo ist öffentlich. Sheet-ID und Passwörter werden nur im Apps Script gesetzt, nie in diesem Repo.
IBAN und Kontoinhaber werden in der Seite unter «Einstellungen» erfasst und im Sheet gespeichert.

## Stand
- CW1.08 – Abrechnung: einzelne Buchungen mit Datum und Beschreibung unter jeder Kategorie; Text bei offenen Rechnungen; Ausdruck mit Uhrzeit
- CW1.07 – Fehler behoben: «Speichern» oben übernimmt jetzt auch die offene Rechnung; PDF/Senden in der Übersicht nehmen den Formularstand; Hinweis «Ungespeicherte Änderungen»; Fusszeile der Rechnung mehrzeilig
- CW1.06 – Rechnungs-PDF: Leerzeile vor dem Betreff; unten MWST-Hinweis (grau), Leerzeile, dann Danke/IBAN/Kontoinhaber als kleiner Block
- CW1.05 – Rechnungen: Knopf «Kopieren»
- CW1.04 – Rechnung: MWST-Hinweis unter dem Total, IBAN/Kontoinhaber kleiner mit Abstand; Hauptseite: Hersperger ohne Kasten, «Besten Dank!!!» (`Code.gs` bleibt CW1.03)
- CW1.03 – Umbau auf einfache Einnahmen-/Ausgabenrechnung (Chilbi-Teile entfernt), Sponsoren-Fusszeile auf der Hauptseite. `Code.gs` muss neu bereitgestellt werden.
- CW1.02 – Exec-URL eingetragen
- CW1.01 – Design Schwarz/Gold mit Logo, Hauptseite mit Login
