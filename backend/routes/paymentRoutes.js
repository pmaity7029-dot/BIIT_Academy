import express from 'express';
import asyncHandler from 'express-async-handler';
import Payment from '../models/Payment.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);

router.get('/', asyncHandler(async (req, res) => {
  const { search = '', mode = '', status = '' } = req.query;

  const query = {};
  if (mode) query.mode = mode;
  if (status) query.status = status;

  const payments = await Payment.find(query)
    .populate('student')
    .populate('collectedBy', 'name')
    .sort({ paidDate: -1 });

  const filtered = search
    ? payments.filter((payment) => {
        const haystack = [
          payment.receiptNo,
          payment.student?.name,
          payment.student?.regNo,
          payment.student?.phone,
          payment.student?.email,
          payment.month,
          payment.mode,
          payment.status,
          payment.description
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        return haystack.includes(String(search).toLowerCase());
      })
    : payments;

  res.json(filtered);
}));

router.post('/', asyncHandler(async (req, res) => {
  const payment = await Payment.create({ ...req.body, collectedBy: req.user._id });
  const populated = await Payment.findById(payment._id).populate('student').populate('collectedBy', 'name');
  res.status(201).json(populated);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id).populate('student').populate('collectedBy', 'name');
  if (!payment) {
    res.status(404);
    throw new Error('Payment not found.');
  }
  res.json(payment);
}));

router.put('/:id', asyncHandler(async (req, res) => {
  const payment = await Payment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    .populate('student')
    .populate('collectedBy', 'name');

  if (!payment) {
    res.status(404);
    throw new Error('Payment not found.');
  }

  res.json(payment);
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const payment = await Payment.findByIdAndDelete(req.params.id);
  if (!payment) {
    res.status(404);
    throw new Error('Payment not found.');
  }
  res.json({ message: 'Payment deleted successfully.' });
}));

export default router;
