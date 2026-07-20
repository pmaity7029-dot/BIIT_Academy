import express from 'express';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import { protect, headAdminOnly } from '../middleware/authMiddleware.js';
import { sendMail } from '../utils/email.js'; // Added email import

const router = express.Router();
router.use(protect, headAdminOnly);

router.get('/', asyncHandler(async (req, res) => {
  const query = { role: 'SUB_ADMIN' };
  if (req.user.actualRole !== 'ADMIN') {
    query.branch = req.user.branch;
  }
  const subAdmins = await User.find(query).select('-password').sort({ createdAt: -1 });
  res.json(subAdmins);
}));

router.post('/', asyncHandler(async (req, res) => {
  const { name, email, password, branch } = req.body;
  
  const userExists = await User.findOne({ email: String(email).toLowerCase() });
  if (userExists) {
    res.status(400);
    throw new Error('Email already exists in the system.');
  }

  const targetBranch = (req.user.actualRole === 'ADMIN' && branch) ? branch : req.user.branch;

  const user = await User.create({
    name,
    email: String(email).toLowerCase(),
    password,
    role: 'SUB_ADMIN',
    branch: targetBranch,
    status: 'Active',
    mustChangePassword: true
  });

  // Automatically Send Email to Sub-Admin with credentials
  await sendMail({
    to: user.email,
    subject: 'Welcome to BIIT - Sub Admin / Teacher Account',
    text: `Hello ${name},\n\nYour account has been created.\nEmail: ${user.email}\nPassword: ${password}\n\nPlease login and change your password.`,
    html: `<p>Hello ${name},</p><p>Your account has been created.</p><p><b>Email:</b> ${user.email}<br/><b>Password:</b> ${password}</p><p>Please login and change your password.</p>`
  });

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    branch: user.branch
  });
}));

router.put('/:id/status', asyncHandler(async (req, res) => {
  const query = { _id: req.params.id, role: 'SUB_ADMIN' };
  if (req.user.actualRole !== 'ADMIN') query.branch = req.user.branch;
  
  const user = await User.findOne(query);
  if (!user) {
    res.status(404);
    throw new Error('Sub-admin / Teacher not found.');
  }

  user.status = req.body.status;
  await user.save();
  res.json({ _id: user._id, name: user.name, status: user.status });
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const query = { _id: req.params.id, role: 'SUB_ADMIN' };
  if (req.user.actualRole !== 'ADMIN') query.branch = req.user.branch;

  const user = await User.findOne(query);
  if (!user) {
    res.status(404);
    throw new Error('Sub-admin / Teacher not found.');
  }
  
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'Sub-admin removed successfully' });
}));

export default router;