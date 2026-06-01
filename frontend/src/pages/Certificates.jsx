import { Button, Card, DatePicker, Form, Input, Modal, Popconfirm, Select, Space, Table, Tag, message } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { FiAward, FiPlus, FiPrinter, FiSearch, FiTrash2 } from 'react-icons/fi';
import dayjs from 'dayjs';
import api from '../api/client.js';
import PageHeader from '../components/PageHeader.jsx';
import { printExactElement } from '../utils/printElement.js';
import React from 'react';

const CERTIFICATE_PAGE_STYLES = `
  @page { size: A4 landscape; margin: 0; }

  html,
  body.biit-print-body {
    width: 297mm;
    min-height: 210mm;
    margin: 0 !important;
    padding: 0 !important;
    background: #fffdf7 !important;
    overflow: hidden;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  body.biit-print-body {
    display: grid !important;
    place-items: center !important;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif !important;
  }

  .biit-print-stage {
    width: 297mm;
    height: 210mm;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4mm;
    background: #fffdf7;
  }

  .biit-print-stage .certificate-print {
    width: 289mm !important;
    height: 202mm !important;
    min-height: 0 !important;
    max-width: none !important;
    margin: 0 !important;
    box-shadow: none !important;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .biit-print-stage .certificate-print,
  .biit-print-stage .certificate-print * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
`;

const gradeOptions = ['A+', 'A', 'B+', 'B', 'C'].map((value) => ({ value }));

export default function Certificates() {
  const [certificates, setCertificates] = useState([]);
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const certRef = useRef(null);

  const load = async (searchValue = search) => {
    setLoading(true);
    try {
      const [certRes, studentRes] = await Promise.all([
        api.get('/certificates', { params: { search: searchValue } }),
        api.get('/students')
      ]);
      setCertificates(certRes.data);
      setStudents(studentRes.data);

      if (!selected && certRes.data[0]) {
        setSelected(certRes.data[0]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load().catch(() => message.error('Certificate data loading failed'));
  }, []);

  const save = async () => {
    try {
      const values = await form.validateFields();
      const { data } = await api.post('/certificates', {
        ...values,
        issueDate: values.issueDate?.toISOString()
      });
      message.success('Certificate generated');
      setSelected(data);
      setOpen(false);
      form.resetFields();
      load('');
      setSearch('');
    } catch (error) {
      if (!error.errorFields) message.error('Certificate save failed');
    }
  };

  const deleteCertificate = async (certificate) => {
    try {
      await api.delete(`/certificates/${certificate._id}`);
      message.success('Certificate deleted');
      if (selected?._id === certificate._id) setSelected(null);
      load();
    } catch (error) {
      message.error(error?.response?.data?.message || 'Certificate delete failed');
    }
  };

  const printCertificate = () => {
    printExactElement({
      element: certRef.current,
      title: `BIIT Certificate - ${selected?.certificateNo || 'Preview'}`,
      pageStyles: CERTIFICATE_PAGE_STYLES,
      windowSize: 'width=1280,height=900'
    });
  };

  const columns = [
    { title: 'Certificate No.', dataIndex: 'certificateNo', width: 180 },
    {
      title: 'Student',
      render: (_, row) => (
        <div>
          <strong>{row.student?.name}</strong><br />
          <span className="muted-text">{row.student?.regNo}</span>
        </div>
      )
    },
    { title: 'Course', dataIndex: 'courseTitle' },
    { title: 'Grade', dataIndex: 'grade', width: 90, render: (grade) => <Tag color="gold">{grade}</Tag> },
    { title: 'Issue Date', dataIndex: 'issueDate', width: 150, render: (date) => dayjs(date).format('DD MMM YYYY') },
    {
      title: 'Action',
      fixed: 'right',
      width: 190,
      render: (_, row) => (
        <Space>
          <Button icon={<FiPrinter />} onClick={() => setSelected(row)}>Preview</Button>
          <Popconfirm title="Delete this certificate?" okText="Delete" okButtonProps={{ danger: true }} onConfirm={() => deleteCertificate(row)}>
            <Button danger icon={<FiTrash2 />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div>
      <PageHeader
        icon={<FiAward />}
        title="Certificates"
        subtitle="Generate premium course completion certificates"
        actionText="Generate Certificate"
        actionIcon={<FiPlus />}
        onAction={() => setOpen(true)}
      />

      {selected && (
        <Card className="content-card" bordered={false}>
          <div className="section-toolbar">
            <strong>Certificate Preview — {selected.certificateNo}</strong>
            <Button type="primary" icon={<FiPrinter />} onClick={printCertificate}>Print / Save PDF</Button>
          </div>
          <div ref={certRef} className="certificate-print premium-certificate">
            <div className="cert-watermark">BIIT</div>
            <div className="cert-corner cert-corner-tl" />
            <div className="cert-corner cert-corner-tr" />
            <div className="cert-corner cert-corner-bl" />
            <div className="cert-corner cert-corner-br" />
            <div className="cert-kicker">Bengal Institute of Information Technology</div>
            <h1 className="cert-title">Certificate of Completion</h1>
            <p className="cert-text">This certificate is proudly presented to</p>
            <div className="cert-name">{selected.student?.name}</div>
            <div className="cert-line" />
            <p className="cert-text">for successful completion of</p>
            <h2 className="cert-course">{selected.courseTitle}</h2>
            <p className="cert-text">with grade <strong>{selected.grade}</strong></p>
            <p className="cert-meta">Issued on {dayjs(selected.issueDate).format('DD MMM YYYY')}</p>
            <p className="cert-meta">Certificate No: {selected.certificateNo}</p>
            <div className="cert-footer">
              <div className="cert-sign-block">
                <span>BIIT Main Branch</span>
                <small>Issuing Centre</small>
              </div>
              <div className="cert-seal">BIIT</div>
              <div className="cert-sign-block right">
                <span>Authorized Signature</span>
                <small>{selected.issuedBy?.name || 'Super Admin'}</small>
              </div>
            </div>
          </div>
        </Card>
      )}

      <Card className="content-card" bordered={false} title="Certificate Records">
        <div className="section-toolbar compact-toolbar">
          <Space wrap>
            <Input.Search
              allowClear
              enterButton={<FiSearch />}
              placeholder="Search certificate, student, reg no, course..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onSearch={(value) => load(value)}
              style={{ width: 360 }}
            />
            <Button onClick={() => { setSearch(''); load(''); }}>Reset</Button>
          </Space>
        </div>
        <Table rowKey="_id" columns={columns} dataSource={certificates} loading={loading} scroll={{ x: 1100 }} />
      </Card>

      <Modal title="Generate Certificate" open={open} onCancel={() => setOpen(false)} onOk={save} okText="Generate">
        <Form form={form} layout="vertical" initialValues={{ grade: 'A+', issueDate: dayjs() }}>
          <Form.Item name="student" label="Student" rules={[{ required: true }]}> 
            <Select showSearch optionFilterProp="label" options={students.map((student) => ({ value: student._id, label: `${student.name} - ${student.regNo}` }))} />
          </Form.Item>
          <Form.Item name="courseTitle" label="Course Title" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="grade" label="Grade"><Select options={gradeOptions} /></Form.Item>
          <Form.Item name="issueDate" label="Issue Date"><DatePicker className="full-width" /></Form.Item>
          <Form.Item name="remarks" label="Remarks"><Input.TextArea rows={3} /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
