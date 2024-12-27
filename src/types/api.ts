export interface Masjid {
    id: string;
    name: string;
    type: string;
    locale: string | null;
    madhab: string | null;
    website: string | null;
    has_times: boolean;
    active: boolean;
  }
  
  export interface User {
    id: string;
    email: string;
    role: 'admin' | 'masjid_admin';
    active: boolean;
    full_name: string | null;
    related_masjid: string | null;
  }
  
  export interface LoginResponse {
    access_token: string;
    refresh_token: string;
  }
  
  export interface PrayerTimes {
    id: string;
    masjid_id: string;
    date: string;
    hijri_date: string;
    fajr_start: string;
    fajr_jammat: string;
    sunrise: string;
    dhur_start: string;
    dhur_jammat: string;
    asr_start: string;
    asr_start_1: string | null;
    asr_jammat: string;
    magrib_start: string;
    magrib_jammat: string;
    isha_start: string;
    isha_jammat: string;
    active: boolean;
  }
  
  export interface PrayerTime {
    id: string;
    masjid_id: string;
    date: string;
    active: boolean;
    fajr_start: string;
    fajr_jammat: string;
    sunrise: string;
    dhur_start: string;
    dhur_jammat: string;
    asr_start: string;
    asr_start_1: string | null;
    asr_jammat: string;
    magrib_start: string;
    magrib_jammat: string;
    isha_start: string;
    isha_jammat: string;
    hijri_date: string;
  }
  
  export interface SpecialPrayer {
    id: string;
    label: string;
    type: 'jummuah' | 'eid';
    date: string | null;
    start_time: string | null;
    jammat_time: string | null;
    imam: string | null;
    info: string | null;
  }
  
  export interface Announcement {
    id: string;
    date_issued: string;
    date_expired: string | null;
    message: string;
  }
  
  export interface Facility {
    id: string;
    facility: string;
    info: string | null;
  }