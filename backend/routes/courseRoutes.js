import express from 'express';
import asyncHandler from 'express-async-handler';
import Course from '../models/Course.js';
import Batch from '../models/Batch.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);

const buildSearchRegex = (search) => new RegExp(String(search || '').trim(), 'i');

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

router.post('/', asyncHandler(async (req, res) => {
  res.status(201).json(await Course.create(req.body));
}));

router.put('/:id', asyncHandler(async (req, res) => {
  const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!course) {
    res.status(404);
    throw new Error('Course not found.');
  }
  res.json(course);
}));

router.delete('/:id', asyncHandler(async (req, res) => {
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
      { centre: regex },
      { schedule: regex }
    ];
  }

  res.json(await Batch.find(query).populate('course').sort({ createdAt: -1 }));
}));

router.post('/batches', asyncHandler(async (req, res) => {
  res.status(201).json(await Batch.create(req.body));
}));

router.put('/batches/:id', asyncHandler(async (req, res) => {
  const batch = await Batch.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('course');
  if (!batch) {
    res.status(404);
    throw new Error('Batch not found.');
  }
  res.json(batch);
}));

router.delete('/batches/:id', asyncHandler(async (req, res) => {
  const batch = await Batch.findByIdAndDelete(req.params.id);
  if (!batch) {
    res.status(404);
    throw new Error('Batch not found.');
  }
  res.json({ message: 'Batch deleted successfully.' });
}));

export default router;
