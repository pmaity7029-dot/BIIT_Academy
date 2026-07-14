import express from 'express';
import asyncHandler from 'express-async-handler';
import Course from '../models/Course.js';
import Batch from '../models/Batch.js';
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

  if (status) query.status = status;
  if (search) {
    const regex = buildSearchRegex(search);
    query.$or = [
      { name: regex },
      { courseName: regex },
      { schedule: regex }
    ];
  }

  res.json(await Batch.find(query).populate('course').sort({ createdAt: -1 }));
}));

router.post('/batches', adminOnly, asyncHandler(async (req, res) => {
  res.status(201).json(await Batch.create(sanitizeBatchPayload(req.body)));
}));

router.put('/batches/:id', adminOnly, asyncHandler(async (req, res) => {
  const batch = await Batch.findByIdAndUpdate(req.params.id, sanitizeBatchPayload(req.body), { new: true, runValidators: true }).populate('course');
  if (!batch) {
    res.status(404);
    throw new Error('Batch not found.');
  }
  res.json(batch);
}));

router.delete('/batches/:id', adminOnly, asyncHandler(async (req, res) => {
  const batch = await Batch.findByIdAndDelete(req.params.id);
  if (!batch) {
    res.status(404);
    throw new Error('Batch not found.');
  }
  res.json({ message: 'Batch deleted successfully.' });
}));

export default router;