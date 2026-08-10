import { Injectable } from '@angular/core';
import { map, Observable, shareReplay } from 'rxjs';
import {
  DashboardData,
  AppointmentDataResponse,
  Appointment,
  WeeklyStatistic,
  DoctorStatistic,
  TreatmentTypeStatistic,
  Exclusion,
} from '../models/appointment.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private jsonFileName = "assets/termindaten.json";
  private data$?: Observable<DashboardData>;

  private readonly DOCTOR_COUNT_FALLBACK = 3;
  private readonly OPENING_START_HOUR = 8;
  private readonly OPENING_END_HOUR = 18;
  private readonly BREAK_MINUTES = 60;

  constructor(private httpClient: HttpClient) { }

  loadData() {
    if(!this.data$) {
      this.data$ = this.httpClient.get<AppointmentDataResponse>(this.jsonFileName).pipe(
        map((rawData) => this.cleanup(rawData)),
        shareReplay(1)
      )
    }
    return this.data$;
  }

  private cleanup(rawData: AppointmentDataResponse): DashboardData {
    const appointments = rawData.appointments;

    // 1. Median duration per treatment type (to correct 0-minute appointments)
    const durationsByType = new Map<string, number[]>();
    for (const t of appointments) {
      if (t.duration_minutes && t.duration_minutes > 0) {
        const list = durationsByType.get(t.treatment_type) ?? [];
        list.push(t.duration_minutes);
        durationsByType.set(t.treatment_type, list);
      }
    }
    const medianByType = new Map<string, number>();
    durationsByType.forEach((list, type) => medianByType.set(type, median(list)));

    // 2. Enrich appointments: corrected duration, regular slot yes/no, calendar week
    let correctedDurationCount = 0;
    let missingStatusCount = 0;
    const exclusions: Exclusion[] = [];

    interface Enriched extends Appointment {
      correctedDuration: number;
      isRegular: boolean;
      calendarWeek: string;
    }

    const enriched: Enriched[] = appointments.map((t) => {
      const date = new Date(t.date);
      const weekday = date.getDay(); // 0 = Sun, 6 = Sat
      const hour = date.getHours() + date.getMinutes() / 60;

      let isRegular = true;
      let exclusionReason: string | undefined;

      if (weekday === 0 || weekday === 6) {
        isRegular = false;
        exclusionReason = 'Termin am Wochenende';
      } else if (hour < this.OPENING_START_HOUR || hour >= this.OPENING_END_HOUR) {
        isRegular = false;
        exclusionReason = `Termin außerhalb der Öffnungszeiten (${formatTime(date)} Uhr)`;
      }

      if (!isRegular) {
        exclusions.push({ appointment_id: t.appointment_id, reason: exclusionReason!, date: t.date });
      }

      let correctedDuration = t.duration_minutes;
      if (!correctedDuration || correctedDuration <= 0) {
        correctedDuration = medianByType.get(t.treatment_type) ?? 15;
        correctedDurationCount++;
      }

      if (t.status === null || t.status === undefined) {
        missingStatusCount++;
      }

      return { ...t, correctedDuration, isRegular, calendarWeek: isoWeekLabel(date) };
    });

    const regular = enriched.filter((t) => t.isRegular);
    const doctorCount = new Set(regular.map((t) => t.doctor)).size || this.DOCTOR_COUNT_FALLBACK;
    const capacityPerDayPerDoctor =
      (this.OPENING_END_HOUR - this.OPENING_START_HOUR) * 60 - this.BREAK_MINUTES;

    // 3. Weekly statistics
    const weekGroups = groupBy(regular, (t) => t.calendarWeek);
    const weeks: WeeklyStatistic[] = Array.from(weekGroups.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([week, terms]) => {
        const daysInWeek = new Set(terms.map((t) => t.date.slice(0, 10))).size;
        const dayBasis = Math.max(daysInWeek, 5);
        const capacityMinutes = doctorCount * capacityPerDayPerDoctor * dayBasis;

        const bookedMinutes = sum(terms.map((t) => t.correctedDuration));
        const completed = terms.filter((t) => t.status === 'attended');
        const completedMinutes = sum(completed.map((t) => t.correctedDuration));

        return {
          week,
          periodLabel: weekRangeLabel(terms.map((t) => t.date)),
          bookedPercent: round1((bookedMinutes / capacityMinutes) * 100),
          completedPercent: round1((completedMinutes / capacityMinutes) * 100),
        };
      });

    // 4. Utilization per doctor (over the entire period, completed)
    const totalDays = new Set(regular.map((t) => t.date.slice(0, 10))).size;
    const doctorGroups = groupBy(regular, (t) => t.doctor);
    const doctors: DoctorStatistic[] = Array.from(doctorGroups.entries())
      .map(([doctor, terms]) => {
        const completedMinutes = sum(
          terms.filter((t) => t.status === 'attended').map((t) => t.correctedDuration)
        );
        const capacityMinutes = capacityPerDayPerDoctor * totalDays;
        return { doctor, utilizationPercent: round1((completedMinutes / capacityMinutes) * 100) };
      })
      .sort((a, b) => b.utilizationPercent - a.utilizationPercent);

    // 5. Treatment type distribution
    const typeGroups = groupBy(regular, (t) => t.treatment_type);
    const treatmentTypes: TreatmentTypeStatistic[] = Array.from(typeGroups.entries())
      .map(([treatmentType, terms]) => ({ treatmentType, count: terms.length }))
      .sort((a, b) => b.count - a.count);

    // 6. Overall totals
    const totalCapacity = doctorCount * capacityPerDayPerDoctor * totalDays;
    const totalBooked = sum(regular.map((t) => t.correctedDuration));
    const totalCompleted = sum(
      regular.filter((t) => t.status === 'attended').map((t) => t.correctedDuration)
    );
    const totalNoShow = regular.filter((t) => t.status === 'no_show').length;

    return {
      practice: rawData.practice,
      periodLabel: `${formatDate(rawData.period.from)} – ${formatDate(rawData.period.to)}`,
      openingHoursNote: rawData.opening_hours_note,
      totals: {
        bookedPercent: round1((totalBooked / totalCapacity) * 100),
        completedPercent: round1((totalCompleted / totalCapacity) * 100),
        gapPercent: round1(((totalBooked - totalCompleted) / totalCapacity) * 100),
        noShowRatePercent: round1((totalNoShow / regular.length) * 100),
        totalAppointmentCount: regular.length,
        noShowCount: totalNoShow,
      },
      weeks,
      doctors,
      treatmentTypes,
      exclusions,
      missingStatusCount,
      correctedDurationCount,
    };
  }
}

// --- Helper functions ---

function sum(values: number[]): number {
  return values.reduce((a, b) => a + b, 0);
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function round1(value: number): number {
  if (!isFinite(value)) return 0;
  return Math.round(value * 10) / 10;
}

function groupBy<T>(list: T[], keyFn: (item: T) => string): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const item of list) {
    const key = keyFn(item);
    const group = map.get(key) ?? [];
    group.push(item);
    map.set(key, group);
  }
  return map;
}

function isoWeekLabel(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `KW${weekNo}`;
}

function weekRangeLabel(dates: string[]): string {
  const sorted = [...dates].map((d) => d.slice(0, 10)).sort();
  return `${formatDate(sorted[0])}–${formatDate(sorted[sorted.length - 1])}`;
}

function formatDate(iso: string): string {
  const [year, month, day] = iso.split('-');
  return `${day}.${month}.`;
}

function formatTime(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}
