import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema(
  {
    certificateNo: { type: String, unique: true, index: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    courseTitle: { type: String, required: true, trim: true },
    grade: { type: String, trim: true, default: 'A' },
    issueDate: { type: Date, default: Date.now },
    remarks: { type: String, trim: true },
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
