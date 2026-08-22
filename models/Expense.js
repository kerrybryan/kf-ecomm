import mongoose from 'mongoose';

const ExpenseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Expense title is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: [
        'raw_timber_lumber',
        'upholstery_fabrics',
        'hardware_joinery',
        'workshop_rent_utilities',
        'machinery_maintenance',
        'white_glove_logistics',
        'marketing_advertising',
        'artisan_payroll',
        'insurance_legal',
        'other',
      ],
      default: 'raw_timber_lumber',
    },
    amount: {
      type: Number,
      required: [true, 'Expense amount is required'],
      min: 0,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    vendor: {
      type: String,
      default: 'Nordic Wood & Steel Suppliers',
    },
    paymentMethod: {
      type: String,
      enum: ['bank_wire', 'credit_card', 'check', 'ach', 'cash'],
      default: 'bank_wire',
    },
    receiptUrl: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
    ledgerEntryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LedgerEntry',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Expense || mongoose.model('Expense', ExpenseSchema);
