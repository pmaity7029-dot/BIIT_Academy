import { Button, Card, Drawer, Form, Grid, Input, Popconfirm, Select, Space, Table, message } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEye, FiPlus, FiSearch, FiTrash2, FiUsers } from 'react-icons/fi';
import dayjs from 'dayjs';
import api from '../api/client.js';
import PageHeader from '../components/PageHeader.jsx';
import StudentForm from '../components/StudentForm.jsx';
import { ShimmerTable } from '../components/ShimmerLoading.jsx';
import React from 'react';

const studentStatusOptions = ['Active', 'Inactive', 'Completed'].map((value) => ({ value }));

const cleanParams = (params) => {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined)
  );
};

export default function Students() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [students, setStudents] = useState([]);
  const [batchOptions, setBatchOptions] = useState([]);
  const [courseOptions, setCourseOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;

  const openStudentDetails = (studentId) => {
    navigate(`/admin/students/${studentId}`);
  };

  const [filters, setFilters] = useState({ search: '', status: '', batch: '' });

  const loadBatches = async () => {
    try {
      const { data } = await api.get('/courses/batches/list');
      const validBatches = (data || []).map((batch) => batch.name).filter(Boolean);
      setBatchOptions(validBatches.sort((a, b) => String(a).localeCompare(String(b))));
    } catch (error) {
      setBatchOptions([]);
    }
  };

  const loadCourses = async () => {
    try {
      const { data } = await api.get('/courses');
      setCourseOptions((data || []).filter((course) => course.status !== 'Inactive'));
    } catch (error) {
      setCourseOptions([]);
    }
  };

  const load = async (nextFilters = filters) => {
    try {
      setLoading(true);
      const { data } = await api.get('/students', { params: cleanParams(nextFilters) });
      setStudents(data);
    } catch (error) {
      message.error('Unable to load students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    loadBatches();
    loadCourses();
  }, []);

  const openEnrollment = () => {
    form.resetFields();
    form.setFieldsValue({
      status: 'Active',
      admissionFee: 0,
      examFee: 0,
      installmentFeePerMonth: 0,
      courses: [],
      photo: ''
    });
    setOpen(true);
  };

  const submit = async () => {
    try {
      const values = await form.validateFields();
      await api.post('/students', {
        ...values,
        courses: values.courses || [],
        dob: values.dob?.toISOString(),
        enrolledDate: values.enrolledDate?.toISOString()
      });
      message.success('Student enrolled successfully');
      form.resetFields();
      setOpen(false);
      load();
      loadBatches();
    } catch (error) {
      if (!error.errorFields) {
        message.error(error?.response?.data?.message || 'Enrollment failed');
      }
    }
  };

  const applyFilters = (patch) => {
    const nextFilters = { ...filters, ...patch };
    setFilters(nextFilters);
    load(nextFilters);
  };

  const resetFilters = () => {
    const nextFilters = { search: '', status: '', batch: '' };
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
      loadBatches();
    } catch (error) {
      message.error(error?.response?.data?.message || 'Student delete failed');
    }
  };

  const filteredStudents = useMemo(() => students, [students]);

  const columns = [
    {
      title: 'Student',
      dataIndex: 'name',
      width: 240,
      render: (text, row) => (
        <Button type="link" className="table-student-link" onClick={() => openStudentDetails(row._id)}>
          <span className="student-cell">
            <strong>{text}</strong>
            <span className="muted-text">{row.regNo}</span>
          </span>
        </Button>
      )
    },
    { title: 'Phone', dataIndex: 'phone', width: 140 },
    { title: 'Branch', dataIndex: 'branch', width: 140 },
    { title: 'Batch', dataIndex: 'batch', width: 210, ellipsis: true },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 155,
      render: (status, row) => (
        <Select
          value={status}
          size="small"
          className="attendance-status-select"
          style={{ width: 125 }}
          onChange={(value) => updateStudentStatus(row, value)}
          options={studentStatusOptions}
        />
      )
    },
    { title: 'Enrolled', dataIndex: 'enrolledDate', width: 135, render: (date) => dayjs(date).format('DD MMM YYYY') },
    {
      title: 'Actions',
      width: 165,
      render: (_, row) => (
        <Space>
          <Button icon={<FiEye />} onClick={() => openStudentDetails(row._id)}>
            View
          </Button>
          <Popconfirm title="Delete this student?" okText="Delete" okButtonProps={{ danger: true }} onConfirm={() => deleteStudent(row)}>
            <Button danger icon={<FiTrash2 />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  const mobileColumns = [
    {
      title: 'Student',
      dataIndex: 'name',
      render: (text, row) => (
        <Button type="link" className="table-student-link mobile-student-name-link" onClick={() => openStudentDetails(row._id)}>
          <span className="student-cell">
            <strong>{text}</strong>
            <span className="muted-text">{row.regNo}</span>
          </span>
        </Button>
      )
    },
    { title: 'Batch', dataIndex: 'batch', ellipsis: true }
  ];

  return (
    <div>
      <PageHeader
        icon={<FiUsers />}
        title="Students"
        subtitle="Manage student enrolment, search, status, batch, and records"
        actionText="Enroll Student"
        actionIcon={<FiPlus />}
        onAction={openEnrollment}
      />

      <Card className="content-card students-card" variant="borderless">
        <div className="section-toolbar">
          <strong>All Students ({filteredStudents.length})</strong>
          <Space wrap>
            <Select allowClear showSearch optionFilterProp="label" placeholder="Search batch" style={{ width: 250 }} value={filters.batch || undefined} onChange={(value) => applyFilters({ batch: value || '' })} options={batchOptions.map((batch) => ({ value: batch, label: batch }))} />
            <Select allowClear placeholder="Status" style={{ width: 170 }} value={filters.status || undefined} onChange={(value) => applyFilters({ status: value || '' })} options={studentStatusOptions} />
            <Input.Search placeholder="Search name, reg no, phone, email, batch..." allowClear enterButton={<FiSearch />} value={filters.search} onChange={(event) => applyFilters({ search: event.target.value })} onSearch={(value) => applyFilters({ search: value })} className="live-search-input" style={{ width: 380 }} />
            <Button onClick={resetFilters}>Reset</Button>
          </Space>
        </div>

        {loading ? (
          <ShimmerTable columns={isMobile ? 2 : 6} rows={8} />
        ) : (
          <Table rowKey="_id" columns={isMobile ? mobileColumns : columns} dataSource={filteredStudents} scroll={isMobile ? undefined : { x: 1045 }} tableLayout="fixed" size={isMobile ? 'small' : 'middle'} className="students-table mobile-focused-table" />
        )}
      </Card>

      <Drawer title="Enroll New Student" width={780} open={open} onClose={() => setOpen(false)} extra={<Space><Button onClick={() => setOpen(false)}>Cancel</Button><Button type="primary" onClick={submit}>Save Student</Button></Space>}>
        <StudentForm form={form} batchOptions={batchOptions} courseOptions={courseOptions} />
      </Drawer>
    </div>
  );
}
