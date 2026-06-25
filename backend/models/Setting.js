import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema(
  {
    perDayFine: { type: Number, default: 10 }
  },
  { timestamps: true }
);

export default mongoose.model('Setting', settingSchema);