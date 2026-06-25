import mongoose from 'mongoose';

const idCardSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', default: null },
    studentName: { type: String, required: true, trim: true },
    regNo: { type: String, required: true, trim: true },
    batch: { type: String, trim: true, default: 'Default Batch' },
    dob: { type: Date, required: true },
    phone: { type: String, required: true, trim: true },
    bloodGroup: { type: String, trim: true, default: 'O+' },
    validUntil: { type: String, trim: true, default: 'Dec 2026' },
    photo: { type: String, default: '' } // Cloudinary Hosted URL String
  },
  { timestamps: true }
);

export default mongoose.model('IdCard', idCardSchema);