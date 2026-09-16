import mongoose from 'mongoose';

const AiUsageLogSchema = new mongoose.Schema(
  {
    adminEmail: {
      type: String,
      default: 'admin@kbfurniture.et',
    },
    adminRole: {
      type: String,
      default: 'super_admin',
    },
    feature: {
      type: String,
      enum: ['generate-description', 'generate-video', 'quick-calc'],
      required: true,
    },
    promptSummary: {
      type: String,
      default: '',
    },
    tokensUsed: {
      type: Number,
      default: 0,
    },
    costEstimateUsd: {
      type: Number,
      default: 0.0001,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

if (mongoose.models.AiUsageLog) {
  delete mongoose.models.AiUsageLog;
}

export default mongoose.model('AiUsageLog', AiUsageLogSchema);
