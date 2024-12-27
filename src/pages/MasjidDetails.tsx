import { useParams } from 'react-router-dom';
import { Container, Title, Paper, Text, Grid, Button, LoadingOverlay } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { masjidApi } from '../services/api';

function MasjidDetails() {
  const { id } = useParams<{ id: string }>();
  
  const { data: masjid, isLoading, error } = useQuery({
    queryKey: ['masjid', id],
    queryFn: () => masjidApi.getMasjid(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return <LoadingOverlay visible />;
  }

  if (error) {
    return (
      <Container>
        <Paper p="md">
          <Text color="red">Error loading masjid details. Please try again later.</Text>
        </Paper>
      </Container>
    );
  }

  if (!masjid) {
    return (
      <Container>
        <Paper p="md">
          <Text>Masjid not found</Text>
        </Paper>
      </Container>
    );
  }

  return (
    <Container>
      <Title order={2}>{masjid.name}</Title>
      
      <Grid mt="md">
        <Grid.Col span={6}>
          <Paper p="md">
            <Title order={3}>Details</Title>
            <Text><strong>Type:</strong> {masjid.type}</Text>
            <Text><strong>Locale:</strong> {masjid.locale || 'Not set'}</Text>
            <Text><strong>Madhab:</strong> {masjid.madhab || 'Not set'}</Text>
            <Text><strong>Website:</strong> {masjid.website || 'Not set'}</Text>
            <Text><strong>Status:</strong> {masjid.active ? 'Active' : 'Inactive'}</Text>
            <Text><strong>Prayer Times:</strong> {masjid.has_times ? 'Available' : 'Not available'}</Text>
            
            <Button mt="md" onClick={() => {/* Add edit functionality */}}>
              Edit Details
            </Button>
          </Paper>
        </Grid.Col>
        
        <Grid.Col span={6}>
          <Paper p="md">
            <Title order={3}>Prayer Times</Title>
            {/* Add prayer times component here */}
          </Paper>
        </Grid.Col>
      </Grid>
    </Container>
  );
}

export default MasjidDetails; 