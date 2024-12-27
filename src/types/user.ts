export type UserRole = 'admin' | 'masjid_admin';

export interface UserRead {
  id: string;
  email: string;
  role: UserRole;
  active: boolean;
  full_name: string | null;
  related_masjid: string | null;
}

export interface UserCreate {
  email: string;
  password: string;
  role?: UserRole;
  active: boolean;
  full_name: string | null;
  related_masjid: string | null;
}

export interface UserUpdate {
  email: string;
  role: UserRole;
  active: boolean;
  full_name: string | null;
  related_masjid: string | null;
}

export interface UserPasswordReset {
  new_password: string;
  confirm_password: string;
} 