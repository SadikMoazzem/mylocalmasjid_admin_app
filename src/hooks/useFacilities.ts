import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { masjidApi, Facility } from '../services/api';

export function useFacilities(masjidId: string | null | undefined) {
  const queryClient = useQueryClient();

  // Query for fetching facilities
  const facilitiesQuery = useQuery({
    queryKey: ['facilities', masjidId],
    queryFn: () => masjidId ? masjidApi.getFacilities(masjidId) : Promise.resolve([]),
    enabled: !!masjidId,
  });

  // Mutation for creating a facility
  const createFacility = useMutation({
    mutationFn: (data: Omit<Facility, 'id'>) => {
      if (!masjidId) throw new Error('Masjid ID is required');
      return masjidApi.createFacility(masjidId, data);
    },
    onSuccess: () => {
      notifications.show({
        title: 'Success',
        message: 'Facility created successfully',
        color: 'green',
      });
      queryClient.invalidateQueries({ queryKey: ['facilities', masjidId] });
    },
    onError: (error: Error) => {
      notifications.show({
        title: 'Error',
        message: error.message || 'Failed to create facility',
        color: 'red',
      });
    },
  });

  // Mutation for updating a facility
  const updateFacility = useMutation({
    mutationFn: (data: Facility) => {
      if (!masjidId) throw new Error('Masjid ID is required');
      if (!data.id) throw new Error('Facility ID is required');
      return masjidApi.updateFacility(masjidId, data.id, data);
    },
    onSuccess: () => {
      notifications.show({
        title: 'Success',
        message: 'Facility updated successfully',
        color: 'green',
      });
      queryClient.invalidateQueries({ queryKey: ['facilities', masjidId] });
    },
    onError: (error: Error) => {
      notifications.show({
        title: 'Error',
        message: error.message || 'Failed to update facility',
        color: 'red',
      });
    },
  });

  return {
    facilities: facilitiesQuery.data || [],
    isLoading: facilitiesQuery.isLoading,
    isError: facilitiesQuery.isError,
    error: facilitiesQuery.error,
    createFacility,
    updateFacility,
  };
} 