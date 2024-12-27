import { TextInput, Select, Button, Paper, Title, Grid, Badge, Group, Container } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useMasjid } from '../store/useStore';
import { masjidApi, Location, LocationCreate } from '../services/api';
import { notifications } from '@mantine/notifications';
import { useEffect, useState } from 'react';
import { MapboxSearch } from '../components/MapboxSearch';
import { encode } from 'ngeohash';

export function EditMasjid() {
  const masjid = useMasjid();
  const [location, setLocation] = useState<Location | null>(null);

  const form = useForm({
    initialValues: {
      name: masjid?.name || '',
      type: masjid?.type || '',
      madhab: masjid?.madhab || '',
      locale: masjid?.locale || '',
      website: masjid?.website || '',
      // Location fields
      full_address: '',
      city: '',
      country: '',
      latitude: 0,
      longitude: 0,
    },
  });

  useEffect(() => {
    const fetchLocation = async () => {
      if (!masjid?.id) return;
      try {
        const locationData = await masjidApi.getMasjidLocation(masjid.id);
        setLocation(locationData);
        form.setValues({
          ...form.values,
          full_address: locationData.full_address,
          city: locationData.city,
          country: locationData.country,
          latitude: locationData.latitude,
          longitude: locationData.longitude,
        });
      } catch (error) {
        console.error('Failed to fetch location:', error);
      }
    };
    fetchLocation();
  }, [masjid?.id]);

  const handleLocationSelect = (newLocation: Omit<Location, 'id' | 'masjid_id' | 'geoHash'>) => {
    form.setValues({
      ...form.values,
      ...newLocation,
    });
  };

  const handleLocationSubmit = async () => {
    try {
      if (!masjid?.id) return;

      const locationData: LocationCreate = {
        masjid_id: masjid.id,
        full_address: form.values.full_address,
        city: form.values.city,
        country: form.values.country,
        latitude: form.values.latitude,
        longitude: form.values.longitude,
        geoHash: encode(form.values.latitude, form.values.longitude),
      };

      if (location?.id) {
        const updatedLocation = await masjidApi.updateMasjidLocation(masjid.id, location.id, {
          ...locationData,
          id: location.id,
        });
        setLocation(updatedLocation);
      } else {
        const createdLocation = await masjidApi.createMasjidLocation(masjid.id, locationData);
        setLocation(createdLocation);
      }

      notifications.show({
        title: 'Success',
        message: 'Location saved successfully',
        color: 'green',
      });
    } catch (error) {
      console.error('Failed to save location:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to save location',
        color: 'red',
      });
    }
  };

  const generateGeoHash = (lat: number, lng: number): string => {
    return encode(lat, lng, 7); // 7 characters gives ~150m precision
  };

  const handleMasjidDetailsSubmit = async (values: typeof form.values) => {
    try {
      if (!masjid?.id) return;
      
      const masjidUpdate = {
        name: values.name,
        type: values.type,
        madhab: values.madhab,
        locale: values.locale,
        website: values.website,
        has_times: masjid.has_times,
      };
      
      await masjidApi.updateMasjid(masjid.id, masjidUpdate);

      notifications.show({
        title: 'Success',
        message: 'Masjid details updated successfully',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to update masjid details',
        color: 'red',
      });
    }
  };

  return (
    <Container size="lg" py="xl">
      <form onSubmit={(e) => e.preventDefault()}>
        <Paper shadow="xs" p="md" mb="xl">
          <Title order={2} mb="md">Masjid Details</Title>
          <Grid>
            <Grid.Col span={12}>
              <TextInput
                label="Name"
                placeholder="Masjid name"
                {...form.getInputProps('name')}
              />
            </Grid.Col>
            
            <Grid.Col span={6}>
              <Select
                label="Type"
                placeholder="Select type"
                data={[
                  { value: 'sunni', label: 'Sunni' },
                  { value: 'shia', label: 'Shia' },
                  { value: 'other', label: 'Other' },
                ]}
                {...form.getInputProps('type')}
              />
            </Grid.Col>

            <Grid.Col span={6}>
              <Select
                label="Madhab"
                placeholder="Select madhab"
                data={[
                  { value: 'hanafi', label: 'Hanafi' },
                  { value: 'shafi', label: 'Shafi' },
                  { value: 'maliki', label: 'Maliki' },
                  { value: 'hanbali', label: 'Hanbali' },
                  { value: 'other', label: 'Other' },
                ]}
                {...form.getInputProps('madhab')}
              />
            </Grid.Col>

            <Grid.Col span={6}>
              <Select
                label="Locale"
                placeholder="Select locale"
                data={[
                  { value: 'en', label: 'English' },
                  { value: 'ar', label: 'Arabic' },
                  { value: 'ur', label: 'Urdu' },
                ]}
                {...form.getInputProps('locale')}
              />
            </Grid.Col>

            <Grid.Col span={6}>
              <TextInput
                label="Website"
                placeholder="https://example.com"
                {...form.getInputProps('website')}
              />
            </Grid.Col>
          </Grid>
          <div className="flex justify-end mt-4">
            <Button onClick={() => handleMasjidDetailsSubmit(form.values)} size="md">
              Save Masjid Details
            </Button>
          </div>
        </Paper>

        <Paper shadow="xs" p="md" mb="xl">
          <Group justify="space-between" mb="md">
            <Title order={2}>Location Details</Title>
            {!location && (
              <Badge color="yellow">No Location</Badge>
            )}
          </Group>

          <MapboxSearch
            initialLocation={location || undefined}
            onLocationSelect={handleLocationSelect}
          />

          <Group justify="flex-end" mt="md">
            <Button 
              onClick={handleLocationSubmit}
              size="md"
              disabled={!form.values.latitude || !form.values.longitude}
            >
              Save Location
            </Button>
          </Group>
        </Paper>
      </form>
    </Container>
  );
} 