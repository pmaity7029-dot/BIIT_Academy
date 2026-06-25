import { Avatar, Button, Drawer, Grid, Layout, Menu, Typography } from 'antd';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { FiUser } from 'react-icons/fi';
import {
  FiAward,
  FiBarChart2,
  FiBookOpen,
  FiCalendar,
  FiCreditCard,
  FiHome,
  FiLogOut,
  FiMail,
  FiMenu,
  FiMonitor,
  FiUsers,
  FiX
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext.jsx';

const { Header, Sider, Content } = Layout;

const menuItems = [
  { key: '/admin/dashboard', icon: <FiHome />, label: 'Dashboard' },
  {
    type: 'group',
    label: 'Students',
    children: [
      { key: '/admin/students', icon: <FiUsers />, label: 'All Students' },
      { key: '/admin/attendance', icon: <FiCalendar />, label: 'Attendance' },
      { key: '/admin/performance', icon: <FiBarChart2 />, label: 'Performance' },
      { key: '/admin/id-cards', icon: <FiUser />, label: 'ID Cards' } // NEW MENU ITEM
    ]
  },
  {
    type: 'group',
    label: 'Courses',
    children: [
      { key: '/admin/courses', icon: <FiBookOpen />, label: 'Batches & Courses' }
    ]
  },
  {
    type: 'group',
    label: 'Finance & Certs',
    children: [
      { key: '/admin/payments', icon: <FiCreditCard />, label: 'Payments' },
      { key: '/admin/certificates', icon: <FiAward />, label: 'Certificates' }
    ]
  },
  {
    type: 'group',
    label: 'Communication',
    children: [
      { key: '/admin/messages', icon: <FiMail />, label: 'Messages' }
    ]
  }
];

const pageTitle = (pathname) => {
  const match = menuItems
    .flatMap((item) => item.children || [item])
    .find((item) => item.key === pathname);

  return match?.label || 'Dashboard';
};

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const screens = Grid.useBreakpoint();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (screens.lg) {
      setMobileMenuOpen(false);
    }
  }, [screens.lg]);

  const onLogout = () => {
    logout();
    navigate('/admin');
  };

  const onMenuClick = ({ key }) => {
    navigate(key);
    setMobileMenuOpen(false);
  };

  const menuNode = (
    <Menu
      mode="inline"
      selectedKeys={[location.pathname]}
      items={menuItems}
      onClick={onMenuClick}
      className="admin-menu"
    />
  );

  return (
    <Layout className="admin-shell">
      <Sider
        width={284}
        className="admin-sider desktop-admin-sider"
        breakpoint="lg"
        collapsedWidth="0"
        trigger={null}
      >
        <div className="brand-block">
          <div className="brand-icon">
            <FiMonitor />
          </div>
          <div>
            <span>BIIT</span> Admin
          </div>
        </div>

        {menuNode}
      </Sider>

      <Drawer
        open={mobileMenuOpen}
        placement="left"
        width={284}
        closable={false}
        onClose={() => setMobileMenuOpen(false)}
        rootClassName="mobile-admin-drawer-root"
        className="mobile-admin-drawer"
        styles={{
          body: { padding: 0 }
        }}
      >
        <div className="brand-block mobile-brand-block">
          <div className="mobile-brand-left">
            <div className="brand-icon">
              <FiMonitor />
            </div>
            <div>
              <span>BIIT</span> Admin
            </div>
          </div>

          <Button
            type="text"
            className="mobile-drawer-close"
            icon={<FiX />}
            onClick={() => setMobileMenuOpen(false)}
          />
        </div>

        {menuNode}
      </Drawer>

      <Layout className="admin-main-layout">
        <Header className="admin-header">
          <Button
            type="text"
            className="mobile-menu-btn"
            icon={<FiMenu />}
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
          />

          <div className="header-left">
            <Typography.Title level={4} className="header-title">
              {pageTitle(location.pathname)}
            </Typography.Title>
          </div>

          <div className="header-actions">
            <div className="user-pill">
              <Avatar className="user-avatar">
                {user?.name?.slice(0, 2)?.toUpperCase() || 'AD'}
              </Avatar>
              <span>{user?.name || 'Admin'}</span>
            </div>

            <Button danger onClick={onLogout} icon={<FiLogOut />}>
              Logout
            </Button>
          </div>
        </Header>

        <Content className="admin-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
