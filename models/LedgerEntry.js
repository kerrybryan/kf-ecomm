import mongoose from 'mongoose';

const LedgerEntrySchema = new mongoose.Schema(
  {
    entryNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    type: {
      type: String,
      enum: [
        'revenue',
        'cogs_material',
        'cogs_labor',
        'expense',
        'agent_payout',
        'refund',
        'tax_liability',
      ],
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    debit: {
      type: Number,
      default: 0,
    },
    credit: {
      type: Number,
      default: 0,
    },
    referenceId: {
      type: String,
      default: '', // Order #, PO #, Payout ID
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['posted', 'pending', 'void'],
      default: 'posted',
    },
    createdBy: {
      type: String,
      default: 'System Automation',
    },
  },
  {
    timestamps: true,
  }
);

LedgerEntrySchema.index({ date: -1, type: 1 });

export default mongoose.models.LedgerEntry || mongoose.model('LedgerEntry', LedgerEntrySchema);
