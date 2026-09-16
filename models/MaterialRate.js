import mongoose from 'mongoose';

const MaterialRateSchema = new mongoose.Schema(
  {
    materialName: {
      type: String,
      required: [true, 'Please specify a material name'],
      trim: true,
      unique: true,
    },
    unit: {
      type: String,
      required: [true, 'Please specify the measurement unit (e.g. meter, kg, sq meter, unit, liter)'],
      trim: true,
      default: 'unit',
    },
    costPerUnit: {
      type: Number,
      required: [true, 'Please specify cost per unit in Birr'],
      min: [0, 'Cost must be non-negative'],
    },
    categoryTag: {
      type: String,
      default: 'General',
      trim: true,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.MaterialRate || mongoose.model('MaterialRate', MaterialRateSchema);
