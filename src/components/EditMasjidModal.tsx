import { Modal, TextInput, Select, Button } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useMasjid } from '../store/useStore';
import { masjidApi } from '../services/api';
import { notifications } from '@mantine/notifications';

interface EditMasjidModalProps {
  opened: boolean;
  onClose: () => void;
}

export function EditMasjidModal({ opened, onClose }: EditMasjidModalProps) {
  const masjid = useMasjid();

  const form = useForm({
    initialValues: {
      name: masjid?.name || '',
      type: masjid?.type || '',
      madhab: masjid?.madhab || '',
      locale: masjid?.locale || '',
      website: masjid?.website || '',
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    try {
      if (!masjid?.id) return;
      
      await masjidApi.updateMasjid(masjid.id, values);
      notifications.show({
        title: 'Success',
        message: 'Masjid details updated successfully',
        color: 'green',
      });
      onClose();
      // Reload the page to refresh the masjid data
      window.location.reload();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to update masjid details',
        color: 'red',
      });
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Edit Masjid Details">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <TextInput
          label="Name"
          placeholder="Masjid name"
          className="mb-4"
          {...form.getInputProps('name')}
        />
        
        <Select
          label="Type"
          placeholder="Select type"
          className="mb-4"
          data={[
            { value: 'sunni', label: 'Sunni' },
            { value: 'shia', label: 'Shia' },
            { value: 'other', label: 'Other' },
          ]}
          {...form.getInputProps('type')}
        />

        <Select
          label="Madhab"
          placeholder="Select madhab"
          className="mb-4"
          data={[
            { value: 'hanafi', label: 'Hanafi' },
            { value: 'shafi', label: 'Shafi' },
            { value: 'maliki', label: 'Maliki' },
            { value: 'hanbali', label: 'Hanbali' },
            { value: 'other', label: 'Other' },
          ]}
          {...form.getInputProps('madhab')}
        />

        <Select
          label="Locale"
          placeholder="Select locale"
          className="mb-4"
          data={[
            { value: 'en', label: 'English' },
            { value: 'ar', label: 'Arabic' },
            { value: 'ur', label: 'Urdu' },
          ]}
          {...form.getInputProps('locale')}
        />

        <TextInput
          label="Website"
          placeholder="https://example.com"
          className="mb-4"
          {...form.getInputProps('website')}
        />

        <div className="flex justify-end gap-4 mt-4">
          <Button variant="subtle" onClick={onClose}>Cancel</Button>
          <Button type="submit">Save Changes</Button>
        </div>
      </form>
    </Modal>
  );
} 