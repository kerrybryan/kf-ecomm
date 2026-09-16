import mongoose from 'mongoose';

const ContentAssetSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['sticker', 'audio', 'watermark'],
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      default: 'General', // e.g. "Sales Badges", "Product Tags", "Upbeat", "Calm", "Elegant", "Corporate"
    },
    url: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      default: '',
    },
    metadata: {
      durationSeconds: { type: Number, default: 0 },
      mood: { type: String, default: '' },
      license: { type: String, default: 'Royalty-Free / Licensed for KB Furniture Commercial Use' },
      dimensions: {
        width: { type: Number, default: 300 },
        height: { type: Number, default: 120 },
      },
      tagText: { type: String, default: '' },
      badgeColor: { type: String, default: '#B8551F' },
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.ContentAsset || mongoose.model('ContentAsset', ContentAssetSchema);
