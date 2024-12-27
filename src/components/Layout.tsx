import { useNavigate, NavLink, Outlet, useParams } from 'react-router-dom';
import { Popover, UnstyledButton, Title, Box, Button, Text } from '@mantine/core';
import { IconLogout, IconChevronRight, IconEdit } from '@tabler/icons-react';
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../store/useStore';
import { useMasjidDetails } from '../hooks/useMasjidData';

const Layout = (): JSX.Element => {
  const { logout } = useAuth();
  const user = useUser();
  const { masjidId } = useParams();
  const navigate = useNavigate();
  const { masjid } = useMasjidDetails(masjidId);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = user?.role === 'admin';

  const MasjidInfo = () => {
    let currentMasjidLink = null;
    if (masjid) {
        currentMasjidLink = (
            <>
                <div className="flex items-start gap-4 mb-3">
                    {/* Logo placeholder */}
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-gray-400 text-xs">Logo</span>
                    </div>
                    
                    <div className="flex-1">
                        <h2 className="text-xl font-semibold text-gray-800">
                        {masjid.name}
                        </h2>
                    </div>
                </div>

                <Button
                leftSection={<IconEdit size={16} />}
                variant="subtle"
                size="sm"
                onClick={() => navigate(`/edit/${masjidId}`)}
                className="w-full"
                >
                    Edit Masjid
                </Button>
            </>
        );
    };
    
    return (
      <div className="p-4 border-b border-gray-200">
        {currentMasjidLink}
      </div>
    );
  };

  const Navigation = () => {
    if (!masjidId) return null;

    return (
      <nav className="p-4 flex-1">
        <div className="space-y-2">
          <NavLink
            to={`/dashboard/${masjidId}`}
            className={({ isActive }) =>
              `block px-4 py-2 rounded transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to={`/prayer-times/${masjidId}`}
            className={({ isActive }) =>
              `block px-4 py-2 rounded transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            Daily Prayer Timetable
          </NavLink>
          <NavLink
            to={`/special-prayers/${masjidId}`}
            className={({ isActive }) =>
              `block px-4 py-2 rounded transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            Special Prayers
          </NavLink>
          <NavLink
            to={`/announcements/${masjidId}`}
            className={({ isActive }) =>
              `block px-4 py-2 rounded transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            Announcements
          </NavLink>
          <NavLink
            to={`/facilities/${masjidId}`}
            className={({ isActive }) =>
              `block px-4 py-2 rounded transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            Facilities
          </NavLink>
        </div>
      </nav>
    );
  };

  const AdminNavigation = () => {
    if (!isAdmin) return null;

    return (
      <div className="border-t border-gray-200 p-4">
        <Text size="sm" fw={500} c="dimmed" className="mb-2">
          Admin
        </Text>
        <div className="space-y-2">
          <Button
            variant="light"
            size="sm"
            onClick={() => navigate('/')}
            className="w-full mb-2"
          >
            {`${masjid ? 'Switch' : 'Select'} Masjid`}
          </Button>
          <NavLink
            to="/platform-config"
            className={({ isActive }) =>
              `block px-4 py-2 rounded transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            Platform Config
          </NavLink>
          <NavLink
            to="/user-management"
            className={({ isActive }) =>
              `block px-4 py-2 rounded transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            User Management
          </NavLink>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-64 bg-white shadow-lg flex flex-col">
        {/* Brand Section */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col items-center">
            <img src="/logo.png" alt="My Local Masjid" className="w-16 h-16" />
            <Text size="lg" fw={600} className="mt-2 text-center text-gray-800">
              My Local Masjid
            </Text>
            <Text size="xs" c="dimmed" className="text-center">
              Admin Portal
            </Text>
          </div>
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          <MasjidInfo />
          <Navigation />
        </div>

        {/* Admin Navigation */}
        <AdminNavigation />

        {/* User Profile Section */}
        <div className="border-t border-gray-200 p-4">
          <Popover position="top-end" withArrow shadow="md">
            <Popover.Target>
              <UnstyledButton className="w-full px-3 py-2 hover:bg-gray-50 rounded transition-colors">
                <div className="text-left">
                  <div className="font-medium text-sm text-gray-900">
                    {user?.full_name || 'User'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {user?.email}
                  </div>
                </div>
              </UnstyledButton>
            </Popover.Target>

            <Popover.Dropdown>
              <UnstyledButton
                onClick={handleLogout}
                className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded w-full"
              >
                <IconLogout size={14} className="mr-2" />
                Logout
              </UnstyledButton>
            </Popover.Dropdown>
          </Popover>
        </div>
      </div>

      {/* Main Content Area with Header */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-gray-100">
          <div className="h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout; 