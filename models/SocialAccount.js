import mongoose from 'mongoose';

const SocialAccountSchema = new mongoose.Schema(
  {
    platform: {
      type: String,
      required: [true, 'Platform is required'],
      enum: ['instagram', 'facebook', 'tiktok', 'pinterest', 'twitter', 'youtube'],
      trim: true,
    },
    accountName: {
      type: String,
      required: [true, 'Account handle or name is required'],
      trim: true,
    },
    accountHandle: {
      type: String,
      default: '',
      trim: true,
    },
    accountAvatarUrl: {
      type: String,
      default: '',
    },
    profileUrl: {
      type: String,
      default: '',
    },
    // Tokens are encrypted / server-side only and never sent to client
    accessToken: {
      type: String,
      default: '',
      select: false,
    },
    refreshToken: {
      type: String,
      default: '',
      select: false,
    },
    tokenExpiresAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['connected', 'expired', 'disconnected'],
      default: 'connected',
    },
    connectedAt: {
      type: Date,
      default: Date.now,
    },
    followerCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Unique index per platform account
SocialAccountSchema.index({ platform: 1, accountName: 1 });

export default mongoose.models.SocialAccount || mongoose.model('SocialAccount', SocialAccountSchema);
