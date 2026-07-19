import { Button, Card, Col, Descriptions, Drawer, Form, Input, Modal, Popconfirm, Row, Space, Statistic, Table, Tag, message } from 'antd';
import { useEffect, useState } from 'react';
import { FiAward, FiCalendar, FiCreditCard, FiEye, FiPlus, FiShield, FiTrash2, FiUsers } from 'react-icons/fi';
import dayjs from 'dayjs';
import api from '../api/client.js';
import PageHeader from '../components/PageHeader.jsx';
import React from 'react';

const formatMoney = (value) => `INR ${Number(value || 0).toLocaleString('en-IN')}`;

export default function Franchises() {
  const [franchises, setFranchises] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);
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

  const openProfile = async (franchise) => {
    setProfileOpen(true);
    setProfileLoading(true);
    setProfileData(null);

    try {
      const { data } = await api.get(`/franchise/${franchise._id}/profile`);
      setProfileData(data);
    } catch (error) {
      message.error(error?.response?.data?.message || 'Franchise profile loading failed');
    } finally {
      setProfileLoading(false);
    }
  };

  const columns = [
    { title: 'Centre Name (Branch)', dataIndex: 'branch' },
    { title: 'Authorized Person', dataIndex: 'name' },
    { title: 'Email', dataIndex: 'email' },
    {
      title: 'Actions',
      width: 190,
      render: (_, row) => (
        <Space>
          <Button icon={<FiEye />} onClick={() => openProfile(row)}>View</Button>
          <Popconfirm title="Remove this franchise?" onConfirm={() => remove(row._id)}>
            <Button danger icon={<FiTrash2 />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  const recentStudentColumns = [
    { title: 'Reg No.', dataIndex: 'regNo', width: 145 },
    { title: 'Student', dataIndex: 'name', width: 180 },
    { title: 'Batch', dataIndex: 'batch', width: 160 },
    { title: 'Status', dataIndex: 'status', width: 110, render: (status) => <Tag color={status === 'Active' ? 'green' : 'default'}>{status}</Tag> }
  ];

  const recentPaymentColumns = [
    { title: 'Receipt', dataIndex: 'receiptNo', width: 145 },
    { title: 'Student', width: 180, render: (_, row) => row.student?.name || 'Not linked' },
    { title: 'Amount', width: 130, render: (_, row) => formatMoney((row.amount || 0) + (row.fine || 0)) },
    { title: 'Date', dataIndex: 'paidDate', width: 135, render: (date) => dayjs(date).format('DD MMM YYYY') }
  ];

  const metrics = profileData?.metrics || {};

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

      <Drawer
        title={profileData?.franchise?.branch || 'Franchise Profile'}
        width={900}
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
      >
        {profileLoading ? (
          <Card loading bordered={false} />
        ) : profileData ? (
          <div className="franchise-profile">
            <Descriptions bordered column={{ xs: 1, md: 2 }}>
              <Descriptions.Item label="Centre Name">{profileData.franchise.branch}</Descriptions.Item>
              <Descriptions.Item label="Authorized Person">{profileData.franchise.name}</Descriptions.Item>
              <Descriptions.Item label="Email">{profileData.franchise.email}</Descriptions.Item>
              <Descriptions.Item label="Created">{dayjs(profileData.franchise.createdAt).format('DD MMM YYYY')}</Descriptions.Item>
            </Descriptions>

            <Row gutter={[16, 16]} className="franchise-profile-metrics">
              <Col xs={12} md={8}><Statistic title="Total Students" value={metrics.totalStudents || 0} prefix={<FiUsers />} /></Col>
              <Col xs={12} md={8}><Statistic title="Active Students" value={metrics.activeStudents || 0} prefix={<FiUsers />} /></Col>
              <Col xs={12} md={8}><Statistic title="Present Today" value={metrics.presentToday || 0} prefix={<FiCalendar />} /></Col>
              <Col xs={12} md={8}><Statistic title="Total Revenue" value={metrics.totalRevenue || 0} suffix="INR" prefix={<FiCreditCard />} /></Col>
              <Col xs={12} md={8}><Statistic title="Certificates" value={metrics.certificatesIssued || 0} prefix={<FiAward />} /></Col>
            </Row>

            <Card className="content-card" bordered={false} title="Recent Students">
              <Table rowKey="_id" columns={recentStudentColumns} dataSource={profileData.recentStudents || []} pagination={false} size="small" scroll={{ x: 595 }} />
            </Card>

            <Card className="content-card" bordered={false} title="Recent Payments">
              <Table rowKey="_id" columns={recentPaymentColumns} dataSource={profileData.recentPayments || []} pagination={false} size="small" scroll={{ x: 590 }} />
            </Card>
          </div>
        ) : null}
      </Drawer>

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
