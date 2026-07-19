import express from 'express';
import asyncHandler from 'express-async-handler';
import Course from '../models/Course.js';
import Batch from '../models/Batch.js';
import Student from '../models/Student.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);

const buildSearchRegex = (search) => new RegExp(String(search || '').trim(), 'i');
const LEGACY_LOCATION_FIELD = ['cen', 'tre'].join('');

const sanitizeBatchPayload = (payload = {}) => {
  const { [LEGACY_LOCATION_FIELD]: _removedLocation, ...rest } = payload;
  return rest;
};

router.get('/', asyncHandler(async (req, res) => {
  const { search = '', status = '' } = req.query;
  const query = {};

  if (status) query.status = status;
  if (search) {
    const regex = buildSearchRegex(search);
    query.$or = [
      { title: regex },
      { category: regex },
      { duration: regex },
      { description: regex }
    ];
  }

  res.json(await Course.find(query).sort({ createdAt: -1 }));
}));

router.post('/', adminOnly, asyncHandler(async (req, res) => {
  res.status(201).json(await Course.create(req.body));
}));

router.put('/:id', adminOnly, asyncHandler(async (req, res) => {
  const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!course) {
    res.status(404);
    throw new Error('Course not found.');
  }
  res.json(course);
}));

router.delete('/:id', adminOnly, asyncHandler(async (req, res) => {
  const course = await Course.findByIdAndDelete(req.params.id);
  if (!course) {
    res.status(404);
    throw new Error('Course not found.');
  }
  res.json({ message: 'Course deleted successfully.' });
}));

router.get('/batches/list', asyncHandler(async (req, res) => {
  const { search = '', status = '' } = req.query;
  const query = {};

  // Restrict to franchise branch if user is a franchise
  if (req.user.role === 'FRANCHISE') query.branch = req.user.branch;

  if (status) query.status = status;
  if (search) {
    const regex = buildSearchRegex(search);
    query.$or = [
      { name: regex },
      { courseName: regex },
      { schedule: regex }
    ];
  }

  const batches = await Batch.find(query).populate('course').sort({ createdAt: -1 });

  // Calculate students per batch for overview
  const batchesWithCount = await Promise.all(batches.map(async (batch) => {
    const studentQuery = { batch: batch.name };
    if (req.user.role === 'FRANCHISE') studentQuery.branch = req.user.branch;
    else if (batch.branch) studentQuery.branch = batch.branch;

    const studentCount = await Student.countDocuments(studentQuery);
    return { ...batch.toObject(), studentCount };
  }));

  res.json(batchesWithCount);
}));

router.post('/batches', asyncHandler(async (req, res) => {
  const payload = sanitizeBatchPayload(req.body);
  
  if (req.user.role === 'FRANCHISE') {
    payload.branch = req.user.branch;
  } else if (!payload.branch) {
    payload.branch = 'Main Branch';
  }
  
  res.status(201).json(await Batch.create(payload));
}));

router.put('/batches/:id', asyncHandler(async (req, res) => {
  const existing = await Batch.findById(req.params.id);
  if (!existing || (req.user.role === 'FRANCHISE' && existing.branch !== req.user.branch)) {
    res.status(404);
    throw new Error('Batch not found or unauthorized.');
  }

  const payload = sanitizeBatchPayload(req.body);
  if (req.user.role === 'FRANCHISE') payload.branch = req.user.branch;

  const batch = await Batch.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true }).populate('course');
  res.json(batch);
}));

router.delete('/batches/:id', asyncHandler(async (req, res) => {
  const existing = await Batch.findById(req.params.id);
  if (!existing || (req.user.role === 'FRANCHISE' && existing.branch !== req.user.branch)) {
    res.status(404);
    throw new Error('Batch not found or unauthorized.');
  }
  await Batch.findByIdAndDelete(req.params.id);
  res.json({ message: 'Batch deleted successfully.' });
}));

export default router;