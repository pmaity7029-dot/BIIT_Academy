import mongoose from 'mongoose';

const moduleRowSchema = new mongoose.Schema(
  {
    no: { type: String, trim: true },
    title: { type: String, trim: true },
    fullMarks: { type: String, trim: true },
    marksObtain: { type: String, trim: true }
  },
  { _id: false }
);

const certificateSchema = new mongoose.Schema(
  {
    certificateNo: { type: String, unique: true, index: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', default: null },
    studentName: { type: String, trim: true, default: '' },
    fatherName: { type: String, trim: true, default: '' },
    gender: { type: String, trim: true, default: 'Female' },
    regNo: { type: String, trim: true, default: '' },
    birthDateText: { type: String, trim: true, default: '' },
    photo: { type: String, default: '' }, // Added photo field
    courseTitle: { type: String, required: true, trim: true },
    duration: { type: String, trim: true, default: '6 Months / 120 hrs' },
    grade: { type: String, trim: true, default: 'A+' },
    percentage: { type: String, trim: true, default: '68' },
    totalFullMarks: { type: String, trim: true, default: '500' },
    totalMarksObtain: { type: String, trim: true, default: '342' },
    moduleRows: {
      type: [moduleRowSchema],
      default: [
        { no: '1.', title: 'Computer fundamental, Basic Hardware, Operating system', fullMarks: '150', marksObtain: '92' },
        { no: '2.', title: 'MS Office (Word, Excel, PowerPoint)', fullMarks: '100', marksObtain: '70' },
        { no: '3.', title: 'Internet and E-mail', fullMarks: '50', marksObtain: '30' },
        { no: '4.', title: 'Project work and Practical', fullMarks: '200', marksObtain: '150' }
      ]
    },
    issueDate: { type: Date, default: Date.now },
    issueDateText: { type: String, trim: true, default: '' },
    instituteName: { type: String, trim: true, default: 'Bengal Institute of IT & Technology' },
    officeAddress: { type: String, trim: true, default: 'H.O. & Reg. Office : Midnapore, West Bengal' },
    website: { type: String, trim: true, default: 'www.biit.in' },
    remarks: { type: String, trim: true },
    branch: { type: String, trim: true, default: 'Main Branch' },
    issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

certificateSchema.pre('save', function makeCertificateNo(next) {
  if (this.certificateNo) return next();
  const datePart = new Date().toISOString().slice(2, 10).replaceAll('-', '');
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  this.certificateNo = `CERT${datePart}${randomPart}`;
  next();
});

export default mongoose.model('Certificate', certificateSchema);