import { Container, Title, Paper, Text, LoadingOverlay, Tabs, Card, Group, Button, Stack, Modal, TextInput, Textarea, Badge } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { IconBellRinging, IconClock, IconHistory } from '@tabler/icons-react';
import { useMasjid } from '../contexts/MasjidContext';
import { useAnnouncements } from '../hooks/useAnnouncements';
import { Announcement } from '../hooks/useAnnouncements';
import { useState } from 'react';

function Announcements() {
  const { masjidId } = useMasjid();
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

  const {
    announcements,
    isLoading,
    createAnnouncement,
    updateAnnouncement,
    isActiveAnnouncement,
    isUpcomingAnnouncement,
  } = useAnnouncements(masjidId);

  const form = useForm({
    initialValues: {
      message: '',
      date_issued: '',
      date_expired: null as string | null,
    },
    validate: {
      message: (value) => !value ? 'Message is required' : null,
      date_issued: (value) => !value ? 'Issue date is required' : null,
    },
  });

  const handleAdd = () => {
    setSelectedAnnouncement(null);
    form.reset();
    open();
  };

  const handleEdit = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    form.setValues({
      message: announcement.message,
      date_issued: announcement.date_issued,
      date_expired: announcement.date_expired,
    });
    open();
  };

  const handleSubmit = async (values: typeof form.values) => {
    try {
      if (selectedAnnouncement) {
        await updateAnnouncement.mutateAsync({
          ...selectedAnnouncement,
          ...values,
        });
      } else if (masjidId) {
        await createAnnouncement.mutateAsync({
          ...values,
          masjid_id: masjidId,
        });
      }
      close();
      form.reset();
    } catch (error) {
      console.error('Failed to save announcement:', error);
    }
  };

  const activeAnnouncements = announcements.filter(isActiveAnnouncement);
  const upcomingAnnouncements = announcements.filter(isUpcomingAnnouncement);
  const pastAnnouncements = announcements.filter(
    (announcement: Announcement) => !isActiveAnnouncement(announcement) && !isUpcomingAnnouncement(announcement)
  );

  const renderAnnouncementCard = (announcement: Announcement) => (
    <Card key={announcement.id} withBorder shadow="sm">
      <Stack gap="xs">
        <Group justify="space-between">
          <Group gap="xs">
            <Text size="lg" fw={500}>{announcement.message.split('\n')[0]}</Text>
            {isActiveAnnouncement(announcement) && (
              <Badge color="green">Active</Badge>
            )}
            {isUpcomingAnnouncement(announcement) && (
              <Badge color="blue">Upcoming</Badge>
            )}
          </Group>
          <Button variant="light" onClick={() => handleEdit(announcement)}>
            Edit
          </Button>
        </Group>

        <Group gap="xs">
          <Text size="sm" c="dimmed">
            {announcement.date_expired ? (
              `${announcement.date_issued} - ${announcement.date_expired}`
            ) : (
              announcement.date_issued
            )}
          </Text>
        </Group>

        <Text>{announcement.message.split('\n').slice(1).join('\n')}</Text>
      </Stack>
    </Card>
  );

  if (isLoading) {
    return <LoadingOverlay visible />;
  }

  return (
    <Container size="lg" py="xl">
      <Group justify="space-between" mb="xl">
        <Title order={2}>Announcements</Title>
        <Button leftSection={<IconBellRinging size={16} />} onClick={handleAdd}>
          Add Announcement
        </Button>
      </Group>

      <Tabs defaultValue="active">
        <Tabs.List>
          <Tabs.Tab 
            value="active" 
            leftSection={<IconBellRinging size={16} />}
            rightSection={activeAnnouncements.length ? (
              <Badge size="sm" variant="filled" circle>
                {activeAnnouncements.length}
              </Badge>
            ) : null}
          >
            Active
          </Tabs.Tab>
          <Tabs.Tab 
            value="upcoming" 
            leftSection={<IconClock size={16} />}
            rightSection={upcomingAnnouncements.length ? (
              <Badge size="sm" variant="filled" circle>
                {upcomingAnnouncements.length}
              </Badge>
            ) : null}
          >
            Upcoming
          </Tabs.Tab>
          <Tabs.Tab 
            value="past" 
            leftSection={<IconHistory size={16} />}
            rightSection={pastAnnouncements.length ? (
              <Badge size="sm" variant="filled" circle>
                {pastAnnouncements.length}
              </Badge>
            ) : null}
          >
            Past
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="active" pt="md">
          <Stack gap="md">
            {activeAnnouncements.length === 0 ? (
              <Text c="dimmed" ta="center" py="xl">
                No active announcements
              </Text>
            ) : (
              activeAnnouncements.map(renderAnnouncementCard)
            )}
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="upcoming" pt="md">
          <Stack gap="md">
            {upcomingAnnouncements.length === 0 ? (
              <Text c="dimmed" ta="center" py="xl">
                No upcoming announcements
              </Text>
            ) : (
              upcomingAnnouncements.map(renderAnnouncementCard)
            )}
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="past" pt="md">
          <Stack gap="md">
            {pastAnnouncements.length === 0 ? (
              <Text c="dimmed" ta="center" py="xl">
                No past announcements
              </Text>
            ) : (
              pastAnnouncements.map(renderAnnouncementCard)
            )}
          </Stack>
        </Tabs.Panel>
      </Tabs>

      <Modal
        opened={opened}
        onClose={close}
        title={selectedAnnouncement ? 'Edit Announcement' : 'Add Announcement'}
        size="lg"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <Textarea
              label="Message"
              description="First line will be used as the title"
              placeholder="Enter your announcement message"
              required
              minRows={3}
              {...form.getInputProps('message')}
            />

            <DateInput
              label="Issue Date"
              placeholder="When should this announcement start?"
              required
              clearable
              {...form.getInputProps('date_issued')}
            />

            <DateInput
              label="Expiry Date (Optional)"
              placeholder="When should this announcement expire?"
              clearable
              {...form.getInputProps('date_expired')}
            />

            <Group justify="flex-end">
              <Button variant="light" onClick={close}>Cancel</Button>
              <Button 
                type="submit" 
                loading={createAnnouncement.isPending || updateAnnouncement.isPending}
              >
                {selectedAnnouncement ? 'Update' : 'Create'}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Container>
  );
}

export default Announcements; 