import { useUser } from '../store/useStore';

export function useMasjid() {
  const user = useUser();
  return {
    masjidId: user?.related_masjid || null,
  };
} 