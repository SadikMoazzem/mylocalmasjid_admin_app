import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { masjidApi, PrayerTime } from '../services/api';

interface UsePrayerTimesOptions {
  startDate?: string;
  endDate?: string;
  limit?: number;
}

export function usePrayerTimes(masjidId: string | null | undefined, options: UsePrayerTimesOptions = {}) {
  const queryClient = useQueryClient();
  const { startDate, endDate, limit } = options;

  // Query for fetching prayer times
  const prayerTimesQuery = useQuery({
    queryKey: ['prayer-times', masjidId, startDate, endDate],
    queryFn: () => masjidId ? masjidApi.getPrayerTimes(masjidId, startDate, endDate, limit) : Promise.resolve([]),
    enabled: !!masjidId,
  });

  // Mutation for updating a prayer time
  const updatePrayerTime = useMutation({
    mutationFn: ({ prayerTimeId, data }: { prayerTimeId: string; data: Partial<PrayerTime> }) => {
      if (!masjidId) throw new Error('Masjid ID is required');
      return masjidApi.updatePrayerTime(masjidId, prayerTimeId, data);
    },
    onSuccess: () => {
      notifications.show({
        title: 'Success',
        message: 'Prayer time updated successfully',
        color: 'green',
      });
      queryClient.invalidateQueries({ queryKey: ['prayer-times', masjidId] });
    },
    onError: (error: Error) => {
      console.error('Update error:', error);
      notifications.show({
        title: 'Error',
        message: error.message || 'Failed to update prayer time',
        color: 'red',
      });
    },
  });

  // Helper function to format time string (HH:mm)
  const formatTime = (time: string | null): string => {
    if (!time) return '';
    return time.substring(0, 5); // Extract HH:mm from HH:mm:ss
  };

  return {
    prayerTimes: prayerTimesQuery.data || [],
    isLoading: prayerTimesQuery.isLoading,
    isError: prayerTimesQuery.isError,
    error: prayerTimesQuery.error,
    updatePrayerTime,
    formatTime,
  };
} 