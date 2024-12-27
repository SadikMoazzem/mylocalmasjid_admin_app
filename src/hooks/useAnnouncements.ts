import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { masjidApi } from '../services/api';

export interface Announcement {
  id?: string;
  masjid_id: string;
  message: string;
  date_issued: string;
  date_expired: string | null;
}

export function useAnnouncements(masjidId: string | null | undefined) {
  const queryClient = useQueryClient();

  // Query for fetching announcements
  const announcementsQuery = useQuery({
    queryKey: ['announcements', masjidId],
    queryFn: () => masjidId ? masjidApi.getAnnouncements(masjidId) : Promise.resolve([]),
    enabled: !!masjidId,
  });

  // Mutation for creating an announcement
  const createAnnouncement = useMutation({
    mutationFn: (data: Omit<Announcement, 'id'>) => {
      if (!masjidId) throw new Error('Masjid ID is required');
      return masjidApi.createAnnouncement(masjidId, data);
    },
    onSuccess: () => {
      notifications.show({
        title: 'Success',
        message: 'Announcement created successfully',
        color: 'green',
      });
      queryClient.invalidateQueries({ queryKey: ['announcements', masjidId] });
    },
    onError: (error: Error) => {
      console.error('Create error:', error);
      notifications.show({
        title: 'Error',
        message: error.message || 'Failed to create announcement',
        color: 'red',
      });
    },
  });

  // Mutation for updating an announcement
  const updateAnnouncement = useMutation({
    mutationFn: (data: Announcement) => {
      if (!masjidId) throw new Error('Masjid ID is required');
      if (!data.id) throw new Error('Announcement ID is required');
      return masjidApi.updateAnnouncement(masjidId, data.id, data);
    },
    onSuccess: () => {
      notifications.show({
        title: 'Success',
        message: 'Announcement updated successfully',
        color: 'green',
      });
      queryClient.invalidateQueries({ queryKey: ['announcements', masjidId] });
    },
    onError: (error: Error) => {
      console.error('Update error:', error);
      notifications.show({
        title: 'Error',
        message: error.message || 'Failed to update announcement',
        color: 'red',
      });
    },
  });

  // Helper functions for announcement status
  const isActiveAnnouncement = (announcement: Announcement) => {
    const today = new Date().toISOString().split('T')[0];
    const startDate = announcement.date_issued;
    const endDate = announcement.date_expired || announcement.date_issued;
    
    return startDate <= today && endDate >= today;
  };

  const isUpcomingAnnouncement = (announcement: Announcement) => {
    const today = new Date().toISOString().split('T')[0];
    const startDate = announcement.date_issued;
    
    return startDate > today;
  };

  return {
    announcements: announcementsQuery.data || [],
    isLoading: announcementsQuery.isLoading,
    isError: announcementsQuery.isError,
    error: announcementsQuery.error,
    createAnnouncement,
    updateAnnouncement,
    isActiveAnnouncement,
    isUpcomingAnnouncement,
  };
} 