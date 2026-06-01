import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    category: { type: String, trim: true, default: 'Computer Training' },
    duration: { type: String, required: true, trim: true },
    fee: { type: Number, required: true, min: 0 },
    description: { type: String, trim: true },
    status: { type: String, enum: ['Active', 'Inactive', 'Completed'], default: 'Active' }
  },
  { timestamps: true }
);

export default mongoose.model('Course', courseSchema);
