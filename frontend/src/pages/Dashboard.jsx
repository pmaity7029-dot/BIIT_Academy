import { Button, Card, Grid, Table, Tag, Typography, message } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiAward, FiCalendar, FiCheckCircle, FiCreditCard, FiPlus, FiUsers } from 'react-icons/fi';
import api from '../api/client.js';
import MetricCard from '../components/MetricCard.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { ShimmerMetricGrid, ShimmerTable } from '../components/ShimmerLoading.jsx';
import dayjs from 'dayjs';
import React from "react";

export default function Dashboard() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState({});
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;

  const openStudentDetails = (studentId) => {
    navigate(`/admin/students/${studentId}`);
  };

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
    {
      title: 'Name',
      dataIndex: 'name',
      render: (text, row) => (
        <Button
          type="link"
          className="table-student-link"
          onClick={() => openStudentDetails(row._id)}
        >
          {text}
        </Button>
      )
    },
    { title: 'Batch', dataIndex: 'batch' },
    { title: 'Status', dataIndex: 'status', render: (status) => <Tag color={status === 'Active' ? 'green' : 'default'}>{status}</Tag> },
    { title: 'Enrolled', dataIndex: 'enrolledDate', render: (date) => dayjs(date).format('DD MMM YYYY') },
    { title: 'Actions', render: (_, row) => <Button onClick={() => openStudentDetails(row._id)}>View</Button> }
  ];

  const mobileColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      render: (text, row) => (
        <Button
          type="link"
          className="table-student-link mobile-student-name-link"
          onClick={() => openStudentDetails(row._id)}
        >
          {text}
        </Button>
      )
    },
    {
      title: 'Batch',
      dataIndex: 'batch',
      ellipsis: true
    }
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

      {loading ? (
        <ShimmerMetricGrid cards={5} />
      ) : (
        <div className="metric-grid dashboard-metric-grid">
          <MetricCard title="Total Students" value={metrics.totalStudents || 0} icon={<FiUsers />} />
          <MetricCard title="Active Students" value={metrics.activeStudents || 0} icon={<FiCheckCircle />} />
          <MetricCard title="Present Today" value={metrics.presentToday || 0} icon={<FiCalendar />} />
          <MetricCard title="Revenue" value={metrics.monthlyRevenue || 0} suffix="INR" icon={<FiCreditCard />} />
          <MetricCard title="Certs Issued" value={metrics.certificatesIssued || 0} icon={<FiAward />} />
        </div>
      )}

      <Card className="content-card" bordered={false}>
        <div className="section-toolbar">
          <Typography.Title level={4}>Today's Attendance</Typography.Title>
          <Button onClick={() => navigate('/admin/attendance')}>Mark Attendance</Button>
        </div>
        <Typography.Text type="secondary">Attendance section to mark daily status and filter records by date, month, or student.</Typography.Text>
      </Card>

      <Card className="content-card" bordered={false}>
        <div className="section-toolbar">
          <Typography.Title level={4}>Recently Enrolled Students</Typography.Title>
          <Button onClick={() => navigate('/admin/students')}>View All</Button>
        </div>
        {loading ? (
          <ShimmerTable columns={isMobile ? 2 : 6} rows={6} />
        ) : (
          <Table
            rowKey="_id"
            columns={isMobile ? mobileColumns : columns}
            dataSource={students}
            pagination={false}
            scroll={isMobile ? undefined : { x: 760 }}
            tableLayout="fixed"
            size={isMobile ? 'small' : 'middle'}
            className="dashboard-recent-table mobile-focused-table"
          />
        )}
      </Card>
    </div>
  );
}
