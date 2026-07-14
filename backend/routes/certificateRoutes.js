import express from 'express';
import asyncHandler from 'express-async-handler';
import Certificate from '../models/Certificate.js';
import Student from '../models/Student.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);

const getMarksNumber = (value) => {
  const match = String(value ?? '').replace(/,/g, '').match(/-?\d+(\.\d+)?/);
  return match ? Number(match[0]) : 0;
};

const formatMarksNumber = (value) => {
  const rounded = Math.round((Number(value) || 0) * 100) / 100;
  return Number.isInteger(rounded)
    ? String(rounded)
    : String(rounded).replace(/\.?0+$/, '');
};

const calculateCertificateMarks = (payload = {}) => {
  if (!Array.isArray(payload.moduleRows) || !payload.moduleRows.length) {
    return payload;
  }

  const totalFullMarks = payload.moduleRows.reduce(
    (sum, row) => sum + getMarksNumber(row.fullMarks),
    0
  );

  const totalMarksObtain = payload.moduleRows.reduce(
    (sum, row) => sum + getMarksNumber(row.marksObtain),
    0
  );

  return {
    ...payload,
    totalFullMarks: formatMarksNumber(totalFullMarks),
    totalMarksObtain: formatMarksNumber(totalMarksObtain),
    percentage: totalFullMarks > 0
      ? formatMarksNumber((totalMarksObtain / totalFullMarks) * 100)
      : '0'
  };
};

const populateCertificate = (query) => query.populate('student').populate('issuedBy', 'name');

const buildSearchText = (certificate) => {
  return [
    certificate.certificateNo,
    certificate.studentName,
    certificate.fatherName,
    certificate.regNo,
    certificate.student?.name,
    certificate.student?.fatherName,
    certificate.student?.regNo,
    certificate.student?.phone,
    certificate.courseTitle,
    certificate.duration,
    certificate.grade,
    certificate.percentage,
    certificate.remarks
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
};

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { search = '' } = req.query;
    
    const query = {};
    if (req.user.role === 'FRANCHISE') query.branch = req.user.branch;

    const certificates = await populateCertificate(
      Certificate.find(query).sort({ issueDate: -1, createdAt: -1 })
    );

    const filtered = search
      ? certificates.filter((certificate) =>
          buildSearchText(certificate).includes(String(search).toLowerCase())
        )
      : certificates;

    res.json(filtered);
  })
);

router.post(
  '/',
  adminOnly,
  asyncHandler(async (req, res) => {
    const payload = calculateCertificateMarks({ ...req.body, issuedBy: req.user._id });

    if (payload.student) {
      const student = await Student.findById(payload.student);
      if (student) payload.branch = student.branch;
    } else {
      delete payload.student;
    }

    const certificate = await Certificate.create(payload);
    const populated = await populateCertificate(Certificate.findById(certificate._id));
    res.status(201).json(populated);
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const certificate = await populateCertificate(Certificate.findById(req.params.id));

    if (!certificate || (req.user.role === 'FRANCHISE' && certificate.branch !== req.user.branch)) {
      res.status(404);
      throw new Error('Certificate not found.');
    }

    res.json(certificate);
  })
);

router.put(
  '/:id',
  adminOnly,
  asyncHandler(async (req, res) => {
    const payload = calculateCertificateMarks({ ...req.body });

    if (!payload.student) {
      payload.student = null;
    } else {
      const student = await Student.findById(payload.student);
      if (student) payload.branch = student.branch;
    }

    const certificate = await populateCertificate(
      Certificate.findByIdAndUpdate(req.params.id, payload, {
        new: true,
        runValidators: true
      })
    );

    if (!certificate) {
      res.status(404);
      throw new Error('Certificate not found.');
    }

    res.json(certificate);
  })
);

router.delete(
  '/:id',
  adminOnly,
  asyncHandler(async (req, res) => {
    const certificate = await Certificate.findByIdAndDelete(req.params.id);

    if (!certificate) {
      res.status(404);
      throw new Error('Certificate not found.');
    }

    res.json({ message: 'Certificate deleted successfully.' });
  })
);

export default router;