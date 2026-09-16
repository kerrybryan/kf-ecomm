import mongoose from 'mongoose';

const CaptionTemplateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a template name'],
      trim: true,
    },
    template: {
      type: String,
      required: [true, 'Please provide template text with placeholders'],
      trim: true,
    },
    platform: {
      type: String,
      enum: ['instagram', 'facebook', 'tiktok', 'pinterest', 'whatsapp', 'general'],
      default: 'general',
    },
    description: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

if (mongoose.models.CaptionTemplate) {
  delete mongoose.models.CaptionTemplate;
}

export default mongoose.model('CaptionTemplate', CaptionTemplateSchema);
