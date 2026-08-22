import mongoose from 'mongoose';

const SourcedItemSchema = new mongoose.Schema(
  {
    sourceImageUrl: {
      type: String,
      required: [true, 'Please provide an inspiration image URL'],
      trim: true,
    },
    sourceUrl: {
      type: String,
      default: '',
      trim: true,
    },
    isReferenceOnly: {
      type: Boolean,
      default: true,
    },
    aiAnalysis: {
      furnitureType: { type: String, default: '' },
      materials: { type: [String], default: [] },
      estimatedDimensions: { type: String, default: '' },
      complexityRating: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium',
      },
      suggestedPriceMin: { type: Number, default: 0 },
      suggestedPriceMax: { type: Number, default: 0 },
      confidenceNote: { type: String, default: '' },
    },
    manualOverride: {
      materialCost: { type: Number, default: 250 },
      laborHours: { type: Number, default: 8 },
      laborRate: { type: Number, default: 45 },
      overheadPercent: { type: Number, default: 15 },
      markupMultiplier: { type: Number, default: 2.2 },
      calculatedCost: { type: Number, default: 0 },
      finalPrice: { type: Number, default: 0 },
    },
    status: {
      type: String,
      enum: ['analyzing', 'reviewed', 'converted_to_product', 'discarded'],
      default: 'analyzing',
    },
    linkedProductId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      default: null,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.SourcedItem || mongoose.model('SourcedItem', SourcedItemSchema);
