import { DashboardDaten } from '../models/termin.model';

/**
 * Statische Mock-Daten, nur damit die UI etwas zum Anzeigen hat.
 * Ersetzen durch echte, aufbereitete Daten (z.B. per Service/Input).
 */
export const MOCK_DASHBOARD_DATEN: DashboardDaten = {
  praxis: 'Hausarztpraxis am Stadtpark',
  zeitraumLabel: '15.06. – 03.07.2026',
  oeffnungszeitenHinweis: 'Mo–Fr 08:00–18:00, Mittagspause 12:00–13:00',
  gesamt: {
    gebuchtProzent: 18.0,
    realisiertProzent: 15.3,
    lueckeProzent: 2.7,
    noShowQuoteProzent: 4.8,
    anzahlTermineGesamt: 185,
    anzahlNoShow: 9,
  },
  wochen: [
    { woche: 'KW25', zeitraumLabel: '15.06.–19.06.', gebuchtProzent: 14.7, realisiertProzent: 11.7 },
    { woche: 'KW26', zeitraumLabel: '22.06.–26.06.', gebuchtProzent: 19.9, realisiertProzent: 17.6 },
    { woche: 'KW27', zeitraumLabel: '29.06.–03.07.', gebuchtProzent: 19.2, realisiertProzent: 16.5 },
  ],
  aerzte: [
    { arzt: 'Dr. Brandt', auslastungProzent: 17.0 },
    { arzt: 'Dr. Yilmaz', auslastungProzent: 16.4 },
    { arzt: 'Dr. Sommer', auslastungProzent: 12.5 },
  ],
  behandlungsarten: [
    { behandlungsart: 'EKG', anzahl: 30 },
    { behandlungsart: 'Blutabnahme', anzahl: 29 },
    { behandlungsart: 'Kontrolluntersuchung', anzahl: 26 },
    { behandlungsart: 'Ultraschall', anzahl: 22 },
    { behandlungsart: 'Impfung', anzahl: 22 },
    { behandlungsart: 'Erstgespräch', anzahl: 19 },
    { behandlungsart: 'Gesundheitscheck', anzahl: 19 },
    { behandlungsart: 'Wundversorgung', anzahl: 17 },
  ],
  ausschluesse: [
    { termin_id: 'T-1117', grund: 'Termin am Wochenende', datum: '2026-06-27' },
    { termin_id: 'T-9001', grund: 'Termin außerhalb der Öffnungszeiten (19:30 Uhr)', datum: '2026-06-24' },
  ],
  fehlenderStatus: 1,
  korrigierteDauerAnzahl: 1,
};
