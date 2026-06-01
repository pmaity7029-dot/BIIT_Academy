import { Button, Card, Drawer, Form, Input, Popconfirm, Select, Space, Table, Tag, message } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEye, FiPlus, FiSearch, FiTrash2, FiUsers } from 'react-icons/fi';
import dayjs from 'dayjs';
import api from '../api/client.js';
import PageHeader from '../components/PageHeader.jsx';
import StudentForm from '../components/StudentForm.jsx';
import React from 'react';

const studentStatusOptions = ['Active', 'Inactive', 'Completed'].map((value) => ({ value }));

const statusColor = (status) => {
  if (status === 'Active') return 'green';
  if (status === 'Completed') return 'blue';
  return 'default';
};

export default function Students() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState({ search: '', status: '' });

  const load = async (nextFilters = filters) => {
    try {
      setLoading(true);
      const { data } = await api.get('/students', { params: nextFilters });
      setStudents(data);
    } catch (error) {
      message.error('Unable to load students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const submit = async () => {
    try {
      const values = await form.validateFields();
      await api.post('/students', {
        ...values,
        dob: values.dob?.toISOString(),
        enrolledDate: values.enrolledDate?.toISOString()
      });
      message.success('Student enrolled successfully');
      form.resetFields();
      setOpen(false);
      load();
    } catch (error) {
      if (!error.errorFields) message.error(error?.response?.data?.message || 'Enrollment failed');
    }
  };

  const applyFilters = (patch) => {
    const nextFilters = { ...filters, ...patch };
    setFilters(nextFilters);
    load(nextFilters);
  };

  const updateStudentStatus = async (student, status) => {
    try {
      const { data } = await api.put(`/students/${student._id}`, { status });
      message.success('Student status updated');
      setStudents((prev) => prev.map((item) => (item._id === student._id ? data : item)));
    } catch (error) {
      message.error(error?.response?.data?.message || 'Status update failed');
    }
  };

  const deleteStudent = async (student) => {
    try {
      await api.delete(`/students/${student._id}`);
      message.success('Student deleted');
      load();
    } catch (error) {
      message.error(error?.response?.data?.message || 'Student delete failed');
    }
  };

  const filteredStudents = useMemo(() => students, [students]);

  const columns = [
    { title: 'Reg No.', dataIndex: 'regNo', width: 160 },
    {
      title: 'Name',
      dataIndex: 'name',
      render: (text, row) => (
        <div>
          <strong>{text}</strong><br />
          <span className="muted-text">{row.fatherName}</span>
        </div>
      )
    },
    { title: 'Phone', dataIndex: 'phone' },
    { title: 'Centre', dataIndex: 'centre' },
    { title: 'Batch', dataIndex: 'batch' },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 160,
      render: (status, row) => (
        <Select
          value={status}
          size="small"
          style={{ width: 130 }}
          onChange={(value) => updateStudentStatus(row, value)}
          options={studentStatusOptions.map((item) => ({ ...item, label: <Tag color={statusColor(item.value)}>{item.value}</Tag> }))}
        />
      )
    },
    { title: 'Enrolled', dataIndex: 'enrolledDate', render: (date) => dayjs(date).format('DD MMM YYYY') },
    {
      title: 'Actions',
      fixed: 'right',
      width: 190,
      render: (_, row) => (
        <Space>
          <Button icon={<FiEye />} onClick={() => navigate(`/admin/students/${row._id}`)}>View</Button>
          <Popconfirm title="Delete this student?" okText="Delete" okButtonProps={{ danger: true }} onConfirm={() => deleteStudent(row)}>
            <Button danger icon={<FiTrash2 />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div>
      <PageHeader
        icon={<FiUsers />}
        title="Students"
        subtitle="Manage student enrolment, search, status, and records"
        actionText="Enroll Student"
        actionIcon={<FiPlus />}
        onAction={() => setOpen(true)}
      />

      <Card className="content-card" bordered={false}>
        <div className="section-toolbar">
          <strong>All Students ({filteredStudents.length})</strong>
          <Space wrap>
            <Select
              allowClear
              placeholder="Status"
              style={{ width: 150 }}
              value={filters.status || undefined}
              onChange={(value) => applyFilters({ status: value || '' })}
              options={studentStatusOptions}
            />
            <Input.Search
              placeholder="Search name, reg no, phone, email..."
              allowClear
              enterButton={<FiSearch />}
              value={filters.search}
              onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
              onSearch={(value) => applyFilters({ search: value })}
              style={{ width: 320 }}
            />
            <Button onClick={() => applyFilters({ search: '', status: '' })}>Reset</Button>
          </Space>
        </div>
        <Table rowKey="_id" columns={columns} dataSource={filteredStudents} loading={loading} scroll={{ x: 1200 }} />
      </Card>

      <Drawer
        title="Enroll New Student"
        width={780}
        open={open}
        onClose={() => setOpen(false)}
        extra={<Space><Button onClick={() => setOpen(false)}>Cancel</Button><Button type="primary" onClick={submit}>Save Student</Button></Space>}
      >
        <StudentForm form={form} />
      </Drawer>
    </div>
  );
}
