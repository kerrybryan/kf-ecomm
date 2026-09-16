import mongoose from 'mongoose';

const SourcedItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: 'Untitled Sourced Piece',
      trim: true,
    },
    category: {
      type: String,
      default: 'Living Room',
      trim: true,
    },
    sourceImageUrl: {
      type: String,
      required: [true, 'Please provide an inspiration image or video URL'],
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
    price: {
      type: Number,
      default: 0,
    },
    costBreakdown: {
      materialCost: { type: Number, default: 0 },
      laborCost: { type: Number, default: 0 },
      subtotal: { type: Number, default: 0 },
      overhead: { type: Number, default: 0 },
      overheadPercent: { type: Number, default: 15 },
      totalCost: { type: Number, default: 0 },
      markupMultiplier: { type: Number, default: 2.0 },
      finalPrice: { type: Number, default: 0 },
      items: [
        {
          materialName: String,
          quantity: Number,
          unit: String,
          costPerUnit: Number,
          total: Number,
        },
      ],
      laborHours: { type: Number, default: 0 },
      laborRatePerHour: { type: Number, default: 0 },
      calculatedAt: { type: Date, default: null },
    },
    status: {
      type: String,
      enum: ['new', 'priced', 'content_ready', 'converted_to_product', 'discarded'],
      default: 'new',
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

if (mongoose.models.SourcedItem) {
  delete mongoose.models.SourcedItem;
}

export default mongoose.model('SourcedItem', SourcedItemSchema);
