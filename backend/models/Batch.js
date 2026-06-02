import mongoose from 'mongoose';

const batchSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    courseName: { type: String, trim: true },
    schedule: { type: String, trim: true },
    startDate: Date,
    endDate: Date,
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Completed', 'Upcoming', 'Running'],
      default: 'Active'
    }
  },
  { timestamps: true }
);

export default mongoose.model('Batch', batchSchema);
