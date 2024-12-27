import { useState } from 'react';
import {
  Container,
  Title,
  Button,
  Group,
  Card,
  Text,
  Stack,
  Modal,
  TextInput,
  Textarea,
  LoadingOverlay,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { IconBuilding } from '@tabler/icons-react';
import { useMasjid } from '../contexts/MasjidContext';
import { useFacilities } from '../hooks/useFacilities';
import { Facility } from '../services/api';

function Facilities() {
  const { masjidId } = useMasjid();
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);

  const {
    facilities,
    isLoading,
    createFacility,
    updateFacility,
  } = useFacilities(masjidId);

  const form = useForm({
    initialValues: {
      facility: '',
      info: '',
    },
    validate: {
      facility: (value) => !value ? 'Name is required' : null,
    },
  });

  const handleAdd = () => {
    setSelectedFacility(null);
    form.reset();
    open();
  };

  const handleEdit = (facility: Facility) => {
    setSelectedFacility(facility);
    form.setValues({
      facility: facility.facility,
      info: facility.info || '',
    });
    open();
  };

  const handleSubmit = async (values: typeof form.values) => {
    try {
      if (selectedFacility) {
        await updateFacility.mutateAsync({
          ...selectedFacility,
          ...values,
        });
      } else if (masjidId) {
        await createFacility.mutateAsync({
          ...values,
          masjid_id: masjidId,
        });
      }
      close();
      form.reset();
    } catch (error) {
      console.error('Failed to save facility:', error);
    }
  };

  const renderFacilityCard = (facility: Facility) => (
    <Card key={facility.id} withBorder shadow="sm">
      <Stack gap="xs">
        <Group justify="space-between">
          <Text size="lg" fw={500}>{facility.facility}</Text>
          <Button variant="light" onClick={() => handleEdit(facility)}>
            Edit
          </Button>
        </Group>

        {facility.info && (
          <Text size="sm" c="dimmed">{facility.info}</Text>
        )}
      </Stack>
    </Card>
  );

  if (isLoading) {
    return <LoadingOverlay visible />;
  }

  return (
    <Container size="lg" py="xl">
      <Group justify="space-between" mb="xl">
        <Title order={2}>Facilities</Title>
        <Button leftSection={<IconBuilding size={16} />} onClick={handleAdd}>
          Add Facility
        </Button>
      </Group>

      <Stack gap="md">
        {facilities.length === 0 ? (
          <Text c="dimmed" ta="center">No facilities added yet.</Text>
        ) : (
          facilities.map(renderFacilityCard)
        )}
      </Stack>

      <Modal
        opened={opened}
        onClose={close}
        title={selectedFacility ? 'Edit Facility' : 'Add Facility'}
        size="lg"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput
              label="Name"
              placeholder="Enter facility name"
              required
              {...form.getInputProps('facility')}
            />

            <Textarea
              label="Description"
              placeholder="Enter facility description"
              {...form.getInputProps('info')}
            />

            <Group justify="flex-end">
              <Button variant="light" onClick={close}>Cancel</Button>
              <Button 
                type="submit" 
                loading={createFacility.isPending || updateFacility.isPending}
              >
                {selectedFacility ? 'Update' : 'Create'}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Container>
  );
}

export default Facilities; 