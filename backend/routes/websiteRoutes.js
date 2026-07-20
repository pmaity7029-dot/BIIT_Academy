import express from 'express';
import asyncHandler from 'express-async-handler';
import WebsiteContent from '../models/WebsiteContent.js';
import { protect, superAdminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

const defaultCourses = [
  {
    title: "Certificate in Computer Application (C.C.A)",
    duration: "6 Months / 120 Hrs (Fast Track)",
    eligibility: "10th STANDARD",
    desc: "Computer Fundamentals, MS-DOS, Windows (7,10,11), MS-Office (Word, Excel, PowerPoint), Basic Hardware, Concept of software and computer Languages. Internet Browsing, Upload, Download, Email creation, Compose mail, Send mail, English & Bengali Typing."
  },
  {
    title: "Diploma in Computer Application (D.C.A) + Tally (Basic)",
    duration: "12 Months / 240 Hrs (Fast Track)",
    eligibility: "10th STANDARD",
    desc: "Content of C.C.A + Concept of RDMS and MS-access, Basics of Visual Basic, HTML, Online Data entry. Tally Erp 9, Tally prime (Accounting Fundamentals, Voucher Entries, Inventory Management, ledger setup, Trial Balance, P&L, Balance Sheets, GST and Payroll basics)."
  },
  {
    title: "Advanced Diploma in Computer Application + Tally (Professional)",
    duration: "18 Months / 360 Hrs",
    eligibility: "12th STANDARD",
    desc: "Content of D.C.A + Bio-data & CV making, GST Setup & Configuration, GST Returns Filing (GSTR-1, GSTR-3B) & E-Way Bills, TDS/TCS basics, Bank Reconciliation, Online Banking, Budgets, Financial Statements, Data Backup, Audit, Salary Structures, PF/ESI, MIS reports."
  }
];

const defaultSuccessStories = [
  { name: "Surajit Bera", role: "Maintenance Engineer", company: "Jahanabad Royal Infrastructure Ltd (Kolkata)" },
  { name: "Sadhan Bhunia", role: "Manager", company: "Khejuri SKUS Ltd." }
];

router.get('/', asyncHandler(async (req, res) => {
  let content = await WebsiteContent.findOne();
  if (!content) {
    content = await WebsiteContent.create({
      courses: defaultCourses,
      successStories: defaultSuccessStories
    });
  }
  res.json(content);
}));

router.put('/', protect, superAdminOnly, asyncHandler(async (req, res) => {
  const { courses, successStories } = req.body;
  let content = await WebsiteContent.findOne();
  if (!content) {
    content = new WebsiteContent({ courses: courses || [], successStories: successStories || [] });
  } else {
    if (courses) content.courses = courses;
    if (successStories) content.successStories = successStories;
  }
  await content.save();
  res.json(content);
}));

export default router;