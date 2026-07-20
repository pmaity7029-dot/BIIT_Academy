import { Button, Card, Form, Input, Modal, Popconfirm, Select, Space, Table, message } from 'antd';
import { useEffect, useState } from 'react';
import { FiPlus, FiShield, FiTrash2 } from 'react-icons/fi';
import dayjs from 'dayjs';
import api from '../api/client.js';
import PageHeader from '../components/PageHeader.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import React from 'react';

export default function SubAdmins() {
  const { user } = useAuth();
  const isSuperAdmin = user?.actualRole === 'ADMIN';

  const [subAdmins, setSubAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/sub-admins');
      setSubAdmins(data);
    } catch (error) {
      message.error('Failed to load sub-admins');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    try {
      const values = await form.validateFields();
      await api.post('/sub-admins', values);
      message.success('Sub Admin / Teacher created successfully!');
      setOpen(false);
      form.resetFields();
      load();
    } catch (error) {
      if (!error.errorFields) message.error(error?.response?.data?.message || 'Creation failed');
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/sub-admins/${id}/status`, { status });
      message.success('Account status updated');
      load();
    } catch (error) {
      message.error('Status update failed');
    }
  };

  const remove = async (id) => {
    try {
      await api.delete(`/sub-admins/${id}`);
      message.success('Account deleted successfully');
      load();
    } catch (error) {
      message.error('Delete failed');
    }
  };

  const columns = [
    { title: 'Full Name', dataIndex: 'name', width: 220 },
    { title: 'Email Address', dataIndex: 'email', width: 260 }
  ];

  if (isSuperAdmin) {
    columns.push({ title: 'Branch', dataIndex: 'branch', width: 150 });
  }

  columns.push(
    {
      title: 'Login Access',
      dataIndex: 'status',
      width: 160,
      render: (status, row) => (
        <Select
          value={status}
          className={`attendance-status-select ${status === 'Active' ? 'status-present' : 'status-absent'}`}
          style={{ width: 130 }}
          onChange={(value) => updateStatus(row._id, value)}
          options={[{ value: 'Active', label: 'Active Access' }, { value: 'Inactive', label: 'Revoke / Inactive' }]}
        />
      )
    },
    { title: 'Added On', dataIndex: 'createdAt', width: 140, render: (date) => dayjs(date).format('DD MMM YYYY') },
    {
      title: 'Action',
      width: 100,
      render: (_, row) => (
        <Popconfirm title="Delete this sub-admin permanently?" onConfirm={() => remove(row._id)}>
          <Button danger icon={<FiTrash2 />} />
        </Popconfirm>
      )
    }
  );

  return (
    <div>
      <PageHeader
        icon={<FiShield />}
        title="Sub Admins / Teachers"
        subtitle="Create branch teachers and staff. They can manage students, attendance, and payments but cannot add other staff."
        actionText="Add Sub Admin"
        actionIcon={<FiPlus />}
        onAction={() => setOpen(true)}
      />
      <Card className="content-card" bordered={false}>
        <Table rowKey="_id" columns={columns} dataSource={subAdmins} loading={loading} scroll={{ x: 800 }} />
      </Card>

      <Modal title="Create Sub Admin / Teacher" open={open} onCancel={() => setOpen(false)} onOk={save} okText="Create Account">
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
            <Input placeholder="e.g. Amit Sharma" />
          </Form.Item>
          <Form.Item name="email" label="Email Address" rules={[{ required: true, type: 'email' }]}>
            <Input placeholder="teacher@branch.com" />
          </Form.Item>
          <Form.Item name="password" label="Default Password" rules={[{ required: true, min: 6 }]}>
            <Input.Password placeholder="Min 6 characters" />
          </Form.Item>
          {isSuperAdmin && (
            <Form.Item name="branch" label="Branch / Centre" initialValue="Main Branch">
              <Input placeholder="e.g. Main Branch, BIIT Khejuri" />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
}