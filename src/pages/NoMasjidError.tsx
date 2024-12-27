import { Container, Title, Text, Button, Stack } from '@mantine/core';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../store/useStore';

export default function NoMasjidError() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const user = useUser();
  const { masjidId } = useParams();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isUnauthorizedAccess = user?.related_masjid && user.related_masjid !== masjidId;
  const title = isUnauthorizedAccess ? 'Unauthorized Access' : 'Account Not Setup';
  const message = isUnauthorizedAccess
    ? 'You do not have permission to access this masjid.'
    : 'Your account has not been linked to a masjid yet. Please contact an administrator to set up your account.';

  return (
    <Container size="sm" py="xl">
      <Stack gap="lg" align="center">
        <Title order={2} c="red">{title}</Title>
        <Text ta="center" size="lg">
          {message}
        </Text>
        {isUnauthorizedAccess ? (
          <Button onClick={() => navigate(`/dashboard/${user?.related_masjid}`)} variant="light">
            Go to Your Masjid
          </Button>
        ) : (
          <Button onClick={handleLogout} variant="light" color="red">
            Logout
          </Button>
        )}
      </Stack>
    </Container>
  );
} 