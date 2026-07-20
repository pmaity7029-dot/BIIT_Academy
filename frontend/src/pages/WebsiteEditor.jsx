import { Button, Card, Form, Input, message, Tabs } from 'antd';
import { useEffect, useState } from 'react';
import { FiPlus, FiTrash2, FiSave, FiGlobe } from 'react-icons/fi';
import api from '../api/client.js';
import PageHeader from '../components/PageHeader.jsx';
import React from 'react';

export default function WebsiteEditor() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [successStories, setSuccessStories] = useState([]);

  const loadContent = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/website');
      setCourses(data.courses || []);
      setSuccessStories(data.successStories || []);
      form.setFieldsValue({
        courses: data.courses || [],
        successStories: data.successStories || []
      });
    } catch (error) {
      message.error('Failed to load website content');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContent();
  }, []);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      await api.put('/website', {
        courses: values.courses || [],
        successStories: values.successStories || []
      });
      message.success('Website content updated successfully!');
      loadContent();
    } catch (error) {
      message.error(error?.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        icon={<FiGlobe />}
        title="Website Content Management"
        subtitle="Edit professional courses and success stories displayed on the home page."
      />

      <Card className="content-card" bordered={false} loading={loading}>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Tabs
            items={[
              {
                key: 'courses',
                label: `Professional Courses (${courses.length})`,
                children: (
                  <div>
                    <Form.List name="courses">
                      {(fields, { add, remove }) => (
                        <div style={{ display: 'grid', gap: '20px' }}>
                          {fields.map(({ key, name, ...restField }) => (
                            <Card key={key} size="small" title={`Course #${name + 1}`} extra={<Button danger icon={<FiTrash2 />} onClick={() => remove(name)} />}>
                              <Form.Item {...restField} name={[name, 'title']} label="Course Title" rules={[{ required: true }]}>
                                <Input placeholder="Course title" />
                              </Form.Item>
                              <Form.Item {...restField} name={[name, 'duration']} label="Duration" rules={[{ required: true }]}>
                                <Input placeholder="e.g. 6 Months / 120 Hrs" />
                              </Form.Item>
                              <Form.Item {...restField} name={[name, 'eligibility']} label="Eligibility">
                                <Input placeholder="e.g. 10th STANDARD" />
                              </Form.Item>
                              <Form.Item {...restField} name={[name, 'desc']} label="Description">
                                <Input.TextArea rows={3} placeholder="Course description" />
                              </Form.Item>
                            </Card>
                          ))}
                          <Button type="dashed" onClick={() => add()} block icon={<FiPlus />}>
                            Add Professional Course
                          </Button>
                        </div>
                      )}
                    </Form.List>
                  </div>
                )
              },
              {
                key: 'stories',
                label: `Success Stories (${successStories.length})`,
                children: (
                  <div>
                    <Form.List name="successStories">
                      {(fields, { add, remove }) => (
                        <div style={{ display: 'grid', gap: '20px' }}>
                          {fields.map(({ key, name, ...restField }) => (
                            <Card key={key} size="small" title={`Success Story #${name + 1}`} extra={<Button danger icon={<FiTrash2 />} onClick={() => remove(name)} />}>
                              <Form.Item {...restField} name={[name, 'name']} label="Student Name" rules={[{ required: true }]}>
                                <Input placeholder="Student name" />
                              </Form.Item>
                              <Form.Item {...restField} name={[name, 'role']} label="Role / Designation" rules={[{ required: true }]}>
                                <Input placeholder="e.g. Maintenance Engineer" />
                              </Form.Item>
                              <Form.Item {...restField} name={[name, 'company']} label="Company / Location" rules={[{ required: true }]}>
                                <Input placeholder="e.g. Kolkata" />
                              </Form.Item>
                            </Card>
                          ))}
                          <Button type="dashed" onClick={() => add()} block icon={<FiPlus />}>
                            Add Success Story
                          </Button>
                        </div>
                      )}
                    </Form.List>
                  </div>
                )
              }
            ]}
          />

          <div style={{ marginTop: '24px', textAlign: 'right' }}>
            <Button type="primary" htmlType="submit" size="large" icon={<FiSave />} loading={loading}>
              Save All Changes
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}