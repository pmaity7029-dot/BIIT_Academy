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

  if (user.status === 'Inactive') {
    res.status(401);
    throw new Error('Your account is deactivated. Contact your Head Admin.');
  }

  req.user = user;
  req.user.actualRole = user.role;

  // Trick: Make Sub Admin act like their Branch Head for all normal routes
  if (user.role === 'SUB_ADMIN') {
    req.user.role = user.branch === 'Main Branch' ? 'ADMIN' : 'FRANCHISE';
  }

  next();
});

export const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    res.status(403);
    throw new Error('Admin access required.');
  }
  next();
};

export const superAdminOnly = (req, res, next) => {
  const actualRole = req.user.actualRole || req.user.role;
  if (!req.user || actualRole !== 'ADMIN') {
    res.status(403);
    throw new Error('Super Admin access required.');
  }
  next();
};

export const headAdminOnly = (req, res, next) => {
  const actualRole = req.user.actualRole || req.user.role;
  if (!req.user || (actualRole !== 'ADMIN' && actualRole !== 'FRANCHISE')) {
    res.status(403);
    throw new Error('Branch Head access required.');
  }
  next();
};