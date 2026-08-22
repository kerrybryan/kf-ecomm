import mongoose from 'mongoose';

const RawMaterialSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Material name is required'],
      trim: true,
    },
    sku: {
      type: String,
      required: [true, 'Material SKU is required'],
      unique: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['timber', 'fabric', 'hardware', 'finish', 'foam', 'packaging'],
      default: 'timber',
    },
    inStock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    unit: {
      type: String,
      enum: ['bdft', 'meters', 'kg', 'units', 'liters', 'rolls', 'boxes'],
      default: 'units',
    },
    unitCost: {
      type: Number,
      required: true,
      default: 0,
    },
    reorderThreshold: {
      type: Number,
      default: 10,
    },
    supplier: {
      type: String,
      default: 'Nordic Sustainable Forestry Co.',
    },
    location: {
      type: String,
      default: 'Warehouse Rack A-12',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.RawMaterial || mongoose.model('RawMaterial', RawMaterialSchema);
