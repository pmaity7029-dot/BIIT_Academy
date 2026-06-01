import { Button, Card, DatePicker, Input, Select, Space, Table, Tag, message } from 'antd';
import { useEffect, useState } from 'react';
import { FiCalendar, FiRefreshCcw, FiSave, FiSearch } from 'react-icons/fi';
import dayjs from 'dayjs';
import api from '../api/client.js';
import PageHeader from '../components/PageHeader.jsx';
import React from 'react';

const attendanceStatusOptions = ['Present', 'Absent', 'Late', 'Leave'].map((value) => ({ value }));

const attendanceColor = (status) => {
  if (status === 'Present') return 'green';
  if (status === 'Absent') return 'red';
  if (status === 'Late') return 'gold';
  return 'blue';
};

export default function Attendance() {
  const [date, setDate] = useState(dayjs());
  const [sheet, setSheet] = useState([]);
  const [history, setHistory] = useState([]);
  const [students, setStudents] = useState([]);
  const [historyFilters, setHistoryFilters] = useState({
    date: dayjs(),
    month: null,
    student: '',
    status: '',
    search: ''
  });
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  const loadStudents = async () => {
    const { data } = await api.get('/students');
    setStudents(data);
  };

  const loadSheet = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/attendance/sheet/${date.format('YYYY-MM-DD')}`);
      setSheet(data.map((row) => ({
        key: row.student._id,
        student: row.student,
        status: row.attendance?.status || 'Present',
        notes: row.attendance?.notes || ''
      })));
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
      if (nextFilters.search) params.search = nextFilters.search;

      const { data } = await api.get('/attendance', { params });
      setHistory(data);
    } catch (error) {
      message.error('Attendance history loading failed');
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    loadStudents().catch(() => message.error('Student list loading failed'));
  }, []);

  useEffect(() => {
    loadSheet();
  }, [date]);

  useEffect(() => {
    loadHistory();
  }, []);

  const updateRow = (key, patch) => {
    setSheet((prev) => prev.map((row) => row.key === key ? { ...row, ...patch } : row));
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
    const nextFilters = { date: null, month: null, student: '', status: '', search: '' };
    setHistoryFilters(nextFilters);
    loadHistory(nextFilters);
  };

  const save = async () => {
    try {
      await api.post('/attendance/bulk', {
        date: date.format('YYYY-MM-DD'),
        records: sheet.map((row) => ({ student: row.student._id, status: row.status, notes: row.notes }))
      });
      message.success('Attendance saved successfully');
      loadHistory();
    } catch (error) {
      message.error('Attendance save failed');
    }
  };

  const columns = [
    { title: 'Reg No.', dataIndex: ['student', 'regNo'] },
    { title: 'Student', dataIndex: ['student', 'name'] },
    { title: 'Batch', dataIndex: ['student', 'batch'] },
    {
      title: 'Status',
      render: (_, row) => (
        <Select
          value={row.status}
          style={{ width: 140 }}
          onChange={(value) => updateRow(row.key, { status: value })}
          options={attendanceStatusOptions}
        />
      )
    },
    { title: 'Notes', render: (_, row) => <Input value={row.notes} onChange={(e) => updateRow(row.key, { notes: e.target.value })} placeholder="Optional note" /> }
  ];

  const historyColumns = [
    { title: 'Date', dataIndex: 'date', render: (value) => dayjs(value).format('DD MMM YYYY') },
    { title: 'Day', dataIndex: 'date', render: (value) => dayjs(value).format('dddd') },
    { title: 'Student', dataIndex: ['student', 'name'] },
    { title: 'Reg No.', dataIndex: ['student', 'regNo'] },
    { title: 'Batch', dataIndex: ['student', 'batch'] },
    { title: 'Status', dataIndex: 'status', render: (status) => <Tag color={attendanceColor(status)}>{status}</Tag> },
    { title: 'Notes', dataIndex: 'notes' }
  ];

  return (
    <div>
      <PageHeader icon={<FiCalendar />} title="Attendance" subtitle="Mark daily attendance and view complete attendance history" />

      <Card className="content-card" bordered={false}>
        <div className="section-toolbar">
          <Space wrap>
            <DatePicker value={date} onChange={(value) => setDate(value || dayjs())} format="DD MMM YYYY" />
            <Button type="primary" icon={<FiSave />} onClick={save}>Save Attendance</Button>
            <Button icon={<FiRefreshCcw />} onClick={loadSheet}>Refresh Sheet</Button>
          </Space>
        </div>
        <Table rowKey="key" columns={columns} dataSource={sheet} loading={loading} scroll={{ x: 900 }} />
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
              placeholder="Student"
              value={historyFilters.student || undefined}
              onChange={(value) => applyHistoryFilters({ student: value || '' })}
              options={students.map((student) => ({ value: student._id, label: `${student.name} - ${student.regNo}` }))}
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
              onChange={(event) => setHistoryFilters((prev) => ({ ...prev, search: event.target.value }))}
              onSearch={(value) => applyHistoryFilters({ search: value })}
              style={{ width: 300 }}
            />
            <Button onClick={resetHistoryFilters}>All History</Button>
          </Space>
        </div>
        <Table rowKey="_id" columns={historyColumns} dataSource={history} loading={historyLoading} scroll={{ x: 1000 }} />
      </Card>
    </div>
  );
}
