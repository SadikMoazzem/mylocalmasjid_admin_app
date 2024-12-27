export interface PrayerTime {
  id: string;
  date: string;
  hijri_date: string;
  fajr_start: string;
  fajr_jammat: string;
  sunrise: string;
  dhur_start: string;
  dhur_jammat: string;
  asr_start: string;
  asr_start_1?: string;
  asr_jammat: string;
  magrib_start: string;
  magrib_jammat: string;
  isha_start: string;
  isha_jammat: string;
}

export interface EditPrayerTimeFormValues {
  fajr_start: string;
  fajr_jammat: string;
  sunrise: string;
  dhur_start: string;
  dhur_jammat: string;
  asr_start: string;
  asr_start_1: string;
  asr_jammat: string;
  magrib_start: string;
  magrib_jammat: string;
  isha_start: string;
  isha_jammat: string;
} 