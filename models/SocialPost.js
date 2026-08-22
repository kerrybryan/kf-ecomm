import mongoose from 'mongoose';

const SocialPostSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      default: null,
    },
    mediaType: {
      type: String,
      enum: ['image', 'video'],
      default: 'image',
    },
    mediaUrl: {
      type: String,
      required: [true, 'Media URL is required'],
      trim: true,
    },
    platforms: {
      type: [String],
      required: [true, 'At least one target platform is required'],
      default: ['instagram', 'pinterest'],
    },
    captions: {
      default: { type: String, default: '' },
      instagram: { type: String, default: '' },
      facebook: { type: String, default: '' },
      tiktok: { type: String, default: '' },
      pinterest: { type: String, default: '' },
      twitter: { type: String, default: '' },
    },
    scheduledFor: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['draft', 'queued', 'posted', 'failed'],
      default: 'draft',
    },
    publishedAt: {
      type: Date,
      default: null,
    },
    platformPostIds: {
      type: Map,
      of: String,
      default: {},
    },
    engagementStats: {
      type: Map,
      of: new mongoose.Schema(
        {
          likes: { type: Number, default: 0 },
          comments: { type: Number, default: 0 },
          views: { type: Number, default: 0 },
          shares: { type: Number, default: 0 },
        },
        { _id: false }
      ),
      default: {},
    },
    errorLog: {
      type: String,
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

SocialPostSchema.index({ status: 1, scheduledFor: 1 });
SocialPostSchema.index({ createdAt: -1 });

export default mongoose.models.SocialPost || mongoose.model('SocialPost', SocialPostSchema);
