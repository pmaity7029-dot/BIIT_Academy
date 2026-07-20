import express from 'express';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Payment from '../models/Payment.js';
import Attendance from '../models/Attendance.js';
import Certificate from '../models/Certificate.js';
import { protect, superAdminOnly } from '../middleware/authMiddleware.js';
import { sendMail } from '../utils/email.js';

const router = express.Router();
router.use(protect, superAdminOnly);

router.get('/', asyncHandler(async (req, res) => {
  const franchises = await User.find({ role: 'FRANCHISE' }).select('-password').sort({ createdAt: -1 });
  res.json(franchises);
}));

router.get('/:id/profile', asyncHandler(async (req, res) => {
  const franchise = await User.findById(req.params.id).select('-password');

  if (!franchise || franchise.role !== 'FRANCHISE') {
    res.status(404);
    throw new Error('Franchise not found');
  }

  const branchFilter = { branch: franchise.branch };

  const [
    totalStudents,
    activeStudents,
    presentToday,
    certificatesIssued,
    revenueAgg,
    recentStudents,
    recentPayments
  ] = await Promise.all([
    Student.countDocuments(branchFilter),
    Student.countDocuments({ ...branchFilter, status: 'Active' }),
    Attendance.countDocuments({
      ...branchFilter,
      date: { $gte: startOfToday(), $lt: endOfToday() },
      status: 'Present'
    }),
    Certificate.countDocuments(branchFilter),
    Payment.aggregate([
      { $match: { ...branchFilter, status: { $in: ['Paid', 'Partial'] } } },
      {
        $group: {
          _id: null,
          total: { $sum: { $add: ['$amount', { $ifNull: ['$fine', 0] }] } }
        }
      }
    ]),
    Student.find(branchFilter).sort({ createdAt: -1 }).limit(8),
    Payment.find(branchFilter).populate('student').sort({ paidDate: -1 }).limit(8)
  ]);

  res.json({
    franchise,
    metrics: {
      totalStudents,
      activeStudents,
      presentToday,
      certificatesIssued,
      totalRevenue: revenueAgg[0]?.total || 0
    },
    recentStudents,
    recentPayments
  });
}));

router.post('/', asyncHandler(async (req, res) => {
  const { centreName, authorizedPersonName, email, password } = req.body;

  const userExists = await User.findOne({ email: String(email).toLowerCase() });
  if (userExists) {
    res.status(400);
    throw new Error('Email already exists in the system.');
  }

  const user = await User.create({
    name: authorizedPersonName,
    email: String(email).toLowerCase(),
    password,
    role: 'FRANCHISE',
    branch: centreName,
    mustChangePassword: true
  });

  await sendMail({
    to: user.email,
    subject: 'Welcome to BIIT - Franchise Account',
    text: `Hello ${authorizedPersonName},\n\nYour franchise account for ${centreName} has been created.\nEmail: ${user.email}\nPassword: ${password}\n\nPlease login and change your password.`,
    html: `<p>Hello ${authorizedPersonName},</p><p>Your franchise account for <b>${centreName}</b> has been created.</p><p><b>Email:</b> ${user.email}<br/><b>Password:</b> ${password}</p><p>Please login and change your password.</p>`
  });

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    branch: user.branch,
    role: user.role
  });
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user || user.role !== 'FRANCHISE') {
    res.status(404);
    throw new Error('Franchise not found');
  }
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'Franchise removed successfully' });
}));

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