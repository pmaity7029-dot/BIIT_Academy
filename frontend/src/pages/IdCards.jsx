import { Button, Card, Col, DatePicker, Input, Modal, Popconfirm, Row, Select, Space, Table, Tag, Typography, Upload, message } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { FiCamera, FiEdit3, FiPlus, FiDownload, FiSearch, FiTrash2, FiUser } from 'react-icons/fi';
import dayjs from 'dayjs';
import html2canvas from 'html2canvas';
import api from '../api/client.js';
import PageHeader from '../components/PageHeader.jsx';
import { ShimmerTable } from '../components/ShimmerLoading.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import React from 'react';

const defaultCardValues = {
  student: '', studentName: '', regNo: '', batch: '', dob: null, phone: '', bloodGroup: 'O+', validUntil: 'Dec 2026', photo: ''
};

export default function IdCards() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [idCards, setIdCards] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editorData, setEditorData] = useState(defaultCardValues);
  const [search, setSearch] = useState('');

  const idCardRef = useRef(null);
  const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  useEffect(() => { loadIdCards(''); loadStudents(); }, []);

  const loadStudents = async () => {
    try { const { data } = await api.get('/students'); setStudents(data); } catch (error) { message.error('Failed to load students list'); }
  };

  const loadIdCards = async (searchValue = search) => {
    try {
      setLoading(true);
      const { data } = await api.get('/id-cards', { params: searchValue ? { search: searchValue } : {} });
      setIdCards(data);
      if (!selectedCard && data[0]) setSelectedCard(data[0]);
    } catch (error) {
      message.error('Failed to load saved ID Cards records');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectStudentForEditor = (studentId) => {
    const student = students.find((s) => s._id === studentId);
    if (student) {
      setEditorData((prev) => ({
        ...prev, student: student._id, studentName: student.name, regNo: student.regNo, batch: student.batch || 'Default Batch', dob: student.dob ? dayjs(student.dob) : null, phone: student.phone, photo: student.photo || ''
      }));
    }
  };

  const updateEditorField = (field, value) => { setEditorData((prev) => ({ ...prev, [field]: value })); };

  const customCloudinaryUpload = async ({ file, onSuccess, onError }) => {
    if (!CLOUD_NAME || !UPLOAD_PRESET) { message.error("Cloudinary configurations are missing in .env file!"); onError(new Error("Missing Config")); return; }
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file); formData.append('upload_preset', UPLOAD_PRESET); formData.append('cloud_name', CLOUD_NAME);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: 'POST', body: formData });
      const cloudinaryData = await res.json();
      if (!res.ok) throw new Error(cloudinaryData.error?.message || 'Cloudinary Error');
      updateEditorField('photo', cloudinaryData.secure_url);
      onSuccess(cloudinaryData);
      message.success('Photo uploaded to Cloudinary successfully!');
    } catch (error) {
      onError(error);
      message.error('Photo upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const openNewIdCardEditor = () => { setEditingId(null); setEditorData(defaultCardValues); setEditorOpen(true); };
  const openEditIdCardEditor = (record) => { setEditingId(record._id); setEditorData({ ...record, dob: record.dob ? dayjs(record.dob) : null }); setEditorOpen(true); };

  const saveIdCardRecord = async () => {
    if (!editorData.studentName || !editorData.regNo || !editorData.phone || !editorData.dob) { message.error('Student Name, Reg No, Phone, and DOB are required!'); return; }
    try {
      const payload = { ...editorData };
      if (payload.dob && typeof payload.dob.toISOString === 'function') payload.dob = payload.dob.toISOString();
      else if (payload.dob) payload.dob = new Date(payload.dob).toISOString();
      if (!payload.student || payload.student === '') payload.student = null;

      let responseData;
      if (editingId) {
        const { data } = await api.put(`/id-cards/${editingId}`, payload);
        responseData = data;
        message.success('ID Card updated successfully');
      } else {
        const { data } = await api.post('/id-cards', payload);
        responseData = data;
        message.success('ID Card generated and saved to database');
      }

      setSelectedCard(responseData);
      setEditorOpen(false);
      loadIdCards('');
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to save ID Card record');
    }
  };

  const deleteIdCardRecord = async (id) => {
    try {
      await api.delete(`/id-cards/${id}`);
      message.success('ID Card record deleted');
      if (selectedCard?._id === id) setSelectedCard(null);
      loadIdCards(search);
    } catch (error) {
      message.error('Failed to delete ID Card record');
    }
  };

  const downloadIdCard = async () => {
    if (!selectedCard) return;
    try {
      message.loading({ content: 'Generating High-Quality Image...', key: 'downloading' });
      const element = idCardRef.current;
      const originalShadow = element.style.boxShadow;
      element.style.boxShadow = 'none';

      const images = Array.from(element.querySelectorAll('img'));
      await Promise.all(images.map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => { img.onload = resolve; img.onerror = resolve; });
      }));
      await new Promise((resolve) => setTimeout(resolve, 200));

      const canvas = await html2canvas(element, { scale: 4, useCORS: true, allowTaint: true, backgroundColor: '#ffffff' });
      element.style.boxShadow = originalShadow;

      const imageURI = canvas.toDataURL('image/jpeg', 1.0);
      const link = document.createElement('a');
      link.href = imageURI;
      const safeName = selectedCard.studentName.replace(/[^a-z0-9]/gi, '_');
      link.download = `BIIT_ID_Card_${safeName}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      message.success({ content: 'ID Card JPG downloaded successfully!', key: 'downloading' });
    } catch (error) {
      console.error('Download error:', error);
      message.error({ content: 'Failed to generate image.', key: 'downloading' });
    }
  };

  const columns = [
    { title: 'Registration No.', dataIndex: 'regNo', key: 'regNo', width: 150 },
    { title: 'Student Name', dataIndex: 'studentName', key: 'studentName', width: 220, render: (text) => <strong>{text}</strong> },
    { title: 'Batch / Course', dataIndex: 'batch', key: 'batch', width: 200 },
    { title: 'Blood Group', dataIndex: 'bloodGroup', key: 'bloodGroup', width: 110, render: (b) => <Tag color="volcano">{b}</Tag> }
  ];

  if (isAdmin) {
    columns.push({
      title: 'Action',
      key: 'action',
      width: 220,
      render: (_, row) => (
        <Space>
          <Button onClick={() => setSelectedCard(row)}>View</Button>
          <Button icon={<FiEdit3 />} onClick={() => openEditIdCardEditor(row)}>Edit</Button>
          <Popconfirm title="Delete this saved card record?" onConfirm={() => deleteIdCardRecord(row._id)}>
            <Button danger icon={<FiTrash2 />} />
          </Popconfirm>
        </Space>
      )
    });
  } else {
    columns.push({
      title: 'Action',
      key: 'action',
      width: 100,
      render: (_, row) => (
        <Button onClick={() => setSelectedCard(row)}>View</Button>
      )
    });
  }

  return (
    <div>
      <PageHeader
        icon={<FiUser />}
        title="ID Cards Management"
        subtitle="Generate, save permanently, filter, search, dynamic edit and download student identity cards as JPG."
        actionText={isAdmin ? "Generate ID Card" : undefined}
        actionIcon={isAdmin ? <FiPlus /> : undefined}
        onAction={isAdmin ? openNewIdCardEditor : undefined}
      />

      {selectedCard && (
        <Card className="content-card" bordered={false}>
          <div className="section-toolbar">
            <strong>ID Card Live Preview — {selectedCard.regNo}</strong>
            <Space wrap>
              {isAdmin && (
                <Button icon={<FiEdit3 />} onClick={() => openEditIdCardEditor(selectedCard)}>
                  Edit Card Content
                </Button>
              )}
              <Button type="primary" icon={<FiDownload />} onClick={downloadIdCard}>
                Download Id Card
              </Button>
            </Space>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', padding: '24px', background: '#f5f7fb', borderRadius: '16px' }}>
            <div ref={idCardRef} className="id-card-wrapper">
              <div className="id-card-header">
                <h2>BIIT COACHING</h2>
                <p>Midnapore, West Bengal</p>
              </div>
              
              <div className="id-card-body">
                <div className="id-photo-box">
                  {selectedCard.photo ? (
                    <img src={selectedCard.photo} alt="Student" crossOrigin="anonymous" />
                  ) : (
                    <div className="id-photo-placeholder"><FiUser /></div>
                  )}
                </div>
                
                <h3 className="id-student-name">{selectedCard.studentName}</h3>
                <p className="id-student-course">{selectedCard.batch}</p>
                
                <div className="id-details">
                  <div className="id-detail-row">
                    <span>Reg No:</span> <strong>{selectedCard.regNo}</strong>
                  </div>
                  <div className="id-detail-row">
                    <span>DOB:</span> <strong>{dayjs(selectedCard.dob).format('DD/MM/YYYY')}</strong>
                  </div>
                  <div className="id-detail-row">
                    <span>Blood:</span> <strong>{selectedCard.bloodGroup}</strong>
                  </div>
                  <div className="id-detail-row">
                    <span>Phone:</span> <strong>{selectedCard.phone}</strong>
                  </div>
                  <div className="id-detail-row" style={{ borderBottom: 'none' }}>
                    <span>Valid Till:</span> <strong>{selectedCard.validUntil}</strong>
                  </div>
                </div>
              </div>
              
              <div className="id-card-footer">
                <div className="signature-box">
                  <div className="signature-line"></div>
                  <span>Authorised Signatory</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      <Card className="content-card" title="Saved ID Cards Logs Database">
        <div className="section-toolbar compact-toolbar">
          <Space wrap>
            <Input.Search allowClear enterButton={<FiSearch />} placeholder="Search by student name, reg no, batch..." value={search} onChange={(e) => { setSearch(e.target.value); loadIdCards(e.target.value); }} onSearch={(val) => { setSearch(val); loadIdCards(val); }} className="live-search-input" style={{ width: 360 }} />
            <Button onClick={() => { setSearch(''); loadIdCards(''); }}>Reset Database</Button>
          </Space>
        </div>

        {loading ? (
          <ShimmerTable columns={5} rows={6} />
        ) : (
          <Table rowKey="_id" columns={columns} dataSource={idCards} scroll={{ x: 'max-content' }} onRow={(record) => ({ onClick: () => setSelectedCard(record) })} />
        )}
      </Card>

      <Modal title={editingId ? "Edit Identity Card Records" : "Generate Custom New Student ID Card"} open={editorOpen} onCancel={() => setEditorOpen(false)} onOk={saveIdCardRecord} okText={editingId ? "Update Data" : "Save Record to Database"} width={850} destroyOnHidden>
        <Row gutter={24} style={{ marginTop: '16px' }}>
          <Col xs={24} md={12}>
            <div style={{ maxHeight: '65vh', overflowY: 'auto', paddingRight: '8px' }}>
              {!editingId && (
                <>
                  <label className="editor-field-label">Autofill From Existing Enrolled Student</label>
                  <Select allowClear showSearch className="full-width" placeholder="Optional: Select student profile" optionFilterProp="label" onChange={handleSelectStudentForEditor} options={students.map((s) => ({ value: s._id, label: `${s.name} - ${s.regNo}` }))} style={{ marginBottom: '14px' }} />
                </>
              )}
              <label className="editor-field-label">Student Full Name</label>
              <Input value={editorData.studentName} onChange={(e) => updateEditorField('studentName', e.target.value)} style={{ marginBottom: '14px' }} />
              <label className="editor-field-label">Registration Number</label>
              <Input value={editorData.regNo} onChange={(e) => updateEditorField('regNo', e.target.value)} style={{ marginBottom: '14px' }} />
              <label className="editor-field-label">Batch / Course Allocated</label>
              <Input value={editorData.batch} onChange={(e) => updateEditorField('batch', e.target.value)} style={{ marginBottom: '14px' }} />
              <label className="editor-field-label">Date of Birth</label>
              <DatePicker className="full-width" value={editorData.dob} format="DD/MM/YYYY" onChange={(date) => updateEditorField('dob', date)} style={{ marginBottom: '14px' }} />
              <label className="editor-field-label">Contact Number</label>
              <Input value={editorData.phone} onChange={(e) => updateEditorField('phone', e.target.value)} style={{ marginBottom: '14px' }} />
              <label className="editor-field-label">Blood Group</label>
              <Input value={editorData.bloodGroup} placeholder="e.g. B+, O-" onChange={(e) => updateEditorField('bloodGroup', e.target.value)} style={{ marginBottom: '14px' }} />
              <label className="editor-field-label">Card Validity Extension</label>
              <Input value={editorData.validUntil} placeholder="e.g. Dec 2026" onChange={(e) => updateEditorField('validUntil', e.target.value)} style={{ marginBottom: '14px' }} />
              <div style={{ textAlign: 'center', marginTop: '16px' }}>
                <Upload name="photo" showUploadList={false} customRequest={customCloudinaryUpload} accept="image/*">
                  <Button icon={<FiCamera />} loading={uploading}>Upload Image to Cloudinary</Button>
                </Upload>
              </div>
            </div>
          </Col>
          <Col xs={24} md={12} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', borderRadius: '12px' }}>
            <div className="id-card-wrapper">
              <div className="id-card-header"><h2>BIIT COACHING</h2><p>Midnapore, West Bengal</p></div>
              <div className="id-card-body">
                <div className="id-photo-box">{editorData.photo ? (<img src={editorData.photo} alt="Preview" crossOrigin="anonymous" />) : (<div className="id-photo-placeholder"><FiUser /></div>)}</div>
                <h3 className="id-student-name">{editorData.studentName || 'Student Full Name'}</h3>
                <p className="id-student-course">{editorData.batch || 'Batch Name'}</p>
                <div className="id-details">
                  <div className="id-detail-row"><span>Reg No:</span> <strong>{editorData.regNo || 'BIITXXXXXX'}</strong></div>
                  <div className="id-detail-row"><span>DOB:</span> <strong>{editorData.dob ? editorData.dob.format('DD/MM/YYYY') : 'DD/MM/YYYY'}</strong></div>
                  <div className="id-detail-row"><span>Blood:</span> <strong>{editorData.bloodGroup}</strong></div>
                  <div className="id-detail-row"><span>Phone:</span> <strong>{editorData.phone || '0000000000'}</strong></div>
                  <div className="id-detail-row" style={{ borderBottom: 'none' }}><span>Valid Till:</span> <strong>{editorData.validUntil}</strong></div>
                </div>
              </div>
              <div className="id-card-footer"><div className="signature-box"><div className="signature-line"></div><span>Authorised Signatory</span></div></div>
            </div>
          </Col>
        </Row>
      </Modal>
    </div>
  );
}