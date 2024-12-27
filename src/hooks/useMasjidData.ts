import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { masjidApi } from '../services/api';
import { MasjidRead, MasjidCreate } from '../types/masjid';

interface UseMasjidDataOptions {
  search?: string;
  type_filter?: string | null;
  madhab_filter?: string | null;
  locale_filter?: string | null;
  page?: number;
  size?: number;
}

export function useMasjidData(options: UseMasjidDataOptions = {}) {
  const queryClient = useQueryClient();

  // Query for fetching masjids list
  const masjidsQuery = useQuery({
    queryKey: ['masjids', options],
    queryFn: () => masjidApi.getMasjids(options),
  });

  // Mutation for creating a masjid
  const createMasjid = useMutation({
    mutationFn: (data: MasjidCreate) => masjidApi.createMasjid(data),
    onSuccess: () => {
      notifications.show({
        title: 'Success',
        message: 'Masjid created successfully',
        color: 'green',
      });
      queryClient.invalidateQueries({ queryKey: ['masjids'] });
    },
    onError: (error: Error) => {
      console.error('Create error:', error);
      notifications.show({
        title: 'Error',
        message: error.message || 'Failed to create masjid',
        color: 'red',
      });
    },
  });

  // Mutation for updating a masjid
  const updateMasjid = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<MasjidRead> }) => {
      return masjidApi.updateMasjid(id, data);
    },
    onSuccess: () => {
      notifications.show({
        title: 'Success',
        message: 'Masjid updated successfully',
        color: 'green',
      });
      queryClient.invalidateQueries({ queryKey: ['masjids'] });
    },
    onError: (error: Error) => {
      console.error('Update error:', error);
      notifications.show({
        title: 'Error',
        message: error.message || 'Failed to update masjid',
        color: 'red',
      });
    },
  });

  return {
    masjids: masjidsQuery.data?.items || [],
    totalMasjids: masjidsQuery.data?.total || 0,
    currentPage: masjidsQuery.data?.page || 1,
    totalPages: masjidsQuery.data?.pages || 1,
    isLoading: masjidsQuery.isLoading,
    isError: masjidsQuery.isError,
    error: masjidsQuery.error,
    createMasjid,
    updateMasjid,
  };
}

// Separate hook for fetching a single masjid
export function useMasjidDetails(id: string | null | undefined) {
  const masjidQuery = useQuery({
    queryKey: ['masjid', id],
    queryFn: () => (id ? masjidApi.getMasjid(id) : Promise.resolve(null)),
    enabled: !!id,
  });

  return {
    masjid: masjidQuery.data,
    isLoading: masjidQuery.isLoading,
    isError: masjidQuery.isError,
    error: masjidQuery.error,
  };
} 