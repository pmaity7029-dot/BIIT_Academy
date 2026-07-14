import express from 'express';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { sendMail } from '../utils/email.js';

const router = express.Router();
router.use(protect, adminOnly);

router.get('/', asyncHandler(async (req, res) => {
  const franchises = await User.find({ role: 'FRANCHISE' }).select('-password').sort({ createdAt: -1 });
  res.json(franchises);
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

export default router;