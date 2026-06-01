import express from 'express';
import asyncHandler from 'express-async-handler';
import Certificate from '../models/Certificate.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);

router.get('/', asyncHandler(async (req, res) => {
  const { search = '' } = req.query;
  const certificates = await Certificate.find()
    .populate('student')
    .populate('issuedBy', 'name')
    .sort({ issueDate: -1 });

  const filtered = search
    ? certificates.filter((certificate) => {
        const haystack = [
          certificate.certificateNo,
          certificate.student?.name,
          certificate.student?.regNo,
          certificate.student?.phone,
          certificate.courseTitle,
          certificate.grade,
          certificate.remarks
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        return haystack.includes(String(search).toLowerCase());
      })
    : certificates;

  res.json(filtered);
}));

router.post('/', asyncHandler(async (req, res) => {
  const certificate = await Certificate.create({ ...req.body, issuedBy: req.user._id });
  const populated = await Certificate.findById(certificate._id).populate('student').populate('issuedBy', 'name');
  res.status(201).json(populated);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const certificate = await Certificate.findById(req.params.id).populate('student').populate('issuedBy', 'name');
  if (!certificate) {
    res.status(404);
    throw new Error('Certificate not found.');
  }
  res.json(certificate);
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const certificate = await Certificate.findByIdAndDelete(req.params.id);
  if (!certificate) {
    res.status(404);
    throw new Error('Certificate not found.');
  }
  res.json({ message: 'Certificate deleted successfully.' });
}));

export default router;
