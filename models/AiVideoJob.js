import mongoose from 'mongoose';

const AiVideoJobSchema = new mongoose.Schema(
  {
    jobId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['image_to_video', 'text_to_video'],
      required: true,
    },
    prompt: {
      type: String,
      default: '',
      trim: true,
    },
    sourceImageUrl: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    progressPercent: {
      type: Number,
      default: 10,
    },
    resultVideoUrl: {
      type: String,
      default: '',
    },
    error: {
      type: String,
      default: '',
    },
    createdBy: {
      type: String,
      default: 'admin',
    },
    targetProductId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      default: null,
    },
    durationSeconds: {
      type: Number,
      default: 5,
    },
  },
  {
    timestamps: true,
  }
);

if (mongoose.models.AiVideoJob) {
  delete mongoose.models.AiVideoJob;
}

export default mongoose.model('AiVideoJob', AiVideoJobSchema);
