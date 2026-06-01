import { Button, Card, Form, Input, Select, Table, Tag, message } from 'antd';
import { useEffect, useState } from 'react';
import { FiMail, FiSend } from 'react-icons/fi';
import dayjs from 'dayjs';
import api from '../api/client.js';
import PageHeader from '../components/PageHeader.jsx';
import React from "react";

export default function Messages() {
  const [logs, setLogs] = useState([]);
  const [form] = Form.useForm();
  const recipientType = Form.useWatch('recipientType', form);

  const load = async () => {
    const { data } = await api.get('/mail');
    setLogs(data);
  };

  useEffect(() => { load().catch(() => message.error('Message logs loading failed')); }, []);

  const send = async (values) => {
    try {
      await api.post('/mail/send', {
        ...values,
        emails: values.emails?.split(',').map((email) => email.trim()).filter(Boolean) || []
      });
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
      <PageHeader icon={<FiMail />} title="Messages" subtitle="Send mail communication to students and keep communication logs" />
      <Card className="content-card" bordered={false} title="Compose Mail">
        <Form form={form} layout="vertical" onFinish={send} initialValues={{ recipientType: 'manual' }}>
          <Form.Item name="recipientType" label="Recipient Type">
            <Select options={[{ value: 'manual', label: 'Manual Emails' }, { value: 'all-students', label: 'All Students' }]} />
          </Form.Item>
          {recipientType !== 'all-students' && (
            <Form.Item name="emails" label="Emails" rules={[{ required: true, message: 'Enter at least one email' }]}>
              <Input placeholder="student1@mail.com, student2@mail.com" />
            </Form.Item>
          )}
          <Form.Item name="subject" label="Subject" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="body" label="Message" rules={[{ required: true }]}><Input.TextArea rows={6} /></Form.Item>
          <Button type="primary" htmlType="submit" icon={<FiSend />}>Send Mail</Button>
        </Form>
      </Card>
      <Card className="content-card" bordered={false} title="Communication Logs">
        <Table rowKey="_id" columns={columns} dataSource={logs} scroll={{ x: 800 }} />
      </Card>
    </div>
  );
}
