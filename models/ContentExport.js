import mongoose from 'mongoose';

const ContentExportSchema = new mongoose.Schema(
  {
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'targetType',
    },
    targetType: {
      type: String,
      enum: ['Product', 'SourcedItem'],
      default: 'Product',
    },
    targetName: {
      type: String,
      default: '',
    },
    platform: {
      type: String,
      required: true, // e.g. 'instagram_feed', 'instagram_story', 'facebook_feed', 'tiktok', 'pinterest', 'whatsapp_status', 'general_website'
    },
    platformLabel: {
      type: String,
      default: '',
    },
    format: {
      type: String,
      enum: ['image', 'video'],
      default: 'image',
    },
    fileUrl: {
      type: String,
      required: true,
    },
    priceAtExport: {
      type: Number,
      required: true, // Enforced: must have finalized price
    },
    costBreakdownSnapshot: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    settingsSnapshot: {
      canvasDimensions: { width: Number, height: Number },
      stickersApplied: [mongoose.Schema.Types.Mixed],
      watermarkApplied: Boolean,
      musicTrackName: String,
      trimSettings: { startSec: Number, endSec: Number },
    },
    exportedBy: {
      type: String,
      default: 'Admin',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.ContentExport || mongoose.model('ContentExport', ContentExportSchema);
