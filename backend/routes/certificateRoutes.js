import express from 'express';
import asyncHandler from 'express-async-handler';
import Certificate from '../models/Certificate.js';
import { protect } from '../middleware/authMiddleware.js';

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

    const certificates = await populateCertificate(
      Certificate.find().sort({ issueDate: -1, createdAt: -1 })
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
  asyncHandler(async (req, res) => {
    const payload = calculateCertificateMarks({ ...req.body, issuedBy: req.user._id });

    if (!payload.student) {
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

    if (!certificate) {
      res.status(404);
      throw new Error('Certificate not found.');
    }

    res.json(certificate);
  })
);

router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const payload = calculateCertificateMarks({ ...req.body });

    if (!payload.student) {
      payload.student = null;
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