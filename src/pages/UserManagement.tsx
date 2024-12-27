import { Container, Title, Paper, Table, Button, Group, Text, Modal, TextInput, Select, PasswordInput, Stack } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { useState } from 'react';
import api from '../services/api';

// Types from API spec
interface UserRead {
  id: string;
  email: string;
  role: 'admin' | 'masjid_admin';
  active: boolean;
  full_name: string | null;
  related_masjid: string | null;
}

interface UserCreate {
  email: string;
  role: 'admin' | 'masjid_admin';
  active: boolean;
  full_name: string | null;
  related_masjid: string | null;
  password: string;
}

interface UserUpdate {
  email: string;
  role: 'admin' | 'masjid_admin';
  active: boolean;
  full_name: string | null;
  related_masjid: string | null;
}

interface UserPasswordReset {
  new_password: string;
  confirm_password: string;
}

interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

interface HTTPValidationError {
  detail: ValidationError[];
}

export default function UserManagement() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRead | null>(null);
  const [formData, setFormData] = useState<UserCreate>({
    email: '',
    role: 'masjid_admin',
    active: true,
    full_name: '',
    related_masjid: null,
    password: ''
  });
  const [passwordData, setPasswordData] = useState<UserPasswordReset>({
    new_password: '',
    confirm_password: ''
  });

  // Fetch users
  const { data: users, isLoading } = useQuery<UserRead[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await api.get('/users');
      return response.data;
    }
  });

  // Create user mutation
  const createUser = useMutation({
    mutationFn: async (data: UserCreate) => {
      return api.post('/user', data);
    },
    onSuccess: () => {
      notifications.show({
        title: 'Success',
        message: 'User created successfully',
        color: 'green',
        autoClose: 5000,
        withCloseButton: true
      });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      handleCloseModal();
    },
    onError: (error: any) => {
      // Handle validation errors
      if (error.response?.status === 422) {
        const validationError = error.response.data as HTTPValidationError;
        const errorMessages = validationError.detail.map(err => 
          `${err.loc.slice(1).join('.')}: ${err.msg}`
        ).join('\n');
        
        notifications.show({
          title: 'Validation Error',
          message: errorMessages,
          color: 'red',
          autoClose: 5000,
          withCloseButton: true
        });
      } else {
        notifications.show({
          title: 'Error',
          message: error.response?.data?.message || 'Failed to create user',
          color: 'red',
          autoClose: 5000,
          withCloseButton: true
        });
      }
    }
  });

  // Update user mutation
  const updateUser = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UserUpdate }) => {
      return api.put(`/user/${id}`, data);
    },
    onSuccess: () => {
      notifications.show({
        title: 'Success',
        message: 'User updated successfully',
        color: 'green',
        autoClose: 5000,
        withCloseButton: true
      });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      handleCloseModal();
    },
    onError: (error: any) => {
      if (error.response?.status === 422) {
        const validationError = error.response.data as HTTPValidationError;
        const errorMessages = validationError.detail.map(err => 
          `${err.loc.slice(1).join('.')}: ${err.msg}`
        ).join('\n');
        
        notifications.show({
          title: 'Validation Error',
          message: errorMessages,
          color: 'red',
          autoClose: 5000,
          withCloseButton: true
        });
      } else {
        notifications.show({
          title: 'Error',
          message: error.response?.data?.message || 'Failed to update user',
          color: 'red',
          autoClose: 5000,
          withCloseButton: true
        });
      }
    }
  });

  // Reset password mutation
  const resetPassword = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UserPasswordReset }) => {
      return api.patch(`/user/${id}/password-reset`, data);
    },
    onSuccess: () => {
      notifications.show({
        title: 'Success',
        message: 'Password reset successfully',
        color: 'green',
        autoClose: 5000,
        withCloseButton: true
      });
      handleClosePasswordModal();
    },
    onError: (error: any) => {
      if (error.response?.status === 422) {
        const validationError = error.response.data as HTTPValidationError;
        const errorMessages = validationError.detail.map(err => 
          `${err.loc.slice(1).join('.')}: ${err.msg}`
        ).join('\n');
        
        notifications.show({
          title: 'Validation Error',
          message: errorMessages,
          color: 'red',
          autoClose: 5000,
          withCloseButton: true
        });
      } else {
        notifications.show({
          title: 'Error',
          message: error.response?.data?.message || 'Failed to reset password',
          color: 'red',
          autoClose: 5000,
          withCloseButton: true
        });
      }
    }
  });

  const handleOpenModal = (user?: UserRead) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        email: user.email,
        role: user.role,
        active: user.active,
        full_name: user.full_name,
        related_masjid: user.related_masjid,
        password: '' // Not needed for updates
      });
    } else {
      setEditingUser(null);
      setFormData({
        email: '',
        role: 'masjid_admin',
        active: true,
        full_name: '',
        related_masjid: null,
        password: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setFormData({
      email: '',
      role: 'masjid_admin',
      active: true,
      full_name: '',
      related_masjid: null,
      password: ''
    });
  };

  const handleOpenPasswordModal = (user: UserRead) => {
    setEditingUser(user);
    setPasswordData({
      new_password: '',
      confirm_password: ''
    });
    setIsPasswordModalOpen(true);
  };

  const handleClosePasswordModal = () => {
    setIsPasswordModalOpen(false);
    setEditingUser(null);
    setPasswordData({
      new_password: '',
      confirm_password: ''
    });
  };

  const handleSubmit = () => {
    if (editingUser) {
      const updateData: UserUpdate = {
        email: formData.email,
        role: formData.role,
        active: formData.active,
        full_name: formData.full_name,
        related_masjid: formData.related_masjid
      };
      updateUser.mutate({ id: editingUser.id, data: updateData });
    } else {
      createUser.mutate(formData);
    }
  };

  const handlePasswordSubmit = () => {
    if (!editingUser) {
      notifications.show({
        title: 'Error',
        message: 'No user selected',
        color: 'red',
        autoClose: 5000,
        withCloseButton: true
      });
      return;
    }

    if (passwordData.new_password !== passwordData.confirm_password) {
      notifications.show({
        title: 'Error',
        message: 'Passwords do not match',
        color: 'red',
        autoClose: 5000,
        withCloseButton: true
      });
      return;
    }

    resetPassword.mutate({ 
      id: editingUser.id, 
      data: passwordData 
    });
  };

  return (
    <Container size="lg" py="xl">
      <Group justify="space-between" mb="xl">
        <Title order={1}>User Management</Title>
        <Button 
          leftSection={<IconPlus size={16} />}
          onClick={() => handleOpenModal()}
          loading={isLoading}
        >
          Add User
        </Button>
      </Group>

      <Paper withBorder p="md">
        {users && users.length > 0 ? (
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Name</Table.Th>
                <Table.Th>Email</Table.Th>
                <Table.Th>Role</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {users.map((user) => (
                <Table.Tr key={user.id}>
                  <Table.Td>{user.full_name || '-'}</Table.Td>
                  <Table.Td>{user.email}</Table.Td>
                  <Table.Td>{user.role}</Table.Td>
                  <Table.Td>{user.active ? 'Active' : 'Inactive'}</Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <Button variant="light" size="xs" onClick={() => handleOpenModal(user)}>
                        Edit
                      </Button>
                      <Button 
                        variant="light" 
                        color="yellow" 
                        size="xs"
                        onClick={() => handleOpenPasswordModal(user)}
                      >
                        Reset Password
                      </Button>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        ) : (
          <Text c="dimmed" ta="center" py="xl">No users found</Text>
        )}
      </Paper>

      {/* User Edit/Create Modal */}
      <Modal
        opened={isModalOpen}
        onClose={handleCloseModal}
        title={editingUser ? "Edit User" : "Add User"}
      >
        <Stack>
          <TextInput
            label="Email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            required
          />
          <TextInput
            label="Full Name"
            value={formData.full_name || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
          />
          <Select
            label="Role"
            data={[
              { value: 'admin', label: 'Admin' },
              { value: 'masjid_admin', label: 'Masjid Admin' }
            ]}
            value={formData.role}
            onChange={(value) => 
              value && setFormData(prev => ({ ...prev, role: value as 'admin' | 'masjid_admin' }))
            }
            required
          />
          <Select
            label="Status"
            data={[
              { value: 'true', label: 'Active' },
              { value: 'false', label: 'Inactive' }
            ]}
            value={formData.active.toString()}
            onChange={(value) => 
              setFormData(prev => ({ ...prev, active: value === 'true' }))
            }
            required
          />
          {!editingUser && (
            <PasswordInput
              label="Password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              required={!editingUser}
            />
          )}
          <Button 
            onClick={handleSubmit}
            loading={createUser.isPending || updateUser.isPending}
          >
            {editingUser ? 'Update' : 'Create'}
          </Button>
        </Stack>
      </Modal>

      {/* Password Reset Modal */}
      <Modal
        opened={isPasswordModalOpen}
        onClose={handleClosePasswordModal}
        title={`Reset Password - ${editingUser?.full_name || editingUser?.email || ''}`}
        size="md"
      >
        <Stack>
          <Text size="sm" c="dimmed" mb="md">
            Resetting password for user: <Text span fw={500}>{editingUser?.full_name || editingUser?.email}</Text>
            <Text span fw={500}>{editingUser?.email}</Text>
          </Text>
          <PasswordInput
            label="New Password"
            value={passwordData.new_password}
            onChange={(e) => setPasswordData(prev => ({ ...prev, new_password: e.target.value }))}
            required
          />
          <PasswordInput
            label="Confirm Password"
            value={passwordData.confirm_password}
            onChange={(e) => setPasswordData(prev => ({ ...prev, confirm_password: e.target.value }))}
            required
          />
          <Button 
            onClick={handlePasswordSubmit}
            loading={resetPassword.isPending}
          >
            Reset Password
          </Button>
        </Stack>
      </Modal>
    </Container>
  );
} 