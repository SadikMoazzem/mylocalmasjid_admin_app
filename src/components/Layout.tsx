import { useNavigate, NavLink, Outlet, useParams } from 'react-router-dom';
import { Popover, UnstyledButton, Title, Box, Button, Text, Drawer, ActionIcon, Group } from '@mantine/core';
import { IconLogout, IconChevronRight, IconEdit, IconMenu2 } from '@tabler/icons-react';
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../store/useStore';
import { useMasjidDetails } from '../hooks/useMasjidData';
import { useDisclosure } from '@mantine/hooks';

const Layout = (): JSX.Element => {
  const { logout } = useAuth();
  const user = useUser();
  const { masjidId } = useParams();
  const navigate = useNavigate();
  const { masjid } = useMasjidDetails(masjidId);
  const [drawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false);

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
            onClick={() => {
              navigate(`/edit/${masjidId}`);
              closeDrawer();
            }}
            className="w-full"
          >
            Edit Masjid
          </Button>
        </>
      );
    }
    
    return (
      <div className="p-4 border-b border-gray-200">
        {currentMasjidLink}
      </div>
    );
  };

  const Navigation = () => {
    const navItems = [
      { label: 'Dashboard', path: `/dashboard/${masjidId}` },
      { label: 'Prayer Times', path: `/prayer-times/${masjidId}` },
      { label: 'Special Prayers', path: `/special-prayers/${masjidId}` },
      { label: 'Announcements', path: `/announcements/${masjidId}` },
      { label: 'Facilities', path: `/facilities/${masjidId}` },
    ];

    return (
      <div className="flex-1 overflow-y-auto p-4">
        <Text size="sm" fw={500} c="dimmed" className="mb-2">
          Navigation
        </Text>
        <div className="space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={closeDrawer}
              className={({ isActive }) =>
                `block px-4 py-2 rounded transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>
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
            onClick={() => {
              navigate('/');
              closeDrawer();
            }}
            className="w-full mb-2"
          >
            {`${masjid ? 'Switch' : 'Select'} Masjid`}
          </Button>
          <NavLink
            to="/platform-config"
            onClick={closeDrawer}
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
            onClick={closeDrawer}
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

  const Sidebar = () => (
    <>
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
    </>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Header - Only visible on small screens */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b">
        <div className="flex items-center gap-3">
          <ActionIcon variant="subtle" onClick={openDrawer}>
            <IconMenu2 size={24} />
          </ActionIcon>
          <img src="/logo.png" alt="My Local Masjid" className="w-8 h-8" />
        </div>
        <div className="text-sm font-medium">{masjid?.name || 'My Local Masjid'}</div>
      </div>

      {/* Mobile Navigation Drawer - Only visible on small screens */}
      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        size="xs"
        className="md:hidden"
      >
        <Sidebar />
      </Drawer>

      {/* Original Layout - Hidden on small screens, visible on md and up */}
      <div className="hidden md:flex h-screen">
        {/* Desktop Sidebar */}
        <div className="w-64 bg-white shadow-lg flex flex-col">
          <Sidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-4">
            <Outlet />
          </div>
        </div>
      </div>

      {/* Mobile Content Area - Only visible on small screens */}
      <div className="md:hidden flex-1">
        <div className="p-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout; 