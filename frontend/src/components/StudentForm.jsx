import { DatePicker, Form, Input, Select } from 'antd';
import React from "react";
export default function StudentForm({ form }) {
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
      <Form.Item name="centre" label="Centre">
        <Input placeholder="BIIT - Main Branch" />
      </Form.Item>
      <Form.Item name="batch" label="Batch">
        <Input placeholder="Batch Graphic A" />
      </Form.Item>
      <Form.Item name="address" label="Address" className="grid-span-2">
        <Input.TextArea rows={3} placeholder="Enter address" />
      </Form.Item>
    </Form>
  );
}
