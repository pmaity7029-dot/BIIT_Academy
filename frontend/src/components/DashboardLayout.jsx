import {
  Avatar,
  Button,
  Drawer,
  Grid,
  Layout,
  Menu,
  Typography,
  Modal,
  Form,
  Input,
  message,
} from "antd";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
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
  FiX,
  FiShield,
  FiUser,
  FiGlobe,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../api/client.js"; // Ensure api is imported

const { Header, Sider, Content } = Layout;

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const screens = Grid.useBreakpoint();
  const { user, logout, updateUser } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Password change states
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [passForm] = Form.useForm();

  // Strict JWT validation check on mount
  useEffect(() => {
    api.get("/auth/me").catch(() => {
      // api/client.js already intercepts 401, but this guarantees strict dashboard entry
    });
  }, []);

  // Force password change check
  useEffect(() => {
    if (user && user.mustChangePassword) {
      setPasswordModalOpen(true);
    }
  }, [user]);

  const handlePasswordChange = async (values) => {
    try {
      await api.put("/auth/change-password", values);
      message.success("Password updated successfully!");
      setPasswordModalOpen(false);
      updateUser({ mustChangePassword: false });
    } catch (err) {
      message.error(err.response?.data?.message || "Failed to update password");
    }
  };

  const getMenuItems = () => {
    const items = [
      { key: "/admin/dashboard", icon: <FiHome />, label: "Dashboard" },
      {
        type: "group",
        label: "Students",
        children: [
          { key: "/admin/students", icon: <FiUsers />, label: "All Students" },
          {
            key: "/admin/attendance",
            icon: <FiCalendar />,
            label: "Attendance",
          },
          {
            key: "/admin/performance",
            icon: <FiBarChart2 />,
            label: "Performance",
          },
          { key: "/admin/id-cards", icon: <FiUser />, label: "ID Cards" },
        ],
      },
      {
        type: "group",
        label: "Courses",
        children: [
          {
            key: "/admin/courses",
            icon: <FiBookOpen />,
            label: "Batches & Courses",
          },
        ],
      },
      {
        type: "group",
        label: "Finance & Certs",
        children: [
          { key: "/admin/payments", icon: <FiCreditCard />, label: "Payments" },
          {
            key: "/admin/certificates",
            icon: <FiAward />,
            label: "Certificates",
          },
        ],
      },
      {
        type: "group",
        label: "Communication",
        children: [
          { key: "/admin/messages", icon: <FiMail />, label: "Messages" },
        ],
      },
    ];

    if (user?.actualRole === "ADMIN") {
      items.push({
        type: "group",
        label: "Administration",
        children: [
          { key: "/admin/franchises", icon: <FiShield />, label: "Franchises" },
          {
            key: "/admin/website-editor",
            icon: <FiGlobe />,
            label: "Website Editor",
          },
        ],
      });
    }

    if (user?.actualRole === "ADMIN" || user?.actualRole === "FRANCHISE") {
      items.push({
        type: "group",
        label: "Branch Management",
        children: [
          { key: "/admin/sub-admins", icon: <FiShield />, label: "Sub Admins" },
        ],
      });
    }

    return items;
  };

  const menuItems = getMenuItems();

  const pageTitle = (pathname) => {
    const match = menuItems
      .flatMap((item) => item.children || [item])
      .find((item) => item.key === pathname);
    return match?.label || "Dashboard";
  };

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
    navigate("/admin");
  };

  const onMenuClick = ({ key }) => {
    navigate(key);
    setMobileMenuOpen(false);
  };

  const roleDisplay =
    user?.actualRole === "ADMIN"
      ? "Super Admin"
      : user?.actualRole === "FRANCHISE"
        ? "Franchise"
        : "Sub Admin";

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
        styles={{ body: { padding: 0 } }}
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
          />

          <div className="header-left">
            <Typography.Title level={4} className="header-title">
              {pageTitle(location.pathname)}
            </Typography.Title>
          </div>

          <div className="header-actions">
            <Button
              type="link"
              icon={<FiGlobe />}
              onClick={() => window.open("/", "_blank")}
            >
              Home
            </Button>

            <div className="user-pill">
              <Avatar className="user-avatar">
                {user?.name?.slice(0, 2)?.toUpperCase() || "AD"}
              </Avatar>

              <span>{user?.name || "Admin"}</span>
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

      {/* Forced Password Reset Modal on First Login */}
      <Modal
        title="Change Your Password"
        open={passwordModalOpen}
        closable={false}
        maskClosable={false}
        footer={null}
        keyboard={false}
      >
        <Typography.Paragraph>
          For security reasons, you must change your default password before
          continuing to your dashboard.
        </Typography.Paragraph>
        <Form form={passForm} layout="vertical" onFinish={handlePasswordChange}>
          <Form.Item
            name="password"
            label="New Password"
            rules={[
              {
                required: true,
                min: 6,
                message: "Password must be at least 6 characters",
              },
            ]}
          >
            <Input.Password placeholder="Enter new password" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>
            Update Password
          </Button>
        </Form>
      </Modal>
    </Layout>
  );
}
