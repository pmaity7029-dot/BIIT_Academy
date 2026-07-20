import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import React from 'react';

import Website from './pages/Website.jsx';
import AdminLogin from './pages/AdminLogin.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import DashboardLayout from './components/DashboardLayout.jsx';

import Dashboard from './pages/Dashboard.jsx';
import Students from './pages/Students.jsx';
import StudentDetails from './pages/StudentDetails.jsx';
import Attendance from './pages/Attendance.jsx';
import Performance from './pages/Performance.jsx';
import Courses from './pages/Courses.jsx';
import Payments from './pages/Payments.jsx';
import Certificates from './pages/Certificates.jsx';
import Messages from './pages/Messages.jsx';
import IdCards from './pages/IdCards.jsx';
import Franchises from './pages/Franchises.jsx';
import SubAdmins from './pages/SubAdmins.jsx';
import WebsiteEditor from './pages/WebsiteEditor.jsx';

const routerFutureFlags = {
  v7_startTransition: true,
  v7_relativeSplatPath: true
};

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  return children;
};

const GuestRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/admin/dashboard" replace />;
  return children;
};

export default function App() {
  return (
    <BrowserRouter future={routerFutureFlags}>
      <Routes>
        <Route path="/" element={<Website />} />

        <Route path="/admin/login" element={<GuestRoute><AdminLogin /></GuestRoute>} />
        <Route path="/admin/reset-password/:token" element={<ResetPassword />} />

        <Route path="/admin" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="students" element={<Students />} />
          <Route path="students/:id" element={<StudentDetails />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="performance" element={<Performance />} />
          <Route path="courses" element={<Courses />} />
          <Route path="payments" element={<Payments />} />
          <Route path="certificates" element={<Certificates />} />
          <Route path="id-cards" element={<IdCards />} />
          <Route path="messages" element={<Messages />} />
          <Route path="franchises" element={<Franchises />} />
          <Route path="sub-admins" element={<SubAdmins />} />
          <Route path="website-editor" element={<WebsiteEditor />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}