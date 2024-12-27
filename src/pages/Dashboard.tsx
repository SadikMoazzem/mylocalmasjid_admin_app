import { Container, Title, Paper, Text, Grid, Button, Stack, Badge, Group, Center, Loader } from '@mantine/core';
import { useUser } from '../store/useStore';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { masjidApi, PrayerTime, Announcement, SpecialPrayer } from '../services/api';
import { IconArrowRight } from '@tabler/icons-react';
import dayjs from 'dayjs';

function Dashboard() {
  const user = useUser();
  const { masjidId } = useParams();
  const today = dayjs().format('YYYY-MM-DD');

  // Fetch today's prayer times
  const { data: prayerTimesData, isLoading: isLoadingPrayerTimes } = useQuery({
    queryKey: ['prayer-times', masjidId, today],
    queryFn: async () => {
      try {
        const response = await masjidApi.getPrayerTimes(masjidId!, today);
        if (!response || response.length === 0) {
          return null;
        }
        return response[0];
      } catch (error) {
        console.error('Error fetching prayer times:', error);
        return null;
      }
    },
    enabled: !!masjidId
  });

  // Helper function to format time
  const formatTime = (time: string | null | undefined) => {
    if (!time) return 'Not set';
    try {
      // Split the time string into hours and minutes
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    } catch {
      return 'Not set';
    }
  };

  // Fetch current and upcoming announcements
  const { data: announcements } = useQuery({
    queryKey: ['announcements', masjidId],
    queryFn: () => masjidApi.getAnnouncements(masjidId!),
    enabled: !!masjidId
  });

  // Fetch current and upcoming special prayers
  const { data: specialPrayers } = useQuery({
    queryKey: ['special-prayers', masjidId],
    queryFn: () => masjidApi.getSpecialPrayers(masjidId!),
    enabled: !!masjidId
  });

  if (!user?.related_masjid && user?.role === 'masjid_admin') {
    return (
      <Container>
        <Title order={2}>Welcome</Title>
        <Paper p="md" mt="md">
          <Text>You don't have any assigned masjid yet.</Text>
          <Text>Please contact the administrator.</Text>
        </Paper>
      </Container>
    );
  }

  // Filter announcements
  const currentAnnouncements = announcements?.filter((a: Announcement) => {
    const now = dayjs();
    const startDate = dayjs(a.date_issued);
    const endDate = a.date_expired ? dayjs(a.date_expired) : now.add(100, 'years');
    return now.isAfter(startDate) && now.isBefore(endDate);
  }).slice(0, 3);

  const upcomingAnnouncements = announcements?.filter((a: Announcement) => 
    dayjs(a.date_issued).isAfter(dayjs(), 'day')
  ).slice(0, 3);

  const currentSpecialPrayers = specialPrayers?.filter((p: SpecialPrayer) => 
    dayjs(p.date_start).isSame(dayjs(), 'day') || 
    (dayjs(p.date_start).isBefore(dayjs()) && p.date_end && dayjs(p.date_end).isAfter(dayjs()))
  ).slice(0, 3);

  return (
    <Container size="xl" py="xl">
      <Grid gutter="lg">
        {/* Prayer Times Section */}
        <Grid.Col span={12}>
          <Paper withBorder p="md">
            <Group justify="space-between" mb="md">
              <div>
                <Title order={3}>Today's Prayer Times</Title>
                {prayerTimesData?.date && (
                  <Text size="sm" c="dimmed">Date: {prayerTimesData.date}</Text>
                )}
                {prayerTimesData?.hijri_date && (
                  <Text size="sm" c="dimmed">Hijri: {prayerTimesData.hijri_date}</Text>
                )}
              </div>
              <Button 
                component={Link}
                to={`/prayer-times/${masjidId}`}
                variant="light"
                rightSection={<IconArrowRight size={16} />}
              >
                View All Times
              </Button>
            </Group>
            {prayerTimesData?.fajr_start}
            
            {isLoadingPrayerTimes ? (
              <Center py="xl">
                <Loader />
              </Center>
            ) : !prayerTimesData ? (
              <Text c="dimmed" ta="center" py="xl">No prayer times available for today</Text>
            ) : (
              <Grid>
                <Grid.Col span={2}>
                  <Stack gap="xs">
                    <Text fw={500}>Fajr</Text>
                    <Stack gap={4}>
                      <Text size="xs" c="dimmed">Start</Text>
                      <Text size="lg" fw={500}>{formatTime(prayerTimesData?.fajr_start)}</Text>
                      <Text size="xs" c="dimmed">Jamaat</Text>
                      <Text size="lg" fw={500}>{formatTime(prayerTimesData?.fajr_jammat)}</Text>
                    </Stack>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={2}>
                  <Stack gap="xs">
                    <Text fw={500}>Dhuhr</Text>
                    <Stack gap={4}>
                      <Text size="xs" c="dimmed">Start</Text>
                      <Text size="lg" fw={500}>{formatTime(prayerTimesData?.dhur_start)}</Text>
                      <Text size="xs" c="dimmed">Jamaat</Text>
                      <Text size="lg" fw={500}>{formatTime(prayerTimesData?.dhur_jammat)}</Text>
                    </Stack>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={2}>
                  <Stack gap="xs">
                    <Text fw={500}>Asr</Text>
                    <Stack gap={4}>
                      <Text size="xs" c="dimmed">Start</Text>
                      <Text size="lg" fw={500}>{formatTime(prayerTimesData?.asr_start)}</Text>
                      {prayerTimesData?.asr_start_1 && (
                        <>
                          <Text size="xs" c="dimmed">Start (2nd)</Text>
                          <Text size="lg" fw={500}>{formatTime(prayerTimesData.asr_start_1)}</Text>
                        </>
                      )}
                      <Text size="xs" c="dimmed">Jamaat</Text>
                      <Text size="lg" fw={500}>{formatTime(prayerTimesData?.asr_jammat)}</Text>
                    </Stack>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={2}>
                  <Stack gap="xs">
                    <Text fw={500}>Maghrib</Text>
                    <Stack gap={4}>
                      <Text size="xs" c="dimmed">Start</Text>
                      <Text size="lg" fw={500}>{formatTime(prayerTimesData?.magrib_start)}</Text>
                      <Text size="xs" c="dimmed">Jamaat</Text>
                      <Text size="lg" fw={500}>{formatTime(prayerTimesData?.magrib_jammat)}</Text>
                    </Stack>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={2}>
                  <Stack gap="xs">
                    <Text fw={500}>Isha</Text>
                    <Stack gap={4}>
                      <Text size="xs" c="dimmed">Start</Text>
                      <Text size="lg" fw={500}>{formatTime(prayerTimesData?.isha_start)}</Text>
                      <Text size="xs" c="dimmed">Jamaat</Text>
                      <Text size="lg" fw={500}>{formatTime(prayerTimesData?.isha_jammat)}</Text>
                    </Stack>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={2}>
                  <Stack gap="xs">
                    <Text fw={500}>Sunrise</Text>
                    <Stack gap={4}>
                      <Text size="xs" c="dimmed">Time</Text>
                      <Text size="lg" fw={500}>{formatTime(prayerTimesData?.sunrise)}</Text>
                    </Stack>
                  </Stack>
                </Grid.Col>
              </Grid>
            )}
          </Paper>
        </Grid.Col>

        {/* Current Announcements Section */}
        <Grid.Col span={6}>
          <Paper withBorder p="md">
            <Group justify="space-between" mb="md">
              <Title order={3}>Current Announcements</Title>
              <Button 
                component={Link}
                to={`/announcements/${masjidId}`}
                variant="light"
                rightSection={<IconArrowRight size={16} />}
              >
                View All
              </Button>
            </Group>
            
            {currentAnnouncements?.length ? (
              <Stack>
                {currentAnnouncements.map((announcement: Announcement) => (
                  <Paper key={announcement.id} withBorder p="sm">
                    <Text>{announcement.message}</Text>
                    <Group gap="xs" mt="xs">
                      <Text size="xs" c="dimmed">
                        From: {dayjs(announcement.date_issued).format('MMM D, YYYY')}
                      </Text>
                      {announcement.date_expired && (
                        <Text size="xs" c="dimmed">
                          Until: {dayjs(announcement.date_expired).format('MMM D, YYYY')}
                        </Text>
                      )}
                    </Group>
                  </Paper>
                ))}
              </Stack>
            ) : (
              <Text c="dimmed">No current announcements</Text>
            )}
          </Paper>
        </Grid.Col>

        {/* Current Special Prayers Section */}
        <Grid.Col span={6}>
          <Paper withBorder p="md">
            <Group justify="space-between" mb="md">
              <Title order={3}>Current Special Prayers</Title>
              <Button 
                component={Link}
                to={`/special-prayers/${masjidId}`}
                variant="light"
                rightSection={<IconArrowRight size={16} />}
              >
                View All
              </Button>
            </Group>
            
            {currentSpecialPrayers?.length ? (
              <Stack>
                {currentSpecialPrayers.map((prayer: SpecialPrayer) => (
                  <Paper key={prayer.id} withBorder p="sm">
                    <Group justify="space-between">
                      <div>
                        <Group mb="xs">
                          <Text fw={500}>{prayer.label}</Text>
                          <Badge>{prayer.type}</Badge>
                        </Group>
                        {prayer.info && <Text size="sm">{prayer.info}</Text>}
                      </div>
                      <div>
                        <Text size="sm">
                          {dayjs(prayer.date_start).format('MMM D, YYYY')}
                          {prayer.date_end && ` - ${dayjs(prayer.date_end).format('MMM D, YYYY')}`}
                        </Text>
                        {prayer.jammat_time && (
                          <Text size="sm">Jamaat: {prayer.jammat_time}</Text>
                        )}
                      </div>
                    </Group>
                  </Paper>
                ))}
              </Stack>
            ) : (
              <Text c="dimmed">No current special prayers</Text>
            )}
          </Paper>
        </Grid.Col>

        {/* Upcoming Announcements Section */}
        <Grid.Col span={12}>
          <Paper withBorder p="md">
            <Group justify="space-between" mb="md">
              <Title order={3}>Upcoming Announcements</Title>
              <Button 
                component={Link}
                to={`/announcements/${masjidId}`}
                variant="light"
                rightSection={<IconArrowRight size={16} />}
              >
                View All
              </Button>
            </Group>
            
            {upcomingAnnouncements?.length ? (
              <Grid>
                {upcomingAnnouncements.map((announcement: Announcement) => (
                  <Grid.Col key={announcement.id} span={4}>
                    <Paper withBorder p="sm">
                      <Stack>
                        <Text>{announcement.message}</Text>
                        <Group gap="xs">
                          <Text size="xs" fw={500}>
                            From: {dayjs(announcement.date_issued).format('MMM D, YYYY')}
                          </Text>
                          {announcement.date_expired && (
                            <Text size="xs">
                              Until: {dayjs(announcement.date_expired).format('MMM D, YYYY')}
                            </Text>
                          )}
                        </Group>
                      </Stack>
                    </Paper>
                  </Grid.Col>
                ))}
              </Grid>
            ) : (
              <Text c="dimmed">No upcoming announcements</Text>
            )}
          </Paper>
        </Grid.Col>

        {/* Upcoming Special Prayers Section */}
        <Grid.Col span={12}>
          <Paper withBorder p="md">
            <Group justify="space-between" mb="md">
              <Title order={3}>Upcoming Special Prayers</Title>
              <Button 
                component={Link}
                to={`/special-prayers/${masjidId}`}
                variant="light"
                rightSection={<IconArrowRight size={16} />}
              >
                View All
              </Button>
            </Group>
            
            {specialPrayers?.length ? (
              <Grid>
                {specialPrayers.map((prayer: SpecialPrayer) => (
                  <Grid.Col key={prayer.id} span={4}>
                    <Paper withBorder p="sm">
                      <Stack>
                        <Group justify="space-between">
                          <Text fw={500}>{prayer.label}</Text>
                          <Badge>{prayer.type}</Badge>
                        </Group>
                        {prayer.info && <Text size="sm">{prayer.info}</Text>}
                        <div>
                          <Text size="sm" fw={500}>
                            {dayjs(prayer.date_start).format('MMM D, YYYY')}
                          </Text>
                          {prayer.jammat_time && (
                            <Text size="sm">Jamaat: {prayer.jammat_time}</Text>
                          )}
                        </div>
                      </Stack>
                    </Paper>
                  </Grid.Col>
                ))}
              </Grid>
            ) : (
              <Text c="dimmed">No upcoming special prayers</Text>
            )}
          </Paper>
        </Grid.Col>
      </Grid>
    </Container>
  );
}

export default Dashboard; 