import axios from 'axios';
import { Masjid } from '../types/api';
import { MasjidRead, MasjidCreate } from '../types/masjid';

interface UserLogin {
  email: string;
  password: string;
}

interface UserRead {
  email: string;
  role: UserRole;
  active: boolean;
  full_name: string | null;
  related_masjid: string | null;
  id: string;
}

type UserRole = 'admin' | 'masjid_admin';

interface LoginResponse {
  access_token: string;
  refresh_token: string;
}

interface AuthRefreshToken {
  refresh_token: string;
}

interface UserPasswordReset {
  new_password: string;
  confirm_password: string;
}

interface UserUpdate {
  email: string;
  role: UserRole;
  active: boolean;
  full_name: string | null;
  related_masjid: string | null;
}

interface UserCreate {
  email: string;
  password: string;
  role?: UserRole;
  active: boolean;
  full_name: string | null;
  related_masjid: string | null;
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

export interface Config {
  id: string;
  config_option: 'hijri_adjustment';
  value: string;
}

export type ConfigCreate = Omit<Config, 'id'>;

const API_URL = import.meta.env.VITE_API_URL;
const API_KEY = import.meta.env.VITE_API_KEY;

// Create a separate instance for refresh token requests
const refreshApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY,
  }
});

interface ApiOptions extends RequestInit {
  body?: any;
  params?: Record<string, any>;
}

class ApiService {
  private async fetchWithAuth<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const url = new URL(`${API_URL}${endpoint}`);
    
    // Add query parameters if they exist
    if (options.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    // Get the auth token
    const token = localStorage.getItem('token');
    
    // Merge headers, ensuring API key and Authorization are included
    const headers = {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    };

    // If body is an object, stringify it
    const body = options.body ? JSON.stringify(options.body) : undefined;

    try {
      const response = await fetch(url.toString(), {
        ...options,
        headers,
        body,
      });

      const data = await response.json();

      // Handle both 401 and 403 for token refresh
      if (response.status === 401 || response.status === 403) {
        try {
          console.log('Refreshing token');
          const refreshToken = localStorage.getItem('refresh_token');
          if (!refreshToken) {
            throw new Error('No refresh token available');
          }

          // Try to refresh the token
          const refreshResponse = await refreshApi.post<AuthAccessToken>('/refresh', null, {
            headers: {
              'Authorization': `Bearer ${refreshToken}`
            }
          });

          if (refreshResponse.data.access_token) {
            localStorage.setItem('token', refreshResponse.data.access_token);
            
            // Retry the original request with new token
            const retryResponse = await fetch(url.toString(), {
              ...options,
              headers: {
                ...headers,
                'Authorization': `Bearer ${refreshResponse.data.access_token}`,
              },
              body,
            });

            const retryData = await retryResponse.json();

            if (!retryResponse.ok) {
              throw new Error(retryData.message || `API Error: ${retryResponse.status} ${retryResponse.statusText}`);
            }

            return retryData as T;
          }
        } catch (refreshError) {
          // If refresh fails, clear both tokens and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
          throw new Error('Session expired. Please login again.');
        }
      }

      if (!response.ok) {
        throw new Error(data.message || `API Error: ${response.status} ${response.statusText}`);
      }

      return data as T;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Update method signatures to use generics properly
  async get<T>(endpoint: string, options: Omit<ApiOptions, 'body'> = {}): Promise<T> {
    return this.fetchWithAuth<T>(endpoint, {
      ...options,
      method: 'GET',
    });
  }

  async post<T>(endpoint: string, data: unknown, options: ApiOptions = {}): Promise<T> {
    return this.fetchWithAuth<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data,
    });
  }

  async patch<T>(endpoint: string, data: unknown, options: ApiOptions = {}): Promise<T> {
    return this.fetchWithAuth<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data,
    });
  }

  async put<T>(endpoint: string, data: unknown, options: ApiOptions = {}): Promise<T> {
    return this.fetchWithAuth<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data,
    });
  }

  async delete<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    return this.fetchWithAuth<T>(endpoint, {
      ...options,
      method: 'DELETE',
    });
  }
}

export const api = new ApiService();

// Update interfaces to match OpenAPI spec
interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

interface AuthAccessToken {
  access_token: string;
}

// Update auth API implementation
export const authApi = {
  login: async (credentials: UserLogin): Promise<AuthTokens> => {
    const response = await api.post<AuthTokens>('/login', credentials);
    
    if (response.access_token) {
      localStorage.setItem('token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
    }
    
    return response;
  },

  getCurrentUser: async (): Promise<UserRead> => {
    return api.get<UserRead>('/user');
  },

  refreshToken: async (): Promise<AuthAccessToken> => {
    const refreshToken = localStorage.getItem('refresh_token');
    
    const response = await refreshApi.post<AuthAccessToken>('/refresh', null, {
      headers: {
        'Authorization': `Bearer ${refreshToken}`
      }
    });
    
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
    }
    
    return response.data;
  },

  updateUser: async (userId: string, data: UserUpdate): Promise<UserRead> => {
    return api.put<UserRead>(`/user/${userId}`, data);
  },

  resetPassword: async (userId: string, passwords: UserPasswordReset): Promise<void> => {
    return api.put<void>(`/user/${userId}/password-reset`, passwords);
  },

  createUser: async (data: UserCreate): Promise<void> => {
    return api.post<void>('/user', data);
  },

  getUsers: async (): Promise<UserRead[]> => {
    return api.get<UserRead[]>('/users');
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
  }
};

