# Terminauslastung — Praxis-Dashboard (Frontend)

Reines Angular-Frontend für ein Praxis-Dashboard zur Terminauslastung.
Zeigt aktuell **Mock-Daten** — die eigentliche Datenlogik (Laden, Bereinigen,
Berechnen der Kennzahlen) ist bewusst nicht Teil dieses Frontends.

## Setup

```bash
npm install
npm start
```

Öffnet unter http://localhost:4200.

## Eigene Daten einbinden

`src/app/models/termin.model.ts` beschreibt die Schnittstelle, die die
UI-Komponenten erwarten (`DashboardDaten`). Einfach:

1. Eigene Datenlogik implementieren, die ein `DashboardDaten`-Objekt liefert
   (z.B. als Service mit `HttpClient`, oder synchron).
2. In `app.component.ts` `MOCK_DASHBOARD_DATEN` durch die echten Daten ersetzen.

`src/app/mock/mock-daten.ts` kann danach gelöscht werden.

## Struktur

- `src/app/models/termin.model.ts` — Typen/Schnittstelle für die UI
- `src/app/mock/mock-daten.ts` — statische Beispieldaten
- `src/app/components/` — Präsentations-Komponenten:
  - `kpi-cards` — 4 Kennzahlen-Karten (Auslastung, Lücke, No-Show-Quote)
  - `trend-chart` — Wochenverlauf gebucht vs. realisiert (Chart.js)
  - `arzt-auslastung` — Auslastung pro Arzt als Balken
  - `behandlungsarten` — Verteilung der Behandlungsarten
  - `data-quality-banner` — Hinweisleiste für Datenqualitäts-Ausschlüsse
- `src/app/app.component.*` — setzt die Komponenten zusammen
