import { Navigate, useLocation, useParams } from 'react-router-dom';
import { useUser } from '../store/useStore';
import NoMasjidError from '../pages/NoMasjidError';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const user = useUser();
  const location = useLocation();
  const { masjidId } = useParams<{ masjidId: string }>();

  // First check if user is authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if trying to access a specific masjid route
  if (masjidId) {
    // For masjid_admin, check if they're trying to access their assigned masjid
    if (user.role === 'masjid_admin') {
      if (!user.related_masjid) {
        return <NoMasjidError />;
      }
      
      if (user.related_masjid !== masjidId) {
        return <NoMasjidError />;
      }
    }
    // Admin users can access all masjids, so no additional check needed for them
  }

  return <>{children}</>;
};

export default ProtectedRoute; 