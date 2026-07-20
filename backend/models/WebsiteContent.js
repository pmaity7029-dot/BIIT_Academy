import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  duration: { type: String, required: true, trim: true },
  eligibility: { type: String, trim: true, default: '10th STANDARD' },
  desc: { type: String, trim: true }
}, { _id: true });

const successStorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  role: { type: String, required: true, trim: true },
  company: { type: String, required: true, trim: true }
}, { _id: true });

const websiteContentSchema = new mongoose.Schema(
  {
    courses: [courseSchema],
    successStories: [successStorySchema]
  },
  { timestamps: true }
);

export default mongoose.model('WebsiteContent', websiteContentSchema);