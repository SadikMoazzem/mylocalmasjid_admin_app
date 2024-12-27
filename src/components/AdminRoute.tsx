import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '../store/useStore';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const user = useUser();
  const location = useLocation();

  // First check if user is authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has admin role
  if (user.role !== 'admin') {
    // Redirect non-admin users to the root page
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute; 