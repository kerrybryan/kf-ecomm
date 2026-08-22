import mongoose from 'mongoose';

const DeliveryZoneSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Zone name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    regionCodes: {
      type: [String], // e.g. ['WA', 'OR', 'ID'] or zip prefixes
      default: [],
    },
    baseCost: {
      type: Number,
      required: true,
      default: 150,
    },
    freeShippingThreshold: {
      type: Number,
      default: 2000,
    },
    estimatedDaysMin: {
      type: Number,
      default: 2,
    },
    estimatedDaysMax: {
      type: Number,
      default: 5,
    },
    isWhiteGloveAvailable: {
      type: Boolean,
      default: true,
    },
    whiteGloveSurcharge: {
      type: Number,
      default: 250,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.DeliveryZone || mongoose.model('DeliveryZone', DeliveryZoneSchema);
