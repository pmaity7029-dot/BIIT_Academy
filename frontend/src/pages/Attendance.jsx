import { Button, Card, DatePicker, Grid, Input, Select, Space, Table, Tag, message } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCalendar, FiRefreshCcw, FiSave, FiSearch } from 'react-icons/fi';
import dayjs from 'dayjs';
import api from '../api/client.js';
import PageHeader from '../components/PageHeader.jsx';
import { ShimmerTable } from '../components/ShimmerLoading.jsx';
import React from 'react';

const attendanceStatusOptions = ['Present', 'Absent', 'Late', 'Leave'].map((value) => ({ value }));

const attendanceColor = (status) => {
  if (status === 'Present') return 'green';
  if (status === 'Absent') return 'red';
  if (status === 'Late') return 'gold';
  return 'blue';
};

const cleanParams = (params) => {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined)
  );
};

export default function Attendance() {
  const navigate = useNavigate();
  const [date, setDate] = useState(dayjs());
  const [sheetBatch, setSheetBatch] = useState('');
  const [sheet, setSheet] = useState([]);
  const [history, setHistory] = useState([]);
  const [students, setStudents] = useState([]);
  const [batchOptions, setBatchOptions] = useState([]);

  const [historyFilters, setHistoryFilters] = useState({
    date: dayjs(),
    month: null,
    student: '',
    status: '',
    batch: '',
    search: ''
  });

  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;

  const openStudentDetails = (studentId) => {
    if (studentId) {
      navigate(`/admin/students/${studentId}`);
    }
  };

  const loadStudents = async () => {
    const { data } = await api.get('/students');
    setStudents(data);
  };

const loadBatches = async () => {
    try {
      const [studentBatchRes, courseBatchRes] = await Promise.allSettled([
        api.get('/students/batches/list'),
        api.get('/courses/batches/list')
      ]);

      const studentBatches =
        studentBatchRes.status === 'fulfilled' ? studentBatchRes.value.data || [] : [];
      
      const courseBatches =
        courseBatchRes.status === 'fulfilled'
          ? (courseBatchRes.value.data || []).map((batch) => batch.name).filter(Boolean)
          : [];

      // Dono lists combine karein aur typos (jaise 'D') filter kar dein
      const validBatches = [...new Set([...studentBatches, ...courseBatches])]
        .filter((batch) => batch && batch.trim().length > 2)
        .sort((a, b) => String(a).localeCompare(String(b)));

      setBatchOptions(validBatches);
    } catch (error) {
      setBatchOptions([]);
    }
  };

  const loadSheet = async (nextBatch = sheetBatch) => {
    try {
      setLoading(true);

      const { data } = await api.get(`/attendance/sheet/${date.format('YYYY-MM-DD')}`, {
        params: cleanParams({ batch: nextBatch })
      });

      setSheet(
        data.map((row) => ({
          key: row.student._id,
          student: row.student,
          status: row.attendance?.status || 'Present',
          notes: row.attendance?.notes || ''
        }))
      );
    } catch (error) {
      message.error('Attendance sheet loading failed');
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async (nextFilters = historyFilters) => {
    setHistoryLoading(true);

    try {
      const params = {};

      if (nextFilters.month) {
        params.month = nextFilters.month.format('YYYY-MM');
      } else if (nextFilters.date) {
        params.date = nextFilters.date.format('YYYY-MM-DD');
      }

      if (nextFilters.student) params.student = nextFilters.student;
      if (nextFilters.status) params.status = nextFilters.status;
      if (nextFilters.batch) params.batch = nextFilters.batch;
      if (nextFilters.search) params.search = nextFilters.search;

      const { data } = await api.get('/attendance', { params: cleanParams(params) });
      setHistory(data);
    } catch (error) {
      message.error('Attendance history loading failed');
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    loadStudents().catch(() => message.error('Student list loading failed'));
    loadBatches();
  }, []);

  useEffect(() => {
    loadSheet(sheetBatch);
  }, [date, sheetBatch]);

  useEffect(() => {
    loadHistory();
  }, []);

  const updateRow = (key, patch) => {
    setSheet((prev) =>
      prev.map((row) => (row.key === key ? { ...row, ...patch } : row))
    );
  };

  const applyHistoryFilters = (patch) => {
    const nextFilters = { ...historyFilters, ...patch };

    if (Object.prototype.hasOwnProperty.call(patch, 'month') && patch.month) {
      nextFilters.date = null;
    }

    if (Object.prototype.hasOwnProperty.call(patch, 'date') && patch.date) {
      nextFilters.month = null;
    }

    setHistoryFilters(nextFilters);
    loadHistory(nextFilters);
  };

  const resetHistoryFilters = () => {
    const nextFilters = {
      date: null,
      month: null,
      student: '',
      status: '',
      batch: '',
      search: ''
    };

    setHistoryFilters(nextFilters);
    loadHistory(nextFilters);
  };

  const save = async () => {
    try {
      await api.post('/attendance/bulk', {
        date: date.format('YYYY-MM-DD'),
        records: sheet.map((row) => ({
          student: row.student._id,
          status: row.status,
          notes: row.notes
        }))
      });

      message.success('Attendance saved successfully');
      loadHistory();
    } catch (error) {
      message.error('Attendance save failed');
    }
  };

  const columns = [
    { title: 'Reg No.', dataIndex: ['student', 'regNo'] },
    {
      title: 'Student',
      dataIndex: ['student', 'name'],
      render: (text, row) => (
        <Button
          type="link"
          className="table-student-link"
          onClick={() => openStudentDetails(row.student?._id)}
        >
          {text}
        </Button>
      )
    },
    { title: 'Batch', dataIndex: ['student', 'batch'] },
    {
      title: 'Status',
      render: (_, row) => (
        <Select
          value={row.status}
          className="attendance-status-select"
          style={{ width: 140 }}
          onChange={(value) => updateRow(row.key, { status: value })}
          options={attendanceStatusOptions}
        />
      )
    },
    {
      title: 'Notes',
      render: (_, row) => (
        <Input
          value={row.notes}
          onChange={(e) => updateRow(row.key, { notes: e.target.value })}
          placeholder="Optional note"
        />
      )
    }
  ];

  const mobileColumns = [
    {
      title: 'Student',
      dataIndex: ['student', 'name'],
      render: (text, row) => (
        <Button
          type="link"
          className="table-student-link mobile-student-name-link"
          onClick={() => openStudentDetails(row.student?._id)}
        >
          <span className="student-cell">
            <strong>{text}</strong>
            <span className="muted-text">{row.student?.regNo}</span>
          </span>
        </Button>
      )
    },
    {
      title: 'Status',
      render: (_, row) => (
        <Select
          value={row.status}
          className="attendance-status-select"
          onChange={(value) => updateRow(row.key, { status: value })}
          options={attendanceStatusOptions}
        />
      )
    },
    {
      title: 'Batch',
      dataIndex: ['student', 'batch'],
      ellipsis: true
    }
  ];

  const historyColumns = [
    {
      title: 'Date',
      dataIndex: 'date',
      render: (value) => dayjs(value).format('DD MMM YYYY')
    },
    {
      title: 'Day',
      dataIndex: 'date',
      render: (value) => dayjs(value).format('dddd')
    },
    {
      title: 'Student',
      dataIndex: ['student', 'name'],
      render: (text, row) => (
        <Button
          type="link"
          className="table-student-link"
          onClick={() => openStudentDetails(row.student?._id)}
        >
          {text}
        </Button>
      )
    },
    { title: 'Reg No.', dataIndex: ['student', 'regNo'] },
    { title: 'Batch', dataIndex: ['student', 'batch'] },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (status) => <Tag color={attendanceColor(status)}>{status}</Tag>
    },
    { title: 'Notes', dataIndex: 'notes' }
  ];

  const mobileHistoryColumns = [
    {
      title: 'Student',
      dataIndex: ['student', 'name'],
      render: (text, row) => (
        <Button
          type="link"
          className="table-student-link mobile-student-name-link"
          onClick={() => openStudentDetails(row.student?._id)}
        >
          <span className="student-cell">
            <strong>{text}</strong>
            <span className="muted-text">{row.student?.regNo}</span>
          </span>
        </Button>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (status) => <Tag color={attendanceColor(status)}>{status}</Tag>
    },
    {
      title: 'Batch',
      dataIndex: ['student', 'batch'],
      ellipsis: true
    }
  ];

  return (
    <div>
      <PageHeader
        icon={<FiCalendar />}
        title="Attendance"
        subtitle="Mark daily attendance and filter attendance batch wise"
      />

      <Card className="content-card" bordered={false}>
        <div className="section-toolbar">
          <Space wrap>
            <DatePicker
              value={date}
              onChange={(value) => setDate(value || dayjs())}
              format="DD MMM YYYY"
            />

            <Select
              allowClear
              showSearch
              optionFilterProp="label"
              placeholder="Search batch"
              value={sheetBatch || undefined}
              onChange={(value) => setSheetBatch(value || '')}
              options={batchOptions.map((batch) => ({
                value: batch,
                label: batch
              }))}
              style={{ width: 230 }}
            />

            <Button type="primary" icon={<FiSave />} onClick={save}>
              Save Attendance
            </Button>

            <Button icon={<FiRefreshCcw />} onClick={() => loadSheet(sheetBatch)}>
              Refresh Sheet
            </Button>
          </Space>
        </div>

        {loading ? (
          <ShimmerTable columns={isMobile ? 3 : 5} rows={8} />
        ) : (
          <Table
            rowKey="key"
            columns={isMobile ? mobileColumns : columns}
            dataSource={sheet}
            scroll={isMobile ? undefined : { x: 900 }}
            tableLayout="fixed"
            size={isMobile ? 'small' : 'middle'}
            className="attendance-table mobile-focused-table"
          />
        )}
      </Card>

      <Card className="content-card" bordered={false} title="Attendance History">
        <div className="section-toolbar compact-toolbar">
          <Space wrap>
            <DatePicker
              allowClear
              placeholder="Filter by date"
              value={historyFilters.date}
              onChange={(value) => applyHistoryFilters({ date: value })}
              format="DD MMM YYYY"
            />

            <DatePicker
              allowClear
              picker="month"
              placeholder="Filter by month"
              value={historyFilters.month}
              onChange={(value) => applyHistoryFilters({ month: value })}
            />

            <Select
              allowClear
              showSearch
              optionFilterProp="label"
              placeholder="Search batch"
              value={historyFilters.batch || undefined}
              onChange={(value) => applyHistoryFilters({ batch: value || '' })}
              options={batchOptions.map((batch) => ({
                value: batch,
                label: batch
              }))}
              style={{ width: 230 }}
            />

            <Select
              allowClear
              showSearch
              optionFilterProp="label"
              placeholder="Student"
              value={historyFilters.student || undefined}
              onChange={(value) => applyHistoryFilters({ student: value || '' })}
              options={students.map((student) => ({
                value: student._id,
                label: `${student.name} - ${student.regNo}`
              }))}
              style={{ width: 260 }}
            />

            <Select
              allowClear
              placeholder="Status"
              value={historyFilters.status || undefined}
              onChange={(value) => applyHistoryFilters({ status: value || '' })}
              options={attendanceStatusOptions}
              style={{ width: 150 }}
            />

            <Input.Search
              allowClear
              enterButton={<FiSearch />}
              placeholder="Search name, reg no, batch..."
              value={historyFilters.search}
              onChange={(event) => applyHistoryFilters({ search: event.target.value })}
              onSearch={(value) => applyHistoryFilters({ search: value })}
              className="live-search-input"
              style={{ width: 300 }}
            />

            <Button onClick={resetHistoryFilters}>All History</Button>
          </Space>
        </div>

        {historyLoading ? (
          <ShimmerTable columns={isMobile ? 3 : 7} rows={8} />
        ) : (
          <Table
            rowKey="_id"
            columns={isMobile ? mobileHistoryColumns : historyColumns}
            dataSource={history}
            scroll={isMobile ? undefined : { x: 1000 }}
            tableLayout="fixed"
            size={isMobile ? 'small' : 'middle'}
            className="attendance-history-table mobile-focused-table"
          />
        )}
      </Card>
    </div>
  );
}
