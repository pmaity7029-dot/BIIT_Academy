import express from 'express';
import asyncHandler from 'express-async-handler';
import Student from '../models/Student.js';
import Attendance from '../models/Attendance.js';
import Payment from '../models/Payment.js';
import Certificate from '../models/Certificate.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);

const buildRegex = (value) => new RegExp(String(value || '').trim(), 'i');

router.get('/metrics', asyncHandler(async (req, res) => {
  const [totalStudents, activeStudents, presentToday, certificatesIssued, revenueAgg] = await Promise.all([
    Student.countDocuments(),
    Student.countDocuments({ status: 'Active' }),
    Attendance.countDocuments({
      date: { $gte: startOfToday(), $lt: endOfToday() },
      status: 'Present'
    }),
    Certificate.countDocuments(),
    Payment.aggregate([
      { $match: { paidDate: { $gte: startOfMonth(), $lte: endOfMonth() } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ])
  ]);

  res.json({
    totalStudents,
    activeStudents,
    presentToday,
    certificatesIssued,
    monthlyRevenue: revenueAgg[0]?.total || 0,
    unreadMessages: 0
  });
}));

router.get('/batches/list', asyncHandler(async (req, res) => {
  const batches = await Student.distinct('batch', {
    batch: { $exists: true, $ne: '' }
  });

  res.json(
    batches
      .filter(Boolean)
      .sort((a, b) => String(a).localeCompare(String(b)))
  );
}));

router.get('/', asyncHandler(async (req, res) => {
  const { search = '', status = '', centre = '', batch = '' } = req.query;
  const query = {};

  if (search) {
    const regex = buildRegex(search);

    query.$or = [
      { name: regex },
      { fatherName: regex },
      { regNo: regex },
      { phone: regex },
      { email: regex },
      { centre: regex },
      { batch: regex },
      { status: regex }
    ];
  }

  if (status) query.status = status;
  if (centre) query.centre = buildRegex(centre);
  if (batch) query.batch = buildRegex(batch);

  const students = await Student.find(query).sort({ createdAt: -1 });
  res.json(students);
}));

router.post('/', asyncHandler(async (req, res) => {
  const student = await Student.create(req.body);
  res.status(201).json(student);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);

  if (!student) {
    res.status(404);
    throw new Error('Student not found.');
  }

  const [attendance, payments] = await Promise.all([
    Attendance.find({ student: student._id }).sort({ date: -1 }),
    Payment.find({ student: student._id }).sort({ paidDate: -1 })
  ]);

  const totalAttendance = attendance.length;
  const present = attendance.filter((item) => item.status === 'Present').length;
  const absent = attendance.filter((item) => item.status === 'Absent').length;
  const late = attendance.filter((item) => item.status === 'Late').length;

  res.json({
    student,
    attendanceStats: {
      total: totalAttendance,
      present,
      absent,
      late,
      rate: totalAttendance ? Math.round((present / totalAttendance) * 100) : 0
    },
    attendance,
    payments
  });
}));

router.put('/:id', asyncHandler(async (req, res) => {
  const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!student) {
    res.status(404);
    throw new Error('Student not found.');
  }

  res.json(student);
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const student = await Student.findByIdAndDelete(req.params.id);

  if (!student) {
    res.status(404);
    throw new Error('Student not found.');
  }

  res.json({ message: 'Student deleted successfully.' });
}));

function startOfMonth() {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfMonth() {
  const d = new Date();
  d.setMonth(d.getMonth() + 1, 0);
  d.setHours(23, 59, 59, 999);
  return d;
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfToday() {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

export default router;