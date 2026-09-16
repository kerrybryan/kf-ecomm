import mongoose from 'mongoose';

const AutomationRuleSchema = new mongoose.Schema(
  {
    trigger: {
      type: String,
      default: 'product_published',
      trim: true,
    },
    mode: {
      type: String,
      enum: ['auto_publish', 'review_queue'],
      default: 'review_queue', // Default to review queue for human-in-the-loop safety
    },
    defaultPlatforms: {
      type: [String],
      default: ['instagram', 'pinterest', 'facebook'],
    },
    defaultCaptionTemplate: {
      type: String,
      default:
        'Introducing the {productName} — masterfully crafted in {material}. Starting at ${price}.\n\nExplore our bespoke Scandinavian collection online at KB Furniture. ✨\n\n#NordicDesign #ScandinavianLiving #BespokeFurniture #KBFurniture #LuxuryInteriors',
    },
    enabled: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.AutomationRule || mongoose.model('AutomationRule', AutomationRuleSchema);
