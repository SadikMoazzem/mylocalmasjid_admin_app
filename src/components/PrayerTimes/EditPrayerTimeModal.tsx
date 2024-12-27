import { Modal, Box, Text, Group, Button, Tabs } from '@mantine/core';
import { TimeInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { masjidApi } from '../../services/api';
import { EditPrayerTimeFormValues, PrayerTime } from '../../types/prayerTimes';
import { useMasjid } from '../../contexts/MasjidContext';
import { useEffect } from 'react';
import { IconClock, IconPray, IconSunrise } from '@tabler/icons-react';

interface EditPrayerTimeModalProps {
  opened: boolean;
  onClose: () => void;
  selectedDate: string | null;
  initialValues?: PrayerTime;
}

export function EditPrayerTimeModal({ opened, onClose, selectedDate, initialValues }: EditPrayerTimeModalProps): JSX.Element {
  const { masjidId } = useMasjid();
  const queryClient = useQueryClient();

  const form = useForm<EditPrayerTimeFormValues>({
    initialValues: {
      fajr_start: '',
      fajr_jammat: '',
      sunrise: '',
      dhur_start: '',
      dhur_jammat: '',
      asr_start: '',
      asr_start_1: '',
      asr_jammat: '',
      magrib_start: '',
      magrib_jammat: '',
      isha_start: '',
      isha_jammat: '',
    },
  });

  useEffect(() => {
    if (initialValues) {
      form.setValues({
        fajr_start: initialValues.fajr_start,
        fajr_jammat: initialValues.fajr_jammat,
        sunrise: initialValues.sunrise,
        dhur_start: initialValues.dhur_start,
        dhur_jammat: initialValues.dhur_jammat,
        asr_start: initialValues.asr_start,
        asr_start_1: initialValues.asr_start_1 || '',
        asr_jammat: initialValues.asr_jammat,
        magrib_start: initialValues.magrib_start,
        magrib_jammat: initialValues.magrib_jammat,
        isha_start: initialValues.isha_start,
        isha_jammat: initialValues.isha_jammat,
      });
    }
  }, [initialValues]);

  const updatePrayerTimeMutation = useMutation({
    mutationFn: async (values: EditPrayerTimeFormValues) => {
      if (!masjidId || !initialValues?.id) {
        throw new Error('No masjid or prayer times ID');
      }

      const response = await fetch(`/api/masjids/masjid/${masjidId}/prayer-times/${initialValues.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          masjid_id: masjidId,
          date: selectedDate!,
          active: true,
          fajr_start: values.fajr_start,
          fajr_jammat: values.fajr_jammat,
          sunrise: values.sunrise,
          dhur_start: values.dhur_start,
          dhur_jammat: values.dhur_jammat,
          asr_start: values.asr_start,
          asr_start_1: values.asr_start_1 || null,
          asr_jammat: values.asr_jammat,
          magrib_start: values.magrib_start,
          magrib_jammat: values.magrib_jammat,
          isha_start: values.isha_start,
          isha_jammat: values.isha_jammat,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update prayer times');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prayer-times', masjidId] });
      onClose();
      form.reset();
    },
  });

  return (
    <Modal 
      opened={opened}
      onClose={() => {
        onClose();
        form.reset();
      }}
      title="Edit Prayer Times"
      size="lg"
      centered
      overlayProps={{
        backgroundOpacity: 0.55,
        blur: 3
      }}
    >
      <Box mb="md">
        <Text fw={500} size="sm">Date: {selectedDate}</Text>
        {initialValues?.id && (
          <Text size="xs" c="dimmed">ID: {initialValues.id}</Text>
        )}
      </Box>
      <form onSubmit={form.onSubmit((values) => {
        updatePrayerTimeMutation.mutate(values);
      })}>
        <Tabs defaultValue="jamaah">
          <Tabs.List>
            <Tabs.Tab value="jamaah" leftSection={<IconPray size={16} />}>
              Jama'ah Times
            </Tabs.Tab>
            <Tabs.Tab value="start" leftSection={<IconSunrise size={16} />}>
              Start Times
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="jamaah" pt="md">
            <TimeInput
              label="Fajr Jama'ah"
              rightSection={<IconClock size={16} />}
              mb="md"
              {...form.getInputProps('fajr_jammat')}
            />

            <TimeInput
              label="Zuhr Jama'ah"
              rightSection={<IconClock size={16} />}
              mb="md"
              {...form.getInputProps('dhur_jammat')}
            />

            <TimeInput
              label="Asr Jama'ah"
              rightSection={<IconClock size={16} />}
              mb="md"
              {...form.getInputProps('asr_jammat')}
            />

            <TimeInput
              label="Maghrib Jama'ah"
              rightSection={<IconClock size={16} />}
              mb="md"
              {...form.getInputProps('magrib_jammat')}
            />

            <TimeInput
              label="Isha Jama'ah"
              rightSection={<IconClock size={16} />}
              mb="md"
              {...form.getInputProps('isha_jammat')}
            />
          </Tabs.Panel>

          <Tabs.Panel value="start" pt="md">
            <TimeInput
              label="Fajr Start"
              rightSection={<IconClock size={16} />}
              mb="md"
              {...form.getInputProps('fajr_start')}
            />

            <TimeInput
              label="Sunrise"
              rightSection={<IconClock size={16} />}
              mb="md"
              {...form.getInputProps('sunrise')}
            />

            <TimeInput
              label="Zuhr Start"
              rightSection={<IconClock size={16} />}
              mb="md"
              {...form.getInputProps('dhur_start')}
            />

            <Group grow mb="md">
              <TimeInput
                label="Asr Start"
                rightSection={<IconClock size={16} />}
                {...form.getInputProps('asr_start')}
              />
              <TimeInput
                label="Asr Start (Hanafi)"
                rightSection={<IconClock size={16} />}
                {...form.getInputProps('asr_start_1')}
              />
            </Group>

            <TimeInput
              label="Maghrib Start"
              rightSection={<IconClock size={16} />}
              mb="md"
              {...form.getInputProps('magrib_start')}
            />

            <TimeInput
              label="Isha Start"
              rightSection={<IconClock size={16} />}
              mb="md"
              {...form.getInputProps('isha_start')}
            />
          </Tabs.Panel>
        </Tabs>

        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={onClose}>Cancel</Button>
          <Button 
            type="submit" 
            loading={updatePrayerTimeMutation.isPending}
            disabled={!initialValues?.id}
          >
            Save Changes
          </Button>
        </Group>
      </form>
    </Modal>
  );
} 