import express from 'express';
import asyncHandler from 'express-async-handler';
import IdCard from '../models/IdCard.js';
import Student from '../models/Student.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { search = '' } = req.query;
    const query = {};

    if (req.user.role === 'FRANCHISE') query.branch = req.user.branch;

    if (search) {
      const regex = new RegExp(String(search).trim(), 'i');
      query.$or = [
        { studentName: regex },
        { regNo: regex },
        { batch: regex }
      ];
    }

    const idCards = await IdCard.find(query).sort({ createdAt: -1 });
    res.json(idCards);
  })
);

router.post(
  '/',
  adminOnly,
  asyncHandler(async (req, res) => {
    if (!req.body || Object.keys(req.body).length === 0) {
      res.status(400);
      throw new Error('No data received. Please check your form payload.');
    }
    
    const payload = { ...req.body };
    if (payload.student) {
      const student = await Student.findById(payload.student);
      if (student) payload.branch = student.branch;
    }

    const idCard = await IdCard.create(payload);
    res.status(201).json(idCard);
  })
);

router.put(
  '/:id',
  adminOnly,
  asyncHandler(async (req, res) => {
    if (!req.body || Object.keys(req.body).length === 0) {
      res.status(400);
      throw new Error('No data received to update.');
    }

    const payload = { ...req.body };
    if (payload.student) {
      const student = await Student.findById(payload.student);
      if (student) payload.branch = student.branch;
    }

    const idCard = await IdCard.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true
    });

    if (!idCard) {
      res.status(404);
      throw new Error('ID Card not found.');
    }

    res.json(idCard);
  })
);

router.delete(
  '/:id',
  adminOnly,
  asyncHandler(async (req, res) => {
    const idCard = await IdCard.findByIdAndDelete(req.params.id);

    if (!idCard) {
      res.status(404);
      throw new Error('ID Card not found.');
    }

    res.json({ message: 'ID Card deleted successfully.' });
  })
);

export default router;