import mongoose from 'mongoose';

const InquirySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: [true, 'Please provide your phone number'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['general', 'custom', 'wholesale', 'support'],
      default: 'general',
      required: true,
    },
    message: {
      type: String,
      required: [true, 'Please provide an inquiry message'],
    },
    referenceImage: {
      type: String,
      default: '',
    },
    productContext: {
      type: String,
      default: '',
    },
    dimensions: {
      type: String,
      default: '',
    },
    budget: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['new', 'in_review', 'quoted', 'won', 'lost'],
      default: 'new',
    },
    internalNotes: [
      {
        note: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
        createdBy: { type: String, default: 'Staff' },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Inquiry || mongoose.model('Inquiry', InquirySchema);
