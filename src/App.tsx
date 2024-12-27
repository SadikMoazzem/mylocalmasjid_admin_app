import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MantineProvider, createTheme } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { AuthProvider } from './contexts/AuthContext';
import { MasjidProvider } from './contexts/MasjidContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import PrayerTimes from './pages/PrayerTimes';
import SpecialPrayers from './pages/SpecialPrayers';
import Announcements from './pages/Announcements';
import Facilities from './pages/Facilities';
import MasjidPicker from './pages/MasjidPicker';
import NoMasjidError from './pages/NoMasjidError';
import { useUser } from './store/useStore';
import { EditMasjid } from './pages/EditMasjid';
import PlatformConfig from './pages/PlatformConfig';
import UserManagement from './pages/UserManagement';
import AdminRoute from './components/AdminRoute';

const queryClient = new QueryClient();

const theme = createTheme({
  /** Put your mantine theme override here */
  colors: {
    brand: [
      '#ecfdf5',
      '#d1fae5',
      '#a7f3d0',
      '#6ee7b7',
      '#34d399',
      '#1B8B7D',
      '#187D70',
      '#156F63',
      '#126156',
      '#0F5349',
    ],
  },
  primaryColor: 'brand',
});

function RedirectToDashboard() {
  const user = useUser();
  const location = useLocation();

  // Only redirect if we're not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to="/" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      {/* All authenticated routes wrapped in Layout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        {/* Root shows masjid picker */}
        <Route index element={<MasjidPicker />} />
        <Route path="no-masjid" element={<NoMasjidError />} />
        
        {/* Routes after masjid selection */}
        <Route path="dashboard/:masjidId" element={
          <MasjidProvider>
            <Dashboard />
          </MasjidProvider>
        } />
        <Route path="prayer-times/:masjidId" element={
          <MasjidProvider>
            <PrayerTimes />
          </MasjidProvider>
        } />
        <Route path="special-prayers/:masjidId" element={
          <MasjidProvider>
            <SpecialPrayers />
          </MasjidProvider>
        } />
        <Route path="announcements/:masjidId" element={
          <MasjidProvider>
            <Announcements />
          </MasjidProvider>
        } />
        <Route path="facilities/:masjidId" element={
          <MasjidProvider>
            <Facilities />
          </MasjidProvider>
        } />
        <Route path="edit/:masjidId" element={
          <MasjidProvider>
            <EditMasjid />
          </MasjidProvider>
        } />
        
        {/* Admin routes */}
        <Route 
          path="platform-config" 
          element={
            <AdminRoute>
              <PlatformConfig />
            </AdminRoute>
          } 
        />
        <Route 
          path="user-management" 
          element={
            <AdminRoute>
              <UserManagement />
            </AdminRoute>
          } 
        />
      </Route>
      
      <Route path="*" element={<RedirectToDashboard />} />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider theme={theme} defaultColorScheme="light">
        <Notifications />
        <ModalsProvider>
          <Router>
            <AuthProvider>
              <AppRoutes />
            </AuthProvider>
          </Router>
        </ModalsProvider>
      </MantineProvider>
    </QueryClientProvider>
  );
}

export default App;
