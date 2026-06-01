import express from 'express';
import asyncHandler from 'express-async-handler';
import Attendance from '../models/Attendance.js';
import Payment from '../models/Payment.js';
import Student from '../models/Student.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);

router.get('/overview', asyncHandler(async (req, res) => {
  const students = await Student.find({ status: 'Active' }).sort({ name: 1 });
  const attendance = await Attendance.find().populate('student');
  const payments = await Payment.find().populate('student');

  const rows = students.map((student) => {
    const studentAttendance = attendance.filter((item) => String(item.student?._id) === String(student._id));
    const present = studentAttendance.filter((item) => item.status === 'Present').length;
    const late = studentAttendance.filter((item) => item.status === 'Late').length;
    const absent = studentAttendance.filter((item) => item.status === 'Absent').length;
    const total = studentAttendance.length;
    const paid = payments
      .filter((payment) => String(payment.student?._id) === String(student._id))
      .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

    return {
      student,
      present,
      late,
      absent,
      total,
      attendanceRate: total ? Math.round((present / total) * 100) : 0,
      paid
    };
  });

  res.json(rows);
}));

export default router;
