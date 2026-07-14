import { Button, Card, Form, Input, Modal, Popconfirm, Table, message } from 'antd';
import { useEffect, useState } from 'react';
import { FiPlus, FiShield, FiTrash2 } from 'react-icons/fi';
import api from '../api/client.js';
import PageHeader from '../components/PageHeader.jsx';
import React from 'react';

export default function Franchises() {
  const [franchises, setFranchises] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/franchise');
      setFranchises(data);
    } catch (error) {
      message.error('Failed to load franchises');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    try {
      const values = await form.validateFields();
      await api.post('/franchise', values);
      message.success('Franchise created and email sent!');
      setOpen(false);
      form.resetFields();
      load();
    } catch (error) {
      if (!error.errorFields) message.error(error?.response?.data?.message || 'Creation failed');
    }
  };

  const remove = async (id) => {
    try {
      await api.delete(`/franchise/${id}`);
      message.success('Franchise removed');
      load();
    } catch (error) {
      message.error('Delete failed');
    }
  };

  const columns = [
    { title: 'Centre Name (Branch)', dataIndex: 'branch' },
    { title: 'Authorized Person', dataIndex: 'name' },
    { title: 'Email', dataIndex: 'email' },
    {
      title: 'Actions',
      width: 100,
      render: (_, row) => (
        <Popconfirm title="Remove this franchise?" onConfirm={() => remove(row._id)}>
          <Button danger icon={<FiTrash2 />} />
        </Popconfirm>
      )
    }
  ];

  return (
    <div>
      <PageHeader 
        icon={<FiShield />} 
        title="Franchises" 
        subtitle="Manage your franchise centres and their access." 
        actionText="Add Franchise" 
        actionIcon={<FiPlus />} 
        onAction={() => setOpen(true)} 
      />
      <Card className="content-card" bordered={false}>
        <Table rowKey="_id" columns={columns} dataSource={franchises} loading={loading} />
      </Card>
      <Modal title="Add New Franchise" open={open} onCancel={() => setOpen(false)} onOk={save} okText="Create Franchise">
        <Form form={form} layout="vertical">
          <Form.Item name="centreName" label="Centre Name (Branch)" rules={[{ required: true }]}>
             <Input placeholder="e.g. BIIT Khejuri" />
          </Form.Item>
          <Form.Item name="authorizedPersonName" label="Authorized Person Name" rules={[{ required: true }]}>
             <Input placeholder="e.g. Rahul Das" />
          </Form.Item>
          <Form.Item name="email" label="Email Address" rules={[{ required: true, type: 'email' }]}>
             <Input placeholder="franchise@example.com" />
          </Form.Item>
          <Form.Item name="password" label="Default Password" rules={[{ required: true, min: 6 }]}>
             <Input.Password placeholder="Min 6 characters" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}