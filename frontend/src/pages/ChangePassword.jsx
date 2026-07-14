import { Button, Card, Form, Input, message } from 'antd';
import { FiLock } from 'react-icons/fi';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import PageHeader from '../components/PageHeader.jsx';
import React from 'react';

export default function ChangePassword() {
  const [form] = Form.useForm();
  const { user } = useAuth();

  const onFinish = async (values) => {
    try {
      await api.post('/auth/change-password', values);
      message.success('Password updated successfully. Please login again.');
      localStorage.removeItem('biit_token');
      localStorage.removeItem('biit_user');
      window.location.href = '/admin/login';
    } catch (error) {
      message.error(error?.response?.data?.message || 'Password change failed');
    }
  };

  return (
    <div>
      <PageHeader 
        icon={<FiLock />} 
        title="Change Password" 
        subtitle={user?.mustChangePassword ? "You must change your password before continuing." : "Update your account password"} 
      />
      <Card className="content-card" bordered={false} style={{ maxWidth: 500, margin: '0 auto' }}>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          {!user?.mustChangePassword && (
             <Form.Item name="oldPassword" label="Current Password" rules={[{ required: true }]}>
               <Input.Password prefix={<FiLock />} placeholder="Current password" />
             </Form.Item>
          )}
          <Form.Item name="newPassword" label="New Password" rules={[{ required: true, min: 6 }]}>
            <Input.Password prefix={<FiLock />} placeholder="New password (Min 6 chars)" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>Update Password</Button>
        </Form>
      </Card>
    </div>
  );
}