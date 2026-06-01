# BIIT Coaching MERN Software

A custom MERN stack coaching management system built with React, Ant Design, React Icons, Express, MongoDB, JWT authentication, password reset link support, student enrolment, attendance, performance, courses, batches, payment receipts, premium certificates, and mail communication.

## Main Features

- Public coaching advertisement page at `http://localhost:3000/`
- Admin login page at `http://localhost:3000/admin`
- Admin password reset using frontend reset link sent by email
- Dashboard with total students, active students, attendance, revenue, certificates, and messages
- Student enrolment with name, father's name, DOB, gender, phone, emergency contact, email, centre, batch, address, and enrolled date
- Student detail view with attendance summary and payment history
- Attendance marking and history filters by date and month
- Performance section with attendance rate and fee paid overview
- Courses and batches management
- Payment receipt generation with print option
- Premium certificate generation with print option
- Mail communication section with logs

## Tech Stack

- Frontend: React, Vite, Ant Design, React Icons, Axios, React Router, Dayjs
- Backend: Node.js, Express.js, MongoDB, Mongoose, JWT, Bcrypt, Nodemailer

## Folder Structure

```txt
biit-coaching-mern/
  backend/
  frontend/
  README.md
```

## Setup Instructions

### 1. Install MongoDB

Install MongoDB locally or use MongoDB Atlas. For local MongoDB, keep it running on:

```txt
mongodb://127.0.0.1:27017
```

### 2. Backend Setup

Open a terminal:

```bash
cd backend
cp .env.example .env
npm install
npm run seed
npm run dev
```

Default backend URL:

```txt
http://localhost:5000
```

Default seeded admin login:

```txt
Email: admin@biit.in
Password: Admin@12345
```

### 3. Frontend Setup

Open another terminal:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend URL:

```txt
http://localhost:3000
```

Admin login URL:

```txt
http://localhost:3000/admin
```

### 4. Email Password Reset Setup

Edit `backend/.env` and add real SMTP values. For Gmail, create an app password and use it as `SMTP_PASS`.

```env
MAIL_FROM=BIIT Admin <no-reply@biit.in>
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
FRONTEND_URL=http://localhost:3000
```

If SMTP is not configured, the backend will log mail preview details in the terminal. In development, the reset endpoint also returns the reset link.

## Important Commands

Backend:

```bash
npm run dev
npm run seed
npm start
```

Frontend:

```bash
npm run dev
npm run build
npm run preview
```

## Notes

- The UI follows the uploaded admin panel reference but uses a cleaner layout and React Icons instead of emoji icons.
- Payment receipts and certificates are printable through the browser print dialog.
- You can extend the backend with file upload, WhatsApp notification, role-based staff management, and PDF export later.
