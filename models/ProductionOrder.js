import mongoose from 'mongoose';

const ProductionOrderSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      default: null,
    },
    productName: {
      type: String,
      required: true,
      trim: true,
    },
    productSku: {
      type: String,
      default: '',
    },
    productImage: {
      type: String,
      default: '',
    },
    customSpecifications: {
      woodFinish: { type: String, default: 'Natural Matte Hardwax Oil' },
      fabricChoice: { type: String, default: 'Nordic Bouclé Cream' },
      dimensions: { type: String, default: 'Standard' },
      notes: { type: String, default: '' },
    },
    currentStage: {
      type: String,
      enum: [
        'timber_selection',
        'cutting_joinery',
        'hand_sanding',
        'finishing_staining',
        'upholstery',
        'quality_inspection',
        'completed',
      ],
      default: 'timber_selection',
    },
    priority: {
      type: String,
      enum: ['standard', 'rush', 'vip'],
      default: 'standard',
    },
    leadCraftsman: {
      type: String,
      default: 'Lars Lindqvist',
    },
    workshopBench: {
      type: String,
      default: 'Bench 3 - Joinery East',
    },
    stageHistory: [
      {
        stage: { type: String, required: true },
        enteredAt: { type: Date, default: Date.now },
        completedAt: { type: Date, default: null },
        durationHours: { type: Number, default: 0 },
        craftsman: { type: String, default: 'Lead Craftsman' },
        notes: { type: String, default: '' },
      },
    ],
    materialsRequired: [
      {
        materialId: { type: mongoose.Schema.Types.ObjectId, ref: 'RawMaterial' },
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        unit: { type: String, default: 'units' },
        deducted: { type: Boolean, default: false },
      },
    ],
    targetCompletionDate: {
      type: Date,
      default: null,
    },
    actualCompletionDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['in_progress', 'completed', 'on_hold', 'cancelled'],
      default: 'in_progress',
    },
  },
  {
    timestamps: true,
  }
);

ProductionOrderSchema.index({ currentStage: 1, priority: 1 });
ProductionOrderSchema.index({ createdAt: -1 });

export default mongoose.models.ProductionOrder ||
  mongoose.model('ProductionOrder', ProductionOrderSchema);
