import mongoose from 'mongoose';

const PublishingQueueItemSchema = new mongoose.Schema(
  {
    contentExportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ContentExport',
      default: null,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      default: null,
    },
    title: {
      type: String,
      default: 'Untitled Post',
      trim: true,
    },
    mediaUrl: {
      type: String,
      required: [true, 'Please provide media image or video URL'],
      trim: true,
    },
    mediaType: {
      type: String,
      enum: ['image', 'video'],
      default: 'image',
    },
    platform: {
      type: String,
      enum: ['instagram', 'facebook', 'tiktok', 'pinterest', 'whatsapp', 'general'],
      default: 'instagram',
    },
    captionTemplateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CaptionTemplate',
      default: null,
    },
    finalCaption: {
      type: String,
      required: [true, 'Please provide the final caption text'],
      trim: true,
    },
    plannedDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    status: {
      type: String,
      enum: ['queued', 'posted', 'skipped'],
      default: 'queued',
      index: true,
    },
    postedAt: {
      type: Date,
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

if (mongoose.models.PublishingQueueItem) {
  delete mongoose.models.PublishingQueueItem;
}

export default mongoose.model('PublishingQueueItem', PublishingQueueItemSchema);
