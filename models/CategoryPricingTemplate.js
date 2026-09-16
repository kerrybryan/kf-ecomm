import mongoose from 'mongoose';

const MaterialInputSchema = new mongoose.Schema(
  {
    materialName: { type: String, required: true },
    unitLabel: { type: String, default: 'units' },
    defaultQuantity: { type: Number, default: 1, min: 0 },
    helpText: { type: String, default: '' },
  },
  { _id: false }
);

const CategoryPricingTemplateSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: [true, 'Please specify a category name (e.g. Sofas & Couches, Dining Tables, Beds, Cabinets)'],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      default: '',
    },
    materialInputs: {
      type: [MaterialInputSchema],
      default: [],
    },
    laborHoursDefault: {
      type: Number,
      default: 12,
      min: 0,
    },
    laborRatePerHour: {
      type: Number,
      default: 250, // in Birr
      min: 0,
    },
    overheadPercentDefault: {
      type: Number,
      default: 15, // 15%
      min: 0,
    },
    markupMultiplierDefault: {
      type: Number,
      default: 2.0, // 2x total cost
      min: 1.0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.CategoryPricingTemplate ||
  mongoose.model('CategoryPricingTemplate', CategoryPricingTemplateSchema);
