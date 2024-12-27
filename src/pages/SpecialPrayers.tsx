import { Container, Title, Tabs, Card, Text, Group, Button, Stack, Modal, TextInput, Textarea, Select, ComboboxItem, Switch, Badge } from '@mantine/core';
import { TimeInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { IconClock, IconBuildingMosque, IconSunrise, IconDots, IconMoon, IconSun } from '@tabler/icons-react';
import { useMasjid } from '../contexts/MasjidContext';
import { SpecialPrayer } from '../services/api';
import { useState } from 'react';
import { useSpecialPrayers } from '../hooks/useSpecialPrayers';

type PrayerType = 'jummuah' | 'eid' | 'tahajud' | 'taraweeh' | 'other';

export default function SpecialPrayers() {
  const { masjidId } = useMasjid();
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedPrayer, setSelectedPrayer] = useState<SpecialPrayer | null>(null);
  
  const {
    specialPrayers,
    isLoading,
    createSpecialPrayer,
    updateSpecialPrayer,
    isActivePrayer,
    isUpcomingPrayer,
  } = useSpecialPrayers(masjidId);

  const form = useForm<SpecialPrayer>({
    initialValues: {
      masjid_id: masjidId || '',
      date_start: '',
      date_end: '',
      is_hijri: false,
      label: '',
      type: 'jummuah',
      info: '',
      imam: '',
      start_time: '',
      jammat_time: '',
    },
    validate: {
      label: (value) => !value ? 'Label is required' : null,
      type: (value) => !value ? 'Type is required' : null,
    },
  });

  const handleSubmit = (values: SpecialPrayer) => {
    if (selectedPrayer?.id) {
      updateSpecialPrayer.mutate({ ...values, id: selectedPrayer.id }, {
        onSuccess: () => {
          close();
          form.reset();
        }
      });
    } else {
      createSpecialPrayer.mutate(values, {
        onSuccess: () => {
          close();
          form.reset();
        }
      });
    }
  };

  const handleEdit = (prayer: SpecialPrayer) => {
    setSelectedPrayer(prayer);
    form.setValues({
      ...prayer,
      date_start: prayer.date_start || '',
      date_end: prayer.date_end || '',
      info: prayer.info || '',
      imam: prayer.imam || '',
      start_time: prayer.start_time || '',
      jammat_time: prayer.jammat_time || '',
    });
    open();
  };

  const handleAdd = () => {
    setSelectedPrayer(null);
    form.reset();
    open();
  };

  const jumuahPrayers = specialPrayers
    .filter((prayer: SpecialPrayer) => prayer.type === 'jummuah')
    .sort((a: SpecialPrayer, b: SpecialPrayer) => {
      if (!a.date_start || !b.date_start) return 0;
      return a.date_start.localeCompare(b.date_start);
    });

  const activeJumuahPrayer = jumuahPrayers.find(isActivePrayer);
  const upcomingJumuahPrayers = jumuahPrayers.filter(isUpcomingPrayer);

  const eidPrayers = specialPrayers.filter((prayer: SpecialPrayer) => prayer.type === 'eid');
  const otherPrayers = specialPrayers.filter((prayer: SpecialPrayer) => !['jummuah', 'eid'].includes(prayer.type));

  const prayerTypeOptions: ComboboxItem[] = [
    { value: 'jummuah', label: "Jumu'ah" },
    { value: 'eid', label: 'Eid' },
    { value: 'tahajud', label: 'Tahajjud' },
    { value: 'taraweeh', label: 'Taraweeh' },
    { value: 'other', label: 'Other' },
  ];

  const renderPrayerCard = (prayer: SpecialPrayer) => (
    <Card key={prayer.id} withBorder shadow="sm">
      <Stack gap="xs">
        <Group justify="space-between">
          <Group gap="xs">
            <Title order={4}>{prayer.label}</Title>
            {isActivePrayer(prayer) && (
              <Badge color="green">Active</Badge>
            )}
            {isUpcomingPrayer(prayer) && (
              <Badge color="blue">Upcoming</Badge>
            )}
          </Group>
          <Button variant="light" onClick={() => handleEdit(prayer)}>
            Edit
          </Button>
        </Group>
        
        <Group gap="xs">
          {prayer.is_hijri && <IconMoon size={16} />}
          <Text size="sm" c="dimmed">
            {prayer.date_start && (
              <>
                {prayer.date_end && prayer.date_end !== prayer.date_start ? (
                  `${prayer.date_start} - ${prayer.date_end}`
                ) : (
                  prayer.date_start
                )}
                {prayer.is_hijri ? ' (Hijri)' : ''}
              </>
            )}
          </Text>
        </Group>
        
        <Group gap="lg">
          {prayer.imam && (
            <Text size="sm">
              Imam: {prayer.imam}
            </Text>
          )}
          {prayer.start_time && (
            <Text size="sm">
              Start: {prayer.start_time}
            </Text>
          )}
          {prayer.jammat_time && (
            <Text size="sm">
              Jama'ah: {prayer.jammat_time}
            </Text>
          )}
        </Group>
        
        {prayer.info && (
          <Text size="sm" c="dimmed">
            {prayer.info}
          </Text>
        )}
      </Stack>
    </Card>
  );

  return (
    <Container size="lg" py="xl">
      <Group justify="space-between" mb="xl">
      <Title order={2}>Special Prayers</Title>
        <Button leftSection={<IconBuildingMosque size={16} />} onClick={handleAdd}>
          Add Special Prayer
        </Button>
      </Group>

      <Tabs defaultValue="jummuah">
        <Tabs.List>
          <Tabs.Tab value="jummuah" leftSection={<IconBuildingMosque size={16} />}>
            Jumu'ah Prayers
          </Tabs.Tab>
          <Tabs.Tab value="eid" leftSection={<IconSunrise size={16} />}>
            Eid Prayers
          </Tabs.Tab>
          <Tabs.Tab value="other" leftSection={<IconDots size={16} />}>
            Other Prayers
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="jummuah" pt="md">
          <Stack gap="xl">
            {!activeJumuahPrayer && !upcomingJumuahPrayers.length ? (
              <Text c="dimmed" ta="center" py="xl">
                No Jumu'ah prayers configured
              </Text>
            ) : (
              <>
                {activeJumuahPrayer && (
                  <Stack gap="md">
                    <Title order={3} size="h4">Current Jumu'ah</Title>
                    {renderPrayerCard(activeJumuahPrayer)}
                  </Stack>
                )}
                
                {upcomingJumuahPrayers.length > 0 && (
                  <Stack gap="md">
                    <Title order={3} size="h4">Upcoming Jumu'ah</Title>
                    {upcomingJumuahPrayers.map(renderPrayerCard)}
                  </Stack>
                )}
              </>
            )}
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="eid" pt="md">
          <Stack gap="md">
            {eidPrayers.length === 0 ? (
              <Text c="dimmed" ta="center" py="xl">
                No Eid prayers configured
              </Text>
            ) : (
              eidPrayers.map(renderPrayerCard)
            )}
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="other" pt="md">
          <Stack gap="md">
            {otherPrayers.length === 0 ? (
              <Text c="dimmed" ta="center" py="xl">
                No other special prayers configured
              </Text>
            ) : (
              otherPrayers.map(renderPrayerCard)
            )}
          </Stack>
        </Tabs.Panel>
      </Tabs>

      <Modal 
        opened={opened} 
        onClose={close}
        title={selectedPrayer ? 'Edit Special Prayer' : 'Add Special Prayer'}
        size="lg"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput
              label="Label"
              placeholder="e.g., First Jumu'ah"
              required
              {...form.getInputProps('label')}
            />
            
            <Select
              label="Type"
              required
              data={prayerTypeOptions}
              allowDeselect={false}
              searchable
              {...form.getInputProps('type')}
            />

            <Switch
              label="Use Hijri Calendar"
              checked={form.values.is_hijri}
              onChange={(event) => form.setFieldValue('is_hijri', event.currentTarget.checked)}
              thumbIcon={form.values.is_hijri ? <IconMoon size={14} /> : <IconSun size={14} />}
            />

            <Group grow>
              <TextInput
                type="date"
                label="Start Date"
                placeholder="YYYY-MM-DD"
                {...form.getInputProps('date_start')}
              />
              
              <TextInput
                type="date"
                label="End Date"
                placeholder="YYYY-MM-DD"
                {...form.getInputProps('date_end')}
              />
            </Group>

            <TextInput
              label="Imam"
              placeholder="Name of the Imam"
              {...form.getInputProps('imam')}
            />

            <Group grow>
              <TimeInput
                label="Start Time"
                placeholder="HH:MM"
                rightSection={<IconClock size={16} />}
                {...form.getInputProps('start_time')}
              />
              
              <TimeInput
                label="Jama'ah Time"
                placeholder="HH:MM"
                rightSection={<IconClock size={16} />}
                {...form.getInputProps('jammat_time')}
              />
            </Group>

            <Textarea
              label="Additional Information"
              placeholder="Any additional details about the prayer"
              {...form.getInputProps('info')}
            />

            <Group justify="flex-end">
              <Button variant="light" onClick={close}>Cancel</Button>
              <Button 
                type="submit" 
                loading={createSpecialPrayer.isPending || updateSpecialPrayer.isPending}
              >
                {selectedPrayer ? 'Update' : 'Create'}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Container>
  );
}