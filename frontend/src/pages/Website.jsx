import { Button, Card, Col, Row, Typography, Tag, Avatar, Drawer } from 'antd';
import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { 
  FiArrowRight, FiAward, FiBookOpen, FiMonitor, 
  FiPhone, FiUsers, FiStar, FiMenu, FiHome 
} from 'react-icons/fi';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Website() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [courses, setCourses] = useState([]);
  const [successStories, setSuccessStories] = useState([]);

  useEffect(() => {
    const fetchWebsiteContent = async () => {
      try {
        const { data } = await api.get('/website');
        setCourses(data.courses || []);
        setSuccessStories(data.successStories || []);
      } catch (error) {
        setCourses([]);
        setSuccessStories([]);
      }
    };
    fetchWebsiteContent();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('.reveal');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <div className="site-page">
      <header className="site-header">
        <div className="site-brand" onClick={() => navigate('/')}><FiMonitor /> <span>BIIT</span></div>
        
        <nav className="desktop-nav">
          <a href="#about" className="nav-link">About</a>
          <a href="#courses" className="nav-link">Courses</a>
          <a href="#success" className="nav-link">Success Stories</a>
          <a href="#contact" className="nav-link">Contact</a>
        </nav>

        <div className="header-right">
          {isAuthenticated ? (
            <Button type="primary" size="large" className="nav-admin-btn" icon={<FiHome />} onClick={() => navigate('/admin/dashboard')}>
              Dashboard
            </Button>
          ) : (
            <Button type="primary" size="large" className="nav-admin-btn" onClick={() => navigate('/admin')}>
              Admin Login
            </Button>
          )}
          <Button 
            className="mobile-menu-toggle" 
            type="text" 
            icon={<FiMenu />} 
            onClick={() => setMobileMenuOpen(true)} 
          />
        </div>
      </header>

      <Drawer
        title="BIIT Navigation"
        placement="right"
        onClose={closeMenu}
        open={mobileMenuOpen}
        width={250}
        className="mobile-nav-drawer"
      >
        <div className="mobile-nav-links">
          <a href="#about" className="nav-link" onClick={closeMenu}>About</a>
          <a href="#courses" className="nav-link" onClick={closeMenu}>Courses</a>
          <a href="#success" className="nav-link" onClick={closeMenu}>Success Stories</a>
          <a href="#contact" className="nav-link" onClick={closeMenu}>Contact</a>
          {isAuthenticated ? (
            <Button type="primary" block icon={<FiHome />} onClick={() => { closeMenu(); navigate('/admin/dashboard'); }} style={{ marginTop: '10px' }}>
              Dashboard
            </Button>
          ) : (
            <Button type="primary" block onClick={() => { closeMenu(); navigate('/admin'); }} style={{ marginTop: '10px' }}>
              Admin Login
            </Button>
          )}
        </div>
      </Drawer>

      <section className="hero-section" id="about">
        <div className="hero-copy reveal">
          <div className="eyebrow" style={{ fontSize: '16px', padding: '10px 20px' }}>Welcome to The era of AI</div>
          <Typography.Title className="hero-title">BHARATMATA INSTITUTE OF IT & TECHNOLOGY</Typography.Title>
          <Typography.Paragraph className="hero-subtitle">
            <strong>A Unite Bharatmata Educational Foundation | ISO 9001: 2008 Certified</strong><br /><br />
            সেরা শিক্ষার সঠিক ঠিকানা BIIT. Skill India অনুমোদিত, ভারত সরকার স্বীকৃত সার্টিফিকেট সর্বত্র গ্রহণ যোগ্য।
          </Typography.Paragraph>
          
          <div className="hero-actions">
            <Button type="primary" size="large" className="animated-btn hero-btn" icon={<FiArrowRight />} href="#courses">
              Explore Courses
            </Button>
            <Button size="large" className="animated-btn secondary-btn hero-btn" icon={<FiPhone />} href="#contact">
              Contact Us
            </Button>
          </div>
        </div>
        <Card className="hero-card floating-card reveal" bordered={false}>
          <div className="course-highlight">
            <FiAward style={{ fontSize: '84px' }} />
            <h3 style={{ fontSize: '38px' }}>SKILL BOOKLET</h3>
            <p style={{ fontSize: '18px' }}>Develop modern computer skills with practical training, expert guidance, and government-recognized certifications.</p>
          </div>
        </Card>
      </section>

      <section id="features" className="site-section reveal">
        <Typography.Title level={2} className="section-heading">Why Choose BIIT?</Typography.Title>
        <Row gutter={[24, 24]} align="stretch">
          {[
            { icon: <FiAward />, title: 'Government Recognized', text: 'ভারত সরকার স্বীকৃত সার্টিফিকেট সর্বত্র গ্রহণ যোগ্য।' },
            { icon: <FiUsers />, title: 'Experienced Faculty', text: 'দীর্ঘ বছরের অভিজ্ঞতা ও সর্বশ্রেষ্ঠ কম্পিউটার সেন্টার এবং অভিজ্ঞ শিক্ষক মন্ডলী।' },
            { icon: <FiBookOpen />, title: 'Extra Classes', text: 'ছাত্র-ছাত্রীদের প্রয়োজন অনুসারে অতিরিক্ত ক্লাসের ব্যবস্থা।' }
          ].map((item, index) => (
            <Col xs={24} md={8} key={item.title} style={{ display: 'flex' }}>
              <Card className="feature-card interactive-card" bordered={false} style={{ width: '100%', display: 'flex', flexDirection: 'column', animationDelay: `${index * 0.1}s` }}>
                <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <div className="feature-icon" style={{ fontSize: '42px' }}>{item.icon}</div>
                  <h3 style={{ fontSize: '24px' }}>{item.title}</h3>
                  <p style={{ fontSize: '18px' }}>{item.text}</p>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </section>

      <section id="courses" className="site-section muted-section reveal">
        <Typography.Title level={2} className="section-heading">Our Professional Courses</Typography.Title>
        <Row gutter={[24, 24]} align="stretch">
          {courses.map((course, index) => (
            <Col xs={24} lg={8} md={12} key={course._id || index} style={{ display: 'flex' }}>
              <Card 
                className="course-card interactive-card" 
                bordered={false} 
                style={{ width: '100%', display: 'flex', flexDirection: 'column', animationDelay: `${index * 0.1}s` }}
              >
                <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <FiBookOpen style={{ fontSize: '38px', color: '#143f75', marginBottom: '20px', transition: 'transform 0.3s ease' }} className="course-icon" />
                  <h3 style={{ fontSize: '22px', marginTop: 0, marginBottom: '16px' }}>{course.title}</h3>
                  <div style={{ marginBottom: '16px' }}>
                    <Tag color="blue" style={{ marginBottom: '8px', fontSize: '15px', padding: '6px 10px', borderRadius: '6px' }}>Duration: {course.duration}</Tag>
                    {course.eligibility && <Tag color="gold" style={{ fontSize: '15px', padding: '6px 10px', borderRadius: '6px' }}>Eligibility: {course.eligibility}</Tag>}
                  </div>
                  <p style={{ color: '#6f7f95', fontSize: '16px', lineHeight: '1.7', flexGrow: 1 }}>{course.desc}</p>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </section>

      <section id="success" className="site-section reveal">
        <Typography.Title level={2} className="section-heading">সাফল্যের প্রতিচ্ছবি... (Success Stories)</Typography.Title>
        
        {/* Right to left scrolling marquee container */}
        <div className="marquee-container">
          <div className="marquee-track">
            {successStories.concat(successStories).map((story, idx) => (
              <div className="marquee-item" key={idx}>
                <Card className="feature-card interactive-card success-story-card" bordered={false} style={{ width: '280px', display: 'flex', flexDirection: 'column', textAlign: 'center', padding: '24px 10px' }}>
                  <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <Avatar size={84} className="success-avatar" icon={<FiStar style={{ fontSize: '36px' }} />} />
                    <h4 style={{ margin: '0 0 12px 0', fontSize: '20px' }}>{story.name}</h4>
                    <p style={{ margin: 0, fontSize: '16px', color: '#143f75', fontWeight: 'bold' }}>{story.role}</p>
                    <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#6f7f95', lineHeight: '1.5' }}>{story.company}</p>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer id="contact" className="site-footer reveal">
        <Row gutter={[32, 32]} style={{ width: '100%' }}>
          <Col xs={24} md={16}>
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ margin: '0 0 14px 0', color: '#fff', fontSize: '32px' }}>BIIT Coaching</h2>
              <p style={{ margin: '8px 0', fontSize: '18px', opacity: 0.9 }}><strong>Corporate Office:</strong> 766, Nabashree Bazar, Nabagram, Garia, Panchapota, Kolkata-152</p>
              <p style={{ margin: '8px 0', fontSize: '18px', opacity: 0.9 }}><strong>Branch Office:</strong> Kalagachia, Hospital Road, Khejuri</p>
            </div>
            <div>
              <p style={{ margin: '8px 0', fontSize: '18px', opacity: 0.9 }}>📞 Phone: 8170059555</p>
              <p style={{ margin: '8px 0', fontSize: '18px', opacity: 0.9 }}>✉️ Email: info@biitedu.in</p>
              <p style={{ margin: '8px 0', fontSize: '18px', opacity: 0.9 }}>🌐 Web: www.biitedu.in</p>
            </div>
          </Col>
          <Col xs={24} md={8} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Button type="primary" size="large" className="footer-btn animated-btn" onClick={() => navigate(isAuthenticated ? '/admin/dashboard' : '/admin')}>
              {isAuthenticated ? 'Go to Dashboard' : 'Go to Admin Panel'}
            </Button>
          </Col>
        </Row>
      </footer>
    </div>
  );
}