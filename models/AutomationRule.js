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
<<<<<<< HEAD
        'Introducing the {productName} — masterfully crafted in {material}. Starting at ${price}.\n\nExplore our bespoke Scandinavian collection online at KB Furniture. ✨\n\n#NordicDesign #ScandinavianLiving #BespokeFurniture #KBFurniture #LuxuryInteriors',
=======
        'Introducing the {productName} — masterfully crafted in {material}. Starting at ${price}.\n\nExplore our bespoke Scandinavian collection online at Nordika Studio. ✨\n\n#NordicDesign #ScandinavianLiving #BespokeFurniture #NordikaStudio #LuxuryInteriors',
>>>>>>> 4cd674b4af49d0a4c0c576d40cf1680f0734cfca
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