// Add proper type for the API response
interface ApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
}

// Update GetMasjidsParams to use proper types from OpenAPI spec
interface GetMasjidsParams {
  search?: string;
  type_filter?: string | null;
  madhab_filter?: string | null;
  locale_filter?: string | null;
  page?: number;
  size?: number;
}

// Update PaginatedMasjids to match OpenAPI spec
interface PaginatedMasjids {
  items: MasjidRead[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// Update masjidApi implementation with proper types
export const masjidApi = {
  getMasjids: async (params: GetMasjidsParams = {}): Promise<PaginatedMasjids> => {
    return api.get<PaginatedMasjids>('/masjids', {
      params: {
        search: params.search || '',
        type_filter: params.type_filter || undefined,
        madhab_filter: params.madhab_filter || undefined,
        locale_filter: params.locale_filter || undefined,
        page: params.page || 1,
        size: params.size || 20
      }
    });
  },

  getMasjid: async (id: string): Promise<MasjidRead> => {
    return api.get<MasjidRead>(`/masjids/masjid/${id}`);
  },
  
  createMasjid: async (data: MasjidCreate): Promise<MasjidRead> => {
    return api.post<MasjidRead>('/masjids/masjid', data);
  },

  updateMasjid: async (id: string, data: Partial<Masjid>): Promise<MasjidRead> => {
    return api.patch<MasjidRead>(`/masjids/masjid/${id}`, data);
  },

  getPrayerTimes: async (masjidId: string, startDate?: string, endDate?: string, limit?: number): Promise<PrayerTime[]> => {
    return api.get<PrayerTime[]>(`/masjids/masjid/${masjidId}/prayer-times`, {
      params: { date: startDate, end_date: endDate, limit }
    });
  },

  updatePrayerTime: async (masjidId: string, prayerTimeId: string, data: Partial<PrayerTime>): Promise<PrayerTime> => {
    return api.patch<PrayerTime>(`/masjids/masjid/${masjidId}/prayer-times/${prayerTimeId}`, data);
  },

  getSpecialPrayers: async (masjidId: string): Promise<SpecialPrayer[]> => {
    return api.get<SpecialPrayer[]>(`/masjids/masjid/${masjidId}/special-prayers`);
  },

  createSpecialPrayer: async (masjidId: string, data: Omit<SpecialPrayer, 'id'>): Promise<SpecialPrayer> => {
    return api.post<SpecialPrayer>(`/masjids/masjid/${masjidId}/special-prayers`, data);
  },

  updateSpecialPrayer: async (masjidId: string, prayerId: string, data: Partial<SpecialPrayer>): Promise<SpecialPrayer> => {
    return api.patch<SpecialPrayer>(`/masjids/masjid/${masjidId}/special-prayers/${prayerId}`, data);
  },

  getAnnouncements: async (masjidId: string): Promise<Announcement[]> => {
    return api.get<Announcement[]>(`/masjids/masjid/${masjidId}/announcement`);
  },

  createAnnouncement: async (masjidId: string, data: AnnouncementCreate): Promise<Announcement> => {
    return api.post<Announcement>(`/masjids/masjid/${masjidId}/announcement`, data);
  },

  updateAnnouncement: async (masjidId: string, announcementId: string, data: Partial<Announcement>): Promise<Announcement> => {
    return api.patch<Announcement>(`/masjids/masjid/${masjidId}/announcement/${announcementId}`, data);
  },

  getFacilities: async (masjidId: string): Promise<Facility[]> => {
    return api.get<Facility[]>(`/masjids/masjid/${masjidId}/facility`);
  },

  createFacility: async (masjidId: string, data: FacilityCreate): Promise<Facility> => {
    return api.post<Facility>(`/masjids/masjid/${masjidId}/facility`, data);
  },

  updateFacility: async (masjidId: string, facilityId: string, data: Partial<Facility>): Promise<Facility> => {
    return api.patch<Facility>(`/masjids/masjid/${masjidId}/facility/${facilityId}`, data);
  },

  getMasjidLocation: async (masjidId: string): Promise<Location> => {
    return api.get<Location>(`/masjids/masjid/${masjidId}/location`);
  },

  updateMasjidLocation: async (masjidId: string, locationId: string, data: Location): Promise<Location> => {
    return api.patch<Location>(`/masjids/masjid/${masjidId}/location/${locationId}`, data);
  },

  createMasjidLocation: async (masjidId: string, data: LocationCreate): Promise<Location> => {
    return api.post<Location>(`/masjids/masjid/${masjidId}/location`, data);
  },
};

// Add configApi implementation
export const configApi = {
  getConfigs: async (): Promise<Config[]> => {
    const response = await api.get<Config[]>('/configs');
    return response;
  },

  createConfig: async (data: ConfigCreate): Promise<Config> => {
    const response = await api.post<Config>('/configs/config', data);
    return response;
  },

  updateConfig: async (configId: string, data: ConfigCreate): Promise<Config> => {
    const response = await api.patch<Config>(`/configs/config/${configId}`, data);
    return response;
  },

  deleteConfig: async (configId: string): Promise<void> => {
    await api.delete<void>(`/configs/config/${configId}`);
  },
};

export default api;