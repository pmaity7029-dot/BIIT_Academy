import express from 'express';
import crypto from 'crypto';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import { generateToken } from '../utils/token.js';
import { sendMail } from '../utils/email.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: String(email || '').toLowerCase() });
  if (!user || !(await user.matchPassword(password || ''))) {
    res.status(401);
    throw new Error('Invalid email or password.');
  }

  res.json({
    token: generateToken(user._id),
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      branch: user.branch
    }
  });
}));

router.get('/me', protect, asyncHandler(async (req, res) => {
  res.json({
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    branch: req.user.branch
  });
}));

router.post('/forgot-password', asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: String(email || '').toLowerCase() });

  if (!user) {
    return res.json({ message: 'If the email exists, a reset link has been sent.' });
  }

  const rawToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  user.resetPasswordExpires = new Date(Date.now() + 1000 * 60 * 30);
  await user.save();

  const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/reset-password/${rawToken}`;

  await sendMail({
    to: user.email,
    subject: 'BIIT Admin Password Reset',
    text: `Open this link to reset your BIIT admin password: ${resetLink}`,
    html: `<p>Open this link to reset your BIIT admin password:</p><p><a href="${resetLink}">${resetLink}</a></p><p>This link expires in 30 minutes.</p>`
  });

  res.json({ message: 'If the email exists, a reset link has been sent.', resetLink: process.env.NODE_ENV === 'production' ? undefined : resetLink });
}));

router.post('/reset-password/:token', asyncHandler(async (req, res) => {
  const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({
    resetPasswordToken: hashed,
    resetPasswordExpires: { $gt: new Date() }
  });

  if (!user) {
    res.status(400);
    throw new Error('Reset link is invalid or expired.');
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.json({ message: 'Password reset successfully. Please login with the new password.' });
}));

export default router;