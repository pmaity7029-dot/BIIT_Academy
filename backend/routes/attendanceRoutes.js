import express from 'express';
import asyncHandler from 'express-async-handler';
import Attendance from '../models/Attendance.js';
import Student from '../models/Student.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);

const buildRegex = (value) => new RegExp(String(value || '').trim(), 'i');

const getDayRange = (dateValue) => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return { start: date, end };
};

const buildSheet = async ({ dateValue, batch = '', user }) => {
  const range = getDayRange(dateValue);
  if (!range) {
    const error = new Error('Invalid attendance date.');
    error.statusCode = 400;
    throw error;
  }

  const studentQuery = { status: 'Active' };
  if (user.role === 'FRANCHISE') studentQuery.branch = user.branch;
  if (batch) studentQuery.batch = buildRegex(batch);

  const students = await Student.find(studentQuery).sort({ name: 1 });
  const existing = await Attendance.find({
    date: { $gte: range.start, $lte: range.end }
  });

  const map = new Map(existing.map((item) => [String(item.student), item]));

  return students.map((student) => ({
    student,
    attendance: map.get(String(student._id)) || null
  }));
};

router.get(
  '/sheet/:date',
  asyncHandler(async (req, res) => {
    const sheet = await buildSheet({
      dateValue: req.params.date,
      batch: req.query.batch || '',
      user: req.user
    });
    res.json(sheet);
  })
);

router.get(
  '/sheet',
  asyncHandler(async (req, res) => {
    const sheet = await buildSheet({
      dateValue: req.query.date,
      batch: req.query.batch || '',
      user: req.user
    });
    res.json(sheet);
  })
);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { date, student, month, status, search = '', batch = '' } = req.query;
    const query = {};

    if (req.user.role === 'FRANCHISE') query.branch = req.user.branch;

    if (student) query.student = student;
    if (status) query.status = status;

    if (date) {
      const range = getDayRange(date);
      if (!range) {
        res.status(400); throw new Error('Invalid attendance date.');
      }
      query.date = { $gte: range.start, $lte: range.end };
    } else if (month) {
      const [year, monthIndex] = String(month).split('-').map(Number);
      if (!year || !monthIndex) {
        res.status(400); throw new Error('Invalid attendance month.');
      }
      const start = new Date(year, monthIndex - 1, 1);
      const end = new Date(year, monthIndex, 0, 23, 59, 59, 999);
      query.date = { $gte: start, $lte: end };
    }

    const records = await Attendance.find(query)
      .populate('student')
      .sort({ date: -1, createdAt: -1 });

    const searchText = String(search || '').toLowerCase();
    const batchText = String(batch || '').toLowerCase();

    const filtered = records.filter((record) => {
      if (batchText && !String(record.student?.batch || '').toLowerCase().includes(batchText)) {
        return false;
      }
      if (!searchText) return true;

      const haystack = [
        record.student?.name,
        record.student?.fatherName,
        record.student?.regNo,
        record.student?.phone,
        record.student?.email,
        record.student?.batch,
        record.status,
        record.notes
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(searchText);
    });

    res.json(filtered);
  })
);

router.post(
  '/bulk',
  asyncHandler(async (req, res) => {
    const { date, records } = req.body;

    if (!date || !Array.isArray(records)) {
      res.status(400);
      throw new Error('Date and attendance records are required.');
    }

    const range = getDayRange(date);
    if (!range) {
      res.status(400);
      throw new Error('Invalid attendance date.');
    }

    const result = [];

    for (const record of records) {
      if (!record.student || !record.status) continue;
      
      const studentObj = await Student.findById(record.student);

      const updated = await Attendance.findOneAndUpdate(
        { student: record.student, date: range.start },
        {
          status: record.status,
          notes: record.notes || '',
          performanceRating: record.performanceRating || null,
          markedBy: req.user._id,
          branch: studentObj?.branch || 'Main Branch'
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      ).populate('student');

      result.push(updated);
    }

    res.status(201).json(result);
  })
);

export default router;