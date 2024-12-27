import axios from 'axios';
import { Masjid } from '../types/api';
import { MasjidRead, MasjidCreate } from '../types/masjid';

interface UserLogin {
  email: string;
  password: string;
}

interface LoginResponse {
  access_token?: string;
  token?: string;
}

interface AuthRefreshToken {
  access_token: string;
}

export interface SpecialPrayer {
  id?: string;
  masjid_id: string;
  date_start: string | null;
  date_end: string | null;
  is_hijri: boolean;
  label: string;
  type: 'jummuah' | 'eid' | 'tahajud' | 'taraweeh' | 'other';
  info: string | null;
  imam: string | null;
  start_time: string | null;
  jammat_time: string | null;
}

export interface Announcement {
  id?: string;
  masjid_id: string;
  message: string;
  date_issued: string;
  date_expired: string | null;
}

export interface AnnouncementCreate {
  masjid_id: string;
  message: string;
  date_issued: string;
  date_expired: string | null;
}

export interface PrayerTime {
  id?: string;
  masjid_id: string;
  date: string;
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

export interface Facility {
  id?: string;
  masjid_id: string;
  facility: string;
  info: string | null;
}

export interface FacilityCreate {
  masjid_id: string;
  facility: string;
  info: string | null;
}

export interface Location {
  id?: string;
  masjid_id: string;
  geoHash: string;
  city: string;
  country: string;
  full_address: string;
  latitude: number;
  longitude: number;
}

export interface LocationCreate {
  masjid_id: string;
  geoHash: string;
  city: string;
  country: string;
  full_address: string;
  latitude: number;
  longitude: number;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
console.log('API_URL', API_URL);    

// Create a separate axios instance for refresh token requests
const refreshApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Add request interceptor to add token to refresh requests
refreshApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 and we haven't tried to refresh the token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token using the separate refreshApi instance
        const response = await refreshApi.post<AuthRefreshToken>('/refresh');
        const newToken = response.data.access_token;
        
        // Save the new token
        localStorage.setItem('token', newToken);
        
        // Update the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        
        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, clear token and redirect to login
        localStorage.removeItem('token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Add request interceptor to add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: async (credentials: UserLogin): Promise<LoginResponse> => {
    try {
      const response = await api.post('/login', credentials);
      console.log('Login response:', response.data);
      
      if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
      }
      
      return response.data;
    } catch (error) {
      console.error('Login error details:', error);
      throw error;
    }
  },
  
  getCurrentUser: async () => {
    try {
      const response = await api.get('/user');
      console.log('Current user response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  },

  refreshToken: async (): Promise<AuthRefreshToken> => {
    // Use the separate refreshApi instance for token refresh
    const response = await refreshApi.post('/refresh');
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
    }
    return response.data;
  },
};

interface GetMasjidsParams {
  search?: string;
  type_filter?: string | null;
  madhab_filter?: string | null;
  locale_filter?: string | null;
  page?: number;
  size?: number;
}

interface PaginatedMasjids {
  items: MasjidRead[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export const masjidApi = {
  getMasjids: async (params: GetMasjidsParams = {}): Promise<PaginatedMasjids> => {
    const response = await api.get('/masjids', {
      params: {
        search: params.search || '',
        type_filter: params.type_filter || undefined,
        madhab_filter: params.madhab_filter || undefined,
        locale_filter: params.locale_filter || undefined,
        page: params.page || 1,
        size: params.size || 20
      }
    });
    return response.data;
  },

  getMasjid: async (id: string) => {
    const response = await api.get(`/masjids/masjid/${id}`);
    return response.data;
  },
  
  createMasjid: async (data: MasjidCreate): Promise<MasjidRead> => {
    const response = await api.post('/masjids/masjid', data);
    return response.data;
  },

  updateMasjid: async (id: string, data: Partial<Masjid>) => {
    const response = await api.patch(`/masjids/masjid/${id}`, data);
    return response.data;
  },

  getPrayerTimes: async (masjidId: string, startDate?: string, endDate?: string, limit?: number) => {
    const response = await api.get(`/masjids/masjid/${masjidId}/prayer-times`, {
      params: { date: startDate, end_date: endDate, limit }
    });
    return response.data;
  },

  updatePrayerTime: async (masjidId: string, prayerTimeId: string, data: Partial<PrayerTime>) => {
    const response = await api.patch(`/masjids/masjid/${masjidId}/prayer-times/${prayerTimeId}`, data);
    return response.data;
  },

  getSpecialPrayers: async (masjidId: string) => {
    const response = await api.get(`/masjids/masjid/${masjidId}/special-prayers`);
    return response.data;
  },

  createSpecialPrayer: async (masjidId: string, data: Omit<SpecialPrayer, 'id'>) => {
    const response = await api.post(`/masjids/masjid/${masjidId}/special-prayers`, data);
    return response.data;
  },

  updateSpecialPrayer: async (masjidId: string, prayerId: string, data: Partial<SpecialPrayer>) => {
    const response = await api.patch(`/masjids/masjid/${masjidId}/special-prayers/${prayerId}`, data);
    return response.data;
  },

  getAnnouncements: async (masjidId: string) => {
    const response = await api.get(`/masjids/masjid/${masjidId}/announcement`);
    return response.data;
  },

  createAnnouncement: async (masjidId: string, data: Omit<Announcement, 'id'>) => {
    const response = await api.post(`/masjids/masjid/${masjidId}/announcement`, data);
    return response.data;
  },

  updateAnnouncement: async (masjidId: string, announcementId: string, data: Partial<Announcement>) => {
    const response = await api.patch(`/masjids/masjid/${masjidId}/announcement/${announcementId}`, data);
    return response.data;
  },

  getFacilities: async (masjidId: string) => {
    const response = await api.get(`/masjids/masjid/${masjidId}/facility`);
    return response.data;
  },

  createFacility: async (masjidId: string, data: Omit<Facility, 'id'>) => {
    const response = await api.post(`/masjids/masjid/${masjidId}/facility`, data);
    return response.data;
  },

  updateFacility: async (masjidId: string, facilityId: string, data: Partial<Facility>) => {
    const response = await api.patch(`/masjids/masjid/${masjidId}/facility/${facilityId}`, data);
    return response.data;
  },

  getMasjidLocation: async (masjidId: string): Promise<Location> => {
    const response = await api.get(`/masjids/masjid/${masjidId}/location`);
    return response.data;
  },

  updateMasjidLocation: async (masjidId: string, locationId: string, data: Location) => {
    const response = await api.patch(`/masjids/masjid/${masjidId}/location/${locationId}`, data);
    return response.data;
  },

  createMasjidLocation: async (masjidId: string, data: LocationCreate) => {
    const response = await api.post(`/masjids/masjid/${masjidId}/location`, data);
    return response.data;
  },
};

export default api;