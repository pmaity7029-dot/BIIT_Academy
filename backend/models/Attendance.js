import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    date: { type: Date, required: true },
    status: { type: String, enum: ['Present', 'Absent', 'Late', 'Leave'], required: true },
    notes: { type: String, trim: true },
    performanceRating: { type: Number, min: 1, max: 5, default: null },
    markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    branch: { type: String, trim: true, default: 'Main Branch' }
  },
  { timestamps: true }
);

attendanceSchema.index({ student: 1, date: 1 }, { unique: true });

export default mongoose.model('Attendance', attendanceSchema);