import { useState, useEffect } from 'react';
import { Container, Title, Paper, Button, Group, Modal, TextInput, Select, Checkbox, Stack } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconPlus } from '@tabler/icons-react';
import { authApi } from '../services/api';
import type { UserRead, UserUpdate, UserCreate } from '../types/user';

interface EditModalProps {
  user: UserRead;
  onClose: () => void;
  onSave: (userId: string, data: UserUpdate) => Promise<void>;
}

function EditUserModal({ user, onClose, onSave }: EditModalProps): JSX.Element {
  const [formData, setFormData] = useState<UserUpdate>({
        email: user.email,
        role: user.role,
        active: user.active,
        full_name: user.full_name,
        related_masjid: user.related_masjid,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await onSave(user.id, formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Edit User</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label htmlFor="role" className="block text-sm font-medium mb-1">Role</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            >
              <option value="admin">Admin</option>
              <option value="masjid_admin">Masjid Admin</option>
            </select>
          </div>
          <div>
            <label htmlFor="full_name" className="block text-sm font-medium mb-1">Full Name</label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              value={formData.full_name || ''}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label htmlFor="related_masjid" className="block text-sm font-medium mb-1">Related Masjid ID</label>
            <input
              id="related_masjid"
              name="related_masjid"
              type="text"
              value={formData.related_masjid || ''}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              id="active"
              name="active"
              type="checkbox"
              checked={formData.active}
              onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
              className="rounded"
            />
            <label htmlFor="active" className="text-sm font-medium">Active</label>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function UserManagement(): JSX.Element {
  const [users, setUsers] = useState<UserRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<UserRead | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newUser, setNewUser] = useState<UserCreate>({
    email: '',
    password: '',
    role: 'masjid_admin',
    active: true,
    full_name: null,
    related_masjid: null,
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await authApi.getUsers();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (userId: string, data: UserUpdate) => {
    try {
      await authApi.updateUser(userId, data);
      await loadUsers(); // Reload the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
    }
  };

  const handleCreateUser = async () => {
    try {
      await authApi.createUser(newUser);
      notifications.show({
        title: 'Success',
        message: 'User created successfully',
        color: 'green',
      });
      setCreateModalOpen(false);
      setNewUser({
        email: '',
        password: '',
        role: 'masjid_admin',
        active: true,
        full_name: null,
        related_masjid: null,
      });
      await loadUsers();
    } catch (err) {
      notifications.show({
        title: 'Error',
        message: err instanceof Error ? err.message : 'Failed to create user',
        color: 'red',
      });
    }
  };

  const handleResetPassword = async (userId: string, newPassword: string) => {
    try {
      await authApi.resetPassword(userId, {
        new_password: newPassword,
        confirm_password: newPassword
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <Container size="100%" p={0}>
      <Paper withBorder p="md">
        <Group justify="space-between" mb="xl" wrap="wrap">
          <Title order={2}>User Management</Title>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => setCreateModalOpen(true)}
          >
            Create User
          </Button>
        </Group>
      
        <div className="grid gap-4">
          {users.map(user => (
            <div key={user.id} className="border p-4 rounded">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                  <h3 className="font-medium">{user.email}</h3>
                  <p className="text-sm text-gray-600">
                    Role: {user.role}
                    {user.full_name && ` • Name: ${user.full_name}`}
                    {user.related_masjid && ` • Masjid ID: ${user.related_masjid}`}
                  </p>
                  <p className="text-sm">
                    Status: <span className={user.active ? 'text-green-600' : 'text-red-600'}>
                      {user.active ? 'Active' : 'Inactive'}
                    </span>
                  </p>
                </div>
                <Group wrap="wrap" className="sm:flex-nowrap">
                  <Button
                    variant="light"
                    size="sm"
                    onClick={() => setEditingUser(user)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="light"
                    size="sm"
                    onClick={() => handleUpdateUser(user.id, { ...user, active: !user.active })}
                  >
                    Toggle Status
                  </Button>
                  <Button
                    variant="light"
                    color="yellow"
                    size="sm"
                    onClick={() => {
                      const newPassword = window.prompt('Enter new password');
                      if (newPassword) handleResetPassword(user.id, newPassword);
                    }}
                  >
                    Reset Password
                  </Button>
                </Group>
              </div>
            </div>
          ))}
        </div>
      </Paper>

      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSave={handleUpdateUser}
        />
      )}

      <Modal
        opened={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create New User"
      >
        <Stack>
          <TextInput
            label="Email"
            placeholder="user@example.com"
            required
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          />
          
          <TextInput
            label="Password"
            type="password"
            placeholder="Enter password"
            required
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
          />

          <TextInput
            label="Full Name"
            placeholder="John Doe"
            value={newUser.full_name || ''}
            onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
          />

          <Select
            label="Role"
            placeholder="Select role"
            data={[
              { value: 'admin', label: 'Admin' },
              { value: 'masjid_admin', label: 'Masjid Admin' }
            ]}
            value={newUser.role}
            onChange={(value) => value && setNewUser({ ...newUser, role: value as 'admin' | 'masjid_admin' })}
          />

          <TextInput
            label="Related Masjid ID"
            placeholder="Masjid UUID"
            value={newUser.related_masjid || ''}
            onChange={(e) => setNewUser({ ...newUser, related_masjid: e.target.value })}
          />

          <Checkbox
            label="Active"
            checked={newUser.active}
            onChange={(e) => setNewUser({ ...newUser, active: e.currentTarget.checked })}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={() => setCreateModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateUser}>Create User</Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
} 