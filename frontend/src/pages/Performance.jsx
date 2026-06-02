import { Button, Card, Input, Progress, Select, Space, Table, Tag, message } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { FiBarChart2, FiSearch } from 'react-icons/fi';
import api from '../api/client.js';
import PageHeader from '../components/PageHeader.jsx';
import React from 'react';

const sortOptions = [
  { value: 'high-to-low', label: 'High Performance to Low' },
  { value: 'low-to-high', label: 'Low Performance to High' },
  { value: 'name-az', label: 'Name A to Z' },
  { value: 'name-za', label: 'Name Z to A' }
];

export default function Performance() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    search: '',
    batch: '',
    sortBy: 'high-to-low'
  });

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/performance/overview');
      setRows(Array.isArray(data) ? data : []);
    } catch (error) {
      message.error('Performance data loading failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const batchOptions = useMemo(() => {
    const batches = rows
      .map((row) => row.student?.batch)
      .filter(Boolean);

    return [...new Set(batches)]
      .sort((a, b) => String(a).localeCompare(String(b)))
      .map((batch) => ({
        value: batch,
        label: batch
      }));
  }, [rows]);

  const filteredRows = useMemo(() => {
    const searchText = filters.search.trim().toLowerCase();
    const batchText = filters.batch.trim().toLowerCase();

    const result = rows.filter((row) => {
      const student = row.student || {};

      if (batchText && String(student.batch || '').toLowerCase() !== batchText) {
        return false;
      }

      if (!searchText) return true;

      const haystack = [
        student.name,
        student.fatherName,
        student.regNo,
        student.phone,
        student.email,
        student.batch,
        row.present,
        row.late,
        row.absent,
        row.attendanceRate,
        row.paid
      ]
        .filter((item) => item !== undefined && item !== null)
        .join(' ')
        .toLowerCase();

      return haystack.includes(searchText);
    });

    return [...result].sort((a, b) => {
      const rateA = Number(a.attendanceRate || 0);
      const rateB = Number(b.attendanceRate || 0);

      if (filters.sortBy === 'low-to-high') return rateA - rateB;
      if (filters.sortBy === 'high-to-low') return rateB - rateA;

      if (filters.sortBy === 'name-za') {
        return String(b.student?.name || '').localeCompare(String(a.student?.name || ''));
      }

      return String(a.student?.name || '').localeCompare(String(b.student?.name || ''));
    });
  }, [rows, filters]);

  const resetFilters = () => {
    setFilters({
      search: '',
      batch: '',
      sortBy: 'high-to-low'
    });
  };

  const columns = [
    {
      title: 'Student',
      dataIndex: ['student', 'name'],
      width: 210,
      render: (text, row) => (
        <div className="student-cell">
          <strong>{text}</strong>
          <span className="muted-text">{row.student?.regNo}</span>
        </div>
      )
    },
    {
      title: 'Batch',
      dataIndex: ['student', 'batch'],
      width: 185,
      ellipsis: true
    },
    {
      title: 'Present',
      dataIndex: 'present',
      width: 85
    },
    {
      title: 'Late',
      dataIndex: 'late',
      width: 70
    },
    {
      title: 'Absent',
      dataIndex: 'absent',
      width: 80
    },
    {
      title: 'Attendance Rate',
      dataIndex: 'attendanceRate',
      width: 230,
      render: (value) => {
        const percent = Number(value || 0);

        return (
          <div className="performance-rate-cell">
            <Progress
              percent={percent}
              size="small"
              showInfo={false}
              className="performance-progress"
            />
            <span className="performance-percent">{percent}%</span>
          </div>
        );
      }
    },
    {
      title: 'Fee Paid',
      dataIndex: 'paid',
      width: 125,
      render: (value) => (
        <Tag color="green" className="fee-paid-tag">
          INR {Number(value || 0).toLocaleString('en-IN')}
        </Tag>
      )
    }
  ];

  return (
    <div>
      <PageHeader
        icon={<FiBarChart2 />}
        title="Performance"
        subtitle="Review attendance performance and payment progress batch wise"
      />

      <Card className="content-card performance-card" variant="borderless">
        <div className="section-toolbar performance-toolbar">
          <strong>Performance Records ({filteredRows.length})</strong>

          <Space wrap className="performance-filter-space">
            <Select
              allowClear
              showSearch
              optionFilterProp="label"
              placeholder="Search batch"
              value={filters.batch || undefined}
              onChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  batch: value || ''
                }))
              }
              options={batchOptions}
              className="performance-batch-filter"
            />

            <Select
              placeholder="Performance Sort"
              value={filters.sortBy}
              onChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  sortBy: value
                }))
              }
              options={sortOptions}
              className="performance-sort-filter"
            />

            <Input.Search
              allowClear
              enterButton={<FiSearch />}
              placeholder="Search name, reg no, batch..."
              value={filters.search}
              onChange={(event) =>
                setFilters((prev) => ({
                  ...prev,
                  search: event.target.value
                }))
              }
              className="performance-search-filter"
            />

            <Button onClick={resetFilters}>Reset</Button>
          </Space>
        </div>

        <Table
          rowKey={(row) => row.student?._id}
          columns={columns}
          dataSource={filteredRows}
          loading={loading}
          scroll={{ x: 985 }}
          tableLayout="fixed"
          size="middle"
          className="performance-table"
        />
      </Card>
    </div>
  );
}
