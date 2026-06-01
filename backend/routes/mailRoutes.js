import express from 'express';
import asyncHandler from 'express-async-handler';
import MailLog from '../models/MailLog.js';
import Student from '../models/Student.js';
import { sendMail } from '../utils/email.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);

router.get('/', asyncHandler(async (req, res) => {
  res.json(await MailLog.find().populate('sentBy', 'name').sort({ createdAt: -1 }));
}));

router.post('/send', asyncHandler(async (req, res) => {
  const { recipientType, emails = [], subject, body } = req.body;
  let recipients = emails;

  if (recipientType === 'all-students') {
    const students = await Student.find({ email: { $exists: true, $ne: '' } });
    recipients = students.map((student) => student.email);
  }

  recipients = [...new Set(recipients.filter(Boolean))];

  if (!recipients.length) {
    res.status(400);
    throw new Error('At least one recipient email is required.');
  }

  let status = 'Sent';
  try {
    const result = await sendMail({
      to: recipients.join(','),
      subject,
      text: body,
      html: body.replaceAll('\n', '<br />')
    });
    if (result?.skipped) status = 'Skipped';
  } catch (error) {
    status = 'Failed';
  }

  const log = await MailLog.create({ recipients, subject, body, status, sentBy: req.user._id });
  res.status(201).json(log);
}));

export default router;
