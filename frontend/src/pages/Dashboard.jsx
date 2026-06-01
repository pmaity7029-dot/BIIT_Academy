import { Button, Card, Table, Tag, Typography, message } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiAward, FiCalendar, FiCheckCircle, FiCreditCard, FiMail, FiPlus, FiUsers } from 'react-icons/fi';
import api from '../api/client.js';
import MetricCard from '../components/MetricCard.jsx';
import PageHeader from '../components/PageHeader.jsx';
import dayjs from 'dayjs';
import React from "react";

export default function Dashboard() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState({});
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const [metricRes, studentRes] = await Promise.all([
        api.get('/students/metrics'),
        api.get('/students')
      ]);
      setMetrics(metricRes.data);
      setStudents(studentRes.data.slice(0, 6));
    } catch (error) {
      message.error('Dashboard data loading failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const columns = [
    { title: 'Reg No.', dataIndex: 'regNo' },
    { title: 'Name', dataIndex: 'name', render: (text, row) => <Button type="link" onClick={() => navigate(`/admin/students/${row._id}`)}>{text}</Button> },
    { title: 'Centre', dataIndex: 'centre' },
    { title: 'Batch', dataIndex: 'batch' },
    { title: 'Status', dataIndex: 'status', render: (status) => <Tag color={status === 'Active' ? 'green' : 'default'}>{status}</Tag> },
    { title: 'Enrolled', dataIndex: 'enrolledDate', render: (date) => dayjs(date).format('DD MMM YYYY') },
    { title: 'Actions', render: (_, row) => <Button onClick={() => navigate(`/admin/students/${row._id}`)}>View</Button> }
  ];

  return (
    <div>
      <PageHeader
        icon={<FiUsers />}
        title="Dashboard"
        subtitle="Welcome back. Here is what is happening today."
        actionText="Enroll Student"
        actionIcon={<FiPlus />}
        onAction={() => navigate('/admin/students')}
      />

      <div className="metric-grid">
        <MetricCard title="Total Students" value={metrics.totalStudents || 0} icon={<FiUsers />} />
        <MetricCard title="Active Students" value={metrics.activeStudents || 0} icon={<FiCheckCircle />} />
        <MetricCard title="Present Today" value={metrics.presentToday || 0} icon={<FiCalendar />} />
        <MetricCard title="Revenue" value={metrics.monthlyRevenue || 0} suffix="INR" icon={<FiCreditCard />} />
        <MetricCard title="Certs Issued" value={metrics.certificatesIssued || 0} icon={<FiAward />} />
        <MetricCard title="Unread Messages" value={metrics.unreadMessages || 0} icon={<FiMail />} />
      </div>

      <Card className="content-card" bordered={false}>
        <div className="section-toolbar">
          <Typography.Title level={4}>Today's Attendance by Centre</Typography.Title>
          <Button onClick={() => navigate('/admin/attendance')}>Mark Attendance</Button>
        </div>
        <Typography.Text type="secondary">Use the attendance section to mark daily status and filter records by date, month, or student.</Typography.Text>
      </Card>

      <Card className="content-card" bordered={false}>
        <div className="section-toolbar">
          <Typography.Title level={4}>Recently Enrolled Students</Typography.Title>
          <Button onClick={() => navigate('/admin/students')}>View All</Button>
        </div>
        <Table rowKey="_id" columns={columns} dataSource={students} loading={loading} pagination={false} scroll={{ x: 900 }} />
      </Card>
    </div>
  );
}
