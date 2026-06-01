import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    receiptNo: { type: String, unique: true, index: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    amount: { type: Number, required: true, min: 1 },
    mode: { type: String, enum: ['Cash', 'UPI', 'Card', 'Bank Transfer', 'Cheque'], default: 'Cash' },
    status: {
      type: String,
      enum: ['Paid', 'Pending', 'Partial', 'Cancelled', 'Refunded'],
      default: 'Paid'
    },
    month: { type: String, trim: true },
    description: { type: String, trim: true },
    paidDate: { type: Date, default: Date.now },
    collectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

paymentSchema.pre('save', function makeReceiptNo(next) {
  if (this.receiptNo) return next();
  const datePart = new Date().toISOString().slice(2, 10).replaceAll('-', '');
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  this.receiptNo = `RCP${datePart}${randomPart}`;
  next();
});

export default mongoose.model('Payment', paymentSchema);
