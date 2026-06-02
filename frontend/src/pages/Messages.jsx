import { Button, Card, Form, Input, Select, Table, Tag, Typography, message } from 'antd';
import { useEffect, useState } from 'react';
import { FiMail, FiSend } from 'react-icons/fi';
import dayjs from 'dayjs';
import api from '../api/client.js';
import PageHeader from '../components/PageHeader.jsx';
import { ShimmerTable } from '../components/ShimmerLoading.jsx';
import React from "react";

const studentStatusOptions = [
  { value: 'Active', label: 'Active Students' },
  { value: 'Inactive', label: 'Inactive Students' },
  { value: 'Completed', label: 'Completed Students' }
];

export default function Messages() {
  const [logs, setLogs] = useState([]);
  const [batchOptions, setBatchOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const recipientType = Form.useWatch('recipientType', form);

  const load = async () => {
    setLoading(true);

    try {
      const [logsRes, batchesRes] = await Promise.all([
        api.get('/mail'),
        api.get('/students/batches/list')
      ]);

      setLogs(logsRes.data);
      setBatchOptions(
        (batchesRes.data || []).map((batch) => ({
          value: batch,
          label: batch
        }))
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load().catch(() => message.error('Message logs loading failed')); }, []);

  const send = async (values) => {
    try {
      const payload = {
        ...values,
        emails: values.emails?.split(',').map((email) => email.trim()).filter(Boolean) || [],
        batch: values.batch || '',
        status: values.status || ''
      };

      await api.post('/mail/send', payload);
      message.success('Message processed successfully');
      form.resetFields();
      load();
    } catch (error) {
      message.error(error?.response?.data?.message || 'Message sending failed');
    }
  };

  const columns = [
    { title: 'Subject', dataIndex: 'subject' },
    { title: 'Recipients', dataIndex: 'recipients', render: (value) => value?.length || 0 },
    { title: 'Status', dataIndex: 'status', render: (status) => <Tag color={status === 'Sent' ? 'green' : status === 'Skipped' ? 'blue' : 'red'}>{status}</Tag> },
    { title: 'Date', dataIndex: 'createdAt', render: (date) => dayjs(date).format('DD MMM YYYY hh:mm A') }
  ];

  return (
    <div>
      <PageHeader icon={<FiMail />} title="Messages" subtitle="Send mail communication batch-wise or by active, inactive, and completed student filters" />
      <Card className="content-card" bordered={false} title="Compose Mail">
        <Form
          form={form}
          layout="vertical"
          onFinish={send}
          initialValues={{ recipientType: 'manual', batch: '', status: '' }}
        >
          <Form.Item name="recipientType" label="Send To">
            <Select
              options={[
                { value: 'manual', label: 'Manual Emails' },
                { value: 'all-students', label: 'All Students' },
                { value: 'filtered-students', label: 'Batch / Status Filter' }
              ]}
            />
          </Form.Item>

          {recipientType === 'manual' && (
            <Form.Item name="emails" label="Emails" rules={[{ required: true, message: 'Enter at least one email' }]}>
              <Input placeholder="student1@mail.com, student2@mail.com" />
            </Form.Item>
          )}

          {recipientType === 'filtered-students' && (
            <div className="message-filter-grid">
              <Form.Item name="batch" label="Batch Wise">
                <Select
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  placeholder="Select batch or keep blank for all batches"
                  options={batchOptions}
                />
              </Form.Item>

              <Form.Item name="status" label="Student Status">
                <Select
                  allowClear
                  placeholder="Active / Inactive / Completed"
                  options={studentStatusOptions}
                />
              </Form.Item>

              <Typography.Text type="secondary" className="grid-span-2">
                Select a batch, a student status, or both. Example: Batch Graphic A + Active Students.
              </Typography.Text>
            </div>
          )}

          <Form.Item name="subject" label="Subject" rules={[{ required: true, message: 'Subject is required' }]}>
            <Input placeholder="Enter mail subject" />
          </Form.Item>

          <Form.Item name="body" label="Message / Mail Body" rules={[{ required: true, message: 'Message is required' }]}>
            <Input.TextArea rows={6} placeholder="Write your message here" />
          </Form.Item>

          <Button type="primary" htmlType="submit" icon={<FiSend />}>Send Mail</Button>
        </Form>
      </Card>
      <Card className="content-card" bordered={false} title="Communication Logs">
        {loading ? (
          <ShimmerTable columns={4} rows={6} />
        ) : (
          <Table rowKey="_id" columns={columns} dataSource={logs} scroll={{ x: 800 }} />
        )}
      </Card>
    </div>
  );
}
