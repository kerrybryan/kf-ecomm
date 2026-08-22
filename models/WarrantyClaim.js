import mongoose from 'mongoose';

const WarrantyClaimSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    claimNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    customerEmail: {
      type: String,
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    claimType: {
      type: String,
      enum: ['transit_damage', 'craftsmanship_defect', 'material_flaw', 'warranty_repair'],
      default: 'transit_damage',
    },
    description: {
      type: String,
      required: true,
    },
    photoUrls: {
      type: [String],
      default: [],
    },
    severity: {
      type: String,
      enum: ['minor_touchup', 'part_replacement', 'full_replacement'],
      default: 'minor_touchup',
    },
    status: {
      type: String,
      enum: [
        'submitted',
        'under_review',
        'replacement_approved',
        'repair_scheduled',
        'resolved',
        'rejected',
      ],
      default: 'submitted',
    },
    resolutionNotes: {
      type: String,
      default: '',
    },
    assignedArtisan: {
      type: String,
      default: '',
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.WarrantyClaim ||
  mongoose.model('WarrantyClaim', WarrantyClaimSchema);
