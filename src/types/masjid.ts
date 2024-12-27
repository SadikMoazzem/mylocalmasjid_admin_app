export interface MasjidRead {
  id: string;
  name: string;
  type: string;
  locale: string;
  madhab: string;
  website: string | null;
  has_times: boolean;
  active: boolean;
}

export interface MasjidUpdate {
  name: string;
  type: string;
  locale: string;
  madhab: string;
  website: string | null;
  has_times: boolean;
  active: boolean;
}

export interface MasjidCreate {
  name: string;
  type: string;
  locale: string | null;
  madhab: string | null;
  website: string | null;
  has_times: boolean;
  active: boolean;
} 