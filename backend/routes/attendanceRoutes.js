import express from 'express';
import asyncHandler from 'express-async-handler';
import Attendance from '../models/Attendance.js';
import Student from '../models/Student.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);

router.get('/', asyncHandler(async (req, res) => {
  const { date, student, month, status, search = '' } = req.query;
  const query = {};

  if (student) query.student = student;
  if (status) query.status = status;

  if (date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    query.date = { $gte: start, $lte: end };
  } else if (month) {
    const [year, monthIndex] = month.split('-').map(Number);
    const start = new Date(year, monthIndex - 1, 1);
    const end = new Date(year, monthIndex, 0, 23, 59, 59, 999);
    query.date = { $gte: start, $lte: end };
  }

  const records = await Attendance.find(query).populate('student').sort({ date: -1, createdAt: -1 });

  const filtered = search
    ? records.filter((record) => {
        const haystack = [
          record.student?.name,
          record.student?.regNo,
          record.student?.phone,
          record.student?.batch,
          record.student?.centre,
          record.status,
          record.notes
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        return haystack.includes(String(search).toLowerCase());
      })
    : records;

  res.json(filtered);
}));

router.post('/bulk', asyncHandler(async (req, res) => {
  const { date, records } = req.body;

  if (!date || !Array.isArray(records)) {
    res.status(400);
    throw new Error('Date and attendance records are required.');
  }

  const cleanDate = new Date(date);
  cleanDate.setHours(0, 0, 0, 0);

  const result = [];
  for (const record of records) {
    if (!record.student || !record.status) continue;
    const updated = await Attendance.findOneAndUpdate(
      { student: record.student, date: cleanDate },
      {
        status: record.status,
        notes: record.notes || '',
        markedBy: req.user._id
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).populate('student');
    result.push(updated);
  }

  res.status(201).json(result);
}));

router.get('/sheet/:date', asyncHandler(async (req, res) => {
  const date = new Date(req.params.date);
  date.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  const students = await Student.find({ status: 'Active' }).sort({ name: 1 });
  const existing = await Attendance.find({ date: { $gte: date, $lte: end } });
  const map = new Map(existing.map((item) => [String(item.student), item]));

  const sheet = students.map((student) => ({
    student,
    attendance: map.get(String(student._id)) || null
  }));

  res.json(sheet);
}));

export default router;
