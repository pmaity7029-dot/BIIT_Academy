import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema(
  {
    regNo: { type: String, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    fatherName: { type: String, required: true, trim: true },
    dob: { type: Date, required: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    phone: { type: String, required: true, trim: true },
    emergencyContact: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    address: { type: String, trim: true },
    courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    admissionFee: { type: Number, min: 0, default: 0 },
    examFee: { type: Number, min: 0, default: 0 },
    installmentFeePerMonth: { type: Number, min: 0, default: 0 },
    batch: { type: String, default: 'Default Batch', trim: true },
    branch: { type: String, trim: true, default: 'Main Branch' },
    photo: { type: String, default: '' },
    enrolledDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['Active', 'Inactive', 'Completed'], default: 'Active' },
    notes: { type: String, trim: true }
  },
  { timestamps: true }
);

studentSchema.pre('save', async function makeRegNo(next) {
  if (this.regNo) return next();
  const datePart = new Date().toISOString().slice(2, 10).replaceAll('-', '');
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  this.regNo = `BIIT${datePart}${randomPart}`;
  next();
});

export default mongoose.model('Student', studentSchema);
