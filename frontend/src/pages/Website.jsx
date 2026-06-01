import { Button, Card, Col, Row, Typography } from 'antd';
import React from "react";
import { useNavigate } from 'react-router-dom';
import { FiArrowRight, FiAward, FiBookOpen, FiMonitor, FiPhone, FiShield, FiUsers } from 'react-icons/fi';

export default function Website() {
  const navigate = useNavigate();

  return (
    <div className="site-page">
      <header className="site-header">
        <div className="site-brand"><FiMonitor /> <span>BIIT</span></div>
        <nav>
          <a href="#courses">Courses</a>
          <a href="#features">Features</a>
          <a href="#contact">Contact</a>
          <Button type="primary" onClick={() => navigate('/admin')}>Admin Login</Button>
        </nav>
      </header>

      <section className="hero-section">
        <div className="hero-copy">
          <div className="eyebrow">Professional Computer Training Institute</div>
          <Typography.Title className="hero-title">Build job-ready computer skills with BIIT</Typography.Title>
          <Typography.Paragraph className="hero-subtitle">
            BIIT provides career-focused training in computer fundamentals, design, office tools, programming, and practical project work for students and professionals.
          </Typography.Paragraph>
          <div className="hero-actions">
            <Button type="primary" size="large" icon={<FiArrowRight />}>Explore Courses</Button>
            <Button size="large" icon={<FiPhone />}>Contact Centre</Button>
          </div>
        </div>
        <Card className="hero-card" bordered={false}>
          <div className="course-highlight">
            <FiAward />
            <h3>Admissions Open</h3>
            <p>Enroll now for professional certification batches with attendance tracking, practical assessments, and certificate support.</p>
          </div>
        </Card>
      </section>

      <section id="features" className="site-section">
        <Typography.Title level={2}>Why choose BIIT</Typography.Title>
        <Row gutter={[20, 20]}>
          {[
            { icon: <FiBookOpen />, title: 'Practical Curriculum', text: 'Focused classes with real assignments and skill-based learning.' },
            { icon: <FiUsers />, title: 'Student Support', text: 'Batch-wise guidance, attendance review, and performance monitoring.' },
            { icon: <FiShield />, title: 'Verified Certificates', text: 'Premium certificate generation after successful course completion.' }
          ].map((item) => (
            <Col xs={24} md={8} key={item.title}>
              <Card className="feature-card" bordered={false}>
                <div className="feature-icon">{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </Card>
            </Col>
          ))}
        </Row>
      </section>

      <section id="courses" className="site-section muted-section">
        <Typography.Title level={2}>Popular courses</Typography.Title>
        <Row gutter={[20, 20]}>
          {['Graphic Design', 'Office Management', 'Web Development', 'Computer Fundamentals'].map((title) => (
            <Col xs={24} md={6} key={title}>
              <Card className="course-card" bordered={false}>
                <FiBookOpen />
                <h3>{title}</h3>
                <p>Professional training with guided projects and certificate support.</p>
              </Card>
            </Col>
          ))}
        </Row>
      </section>

      <footer id="contact" className="site-footer">
        <div>
          <strong>BIIT</strong>
          <p>Main Branch, Midnapore, West Bengal</p>
        </div>
        <Button type="primary" onClick={() => navigate('/admin')}>Go to Admin Panel</Button>
      </footer>
    </div>
  );
}
