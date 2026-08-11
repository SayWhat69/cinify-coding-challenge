# Terminauslastung - Praxis-Dashboard

Dashboard für eine Arztpraxis, das zeigt, wie sich die Terminauslastung über
den Zeitraum entwickelt - inkl. Wochen-/Tagesverlauf, Auslastung pro Arzt,
Verteilung der Behandlungsarten und einem Hinweis auf Datenqualitätsprobleme
in den Rohdaten.

## Setup

```bash
npm install
npm start
```

Öffnet unter http://localhost:4200. Die Beispieldaten liegen in
`public/assets/termindaten.json` und werden beim Start per `HttpClient`
geladen und aufbereitet (`DataService`).

## Struktur

- `src/app/models/appointment.model.ts` - Typen/Schnittstellen für Rohdaten
  (`Appointment`) und aufbereitete Dashboard-Daten (`DashboardData`)
- `src/app/services/data.service.ts` - lädt die JSON-Daten und enthält die
  eigentliche Kernlogik: Bereinigung, Ausschlussregeln, Kapazitäts- und
  Auslastungsberechnung (siehe Annahmen unten)
- `src/app/components/` - reine Präsentations-Komponenten:
  - `kpi-cards` - Kennzahlen-Karten (realisierte/gebuchte Auslastung, Lücke, No-Show-Quote)
  - `trend-chart` - Verlauf gebucht vs. realisiert (Chart.js), umschaltbar zwischen Wochen- und Tagesansicht (letzte 7 Tage)
  - `doctor-utilization` - Auslastung pro Arzt als Balken
  - `treatment-types` - Verteilung der Behandlungsarten
  - `data-quality-banner` - Hinweisleiste für ausgeschlossene/korrigierte Termine
- `src/app/app.component.*` - setzt die Komponenten zusammen, hält den
  Umschalter-Zustand (Wochen-/Tagesansicht)

---

## KI-Workflow

Ich habe durchgängig **Claude Code** eingesetzt, aber bewusst mit klarer
Aufgabenteilung:

- **UI komplett von der KI bauen lassen.** Das Grundgerüst (Komponenten,
  Layout, Styling, KPI-Karten, Chart-Einbindung) habe ich von Claude Code
  generieren lassen, zunächst gegen Mock-Daten.
- **Direkt danach alle Bezeichner ins Englische übersetzt.** Variablen,
  Klassen, Interfaces und Dateinamen habe ich sofort im Anschluss an die
  UI-Generierung von Claude Code übersetzen lassen, weil ich in der
  Programmierung grundsätzlich Englisch bevorzuge - unabhängig von der
  Sprache der Aufgabe. UI-Texte, die tatsächlich angezeigt werden, sind
  bewusst auf Deutsch geblieben.
- **Die eigentliche Logik habe ich selbst geschrieben.** Für `data.service.ts`
  (Laden, Bereinigen, Ausschlussregeln, Kapazitäts-/Auslastungsberechnung)
  habe ich die KI **nicht** den Code schreiben lassen - genau diese
  Entscheidungen ("was bedeutet Auslastung", wie geht man mit Anomalien um)
  sind der Kern der Aufgabe und sollten von mir kommen. Die KI habe ich hier
  nur genutzt, um mir die JSON-Rohdaten zusammenfassen zu lassen und schneller
  einen Überblick über Struktur und Auffälligkeiten der Daten zu bekommen.
- **Danach wieder mit Claude Code iteriert**, auf Basis meiner fertigen Logik:
  - bestehende, kaputte Unit-Tests repariert (fehlender `HttpClient`-Provider
    im Test-Setup) und gezielt neue Tests für die Cleanup-Logik ergänzt
    (Median-Korrektur, Ausschlussregeln, fehlender Status, No-Show-Quote,
    Fallback bei leeren Daten)
  - nachträglich, als bewusste Erweiterung über die ursprüngliche Aufgabe
    hinaus, einen Wochen-/Tages-Umschalter für den Trendchart ergänzt
    (letzte 7 Tage vs. Wochenverlauf)

## Annahmen & Trade-offs

„Auslastung“ definiere ich als **realisierte (wahrgenommene) Termin-Minuten
÷ verfügbare Kapazität** (Anzahl aktiver Ärzte × Öffnungszeit abzüglich
Mittagspause) - „gebucht“ wird separat ausgewiesen, die Differenz zwischen
gebucht und realisiert zeige ich explizit als „verlorene Kapazität“ durch
No-Shows/Absagen. Termine am Wochenende oder außerhalb der Öffnungszeiten
werden als Dateneingabefehler behandelt und aus der Kapazitätsrechnung
ausgeschlossen - nicht stillschweigend, sondern transparent über einen
Datenqualitäts-Hinweis. Termine mit 0 Minuten Dauer werden nicht
ausgeschlossen, sondern auf den Median der jeweiligen Behandlungsart
korrigiert, damit einzelne Datenfehler die Auslastung nicht künstlich
drücken. Fehlt der Status, zähle ich den Termin konservativ als „gebucht“,
aber nicht als „realisiert“, statt zu raten. Für unvollständige Wochen am
Rand des Zeitraums nehme ich für die Kapazitätsrechnung eine Mindestbasis
von 5 Werktagen an, damit die Quote nicht künstlich verzerrt wird - die
Tagesansicht ist davon nicht betroffen, da dort die Kapazität pro Tag exakt
bekannt ist.

## Was ich bewusst anders gemacht / abgelehnt habe

Die größte bewusste Entscheidung war, die Kernlogik gar nicht erst von der
KI schreiben zu lassen (siehe KI-Workflow oben) - für mich der wichtigste
Eingriff überhaupt, weil dort die eigentlichen fachlichen Entscheidungen
stecken.

Ein konkretes Beispiel *innerhalb* der KI-unterstützten Arbeit: Beim
Schreiben der Tests hat Claude die erwarteten Zahlen zunächst per
Kopfrechnung hergeleitet - und dabei einen Denkfehler gemacht (Annahme: der
Median für die Dauer-Korrektur wird nur über die „regulären“ Termine
berechnet; tatsächlich läuft er über *alle* Termine einer Behandlungsart,
auch ausgeschlossene). Das ist aufgefallen, weil die Testwerte beim ersten
Lauf nicht passten. Statt die Erwartungswerte einfach anzupassen, wurde die
`cleanup()`-Logik unabhängig in einem kleinen Node-Skript nachgebaut und
gegen die Testdaten simuliert, um die korrekten Werte zu verifizieren, bevor
sie in die Tests übernommen wurden. Verworfen wurde außerdem die zunächst
vorgeschlagene Test-Boilerplate (`HttpClientTestingModule` mit einem
doppelten, sich überschreibenden `beforeEach`) zugunsten der aktuellen
`provideHttpClient()` / `provideHttpClientTesting()`-API.
