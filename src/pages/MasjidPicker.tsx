import { Container, Title, Card, Text, Group, Button, LoadingOverlay, TextInput, Select, Stack, Modal, Pagination, Badge } from '@mantine/core';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { masjidApi } from '../services/api';
import { MasjidRead, MasjidCreate } from '../types/masjid';
import { useStore, useUser } from '../store/useStore';
import { IconSearch, IconPlus } from '@tabler/icons-react';
import { useMemo, useState, useEffect } from 'react';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';

export default function MasjidPicker() {
  const navigate = useNavigate();
  const { setMasjid } = useStore();
  const user = useUser();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [madhabFilter, setMadhabFilter] = useState<string | null>(null);
  const [localeFilter, setLocaleFilter] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [createModalOpened, { open: openCreateModal, close: closeCreateModal }] = useDisclosure(false);

  const form = useForm<MasjidCreate>({
    initialValues: {
      name: '',
      type: '',
      locale: null,
      madhab: null,
      website: null,
      has_times: true,
      active: true,
    },
    validate: {
      name: (value) => !value ? 'Name is required' : null,
      type: (value) => !value ? 'Type is required' : null,
    },
  });

  const createMasjidMutation = useMutation({
    mutationFn: (values: MasjidCreate) => masjidApi.createMasjid(values),
    onSuccess: () => {
      notifications.show({
        title: 'Success',
        message: 'Masjid created successfully',
        color: 'green',
      });
      queryClient.invalidateQueries({ queryKey: ['masjids'] });
      closeCreateModal();
      form.reset();
    },
    onError: (error) => {
      notifications.show({
        title: 'Error',
        message: 'Failed to create masjid',
        color: 'red',
      });
    },
  });

  const { data: masjidsData, isLoading } = useQuery({
    queryKey: ['masjids', searchQuery, typeFilter, madhabFilter, localeFilter, page],
    queryFn: () => masjidApi.getMasjids({
      search: searchQuery,
      type_filter: typeFilter,
      madhab_filter: madhabFilter,
      locale_filter: localeFilter,
      page,
      size: 20
    })
  });

  // Extract unique values for filters from the current page
  const filterOptions = useMemo(() => {
    if (!masjidsData?.items) return { types: [], madhabs: [], locales: [] };

    const types = [...new Set(masjidsData.items.map(m => m.type))];
    const madhabs = [...new Set(masjidsData.items.map(m => m.madhab).filter(Boolean))];
    const locales = [...new Set(masjidsData.items.map(m => m.locale).filter(Boolean))];

    return {
      types: types.map(type => ({ value: type, label: type })),
      madhabs: madhabs.map(madhab => ({ value: madhab, label: madhab })),
      locales: locales.map(locale => ({ value: locale, label: locale }))
    };
  }, [masjidsData?.items]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, typeFilter, madhabFilter, localeFilter]);

  const handleMasjidSelect = async (masjid: MasjidRead) => {
    const masjidData = {
      ...masjid,
      locale: masjid.locale || '',
      madhab: masjid.madhab || '',
      website: masjid.website || undefined
    };
    setMasjid(masjidData);
    navigate(`/dashboard/${masjid.id}`);
  };

  const handleCreateMasjid = (values: MasjidCreate) => {
    createMasjidMutation.mutate(values);
  };

  if (isLoading) {
    return <LoadingOverlay visible />;
  }

  if (user?.role === 'masjid_admin' && user?.related_masjid && masjidsData?.items?.length === 1) {
    const masjid = masjidsData.items[0];
    handleMasjidSelect(masjid);
    return <LoadingOverlay visible />;
  }

  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        <Group justify="space-between">
          <Title order={2}>
            {user?.role === 'admin' ? 'Select a Masjid' : 'Your Masjid'}
          </Title>
          {user?.role === 'admin' && (
            <Button 
              leftSection={<IconPlus size={16} />}
              onClick={openCreateModal}
            >
              Create Masjid
            </Button>
          )}
        </Group>

        <Group grow>
          <TextInput
            placeholder="Search masjids..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftSection={<IconSearch size={16} />}
          />
          <Select
            placeholder="Filter by type"
            value={typeFilter}
            onChange={setTypeFilter}
            data={filterOptions.types}
            clearable
          />
          <Select
            placeholder="Filter by madhab"
            value={madhabFilter}
            onChange={setMadhabFilter}
            data={filterOptions.madhabs}
            clearable
          />
          <Select
            placeholder="Filter by locale"
            value={localeFilter}
            onChange={setLocaleFilter}
            data={filterOptions.locales}
            clearable
          />
        </Group>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {masjidsData?.items.map((masjid: MasjidRead) => (
            <Card key={masjid.id} withBorder>
              <Card.Section withBorder inheritPadding py="xs">
                <Group justify="space-between" wrap="nowrap">
                  <Text fw={500}>{masjid.name}</Text>
                </Group>
              </Card.Section>

              <Card.Section inheritPadding py="xs">
                <div className="space-y-2 text-sm text-gray-600">
                  <Text>Type: {masjid.type}</Text>
                  <Text>Madhab: {masjid.madhab}</Text>
                  <Text>Locale: {masjid.locale}</Text>
                  {masjid.website && (
                    <Text>
                      <a 
                        href={masjid.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Website
                      </a>
                    </Text>
                  )}
                </div>
              </Card.Section>

              <Card.Section inheritPadding py="xs">
                <Group justify="flex-end">
                  <Button 
                    variant="light"
                    onClick={() => handleMasjidSelect(masjid)}
                  >
                    {user?.role === 'admin' ? 'Select' : 'View Dashboard'}
                  </Button>
                </Group>
              </Card.Section>
            </Card>
          ))}
        </div>

        {masjidsData?.items.length === 0 && (
          <Text c="dimmed" ta="center" py="xl">
            No masjids found matching your search criteria.
          </Text>
        )}

        {masjidsData && masjidsData.pages > 1 && (
          <Group justify="center" mt="xl">
            <Pagination
              value={page}
              onChange={setPage}
              total={masjidsData.pages}
            />
          </Group>
        )}
      </Stack>

      <Modal 
        opened={createModalOpened} 
        onClose={closeCreateModal}
        title="Create New Masjid"
      >
        <form onSubmit={form.onSubmit(handleCreateMasjid)}>
          <Stack>
            <TextInput
              label="Name"
              placeholder="Enter masjid name"
              required
              {...form.getInputProps('name')}
            />
            <TextInput
              label="Type"
              placeholder="e.g., Masjid, Islamic Center"
              required
              {...form.getInputProps('type')}
            />
            <TextInput
              label="Locale"
              placeholder="e.g., English, Arabic"
              {...form.getInputProps('locale')}
            />
            <TextInput
              label="Madhab"
              placeholder="e.g., Hanafi, Shafi'i"
              {...form.getInputProps('madhab')}
            />
            <TextInput
              label="Website"
              placeholder="https://..."
              {...form.getInputProps('website')}
            />
            <Group justify="flex-end">
              <Button variant="light" onClick={closeCreateModal}>Cancel</Button>
              <Button type="submit" loading={createMasjidMutation.isPending}>Create</Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Container>
  );
} 