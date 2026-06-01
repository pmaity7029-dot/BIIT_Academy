import { Button, Card, Form, Input, Typography, message } from 'antd';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FiLock } from 'react-icons/fi';
import api from '../api/client.js';
import React from "react";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      await api.post(`/auth/reset-password/${token}`, values);
      message.success('Password reset successfully. Please login.');
      navigate('/admin');
    } catch (error) {
      message.error(error?.response?.data?.message || 'Reset failed');
    }
  };

  return (
    <div className="login-page">
      <Card className="login-card" bordered={false}>
        <div className="login-logo"><FiLock /></div>
        <Typography.Title level={2}>Reset Password</Typography.Title>
        <Form layout="vertical" onFinish={onFinish} className="login-form">
          <Form.Item name="password" label="New Password" rules={[{ required: true, min: 6 }]}>
            <Input.Password size="large" prefix={<FiLock />} placeholder="Enter new password" />
          </Form.Item>
          <Button type="primary" size="large" htmlType="submit" block>Save New Password</Button>
        </Form>
        <Link to="/admin" className="back-link">Back to Login</Link>
      </Card>
    </div>
  );
}
