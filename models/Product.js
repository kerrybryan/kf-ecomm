import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a product name'],
      trim: true,
      maxlength: [120, 'Product name cannot exceed 120 characters'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    category: {
      type: String,
      required: [true, 'Please specify a category'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Please specify a price'],
      min: [0, 'Price must be positive'],
    },
    originalPrice: {
      type: Number,
      default: null,
    },
    images: {
      type: [String],
      required: [true, 'Please provide at least one product image'],
      default: [],
    },
    colors: {
      type: [String],
      default: [],
    },
    materials: {
      type: [String],
      default: [],
    },
    description: {
      type: String,
      required: [true, 'Please provide a product description'],
    },
    specs: {
      dimensions: { type: String, default: '' },
      weight: { type: String, default: '' },
      materialDetails: { type: String, default: '' },
      warranty: { type: String, default: '5-Year Manufacturer Warranty' },
      assembly: { type: String, default: 'Minimal assembly required (Tools included)' },
      care: { type: String, default: 'Wipe clean with a soft dry cloth.' },
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    stockCount: {
      type: Number,
      default: 15,
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'published',
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isBestSeller: {
      type: Boolean,
      default: false,
    },
    trending: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    isReferenceImage: {
      type: Boolean,
      default: false,
    },
    sourceItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SourcedItem',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Helpful text index for search functionality
ProductSchema.index({ name: 'text', description: 'text', category: 'text' });

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
