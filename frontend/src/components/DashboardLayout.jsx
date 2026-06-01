import { Layout, Menu, Select, Button, Avatar, Typography } from 'antd';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import React from "react";
import {
  FiAward,
  FiBarChart2,
  FiBookOpen,
  FiCalendar,
  FiCreditCard,
  FiHome,
  FiLogOut,
  FiMail,
  FiMonitor,
  FiUsers
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext.jsx';

const { Header, Sider, Content } = Layout;

const menuItems = [
  { key: '/admin/dashboard', icon: <FiHome />, label: 'Dashboard' },
  { type: 'group', label: 'Students', children: [
    { key: '/admin/students', icon: <FiUsers />, label: 'All Students' },
    { key: '/admin/attendance', icon: <FiCalendar />, label: 'Attendance' },
    { key: '/admin/performance', icon: <FiBarChart2 />, label: 'Performance' }
  ] },
  { type: 'group', label: 'Courses', children: [
    { key: '/admin/courses', icon: <FiBookOpen />, label: 'Batches & Courses' }
  ] },
  { type: 'group', label: 'Finance & Certs', children: [
    { key: '/admin/payments', icon: <FiCreditCard />, label: 'Payments' },
    { key: '/admin/certificates', icon: <FiAward />, label: 'Certificates' }
  ] },
  { type: 'group', label: 'Communication', children: [
    { key: '/admin/messages', icon: <FiMail />, label: 'Messages' }
  ] }
];

const pageTitle = (pathname) => {
  const match = menuItems.flatMap((item) => item.children || [item]).find((item) => item.key === pathname);
  return match?.label || 'Dashboard';
};

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const onLogout = () => {
    logout();
    navigate('/admin');
  };

  return (
    <Layout className="admin-shell">
      <Sider width={284} className="admin-sider" breakpoint="lg" collapsedWidth="0">
        <div className="brand-block">
          <div className="brand-icon"><FiMonitor /></div>
          <div><span>BIIT</span> Admin</div>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          className="admin-menu"
        />
      </Sider>
      <Layout>
        <Header className="admin-header">
          <div className="header-left">
            <Typography.Title level={4} className="header-title">{pageTitle(location.pathname)}</Typography.Title>
            <Select defaultValue="All Centres" className="centre-select" options={[{ value: 'All Centres', label: 'All Centres' }, { value: 'BIIT - Main Branch', label: 'BIIT - Main Branch' }]} />
          </div>
          <div className="header-actions">
            <div className="user-pill">
              <Avatar className="user-avatar">{user?.name?.slice(0, 2)?.toUpperCase() || 'AD'}</Avatar>
              <span>{user?.name || 'Admin'}</span>
            </div>
            <Button danger onClick={onLogout} icon={<FiLogOut />}>Logout</Button>
          </div>
        </Header>
        <Content className="admin-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
