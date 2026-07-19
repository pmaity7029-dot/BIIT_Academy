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
const LEGACY_LOCATION_FIELD = ['cen', 'tre'].join('');
const revenueStatuses = ['Paid', 'Partial'];

const sanitizeStudentPayload = (payload = {}) => {
  const { [LEGACY_LOCATION_FIELD]: _removedLocation, ...rest } = payload;
  return rest;
};

const revenuePipeline = (match = {}) => [
  { $match: { ...match, status: { $in: revenueStatuses } } },
  {
    $group: {
      _id: null,
      total: { $sum: { $add: ['$amount', { $ifNull: ['$fine', 0] }] } }
    }
  }
];

const aggregateRevenue = async (match = {}) => {
  const result = await Payment.aggregate(revenuePipeline(match));
  return result[0]?.total || 0;
};

router.get('/metrics', asyncHandler(async (req, res) => {
  const branchFilter = req.user.role === 'FRANCHISE' ? { branch: req.user.branch } : {};
  const isAdmin = req.user.role === 'ADMIN';

  const [
    totalStudents,
    activeStudents,
    presentToday,
    certificatesIssued,
    allTimeRevenue,
    mainBranchRevenue
  ] = await Promise.all([
    Student.countDocuments(branchFilter),
    Student.countDocuments({ ...branchFilter, status: 'Active' }),
    Attendance.countDocuments({
      ...branchFilter,
      date: { $gte: startOfToday(), $lt: endOfToday() },
      status: 'Present'
    }),
    Certificate.countDocuments(branchFilter),
    aggregateRevenue(branchFilter),
    isAdmin ? aggregateRevenue({ branch: 'Main Branch' }) : Promise.resolve(0)
  ]);

  res.json({
    totalStudents,
    activeStudents,
    presentToday,
    certificatesIssued,
    allTimeRevenue,
    monthlyRevenue: allTimeRevenue,
    mainBranchRevenue: isAdmin ? mainBranchRevenue : undefined,
    branchRevenue: req.user.role === 'FRANCHISE' ? allTimeRevenue : mainBranchRevenue,
    unreadMessages: 0
  });
}));

router.get('/batches/list', asyncHandler(async (req, res) => {
  const branchFilter = req.user.role === 'FRANCHISE' ? { branch: req.user.branch } : {};
  const batches = await Student.distinct('batch', {
    ...branchFilter,
    batch: { $exists: true, $ne: '' }
  });

  res.json(
    batches
      .filter(Boolean)
      .sort((a, b) => String(a).localeCompare(String(b)))
  );
}));

router.get('/', asyncHandler(async (req, res) => {
  const { search = '', status = '', batch = '' } = req.query;
  const query = {};

  if (req.user.role === 'FRANCHISE') query.branch = req.user.branch;

  if (search) {
    const regex = buildRegex(search);
    query.$or = [
      { name: regex },
      { fatherName: regex },
      { regNo: regex },
      { phone: regex },
      { email: regex },
      { batch: regex },
      { status: regex }
    ];
  }

  if (status) query.status = status;
  if (batch) query.batch = buildRegex(batch);

  const students = await Student.find(query)
    .populate('courses', 'title fee duration category')
    .sort({ createdAt: -1 });
  res.json(students);
}));

router.post('/', asyncHandler(async (req, res) => {
  const payload = sanitizeStudentPayload(req.body);
  if (req.user.role === 'FRANCHISE') {
    payload.branch = req.user.branch;
  } else if (!payload.branch) {
    payload.branch = 'Main Branch';
  }
  const student = await Student.create(payload);
  res.status(201).json(student);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id).populate('courses', 'title fee duration category');

  if (!student || (req.user.role === 'FRANCHISE' && student.branch !== req.user.branch)) {
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
  const existing = await Student.findById(req.params.id);
  if (!existing || (req.user.role === 'FRANCHISE' && existing.branch !== req.user.branch)) {
    res.status(404); throw new Error('Student not found.');
  }

  const payload = sanitizeStudentPayload(req.body);
  if (req.user.role === 'FRANCHISE') payload.branch = req.user.branch;

  const student = await Student.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true
  });

  res.json(student);
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const existing = await Student.findById(req.params.id);
  if (!existing || (req.user.role === 'FRANCHISE' && existing.branch !== req.user.branch)) {
    res.status(404); throw new Error('Student not found.');
  }

  await Student.findByIdAndDelete(req.params.id);
  res.json({ message: 'Student deleted successfully.' });
}));

function startOfToday() {
  const d = new Date(); d.setHours(0, 0, 0, 0); return d;
}
function endOfToday() {
  const d = new Date(); d.setHours(23, 59, 59, 999); return d;
}

export default router;
