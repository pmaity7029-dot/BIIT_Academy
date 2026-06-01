import { Card, Progress, Table, Tag, message } from 'antd';
import { useEffect, useState } from 'react';
import { FiBarChart2 } from 'react-icons/fi';
import api from '../api/client.js';
import PageHeader from '../components/PageHeader.jsx';
import React from "react";

export default function Performance() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/performance/overview');
      setRows(data);
    } catch (error) {
      message.error('Performance data loading failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const columns = [
    { title: 'Student', dataIndex: ['student', 'name'], render: (text, row) => <div><strong>{text}</strong><br /><span className="muted-text">{row.student.regNo}</span></div> },
    { title: 'Batch', dataIndex: ['student', 'batch'] },
    { title: 'Present', dataIndex: 'present' },
    { title: 'Late', dataIndex: 'late' },
    { title: 'Absent', dataIndex: 'absent' },
    { title: 'Attendance Rate', dataIndex: 'attendanceRate', render: (value) => <Progress percent={value} size="small" /> },
    { title: 'Fee Paid', dataIndex: 'paid', render: (value) => <Tag color="green">INR {Number(value || 0).toLocaleString('en-IN')}</Tag> }
  ];

  return (
    <div>
      <PageHeader icon={<FiBarChart2 />} title="Performance" subtitle="Review attendance performance and payment progress" />
      <Card className="content-card" bordered={false}>
        <Table rowKey={(row) => row.student._id} columns={columns} dataSource={rows} loading={loading} scroll={{ x: 1000 }} />
      </Card>
    </div>
  );
}
