import { Button, Card, Form, Input, Modal, Typography, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { FiLock, FiMail, FiMonitor } from 'react-icons/fi';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import React from "react";

export default function AdminLogin() {
  const [form] = Form.useForm();
  const [forgotForm] = Form.useForm();
  const [modal, contextHolder] = Modal.useModal();
  const navigate = useNavigate();
  const { login } = useAuth();

  const onFinish = async (values) => {
    try {
      await login(values);
      message.success('Login successful');
      navigate('/admin/dashboard');
    } catch (error) {
      message.error(error?.response?.data?.message || 'Login failed');
    }
  };

  const openForgot = () => {
    modal.confirm({
      title: 'Reset admin password',
      icon: null,
      content: (
        <Form form={forgotForm} layout="vertical">
          <Form.Item name="email" label="Admin Email" rules={[{ required: true, type: 'email' }]}>
            <Input prefix={<FiMail />} placeholder="admin@biit.in" />
          </Form.Item>
        </Form>
      ),
      okText: 'Send Reset Link',
      async onOk() {
        const values = await forgotForm.validateFields();
        const { data } = await api.post('/auth/forgot-password', values);
        message.success(data.message);
        if (data.resetLink) {
          Modal.info({ title: 'Development reset link', content: data.resetLink });
        }
      }
    });
  };

  return (
    <div className="login-page">
      {contextHolder}
      <Card className="login-card" variant="borderless">
        <div className="login-logo"><FiLock /></div>
        <Typography.Title level={2}>BIIT</Typography.Title>
        <Typography.Text type="secondary">Admin Panel — Secure Login</Typography.Text>
        
        <Form form={form} layout="vertical" onFinish={onFinish} className="login-form">
          <Form.Item name="email" label="Email Address" rules={[{ required: true, type: 'email' }]}>
            <Input size="large" prefix={<FiMail />} placeholder="Enter email address" />
          </Form.Item>
          <Form.Item name="password" label="Password" rules={[{ required: true }]}>
            <Input.Password size="large" prefix={<FiLock />} placeholder="Enter password" />
          </Form.Item>
          <Button type="primary" size="large" htmlType="submit" block>Login to Admin Panel</Button>
        </Form>
        <Button type="link" onClick={openForgot}>Forgot password?</Button>
        <Link to="/" className="back-link"><FiMonitor /> Back to Website</Link>
      </Card>
    </div>
  );
}