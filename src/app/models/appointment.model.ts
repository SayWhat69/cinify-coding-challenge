export type AppointmentStatus = 'attended' | 'no_show' | 'cancelled' | null;

export interface Appointment {
  appointment_id: string;
  date: string; // ISO datetime
  duration_minutes: number;
  treatment_type: string;
  doctor: string;
  status: AppointmentStatus;
  new_patient: boolean;
}

export interface AppointmentDataResponse {
  practice: string;
  period: { from: string; to: string };
  opening_hours_note: string;
  appointments: Appointment[];
}

export interface WeeklyStatistic {
  week: string;
  periodLabel: string;
  bookedPercent: number;
  completedPercent: number;
}

export interface DoctorStatistic {
  doctor: string;
  utilizationPercent: number;
}

export interface TreatmentTypeStatistic {
  treatmentType: string;
  count: number;
}

export interface Exclusion {
  appointment_id: string;
  reason: string;
  date: string;
}

export interface DashboardData {
  practice: string;
  periodLabel: string;
  openingHoursNote: string;
  totals: {
    bookedPercent: number;
    completedPercent: number;
    gapPercent: number;
    noShowRatePercent: number;
    totalAppointmentCount: number;
    noShowCount: number;
  };
  weeks: WeeklyStatistic[];
  doctors: DoctorStatistic[];
  treatmentTypes: TreatmentTypeStatistic[];
  exclusions: Exclusion[];
  missingStatusCount: number;
  correctedDurationCount: number;
}
