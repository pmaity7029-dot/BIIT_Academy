import express from 'express';
import asyncHandler from 'express-async-handler';
import MailLog from '../models/MailLog.js';
import Student from '../models/Student.js';
import { sendMail } from '../utils/email.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);

const buildRegex = (value) => new RegExp(String(value || '').trim(), 'i');
const validStudentStatuses = ['Active', 'Inactive', 'Completed'];

const normalizeStudentStatus = (status) => {
  if (!status) return '';
  return validStudentStatuses.find(
    (item) => item.toLowerCase() === String(status).trim().toLowerCase()
  ) || '';
};

const normalizeEmails = (emails = []) => {
  const list = Array.isArray(emails) ? emails : String(emails || '').split(',');
  return [...new Set(
    list
      .map((email) => String(email || '').trim().toLowerCase())
      .filter(Boolean)
  )];
};

const getStudentRecipients = async ({ batch = '', status = '', user } = {}) => {
  const query = { email: { $exists: true, $ne: '' } };
  
  if (user.role === 'FRANCHISE') query.branch = user.branch;

  const cleanBatch = String(batch || '').trim();
  const cleanStatus = normalizeStudentStatus(status);

  if (cleanBatch) query.batch = buildRegex(cleanBatch);
  if (cleanStatus) query.status = cleanStatus;

  const students = await Student.find(query).select('email');
  return normalizeEmails(students.map((student) => student.email));
};

router.get('/', asyncHandler(async (req, res) => {
  const query = req.user.role === 'FRANCHISE' ? { sentBy: req.user._id } : {};
  res.json(await MailLog.find(query).populate('sentBy', 'name').sort({ createdAt: -1 }));
}));

router.post('/send', asyncHandler(async (req, res) => {
  const {
    recipientType = 'manual',
    emails = [],
    subject = '',
    body = '',
    batch = '',
    status = ''
  } = req.body;

  if (!String(subject).trim()) {
    res.status(400);
    throw new Error('Subject is required.');
  }

  if (!String(body).trim()) {
    res.status(400);
    throw new Error('Message body is required.');
  }

  if (status && !normalizeStudentStatus(status)) {
    res.status(400);
    throw new Error('Invalid student status filter.');
  }

  let recipients = [];

  if (recipientType === 'all-students') {
    recipients = await getStudentRecipients({ user: req.user });
  } else if (recipientType === 'filtered-students') {
    if (!String(batch || '').trim() && !String(status || '').trim()) {
      res.status(400);
      throw new Error('Select at least one filter: batch or student status.');
    }

    recipients = await getStudentRecipients({ batch, status, user: req.user });
  } else {
    recipients = normalizeEmails(emails);
  }

  if (!recipients.length) {
    res.status(400);
    throw new Error('No student email matched the selected recipient option.');
  }

  let sendStatus = 'Sent';
  try {
    const result = await sendMail({
      to: recipients.join(','),
      subject: String(subject).trim(),
      text: body,
      html: String(body).replaceAll('\n', '<br />')
    });
    if (result?.skipped) sendStatus = 'Skipped';
  } catch (error) {
    sendStatus = 'Failed';
  }

  const log = await MailLog.create({
    recipients,
    subject: String(subject).trim(),
    body,
    status: sendStatus,
    sentBy: req.user._id
  });

  res.status(201).json(log);
}));

export default router;