import { DashboardData } from '../models/appointment.model';

/**
 * Static mock data, just so the UI has something to display.
 * Replace with real, processed data (e.g. via service/input).
 */
export const MOCK_DASHBOARD_DATA: DashboardData = {
  practice: 'Hausarztpraxis am Stadtpark',
  periodLabel: '15.06. – 03.07.2026',
  openingHoursNote: 'Mo–Fr 08:00–18:00, Mittagspause 12:00–13:00',
  totals: {
    bookedPercent: 18.0,
    completedPercent: 15.3,
    gapPercent: 2.7,
    noShowRatePercent: 4.8,
    totalAppointmentCount: 185,
    noShowCount: 9,
  },
  weeks: [
    { week: 'KW25', periodLabel: '15.06.–19.06.', bookedPercent: 14.7, completedPercent: 11.7 },
    { week: 'KW26', periodLabel: '22.06.–26.06.', bookedPercent: 19.9, completedPercent: 17.6 },
    { week: 'KW27', periodLabel: '29.06.–03.07.', bookedPercent: 19.2, completedPercent: 16.5 },
  ],
  doctors: [
    { doctor: 'Dr. Brandt', utilizationPercent: 17.0 },
    { doctor: 'Dr. Yilmaz', utilizationPercent: 16.4 },
    { doctor: 'Dr. Sommer', utilizationPercent: 12.5 },
  ],
  treatmentTypes: [
    { treatmentType: 'EKG', count: 30 },
    { treatmentType: 'Blutabnahme', count: 29 },
    { treatmentType: 'Kontrolluntersuchung', count: 26 },
    { treatmentType: 'Ultraschall', count: 22 },
    { treatmentType: 'Impfung', count: 22 },
    { treatmentType: 'Erstgespräch', count: 19 },
    { treatmentType: 'Gesundheitscheck', count: 19 },
    { treatmentType: 'Wundversorgung', count: 17 },
  ],
  exclusions: [
    { appointment_id: 'T-1117', reason: 'Termin am Wochenende', date: '2026-06-27' },
    { appointment_id: 'T-9001', reason: 'Termin außerhalb der Öffnungszeiten (19:30 Uhr)', date: '2026-06-24' },
  ],
  missingStatusCount: 1,
  correctedDurationCount: 1,
};
