import mongoose from 'mongoose';

const mailLogSchema = new mongoose.Schema(
  {
    recipients: [{ type: String, trim: true }],
    subject: { type: String, required: true, trim: true },
    body: { type: String, required: true },
    status: { type: String, enum: ['Sent', 'Skipped', 'Failed'], default: 'Sent' },
    sentBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

export default mongoose.model('MailLog', mailLogSchema);
