import { Button, Card, Col, Descriptions, Row, Statistic, Table, Tag, message } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiCalendar, FiCreditCard, FiUser } from 'react-icons/fi';
import dayjs from 'dayjs';
import api from '../api/client.js';
import PageHeader from '../components/PageHeader.jsx';
import { ShimmerDetailPage } from '../components/ShimmerLoading.jsx';
import React from 'react';

const attendanceColor = (status) => {
  if (status === 'Present') return 'green';
  if (status === 'Absent') return 'red';
  if (status === 'Late') return 'gold';
  return 'blue';
};

const formatMoney = (value) => `INR ${Number(value || 0).toLocaleString('en-IN')}`;

const getCourseLabels = (courses = []) =>
  courses
    .map((course) => course?.title || course)
    .filter(Boolean);

export default function StudentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/students/${id}`);
      setData(res.data);
    } catch (error) {
      message.error('Student details loading failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  if (!data) return <ShimmerDetailPage />;

  const { student, attendanceStats, attendance = [], payments } = data;
  const courseLabels = getCourseLabels(student.courses);

  const paymentColumns = [
    { title: 'Receipt No.', dataIndex: 'receiptNo' },
    { title: 'Amount', dataIndex: 'amount', render: formatMoney },
    { title: 'Mode', dataIndex: 'mode' },
    { title: 'Status', dataIndex: 'status', render: (status = 'Paid') => <Tag color={status === 'Paid' ? 'green' : 'gold'}>{status}</Tag> },
    { title: 'Month', dataIndex: 'month' },
    { title: 'Date', dataIndex: 'paidDate', render: (date) => dayjs(date).format('DD MMM YYYY') }
  ];

  const attendanceColumns = [
    { title: 'Date', dataIndex: 'date', render: (date) => dayjs(date).format('DD MMM YYYY') },
    { title: 'Day', dataIndex: 'date', render: (date) => dayjs(date).format('dddd') },
    { title: 'Status', dataIndex: 'status', render: (status) => <Tag color={attendanceColor(status)}>{status}</Tag> },
    { title: 'Score', dataIndex: 'performanceRating', render: (score) => <Tag color="blue">{Number(score || 0)}/5</Tag> },
    { title: 'Notes', dataIndex: 'notes', render: (notes) => notes || '-' }
  ];

  return (
    <div>
      <PageHeader icon={<FiUser />} title={student.name} subtitle={`${student.regNo} - ${student.batch}`} />

      <Card className="content-card profile-card" bordered={false}>
        <div className="profile-top">
          <div className="profile-avatar">
            {student.photo ? <img src={student.photo} alt={`${student.name} profile`} /> : student.name?.slice(0, 2)?.toUpperCase()}
          </div>
          <div>
            <h2>{student.name}</h2>
            <p>{student.regNo} - {student.batch}</p>
          </div>
          <Tag color={student.status === 'Active' ? 'green' : student.status === 'Completed' ? 'blue' : 'default'}>{student.status}</Tag>
        </div>
        <Descriptions bordered column={{ xs: 1, md: 3 }}>
          <Descriptions.Item label="Father's Name">{student.fatherName}</Descriptions.Item>
          <Descriptions.Item label="Date of Birth">{dayjs(student.dob).format('DD MMM YYYY')}</Descriptions.Item>
          <Descriptions.Item label="Gender">{student.gender}</Descriptions.Item>
          <Descriptions.Item label="Phone">{student.phone}</Descriptions.Item>
          <Descriptions.Item label="Emergency Contact">{student.emergencyContact}</Descriptions.Item>
          <Descriptions.Item label="Email">{student.email || 'Not added'}</Descriptions.Item>
          <Descriptions.Item label="Enrolled">{dayjs(student.enrolledDate).format('DD MMM YYYY')}</Descriptions.Item>
          <Descriptions.Item label="Courses" span={2}>{courseLabels.length ? courseLabels.join(', ') : 'Not added'}</Descriptions.Item>
          <Descriptions.Item label="Admission Fees">{formatMoney(student.admissionFee)}</Descriptions.Item>
          <Descriptions.Item label="Exam Fees">{formatMoney(student.examFee)}</Descriptions.Item>
          <Descriptions.Item label="Installment / Month">{formatMoney(student.installmentFeePerMonth)}</Descriptions.Item>
          <Descriptions.Item label="Branch">{student.branch || 'Main Branch'}</Descriptions.Item>
          <Descriptions.Item label="Address" span={2}>{student.address || 'Not added'}</Descriptions.Item>
        </Descriptions>

        <Row gutter={[16, 16]} className="stats-strip">
          <Col xs={12} md={4}><Statistic title="Total Attendance" value={attendanceStats.total} /></Col>
          <Col xs={12} md={4}><Statistic title="Present" value={attendanceStats.present} /></Col>
          <Col xs={12} md={4}><Statistic title="Absent" value={attendanceStats.absent} /></Col>
          <Col xs={12} md={4}><Statistic title="Late" value={attendanceStats.late} /></Col>
          <Col xs={12} md={4}><Statistic title={`Attendance % (${attendanceStats.present}/${attendanceStats.total})`} value={attendanceStats.rate} suffix="%" /></Col>
        </Row>

        <div className="button-row">
          <Button icon={<FiCalendar />} onClick={() => navigate('/admin/attendance')}>Open Attendance</Button>
          <Button icon={<FiCreditCard />} onClick={() => navigate('/admin/payments')}>Open Payments</Button>
          <Button icon={<FiArrowLeft />} onClick={() => navigate('/admin/students')}>Back</Button>
        </div>
      </Card>

      <Card className="content-card" bordered={false} title="Attendance History">
        <Table rowKey="_id" columns={attendanceColumns} dataSource={attendance} pagination={{ pageSize: 10 }} scroll={{ x: 820 }} />
      </Card>

      <Card className="content-card" bordered={false} title="Payment History">
        <Table rowKey="_id" columns={paymentColumns} dataSource={payments} pagination={false} scroll={{ x: 900 }} />
      </Card>
    </div>
  );
}
