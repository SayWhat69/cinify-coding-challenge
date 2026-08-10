import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { DataService } from './data.service';
import { Appointment, AppointmentDataResponse, DashboardData } from '../models/appointment.model';

const ASSET_URL = 'assets/termindaten.json';

function buildResponse(
  appointments: Appointment[],
  overrides: Partial<AppointmentDataResponse> = {}
): AppointmentDataResponse {
  return {
    practice: 'Testpraxis',
    period: { from: '2024-01-01', to: '2024-01-02' },
    opening_hours_note: 'Mo-Fr 08:00-18:00',
    appointments,
    ...overrides,
  };
}

describe('DataService', () => {
  let service: DataService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(DataService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // stellt sicher, dass keine offenen Requests übrig sind
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('requests the appointment data from assets/termindaten.json', () => {
    service.loadData().subscribe();
    const req = httpMock.expectOne(ASSET_URL);
    expect(req.request.method).toBe('GET');
    req.flush(buildResponse([]));
  });

  it('caches the request and issues only a single HTTP call for repeated subscriptions', () => {
    let firstResult: DashboardData | undefined;
    let secondResult: DashboardData | undefined;
    service.loadData().subscribe((d) => (firstResult = d));
    service.loadData().subscribe((d) => (secondResult = d));
    httpMock.expectOne(ASSET_URL).flush(buildResponse([]));

    expect(firstResult).toBeTruthy();
    expect(secondResult).toBe(firstResult!);
  });

  describe('cleanup logic', () => {
    it('excludes weekend appointments with the correct reason', () => {
      const appointments: Appointment[] = [
        {
          appointment_id: 'WKND-1',
          date: '2024-01-06T09:00:00', // Saturday
          duration_minutes: 20,
          treatment_type: 'EKG',
          doctor: 'Dr. A',
          status: 'attended',
          new_patient: false,
        },
      ];
      let result!: DashboardData;
      service.loadData().subscribe((d) => (result = d));
      httpMock.expectOne(ASSET_URL).flush(buildResponse(appointments));

      expect(result.exclusions).toEqual([
        { appointment_id: 'WKND-1', reason: 'Termin am Wochenende', date: '2024-01-06T09:00:00' },
      ]);
      expect(result.totals.totalAppointmentCount).toBe(0);
    });

    it('excludes appointments outside opening hours with a formatted time in the reason', () => {
      const appointments: Appointment[] = [
        {
          appointment_id: 'LATE-1',
          date: '2024-01-01T19:30:00', // Monday, but after 18:00
          duration_minutes: 15,
          treatment_type: 'EKG',
          doctor: 'Dr. A',
          status: 'attended',
          new_patient: false,
        },
      ];
      let result!: DashboardData;
      service.loadData().subscribe((d) => (result = d));
      httpMock.expectOne(ASSET_URL).flush(buildResponse(appointments));

      expect(result.exclusions).toEqual([
        {
          appointment_id: 'LATE-1',
          reason: 'Termin außerhalb der Öffnungszeiten (19:30 Uhr)',
          date: '2024-01-01T19:30:00',
        },
      ]);
      expect(result.totals.totalAppointmentCount).toBe(0);
    });

    it('corrects 0-minute durations to the median duration of the same treatment type', () => {
      const appointments: Appointment[] = [
        { appointment_id: 'E-1', date: '2024-01-01T08:30:00', duration_minutes: 10, treatment_type: 'EKG', doctor: 'Dr. X', status: 'attended', new_patient: false },
        { appointment_id: 'E-2', date: '2024-01-01T09:00:00', duration_minutes: 20, treatment_type: 'EKG', doctor: 'Dr. X', status: 'attended', new_patient: false },
        { appointment_id: 'E-3', date: '2024-01-01T09:30:00', duration_minutes: 30, treatment_type: 'EKG', doctor: 'Dr. X', status: 'attended', new_patient: false },
        { appointment_id: 'E-4', date: '2024-01-01T10:00:00', duration_minutes: 40, treatment_type: 'EKG', doctor: 'Dr. X', status: 'attended', new_patient: false },
        { appointment_id: 'E-5', date: '2024-01-01T10:30:00', duration_minutes: 0, treatment_type: 'EKG', doctor: 'Dr. X', status: 'attended', new_patient: false },
      ];
      let result!: DashboardData;
      service.loadData().subscribe((d) => (result = d));
      httpMock.expectOne(ASSET_URL).flush(buildResponse(appointments));

      // median of [10, 20, 30, 40] is 25 and replaces the 0-minute appointment's duration
      expect(result.correctedDurationCount).toBe(1);
      expect(result.missingStatusCount).toBe(0);
      expect(result.exclusions).toEqual([]);
      // booked minutes: 10+20+30+40+25 = 125 of a 540-minute, single-doctor, single-day capacity
      expect(result.totals.bookedPercent).toBe(23.1);
    });

    it('counts appointments with a missing status toward booked but not completed', () => {
      const appointments: Appointment[] = [
        {
          appointment_id: 'M-1',
          date: '2024-01-01T09:00:00',
          duration_minutes: 30,
          treatment_type: 'EKG',
          doctor: 'Dr. A',
          status: null,
          new_patient: false,
        },
      ];
      let result!: DashboardData;
      service.loadData().subscribe((d) => (result = d));
      httpMock.expectOne(ASSET_URL).flush(buildResponse(appointments));

      expect(result.missingStatusCount).toBe(1);
      expect(result.totals.totalAppointmentCount).toBe(1);
      expect(result.totals.completedPercent).toBe(0);
      expect(result.totals.bookedPercent).toBeGreaterThan(0);
    });

    it('counts no-show appointments in the no-show rate but not as completed', () => {
      const appointments: Appointment[] = [
        {
          appointment_id: 'N-1',
          date: '2024-01-01T09:00:00',
          duration_minutes: 30,
          treatment_type: 'EKG',
          doctor: 'Dr. A',
          status: 'no_show',
          new_patient: false,
        },
      ];
      let result!: DashboardData;
      service.loadData().subscribe((d) => (result = d));
      httpMock.expectOne(ASSET_URL).flush(buildResponse(appointments));

      expect(result.totals.noShowCount).toBe(1);
      expect(result.totals.noShowRatePercent).toBe(100);
      expect(result.totals.completedPercent).toBe(0);
    });

    it('falls back to the default doctor count and returns all-zero totals when no appointments are regular', () => {
      const appointments: Appointment[] = [
        { appointment_id: 'WKND-1', date: '2024-01-06T09:00:00', duration_minutes: 20, treatment_type: 'EKG', doctor: 'Dr. A', status: 'attended', new_patient: false },
        { appointment_id: 'LATE-1', date: '2024-01-01T19:30:00', duration_minutes: 15, treatment_type: 'EKG', doctor: 'Dr. A', status: 'attended', new_patient: false },
      ];
      let result!: DashboardData;
      service.loadData().subscribe((d) => (result = d));
      httpMock.expectOne(ASSET_URL).flush(buildResponse(appointments));

      expect(result.weeks).toEqual([]);
      expect(result.doctors).toEqual([]);
      expect(result.treatmentTypes).toEqual([]);
      expect(result.totals).toEqual({
        bookedPercent: 0,
        completedPercent: 0,
        gapPercent: 0,
        noShowRatePercent: 0,
        totalAppointmentCount: 0,
        noShowCount: 0,
      });
    });

    it('aggregates weekly, per-doctor and per-treatment-type statistics for a mixed dataset', () => {
      const appointments: Appointment[] = [
        { appointment_id: 'A-1', date: '2024-01-01T09:00:00', duration_minutes: 30, treatment_type: 'EKG', doctor: 'Dr. A', status: 'attended', new_patient: false },
        { appointment_id: 'A-2', date: '2024-01-01T10:00:00', duration_minutes: 30, treatment_type: 'EKG', doctor: 'Dr. A', status: 'no_show', new_patient: false },
        { appointment_id: 'B-1', date: '2024-01-02T09:00:00', duration_minutes: 0, treatment_type: 'EKG', doctor: 'Dr. B', status: 'attended', new_patient: false },
        { appointment_id: 'B-2', date: '2024-01-02T10:00:00', duration_minutes: 45, treatment_type: 'Blutabnahme', doctor: 'Dr. B', status: null, new_patient: false },
        { appointment_id: 'WKND-1', date: '2024-01-06T09:00:00', duration_minutes: 20, treatment_type: 'EKG', doctor: 'Dr. A', status: 'attended', new_patient: false },
        { appointment_id: 'LATE-1', date: '2024-01-01T19:30:00', duration_minutes: 15, treatment_type: 'EKG', doctor: 'Dr. A', status: 'attended', new_patient: false },
      ];
      let result!: DashboardData;
      service.loadData().subscribe((d) => (result = d));
      httpMock.expectOne(ASSET_URL).flush(
        buildResponse(appointments, { practice: 'Hausarztpraxis Test' })
      );

      expect(result.practice).toBe('Hausarztpraxis Test');
      expect(result.periodLabel).toBe('01.01. – 02.01.');
      expect(result.openingHoursNote).toBe('Mo-Fr 08:00-18:00');

      expect(result.exclusions).toEqual([
        { appointment_id: 'WKND-1', reason: 'Termin am Wochenende', date: '2024-01-06T09:00:00' },
        { appointment_id: 'LATE-1', reason: 'Termin außerhalb der Öffnungszeiten (19:30 Uhr)', date: '2024-01-01T19:30:00' },
      ]);
      expect(result.correctedDurationCount).toBe(1);
      expect(result.missingStatusCount).toBe(1);

      // EKG median across all appointments is (20+30)/2 = 25, so B-1's 0-minute duration becomes 25
      expect(result.weeks).toEqual([
        { week: 'KW1', periodLabel: '01.01.–02.01.', bookedPercent: 2.4, completedPercent: 1 },
      ]);

      expect(result.doctors).toEqual([
        { doctor: 'Dr. A', utilizationPercent: 2.8 },
        { doctor: 'Dr. B', utilizationPercent: 2.3 },
      ]);

      expect(result.treatmentTypes).toEqual([
        { treatmentType: 'EKG', count: 3 },
        { treatmentType: 'Blutabnahme', count: 1 },
      ]);

      expect(result.totals).toEqual({
        bookedPercent: 6,
        completedPercent: 2.5,
        gapPercent: 3.5,
        noShowRatePercent: 25,
        totalAppointmentCount: 4,
        noShowCount: 1,
      });
    });
  });
});
