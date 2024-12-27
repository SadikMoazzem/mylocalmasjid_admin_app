import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { masjidApi, SpecialPrayer } from '../services/api';

export function useSpecialPrayers(masjidId: string | null | undefined) {
  const queryClient = useQueryClient();

  // Query for fetching special prayers
  const specialPrayersQuery = useQuery({
    queryKey: ['special-prayers', masjidId],
    queryFn: () => masjidId ? masjidApi.getSpecialPrayers(masjidId) : Promise.resolve([]),
    enabled: !!masjidId,
  });

  // Mutation for creating a special prayer
  const createSpecialPrayer = useMutation({
    mutationFn: (data: Omit<SpecialPrayer, 'id'>) => {
      if (!masjidId) throw new Error('Masjid ID is required');
      return masjidApi.createSpecialPrayer(masjidId, data);
    },
    onSuccess: () => {
      notifications.show({
        title: 'Success',
        message: 'Special prayer created successfully',
        color: 'green',
      });
      queryClient.invalidateQueries({ queryKey: ['special-prayers', masjidId] });
    },
    onError: (error: Error) => {
      console.error('Create error:', error);
      notifications.show({
        title: 'Error',
        message: error.message || 'Failed to create special prayer',
        color: 'red',
      });
    },
  });

  // Mutation for updating a special prayer
  const updateSpecialPrayer = useMutation({
    mutationFn: (data: SpecialPrayer) => {
      if (!masjidId) throw new Error('Masjid ID is required');
      if (!data.id) throw new Error('Prayer ID is required');
      
      return masjidApi.updateSpecialPrayer(masjidId, data.id, {
        masjid_id: data.masjid_id,
        date_start: data.date_start,
        date_end: data.date_end,
        is_hijri: data.is_hijri,
        label: data.label,
        type: data.type,
        info: data.info,
        imam: data.imam,
        start_time: data.start_time,
        jammat_time: data.jammat_time,
      });
    },
    onSuccess: () => {
      notifications.show({
        title: 'Success',
        message: 'Special prayer updated successfully',
        color: 'green',
      });
      queryClient.invalidateQueries({ queryKey: ['special-prayers', masjidId] });
    },
    onError: (error: Error) => {
      console.error('Update error:', error);
      notifications.show({
        title: 'Error',
        message: error.message || 'Failed to update special prayer',
        color: 'red',
      });
    },
  });

  // Helper functions for prayer status
  const isActivePrayer = (prayer: SpecialPrayer) => {
    const today = new Date().toISOString().split('T')[0];
    const startDate = prayer.date_start;
    const endDate = prayer.date_end || prayer.date_start;
    
    return startDate && endDate && 
           startDate <= today && 
           endDate >= today;
  };

  const isUpcomingPrayer = (prayer: SpecialPrayer) => {
    const today = new Date().toISOString().split('T')[0];
    const startDate = prayer.date_start;
    
    return startDate && startDate > today;
  };

  return {
    specialPrayers: specialPrayersQuery.data || [],
    isLoading: specialPrayersQuery.isLoading,
    isError: specialPrayersQuery.isError,
    error: specialPrayersQuery.error,
    createSpecialPrayer,
    updateSpecialPrayer,
    isActivePrayer,
    isUpcomingPrayer,
  };
} 