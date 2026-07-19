import express from 'express';
import asyncHandler from 'express-async-handler';
import Payment from '../models/Payment.js';
import Setting from '../models/Setting.js';
import Student from '../models/Student.js';
import Batch from '../models/Batch.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);

router.get('/settings', asyncHandler(async (req, res) => {
  let setting = await Setting.findOne();
  if (!setting) {
    setting = await Setting.create({ perDayFine: 10 });
  }
  res.json(setting);
}));

router.put('/settings', asyncHandler(async (req, res) => {
  let setting = await Setting.findOne();
  if (!setting) {
    setting = await Setting.create({ perDayFine: req.body.perDayFine || 0 });
  } else {
    setting.perDayFine = req.body.perDayFine || 0;
    await setting.save();
  }
  res.json(setting);
}));

router.get('/dues', asyncHandler(async (req, res) => {
  const { month, status, batch, search } = req.query; 

  if (!month) {
    res.status(400); 
    throw new Error('Month parameter is required (YYYY-MM)');
  }

  const [yearStr, monthStr] = month.split('-');
  const year = parseInt(yearStr, 10);
  const monthIndex = parseInt(monthStr, 10) - 1;

  const dueMonthDate = new Date(year, monthIndex, 5);
  dueMonthDate.setHours(23, 59, 59, 999);
  
  const today = new Date();
  let daysLate = 0;
  if (today > dueMonthDate) {
    daysLate = Math.floor((today - dueMonthDate) / (1000 * 60 * 60 * 24));
  }

  let setting = await Setting.findOne();
  const perDayFine = setting ? setting.perDayFine : 10;

  const studentQuery = { status: 'Active' };
  if (req.user.role === 'FRANCHISE') studentQuery.branch = req.user.branch;
  if (batch) studentQuery.batch = new RegExp(batch.trim(), 'i');

  let activeStudents = await Student.find(studentQuery).sort({ name: 1 });

  if (search) {
    const s = search.toLowerCase();
    activeStudents = activeStudents.filter(st =>
      (st.name && st.name.toLowerCase().includes(s)) ||
      (st.regNo && st.regNo.toLowerCase().includes(s)) ||
      (st.phone && st.phone.toLowerCase().includes(s))
    );
  }

  const payments = await Payment.find({ month }).populate('student');
  const paidMap = {};
  payments.forEach(p => {
    if (p.student) paidMap[p.student._id.toString()] = p;
  });

  const batches = await Batch.find().populate('course');
  const batchFeeMap = {};
  batches.forEach(b => {
    batchFeeMap[b.name] = b.course?.fee || 0;
  });

  let results = activeStudents.map(student => {
    const payment = paidMap[student._id.toString()];
    const isPaid = payment && payment.status === 'Paid';
    const baseFee = student.installmentFeePerMonth || batchFeeMap[student.batch] || 0;

    let fineAmount = 0;
    if (payment) {
      fineAmount = payment.fine || 0;
    } else if (daysLate > 0) {
      fineAmount = daysLate * perDayFine;
    }

    return {
      key: student._id,
      student,
      baseFee,
      amountPaid: payment ? payment.amount : 0,
      fine: fineAmount,
      totalAmount: payment ? (payment.amount + payment.fine) : (baseFee + fineAmount),
      status: isPaid ? 'Paid' : (payment ? payment.status : 'Due'),
      paymentDate: payment ? payment.paidDate : null,
      receiptNo: payment ? payment.receiptNo : null,
      month,
      daysLate: !payment && daysLate > 0 ? daysLate : 0
    };
  });

  if (status) {
    results = results.filter(r => r.status === status);
  }

  res.json(results);
}));

router.get('/', asyncHandler(async (req, res) => {
  const { search = '', mode = '', status = '' } = req.query;

  const query = {};
  if (req.user.role === 'FRANCHISE') query.branch = req.user.branch;
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
  const student = await Student.findById(req.body.student);
  const payment = await Payment.create({ 
    ...req.body, 
    branch: student?.branch || 'Main Branch', 
    collectedBy: req.user._id 
  });
  const populated = await Payment.findById(payment._id).populate('student').populate('collectedBy', 'name');
  res.status(201).json(populated);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id).populate('student').populate('collectedBy', 'name');
  if (!payment || (req.user.role === 'FRANCHISE' && payment.branch !== req.user.branch)) {
    res.status(404);
    throw new Error('Payment not found.');
  }
  res.json(payment);
}));

router.put('/:id', asyncHandler(async (req, res) => {
  const existing = await Payment.findById(req.params.id);
  if (!existing || (req.user.role === 'FRANCHISE' && existing.branch !== req.user.branch)) {
    res.status(404); throw new Error('Payment not found.');
  }

  const payment = await Payment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    .populate('student')
    .populate('collectedBy', 'name');

  res.json(payment);
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const existing = await Payment.findById(req.params.id);
  if (!existing || (req.user.role === 'FRANCHISE' && existing.branch !== req.user.branch)) {
    res.status(404); throw new Error('Payment not found.');
  }

  await Payment.findByIdAndDelete(req.params.id);
  res.json({ message: 'Payment deleted successfully.' });
}));

export default router;
