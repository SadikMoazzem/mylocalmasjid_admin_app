import { Container, Title, Paper, Stack, Text, NumberInput, Button, Group, Table, ActionIcon, Modal, TextInput, Select } from '@mantine/core';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { IconEdit, IconTrash, IconPlus } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import api from '../services/api';

interface Config {
  id: string;
  config_option: 'hijri_adjustment';
  value: string;
}

interface ConfigFormData {
  config_option: 'hijri_adjustment';
  value: string;
}

export default function PlatformConfig() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<Config | null>(null);
  const [hijriAdjustment, setHijriAdjustment] = useState<number>(0);
  const [formData, setFormData] = useState<ConfigFormData>({
    config_option: 'hijri_adjustment',
    value: ''
  });

  // Fetch configs
  const { data: configs, isLoading } = useQuery<Config[]>({
    queryKey: ['configs'],
    queryFn: async () => {
      const response = await api.get('/configs');
      return response.data;
    }
  });

  // Update hijriAdjustment when configs change
  useEffect(() => {
    if (configs) {
      const hijriConfig = configs.find(c => c.config_option === 'hijri_adjustment');
      if (hijriConfig) {
        setHijriAdjustment(parseInt(hijriConfig.value));
      }
    }
  }, [configs]);

  // Update config mutation
  const updateConfig = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: ConfigFormData }) => {
      return api.patch(`/configs/config/${id}`, data);
    },
    onSuccess: () => {
      notifications.show({
        title: 'Success',
        message: 'Configuration updated successfully',
        color: 'green'
      });
      queryClient.invalidateQueries({ queryKey: ['configs'] });
      handleCloseModal();
    },
    onError: (error) => {
      notifications.show({
        title: 'Error',
        message: 'Failed to update configuration',
        color: 'red'
      });
    }
  });

  // Create config mutation
  const createConfig = useMutation({
    mutationFn: async (data: ConfigFormData) => {
      return api.post('/configs/config', data);
    },
    onSuccess: () => {
      notifications.show({
        title: 'Success',
        message: 'Configuration created successfully',
        color: 'green'
      });
      queryClient.invalidateQueries({ queryKey: ['configs'] });
      handleCloseModal();
    },
    onError: (error) => {
      notifications.show({
        title: 'Error',
        message: 'Failed to create configuration',
        color: 'red'
      });
    }
  });

  // Delete config mutation
  const deleteConfig = useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/configs/config/${id}`);
    },
    onSuccess: () => {
      notifications.show({
        title: 'Success',
        message: 'Configuration deleted successfully',
        color: 'green'
      });
      queryClient.invalidateQueries({ queryKey: ['configs'] });
    },
    onError: (error) => {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete configuration',
        color: 'red'
      });
    }
  });

  const handleHijriAdjustmentSave = () => {
    const hijriConfig = configs?.find(c => c.config_option === 'hijri_adjustment');
    if (hijriConfig?.id) {
      updateConfig.mutate({ 
        id: hijriConfig.id, 
        data: {
          config_option: 'hijri_adjustment',
          value: hijriAdjustment.toString()
        }
      });
    } else {
      createConfig.mutate({
        config_option: 'hijri_adjustment',
        value: hijriAdjustment.toString()
      });
    }
  };

  const handleOpenModal = (config?: Config) => {
    if (config) {
      setEditingConfig(config);
      setFormData({
        config_option: config.config_option,
        value: config.value
      });
    } else {
      setEditingConfig(null);
      setFormData({
        config_option: 'hijri_adjustment',
        value: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingConfig(null);
    setFormData({
      config_option: 'hijri_adjustment',
      value: ''
    });
  };

  const handleSubmit = () => {
    if (editingConfig) {
      updateConfig.mutate({ id: editingConfig.id, data: formData });
    } else {
      createConfig.mutate(formData);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this configuration?')) {
      deleteConfig.mutate(id);
    }
  };

  return (
    <Container size="lg" py="xl">
      <Title order={1} mb="xl">Platform Configuration</Title>
      
      <Stack gap="lg">
        <Paper withBorder p="md">
          <Title order={3} mb="md">Hijri Date Adjustment</Title>
          <Text c="dimmed" mb="md">
            Adjust the Hijri date calculation. This affects how prayer times and special prayers are displayed.
          </Text>
          <Group align="end">
            <NumberInput
              label="Adjustment Value"
              description="Positive or negative number to adjust Hijri date"
              placeholder="0"
              value={hijriAdjustment}
              onChange={(value) => setHijriAdjustment(value as number)}
              min={-2}
              max={2}
              w={200}
              disabled={isLoading}
            />
            <Button 
              onClick={handleHijriAdjustmentSave}
              loading={updateConfig.isPending || createConfig.isPending}
            >
              Save Adjustment
            </Button>
          </Group>
        </Paper>

        <Paper withBorder p="md">
          <Group justify="space-between" mb="md">
            <Title order={3}>All Configurations</Title>
            <Button 
              leftSection={<IconPlus size={16} />}
              onClick={() => handleOpenModal()}
            >
              Add Config
            </Button>
          </Group>
          
          {configs && configs.length > 0 ? (
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Option</Table.Th>
                  <Table.Th>Value</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {configs.map((config: Config) => (
                  <Table.Tr key={config.id}>
                    <Table.Td>{config.config_option}</Table.Td>
                    <Table.Td>{config.value}</Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <ActionIcon
                          variant="light"
                          onClick={() => handleOpenModal(config)}
                          size="sm"
                        >
                          <IconEdit size={16} />
                        </ActionIcon>
                        <ActionIcon
                          variant="light"
                          color="red"
                          onClick={() => handleDelete(config.id)}
                          size="sm"
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          ) : (
            <Text c="dimmed" ta="center" py="xl">
              No configurations found
            </Text>
          )}
        </Paper>
      </Stack>

      <Modal
        opened={isModalOpen}
        onClose={handleCloseModal}
        title={editingConfig ? "Edit Configuration" : "Add Configuration"}
      >
        <Stack>
          <Select
            label="Configuration Option"
            data={[{ value: 'hijri_adjustment', label: 'Hijri Adjustment' }]}
            value={formData.config_option}
            onChange={(value) => value && setFormData(prev => ({ ...prev, config_option: value as 'hijri_adjustment' }))}
          />
          <TextInput
            label="Value"
            value={formData.value}
            onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
            placeholder="Enter value"
          />
          <Button onClick={handleSubmit}>
            {editingConfig ? 'Update' : 'Create'}
          </Button>
        </Stack>
      </Modal>
    </Container>
  );
} 