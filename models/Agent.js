import mongoose from 'mongoose';

const AgentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your full name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide your business email'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: [true, 'Please provide your phone number'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'Please provide your primary city/region'],
      trim: true,
    },
    experience: {
      type: String,
      default: '',
    },
    salesChannel: {
      type: String,
      required: [true, 'Please specify your primary sales channel / role (e.g. Interior Designer, Architect, Showroom)'],
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    referralCode: {
      type: String,
      unique: true,
      sparse: true,
    },
    totalSales: {
      type: Number,
      default: 0,
    },
    commissionRate: {
      type: Number,
      default: 10,
    },
    commissionOwed: {
      type: Number,
      default: 0,
    },
    payoutStatus: {
      type: String,
      enum: ['paid', 'pending_payout', 'none'],
      default: 'none',
    },
    payoutHistory: [
      {
        amount: { type: Number, required: true },
        paidAt: { type: Date, default: Date.now },
        reference: { type: String, default: '' },
        notes: { type: String, default: '' },
        paidBy: { type: String, default: 'Super Admin' },
      },
    ],
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Agent || mongoose.model('Agent', AgentSchema);
