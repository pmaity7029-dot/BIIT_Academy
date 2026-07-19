import { Button, DatePicker, Form, Input, InputNumber, Select, Upload, message } from 'antd';
import React from "react";
import { FiCamera, FiTrash2 } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext.jsx';

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export default function StudentForm({ form, batchOptions = [], courseOptions = [] }) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const photo = Form.useWatch('photo', form);

  const handlePhotoSelect = async (file) => {
    if (!file.type?.startsWith('image/')) {
      message.error('Please upload an image file');
      return Upload.LIST_IGNORE;
    }

    if (file.size > 2 * 1024 * 1024) {
      message.error('Photo size should be under 2 MB');
      return Upload.LIST_IGNORE;
    }

    const dataUrl = await readFileAsDataUrl(file);
    form.setFieldsValue({ photo: dataUrl });
    return Upload.LIST_IGNORE;
  };

  return (
    <Form form={form} layout="vertical" className="form-grid">
      <Form.Item name="name" label="Student Name" rules={[{ required: true, message: 'Student name is required' }]}>
        <Input placeholder="Enter student name" />
      </Form.Item>
      <Form.Item name="fatherName" label="Father's Name" rules={[{ required: true, message: "Father's name is required" }]}>
        <Input placeholder="Enter father's name" />
      </Form.Item>
      <Form.Item name="dob" label="Date of Birth" rules={[{ required: true, message: 'DOB is required' }]}>
        <DatePicker className="full-width" format="DD MMM YYYY" />
      </Form.Item>
      <Form.Item name="gender" label="Gender" rules={[{ required: true, message: 'Gender is required' }]}>
        <Select placeholder="Select gender" options={[{ value: 'Male' }, { value: 'Female' }, { value: 'Other' }]} />
      </Form.Item>
      <Form.Item name="phone" label="Phone" rules={[{ required: true, message: 'Phone is required' }]}>
        <Input placeholder="Enter phone number" />
      </Form.Item>
      <Form.Item name="emergencyContact" label="Emergency Contact" rules={[{ required: true, message: 'Emergency contact is required' }]}>
        <Input placeholder="Enter emergency contact" />
      </Form.Item>
      <Form.Item name="email" label="Email">
        <Input placeholder="Enter email address" />
      </Form.Item>
      <Form.Item name="enrolledDate" label="Enrolled Date">
        <DatePicker className="full-width" format="DD MMM YYYY" />
      </Form.Item>
      <Form.Item name="status" label="Status" initialValue="Active">
        <Select options={[{ value: 'Active' }, { value: 'Inactive' }, { value: 'Completed' }]} />
      </Form.Item>
      <Form.Item name="batch" label="Batch">
        <Select
          allowClear
          showSearch
          optionFilterProp="label"
          placeholder="Search and select batch"
          options={batchOptions.map((batch) => ({
            value: batch,
            label: batch
          }))}
        />
      </Form.Item>

      <Form.Item name="courses" label="Choose Courses" className="grid-span-2">
        <Select
          allowClear
          mode="multiple"
          showSearch
          optionFilterProp="label"
          placeholder="Select one or more courses"
          options={courseOptions.map((course) => ({
            value: course._id,
            label: `${course.title}${course.duration ? ` - ${course.duration}` : ''}`
          }))}
        />
      </Form.Item>

      <Form.Item name="admissionFee" label="Admission Fees" initialValue={0}>
        <InputNumber min={0} className="full-width" placeholder="Enter admission fees" />
      </Form.Item>

      <Form.Item name="examFee" label="Exam Fees" initialValue={0}>
        <InputNumber min={0} className="full-width" placeholder="Enter exam fees" />
      </Form.Item>

      <Form.Item name="installmentFeePerMonth" label="Installment Fees / Month" initialValue={0}>
        <InputNumber min={0} className="full-width" placeholder="Enter monthly installment fees" />
      </Form.Item>

      <Form.Item name="photo" hidden>
        <Input />
      </Form.Item>

      <Form.Item label="Profile Photo" className="grid-span-2">
        <div className="student-photo-upload">
          <div className="student-photo-preview">
            {photo ? <img src={photo} alt="Student profile preview" /> : <span>Photo</span>}
          </div>
          <div className="student-photo-actions">
            <Upload accept="image/*" showUploadList={false} beforeUpload={handlePhotoSelect}>
              <Button icon={<FiCamera />}>Upload Photo</Button>
            </Upload>
            {photo && (
              <Button icon={<FiTrash2 />} danger onClick={() => form.setFieldsValue({ photo: '' })}>
                Remove
              </Button>
            )}
          </div>
        </div>
      </Form.Item>
      
      {isAdmin && (
        <Form.Item name="branch" label="Branch / Centre" initialValue="Main Branch" className="grid-span-2">
          <Input placeholder="e.g. Main Branch, BIIT Khejuri" />
        </Form.Item>
      )}

      <Form.Item name="address" label="Address" className={isAdmin ? "" : "grid-span-2"}>
        <Input.TextArea rows={3} placeholder="Enter address" />
      </Form.Item>
    </Form>
  );
}
