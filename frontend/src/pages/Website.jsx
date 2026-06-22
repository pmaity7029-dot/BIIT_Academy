import { Button, Card, Col, Row, Typography, Tag, Avatar } from 'antd';
import React, { useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { 
  FiArrowRight, FiAward, FiBookOpen, FiMonitor, 
  FiPhone, FiUsers, FiStar 
} from 'react-icons/fi';

export default function Website() {
  const navigate = useNavigate();

  // Scroll Reveal Animation Logic
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

  const courses = [
    {
      id: 1,
      title: "Certificate in Computer Application (C.C.A)",
      duration: "6 Months / 120 Hrs (Fast Track)",
      eligibility: "10th STANDARD",
      desc: "Computer Fundamentals, MS-DOS, Windows (7,10,11), MS-Office (Word, Excel, PowerPoint), Basic Hardware, Concept of software and computer Languages. Internet Browsing, Upload, Download, Email creation, Compose mail, Send mail, English & Bengali Typing."
    },
    {
      id: 2,
      title: "Diploma in Computer Application (D.C.A) + Tally (Basic)",
      duration: "12 Months / 240 Hrs (Fast Track)",
      eligibility: "10th STANDARD",
      desc: "Content of C.C.A + Concept of RDMS and MS-access, Basics of Visual Basic, HTML, Online Data entry. Tally Erp 9, Tally prime (Accounting Fundamentals, Voucher Entries, Inventory Management, ledger setup, Trial Balance, P&L, Balance Sheets, GST and Payroll basics)."
    },
    {
      id: 3,
      title: "Advanced Diploma in Computer Application + Tally (Professional)",
      duration: "18 Months / 360 Hrs",
      eligibility: "12th STANDARD",
      desc: "Content of D.C.A + Bio-data & CV making, GST Setup & Configuration, GST Returns Filing (GSTR-1, GSTR-3B) & E-Way Bills, TDS/TCS basics, Bank Reconciliation, Online Banking, Budgets, Financial Statements, Data Backup, Audit, Salary Structures, PF/ESI, MIS reports."
    },
    {
      id: 4,
      title: "Diploma in Desktop Publishing Professional (D.D.P.P)",
      duration: "12 Months / 240 Hrs (Fast Track)",
      eligibility: "10th STANDARD",
      desc: "Computer Fundamentals, MS-DOS, Windows, MS-Office (Word, Excel, PowerPoint), Internet & e-mail, Adobe Photoshop, Page Maker, Corel Draw."
    },
    {
      id: 5,
      title: "Diploma in Hardware and Networking",
      duration: "12 Months / 240 Hrs (Fast Track)",
      eligibility: "12th Computer knowledge",
      desc: "PC Hardware, Networking, Laptops, Printers, Windows 7/10/11, Linux OS (Fedora, Ubuntu, RedHat), Modules of C.C.A."
    },
    {
      id: 6,
      title: "Basic Python Concept & Programming",
      duration: "6 Months / 120 Hrs",
      eligibility: "10th STANDARD",
      desc: "Introduction to Programming, Setting up the Environment, Basic Syntax, Variables, Basic Data Types, Input and Output, Conditional Statements, Loops, Lists, Tuples, File Operations, OOP Introduction, Polymorphism and Encapsulation etc."
    },
    {
      id: 7,
      title: "Diploma in Animation and Multimedia",
      duration: "18 Months / 360 Hrs",
      eligibility: "12th Computer knowledge",
      desc: "Computer basics, Fundamental of Animation, 2D & 3D animation, digital art, storyboarding. Core skills in 2D/3D modeling, texturing, rigging, lighting (Maya, After Effects, Photoshop). Sound design, video editing, game/VFX production for professional portfolios."
    },
    {
      id: 8,
      title: "Diploma in Graphic Design & Video Editing",
      duration: "18 Months / 360 Hrs",
      eligibility: "12th Computer knowledge",
      desc: "Introduction to computer, Design fundamentals, image editing (Photoshop/Lightroom), video editing (Premiere Pro/Resolve), color correction/grading, motion graphics (After Effects), sound design, storytelling and post-production workflow."
    },
    {
      id: 9,
      title: "Certified Industrial Accountant (CIA)",
      duration: "18 Months / 360 Hrs",
      eligibility: "12th Computer knowledge",
      desc: "Fundamental of Accounts with Bookkeeping, Business Fundamentals Accounting, Business Taxation Fundamentals, Analysis of Financial Statements, Introduction To Financial Markets, Applied Statutory Compliance."
    }
  ];

  const successStories = [
    { name: "Surajit Bera", role: "Maintenance Engineer", company: "Jahanabad Royal Infrastructure Ltd (Kolkata)" },
    { name: "Sadhan Bhunia", role: "Manager", company: "Khejuri SKUS Ltd." },
    { name: "Supriti Karan", role: "GDS ABPM India", company: "Kamarda Postal Department" },
    { name: "Surya Kanta Gayen", role: "Restaurant Captain", company: "Bengaluru" },
    { name: "Soumya Kanti Maity", role: "Tax consultant (freelance)", company: "Navi Mumbai" },
    { name: "Nibedita Sasmal", role: "GDS ABPM (TAKAPURA BO)", company: "Takapura, Purba Medinipur" }
  ];

  return (
    <div className="site-page">
      <header className="site-header">
        <div className="site-brand"><FiMonitor /> <span>BIIT</span></div>
        <nav>
          <a href="#about" className="nav-link">About</a>
          <a href="#courses" className="nav-link">Courses</a>
          <a href="#success" className="nav-link">Success Stories</a>
          <a href="#contact" className="nav-link">Contact</a>
          <Button type="primary" size="large" className="nav-btn" onClick={() => navigate('/admin')}>Admin Login</Button>
        </nav>
      </header>

      <section className="hero-section" id="about">
        <div className="hero-copy reveal">
          <div className="eyebrow" style={{ fontSize: '16px', padding: '10px 20px' }}>Welcome to The era of AI</div>
          <Typography.Title className="hero-title">BHARATMATA INSTITUTE OF IT & TECHNOLOGY</Typography.Title>
          <Typography.Paragraph className="hero-subtitle">
            <strong>A Unite Bharatmata Educational Foundation | ISO 9001: 2008 Certified</strong><br /><br />
            সেরা শিক্ষার সঠিক ঠিকানা BIIT. Skill India অনুমোদিত, ভারত সরকার স্বীকৃত সার্টিফিকেট সর্বত্র গ্রহণ যোগ্য।
          </Typography.Paragraph>
          
          <div className="hero-actions">
            <Button type="primary" size="large" className="animated-btn" icon={<FiArrowRight />} href="#courses">Explore Courses</Button>
            <Button size="large" className="animated-btn secondary-btn" icon={<FiPhone />} href="#contact">Contact Us</Button>
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
            { icon: <FiBookOpen />, title: 'Extra Classes', text: 'ছাত্র-ছাত্রীদের প্রয়োজন অনুসারে অতিরিক্ত ক্লাসের ব্যবস্থা।' }
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
            <Col xs={24} lg={8} md={12} key={course.id} style={{ display: 'flex' }}>
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
                    <Tag color="gold" style={{ fontSize: '15px', padding: '6px 10px', borderRadius: '6px' }}>Eligibility: {course.eligibility}</Tag>
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
        <Row gutter={[24, 24]} align="stretch">
          {successStories.map((story, idx) => (
            <Col xs={24} sm={12} md={8} lg={4} key={idx} style={{ display: 'flex' }}>
              <Card className="feature-card interactive-card" bordered={false} style={{ width: '100%', display: 'flex', flexDirection: 'column', textAlign: 'center', padding: '24px 10px', animationDelay: `${idx * 0.1}s` }}>
                <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                  <Avatar size={84} className="success-avatar" icon={<FiStar style={{ fontSize: '36px' }} />} />
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '20px' }}>{story.name}</h4>
                  <p style={{ margin: 0, fontSize: '16px', color: '#143f75', fontWeight: 'bold' }}>{story.role}</p>
                  <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#6f7f95', lineHeight: '1.5' }}>{story.company}</p>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
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
            <Button type="primary" size="large" className="footer-btn animated-btn" onClick={() => navigate('/admin')}>
              Go to Admin Panel
            </Button>
          </Col>
        </Row>
      </footer>
    </div>
  );
}