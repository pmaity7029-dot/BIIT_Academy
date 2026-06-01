import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import React from "react";

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

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

const GuestRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Website />} />

        <Route
          path="/admin/login"
          element={
            <GuestRoute>
              <AdminLogin />
            </GuestRoute>
          }
        />

        <Route path="/admin/reset-password/:token" element={<ResetPassword />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="students" element={<Students />} />
          <Route path="students/:id" element={<StudentDetails />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="performance" element={<Performance />} />
          <Route path="courses" element={<Courses />} />
          <Route path="payments" element={<Payments />} />
          <Route path="certificates" element={<Certificates />} />
          <Route path="messages" element={<Messages />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}