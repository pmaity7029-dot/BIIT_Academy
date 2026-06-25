import express from 'express';
import asyncHandler from 'express-async-handler';
import IdCard from '../models/IdCard.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);

// 1. Get all saved ID Cards with search filters (Name, RegNo, Batch)
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { search = '' } = req.query;
    const query = {};

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

// 2. Create/Save a new ID Card
router.post(
  '/',
  asyncHandler(async (req, res) => {
    // FAILSAFE: Agar data empty aaye toh clear message dena server crash mat karna
    if (!req.body || Object.keys(req.body).length === 0) {
      res.status(400);
      throw new Error('No data received. Please check your form payload.');
    }

    const idCard = await IdCard.create(req.body);
    res.status(201).json(idCard);
  })
);

// 3. Update an existing ID Card
router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    if (!req.body || Object.keys(req.body).length === 0) {
      res.status(400);
      throw new Error('No data received to update.');
    }

    const idCard = await IdCard.findByIdAndUpdate(req.params.id, req.body, {
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

// 4. Delete an ID Card record
router.delete(
  '/:id',
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