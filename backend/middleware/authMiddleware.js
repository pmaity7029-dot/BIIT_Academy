import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

export const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    res.status(401);
    throw new Error('Not authorized. Token missing.');
  }

  const token = header.split(' ')[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id).select('-password');

  if (!user) {
    res.status(401);
    throw new Error('Not authorized. User not found.');
  }

  req.user = user;
  next();
});

export const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    res.status(403);
    throw new Error('Admin access required.');
  }
  next();
};
