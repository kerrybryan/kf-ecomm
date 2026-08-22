const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// 1. Load .env.local
const envPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  envConfig.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, ...values] = trimmed.split('=');
      process.env[key.trim()] = values.join('=').trim();
    }
  });
}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nordika_furniture';

// 2. Define Mongoose Schemas directly to allow standalone CLI execution
const CategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    image: { type: String, required: true },
    icon: { type: String, default: 'Armchair' },
    description: { type: String, default: '' },
    itemCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number, default: null },
    images: { type: [String], default: [] },
    colors: { type: [String], default: [] },
    materials: { type: [String], default: [] },
    description: { type: String, required: true },
    specs: {
      dimensions: { type: String, default: '' },
      weight: { type: String, default: '' },
      materialDetails: { type: String, default: '' },
      warranty: { type: String, default: '5-Year Manufacturer Warranty' },
      assembly: { type: String, default: 'Minimal assembly required' },
      care: { type: String, default: 'Wipe clean with a soft dry cloth.' },
    },
    rating: { type: Number, default: 5.0 },
    reviewCount: { type: Number, default: 0 },
    inStock: { type: Boolean, default: true },
    stockCount: { type: Number, default: 15 },
    status: { type: String, enum: ['draft', 'published'], default: 'published' },
    isFeatured: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    trending: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const OrderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    variant: {
      color: { type: String, default: '' },
      material: { type: String, default: '' },
    },
    image: { type: String, default: '' },
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    customer: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      address: {
        street: { type: String, required: true },
        apartment: { type: String, default: '' },
        city: { type: String, required: true },
        state: { type: String, required: true },
        postalCode: { type: String, required: true },
        country: { type: String, default: 'United States' },
      },
    },
    items: { type: [OrderItemSchema], required: true },
    subtotal: { type: Number, required: true },
    shipping: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['credit_card', 'apple_pay', 'bank_transfer', 'cash_on_delivery'],
      default: 'credit_card',
    },
    paymentStatus: {
      type: String,
      enum: ['paid', 'pending', 'failed'],
      default: 'paid',
    },
    deliveryNotes: { type: String, default: '' },
    timeline: [
      {
        status: { type: String, required: true },
        note: { type: String, default: '' },
        updatedAt: { type: Date, default: Date.now },
        updatedBy: { type: String, default: 'System' },
      },
    ],
    internalNotes: [
      {
        note: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
        createdBy: { type: String, default: 'Staff' },
      },
    ],
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const InquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    type: {
      type: String,
      enum: ['general', 'custom', 'wholesale', 'support'],
      default: 'general',
    },
    message: { type: String, required: true },
    referenceImage: { type: String, default: '' },
    productContext: { type: String, default: '' },
    dimensions: { type: String, default: '' },
    budget: { type: String, default: '' },
    status: {
      type: String,
      enum: ['new', 'in_review', 'quoted', 'won', 'lost'],
      default: 'new',
    },
    internalNotes: [
      {
        note: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
        createdBy: { type: String, default: 'Staff' },
      },
    ],
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const AgentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    city: { type: String, required: true },
    experience: { type: String, default: '' },
    salesChannel: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    referralCode: { type: String, unique: true, sparse: true },
    totalSales: { type: Number, default: 0 },
    commissionRate: { type: Number, default: 10 },
    commissionOwed: { type: Number, default: 0 },
    payoutStatus: {
      type: String,
      enum: ['paid', 'pending_payout', 'none'],
      default: 'none',
    },
    payoutHistory: [
      {
        amount: { type: Number, required: true },
        paidAt: { type: Date, default: Date.now },
        reference: { type: String, default: '' },
        notes: { type: String, default: '' },
        paidBy: { type: String, default: 'Super Admin' },
      },
    ],
    notes: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const AddressSchema = new mongoose.Schema(
  {
    isDefault: { type: Boolean, default: false },
    street: { type: String, required: true },
    apartment: { type: String, default: '' },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, default: 'United States' },
  },
  { _id: true }
);

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    phone: { type: String, default: '' },
    role: {
      type: String,
      enum: ['customer', 'super_admin', 'product_manager', 'sales_manager', 'support', 'admin', 'agent'],
      default: 'customer',
    },
    status: { type: String, enum: ['active', 'suspended'], default: 'active' },
    lastLogin: { type: Date, default: null },
    notes: { type: String, default: '' },
    addresses: { type: [AddressSchema], default: [] },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const ReviewSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
    customerName: { type: String, required: true },
    customerEmail: { type: String, default: '' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, default: '' },
    comment: { type: String, required: true },
    verifiedPurchase: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const SettingSchema = new mongoose.Schema(
  {
    storeName: { type: String, default: 'Nordika Scandinavian Studio' },
    storeEmail: { type: String, default: 'concierge@nordika.com' },
    storePhone: { type: String, default: '+1 (206) 555-0199' },
    storeAddress: { type: String, default: '440 Westlake Ave N, Suite 300, Seattle, WA 98109' },
    currency: {
      code: { type: String, default: 'USD' },
      symbol: { type: String, default: '$' },
    },
    shippingRules: {
      flatRate: { type: Number, default: 150 },
      freeShippingThreshold: { type: Number, default: 2000 },
      expeditedRate: { type: Number, default: 350 },
      whiteGloveRate: { type: Number, default: 450 },
    },
    taxRates: [
      {
        region: { type: String, required: true },
        rate: { type: Number, required: true, default: 8.5 },
      },
    ],
    paymentMethods: {
      creditCard: { type: Boolean, default: true },
      applePay: { type: Boolean, default: true },
      bankTransfer: { type: Boolean, default: true },
      cashOnDelivery: { type: Boolean, default: false },
    },
    globalCommissionRate: { type: Number, default: 10 },
    homepageSections: {
      bestSellersTitle: { type: String, default: "Today's Best Selling" },
      bestSellersSubtitle: { type: String, default: 'Artisanal creations designed for modern living' },
      trendingTitle: { type: String, default: 'Trending Now' },
      trendingSubtitle: { type: String, default: 'What customers are loving this month' },
    },
  },
  { timestamps: true }
);

const NewsletterSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    status: { type: String, enum: ['subscribed', 'unsubscribed'], default: 'subscribed' },
    source: { type: String, default: 'footer' },
  },
  { timestamps: true }
);

const SourcedItemSchema = new mongoose.Schema(
  {
    sourceImageUrl: { type: String, required: true },
    sourceUrl: { type: String, default: '' },
    isReferenceOnly: { type: Boolean, default: true },
    aiAnalysis: {
      furnitureType: { type: String, default: '' },
      materials: { type: [String], default: [] },
      estimatedDimensions: { type: String, default: '' },
      complexityRating: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
      suggestedPriceMin: { type: Number, default: 0 },
      suggestedPriceMax: { type: Number, default: 0 },
      confidenceNote: { type: String, default: '' },
    },
    manualOverride: {
      materialCost: { type: Number, default: 250 },
      laborHours: { type: Number, default: 8 },
      laborRate: { type: Number, default: 45 },
      overheadPercent: { type: Number, default: 15 },
      markupMultiplier: { type: Number, default: 2.2 },
      calculatedCost: { type: Number, default: 0 },
      finalPrice: { type: Number, default: 0 },
    },
    status: {
      type: String,
      enum: ['analyzing', 'reviewed', 'converted_to_product', 'discarded'],
      default: 'analyzing',
    },
    linkedProductId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);
const Inquiry = mongoose.models.Inquiry || mongoose.model('Inquiry', InquirySchema);
const Agent = mongoose.models.Agent || mongoose.model('Agent', AgentSchema);
const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Review = mongoose.models.Review || mongoose.model('Review', ReviewSchema);
const Setting = mongoose.models.Setting || mongoose.model('Setting', SettingSchema);
const Newsletter = mongoose.models.Newsletter || mongoose.model('Newsletter', NewsletterSchema);
const SourcedItem = mongoose.models.SourcedItem || mongoose.model('SourcedItem', SourcedItemSchema);

// Helper to generate dates over the past 30 days
function getRandomPastDate(daysAgo = 30) {
  const date = new Date();
  const randomDays = Math.floor(Math.random() * daysAgo);
  const randomHours = Math.floor(Math.random() * 24);
  const randomMinutes = Math.floor(Math.random() * 60);
  date.setDate(date.getDate() - randomDays);
  date.setHours(date.getHours() - randomHours);
  date.setMinutes(date.getMinutes() - randomMinutes);
  return date;
}

// 3. Seed Datasets
const SEED_CATEGORIES = [
  {
    name: 'Seating',
    slug: 'living-room',
    image: 'https://picsum.photos/seed/cat-living-room/800/800',
    icon: 'Armchair',
    description: 'Sculptural modular bouclé sectionals, ergonomic armchairs, and minimalist oak benches.',
    itemCount: 6,
  },
  {
    name: 'Tables',
    slug: 'dining-room',
    image: 'https://picsum.photos/seed/cat-dining-room/800/800',
    icon: 'Layers',
    description: 'Extendable European oak dining tables, sculptural travertine cocktail tables, and slim console desks.',
    itemCount: 5,
  },
  {
    name: 'Storage & Units',
    slug: 'storage',
    image: 'https://picsum.photos/seed/cat-storage/800/800',
    icon: 'Archive',
    description: 'Fluted wood sideboards, floating bookshelves, architectural wardrobes, and media credenzas.',
    itemCount: 4,
  },
  {
    name: 'Beds & Bedroom',
    slug: 'bedroom',
    image: 'https://picsum.photos/seed/cat-bedroom/800/800',
    icon: 'Bed',
    description: 'Solid walnut platform bed frames, floating nightstands, and organic linen dressers.',
    itemCount: 4,
  },
  {
    name: 'Doors & Fittings',
    slug: 'doors',
    image: 'https://picsum.photos/seed/cat-doors/800/800',
    icon: 'DoorClosed',
    description: 'Solid core interior wooden doors, slatted barn doors, and brushed brass architectural hardware.',
    itemCount: 4,
  },
  {
    name: 'Kitchen & Cabinetry',
    slug: 'kitchen',
    image: 'https://picsum.photos/seed/cat-kitchen/800/800',
    icon: 'UtensilsCrossed',
    description: 'Custom island counters, fluted timber pantry cabinets, and counter-height leather stools.',
    itemCount: 3,
  },
  {
    name: 'Outdoor Living',
    slug: 'outdoor',
    image: 'https://picsum.photos/seed/cat-outdoor/800/800',
    icon: 'Sun',
    description: 'Sustainably harvested teak loungers, concrete dining sets, and water-repellent lounge sofas.',
    itemCount: 3,
  },
  {
    name: 'Office & Desks',
    slug: 'home-office',
    image: 'https://picsum.photos/seed/cat-home-office/800/800',
    icon: 'Briefcase',
    description: 'Executive solid oak work desks, ergonomic task chairs, and minimal credenzas.',
    itemCount: 3,
  },
  {
    name: 'Lighting & Decor',
    slug: 'lighting-decor',
    image: 'https://picsum.photos/seed/cat-lighting-decor/800/800',
    icon: 'Lamp',
    description: 'Brushed brass floor lamps, hand-blown glass pendants, and organic travertine sculptures.',
    itemCount: 3,
  },
  {
    name: 'Custom Made',
    slug: 'custom-order',
    image: 'https://picsum.photos/seed/cat-custom-order/800/800',
    icon: 'Hammer',
    description: 'Bespoke architectural woodwork, customized dimensions, and exclusive trade commissions.',
    itemCount: 2,
  },
];

const RAW_PRODUCTS = [
  // SEATING
  {
    name: 'Nordika Haven Modular Bouclé Sofa',
    slug: 'nordika-haven-modular-boucle-sofa',
    category: 'living-room',
    price: 2450,
    originalPrice: 2850,
    images: [
      'https://picsum.photos/seed/nordika-haven-modular-boucle-sofa/800/800',
      'https://picsum.photos/seed/nordika-haven-modular-boucle-sofa-2/800/800',
    ],
    colors: ['Oatmeal Cream', 'Charcoal', 'Walnut'],
    materials: ['Textured Bouclé', 'FSC Solid Pine', 'Memory Foam'],
    description: 'An architectural statement piece combining cloud-like comfort with clean Scandinavian proportions.',
    specs: { dimensions: '112" W x 42" D x 29" H', weight: '165 lbs', materialDetails: 'Wool-blend bouclé', assembly: 'Minimal' },
    rating: 4.9,
    reviewCount: 42,
    inStock: true,
    isFeatured: true,
    isBestSeller: true,
    trending: true,
    status: 'published',
  },
  {
    name: 'Stockholm Curved Lounge Armchair',
    slug: 'stockholm-curved-lounge-armchair',
    category: 'living-room',
    price: 890,
    originalPrice: 1050,
    images: [
      'https://picsum.photos/seed/stockholm-curved-lounge-armchair/800/800',
      'https://picsum.photos/seed/stockholm-curved-lounge-armchair-2/800/800',
    ],
    colors: ['Warm Sand', 'Olive Velvet', 'Charcoal'],
    materials: ['Bouclé', 'Solid Oak Legs'],
    description: 'Sculptural reading armchair with wrap-around ergonomic barrel curve.',
    specs: { dimensions: '34" W x 32" D x 30" H', weight: '45 lbs' },
    rating: 4.8,
    reviewCount: 28,
    inStock: true,
    isFeatured: true,
    isBestSeller: true,
    trending: true,
    status: 'published',
  },
  {
    name: 'Oslo Minimalist 3-Seater Leather Sofa',
    slug: 'oslo-minimalist-3-seater-leather-sofa',
    category: 'living-room',
    price: 2150,
    originalPrice: 2400,
    images: [
      'https://picsum.photos/seed/oslo-minimalist-3-seater-leather-sofa/800/800',
      'https://picsum.photos/seed/oslo-minimalist-3-seater-leather-sofa-2/800/800',
    ],
    colors: ['Cognac Leather', 'Dark Espresso'],
    materials: ['Full-Grain Leather', 'Solid Ash'],
    description: 'Butter-soft Italian full-grain leather tailored over clean Scandinavian exposed wood rails.',
    specs: { dimensions: '88" W x 36" D x 31" H', weight: '130 lbs' },
    rating: 4.9,
    reviewCount: 19,
    inStock: true,
    isFeatured: false,
    isBestSeller: false,
    trending: true,
    status: 'published',
  },
  {
    name: 'Bergen Upholstered Dining Bench',
    slug: 'bergen-upholstered-dining-bench',
    category: 'living-room',
    price: 520,
    images: [
      'https://picsum.photos/seed/bergen-upholstered-dining-bench/800/800',
      'https://picsum.photos/seed/bergen-upholstered-dining-bench-2/800/800',
    ],
    colors: ['Oatmeal', 'Charcoal'],
    materials: ['Solid Oak', 'Wool Weave'],
    description: 'Solid European oak frame with high-density padded bench cushion.',
    specs: { dimensions: '60" W x 16" D x 18" H', weight: '32 lbs' },
    rating: 4.7,
    reviewCount: 12,
    inStock: true,
    isFeatured: false,
    isBestSeller: false,
    trending: false,
    status: 'published',
  },

  // TABLES
  {
    name: 'Aura Travertine & Walnut Coffee Table',
    slug: 'aura-travertine-walnut-coffee-table',
    category: 'dining-room',
    price: 980,
    originalPrice: 1180,
    images: [
      'https://picsum.photos/seed/aura-travertine-walnut-coffee-table/800/800',
      'https://picsum.photos/seed/aura-travertine-walnut-coffee-table-2/800/800',
    ],
    colors: ['Ivory Travertine', 'Honed Black Marble'],
    materials: ['Italian Travertine Stone', 'Solid American Walnut'],
    description: 'Solid Roman travertine stone resting atop intersecting solid walnut pedestal pillars.',
    specs: { dimensions: '48" W x 28" D x 16" H', weight: '95 lbs' },
    rating: 5.0,
    reviewCount: 34,
    inStock: true,
    isFeatured: true,
    isBestSeller: true,
    trending: true,
    status: 'published',
  },
  {
    name: 'Stockholm Extendable Oak Dining Table',
    slug: 'stockholm-extendable-oak-dining-table',
    category: 'dining-room',
    price: 1850,
    originalPrice: 2200,
    images: [
      'https://picsum.photos/seed/stockholm-extendable-oak-dining-table/800/800',
      'https://picsum.photos/seed/stockholm-extendable-oak-dining-table-2/800/800',
    ],
    colors: ['Natural White Oak', 'Smoked Oak'],
    materials: ['Solid European White Oak'],
    description: 'Seamless German butterfly leaf mechanism extends from 6 to 10 dinner guests effortlessly.',
    specs: { dimensions: '78"-108" L x 38" W x 30" H', weight: '145 lbs' },
    rating: 4.9,
    reviewCount: 52,
    inStock: true,
    isFeatured: true,
    isBestSeller: true,
    trending: false,
    status: 'published',
  },
  {
    name: 'Koben Minimalist Side Table',
    slug: 'koben-minimalist-side-table',
    category: 'dining-room',
    price: 280,
    images: [
      'https://picsum.photos/seed/koben-minimalist-side-table/800/800',
      'https://picsum.photos/seed/koben-minimalist-side-table-2/800/800',
    ],
    colors: ['Oak', 'Walnut', 'Black Ash'],
    materials: ['Solid Oak'],
    description: 'Cylindrical tripod side table crafted with concealed screwless joints.',
    specs: { dimensions: '18" Dia x 20" H', weight: '14 lbs' },
    rating: 4.6,
    reviewCount: 16,
    inStock: true,
    isFeatured: false,
    isBestSeller: false,
    trending: false,
    status: 'published',
  },

  // STORAGE
  {
    name: 'Malmö Fluted Solid Oak Sideboard',
    slug: 'malmo-fluted-solid-oak-sideboard',
    category: 'storage',
    price: 1650,
    originalPrice: 1950,
    images: [
      'https://picsum.photos/seed/malmo-fluted-solid-oak-sideboard/800/800',
      'https://picsum.photos/seed/malmo-fluted-solid-oak-sideboard-2/800/800',
    ],
    colors: ['Natural Oak', 'Smoked Walnut'],
    materials: ['Solid White Oak', 'Soft-Close German Hinges'],
    description: 'Precision CNC-fluted door fronts with push-to-open concealed acoustic dampeners.',
    specs: { dimensions: '72" W x 18" D x 30" H', weight: '125 lbs' },
    rating: 4.9,
    reviewCount: 23,
    inStock: true,
    isFeatured: true,
    isBestSeller: true,
    trending: true,
    status: 'published',
  },
  {
    name: 'Gothenburg Modular Oak Wall Bookshelf',
    slug: 'gothenburg-modular-oak-wall-bookshelf',
    category: 'storage',
    price: 1120,
    images: [
      'https://picsum.photos/seed/gothenburg-modular-oak-wall-bookshelf/800/800',
      'https://picsum.photos/seed/gothenburg-modular-oak-wall-bookshelf-2/800/800',
    ],
    colors: ['Oak', 'Walnut'],
    materials: ['FSC White Oak'],
    description: 'Architectural modular shelving unit designed for open floor plans and modern studios.',
    specs: { dimensions: '64" W x 14" D x 78" H', weight: '110 lbs' },
    rating: 4.8,
    reviewCount: 14,
    inStock: true,
    isFeatured: false,
    isBestSeller: false,
    trending: false,
    status: 'published',
  },

  // BEDS
  {
    name: 'Nordic Floating Platform Bed',
    slug: 'nordic-floating-platform-bed',
    category: 'bedroom',
    price: 1950,
    originalPrice: 2300,
    images: [
      'https://picsum.photos/seed/nordic-floating-platform-bed/800/800',
      'https://picsum.photos/seed/nordic-floating-platform-bed-2/800/800',
    ],
    colors: ['American Walnut', 'White Oak'],
    materials: ['Solid American Walnut', 'Solid Slats'],
    description: 'Concealed cantilever base creates a weightless floating illusion in the master sanctuary.',
    specs: { dimensions: '84" L x 76" W x 38" H (King)', weight: '180 lbs' },
    rating: 5.0,
    reviewCount: 39,
    inStock: true,
    isFeatured: true,
    isBestSeller: true,
    trending: true,
    status: 'published',
  },
  {
    name: 'Visby Minimalist Nightstand Set',
    slug: 'visby-minimalist-nightstand-set',
    category: 'bedroom',
    price: 540,
    images: [
      'https://picsum.photos/seed/visby-minimalist-nightstand-set/800/800',
      'https://picsum.photos/seed/visby-minimalist-nightstand-set-2/800/800',
    ],
    colors: ['Natural Oak', 'Smoked Oak'],
    materials: ['Solid Oak', 'Felt Lining'],
    description: 'Pair of compact bedside drawer tables with soft-closing Blum slides.',
    specs: { dimensions: '20" W x 16" D x 19" H (each)', weight: '38 lbs' },
    rating: 4.7,
    reviewCount: 21,
    inStock: true,
    isFeatured: false,
    isBestSeller: false,
    trending: false,
    status: 'published',
  },

  // DOORS & FITTINGS
  {
    name: 'Vanguard Slatted Solid Oak Interior Door',
    slug: 'vanguard-slatted-solid-oak-interior-door',
    category: 'doors',
    price: 680,
    originalPrice: 820,
    images: [
      'https://picsum.photos/seed/vanguard-slatted-solid-oak-interior-door/800/800',
      'https://picsum.photos/seed/vanguard-slatted-solid-oak-interior-door-2/800/800',
    ],
    colors: ['Natural Oak', 'Blackened Timber', 'Smoked Walnut'],
    materials: ['Solid Core Hardwood', 'Concealed Pivot Hinges'],
    description: 'Vertical acoustic timber slats with solid sound-dampening core and magnetic latch.',
    specs: { dimensions: '36" W x 84" H x 1.75" D', weight: '85 lbs' },
    rating: 4.9,
    reviewCount: 17,
    inStock: true,
    isFeatured: true,
    isBestSeller: false,
    trending: true,
    status: 'published',
  },
  {
    name: 'Architectural Modern Barn Door with Hardware',
    slug: 'architectural-modern-barn-door-hardware',
    category: 'doors',
    price: 790,
    images: [
      'https://picsum.photos/seed/architectural-modern-barn-door-hardware/800/800',
      'https://picsum.photos/seed/architectural-modern-barn-door-hardware-2/800/800',
    ],
    colors: ['Raw European Oak', 'Charcoal Stained'],
    materials: ['Solid Oak', 'Matte Black Steel Rail'],
    description: 'Whisper-quiet sliding barn door with precision ball-bearing top rail system.',
    specs: { dimensions: '40" W x 84" H', weight: '90 lbs' },
    rating: 4.8,
    reviewCount: 15,
    inStock: true,
    isFeatured: false,
    isBestSeller: false,
    trending: false,
    status: 'published',
  },

  // KITCHEN & CABINETRY
  {
    name: 'Nordika Custom Kitchen Island with Travertine',
    slug: 'nordika-custom-kitchen-island-travertine',
    category: 'kitchen',
    price: 3200,
    images: [
      'https://picsum.photos/seed/nordika-custom-kitchen-island-travertine/800/800',
      'https://picsum.photos/seed/nordika-custom-kitchen-island-travertine-2/800/800',
    ],
    colors: ['Oatmeal Oak', 'Charcoal Timber'],
    materials: ['Solid Oak', 'Honed Roman Travertine'],
    description: 'Freestanding kitchen island unit with fluted bar counter overhang and cutlery drawers.',
    specs: { dimensions: '84" W x 36" D x 36" H', weight: '260 lbs' },
    rating: 5.0,
    reviewCount: 8,
    inStock: true,
    isFeatured: true,
    isBestSeller: false,
    trending: true,
    status: 'published',
  },
  {
    name: 'Copenhagen Leather Counter Stool Set (2)',
    slug: 'copenhagen-leather-counter-stool-set',
    category: 'kitchen',
    price: 640,
    images: [
      'https://picsum.photos/seed/copenhagen-leather-counter-stool-set/800/800',
      'https://picsum.photos/seed/copenhagen-leather-counter-stool-set-2/800/800',
    ],
    colors: ['Cognac', 'Black Leather'],
    materials: ['Solid Oak', 'Top-Grain Leather'],
    description: 'Set of two counter-height stools with ergonomic contoured seat pan.',
    specs: { dimensions: '19" W x 20" D x 36" H (Seat: 26")', weight: '22 lbs each' },
    rating: 4.8,
    reviewCount: 29,
    inStock: true,
    isFeatured: false,
    isBestSeller: false,
    trending: false,
    status: 'published',
  },

  // OUTDOOR
  {
    name: 'Solvorn Teak Outdoor Lounge Chair Set',
    slug: 'solvorn-teak-outdoor-lounge-chair-set',
    category: 'outdoor',
    price: 1350,
    images: [
      'https://picsum.photos/seed/solvorn-teak-outdoor-lounge-chair-set/800/800',
      'https://picsum.photos/seed/solvorn-teak-outdoor-lounge-chair-set-2/800/800',
    ],
    colors: ['Natural Teak / Sand Upholstery'],
    materials: ['Grade-A Teak', 'Sunbrella Performance Fabric'],
    description: 'Weatherproof high-oil plantation teak that weathers gracefully to silver patina.',
    specs: { dimensions: '32" W x 34" D x 28" H', weight: '42 lbs each' },
    rating: 4.9,
    reviewCount: 18,
    inStock: true,
    isFeatured: false,
    isBestSeller: false,
    trending: true,
    status: 'published',
  },

  // OFFICE
  {
    name: 'Kobenhavn Executive Oak Desk',
    slug: 'kobenhavn-executive-oak-desk',
    category: 'home-office',
    price: 1450,
    originalPrice: 1680,
    images: [
      'https://picsum.photos/seed/kobenhavn-executive-oak-desk/800/800',
      'https://picsum.photos/seed/kobenhavn-executive-oak-desk-2/800/800',
    ],
    colors: ['White Oak', 'American Walnut'],
    materials: ['Solid Oak', 'Concealed Cable Channel'],
    description: 'Clean floating tabletop with discreet magnetic cable organizer and soft-close drawers.',
    specs: { dimensions: '64" W x 30" D x 30" H', weight: '95 lbs' },
    rating: 4.9,
    reviewCount: 31,
    inStock: true,
    isFeatured: true,
    isBestSeller: true,
    trending: false,
    status: 'published',
  },

  // LIGHTING
  {
    name: 'Aalto Sculptural Brass Pendant Lamp',
    slug: 'aalto-sculptural-brass-pendant-lamp',
    category: 'lighting-decor',
    price: 380,
    images: [
      'https://picsum.photos/seed/aalto-sculptural-brass-pendant-lamp/800/800',
      'https://picsum.photos/seed/aalto-sculptural-brass-pendant-lamp-2/800/800',
    ],
    colors: ['Brushed Brass', 'Matte Black', 'Brushed Nickel'],
    materials: ['Solid Spun Brass', 'Mouth-Blown Opal Glass'],
    description: 'Warm ambient glow with architectural tiered spun brass reflectors.',
    specs: { dimensions: '16" Dia x 12" H (6ft adjustable cord)', weight: '8 lbs' },
    rating: 4.9,
    reviewCount: 44,
    inStock: true,
    isFeatured: false,
    isBestSeller: false,
    trending: true,
    status: 'published',
  },

  // DRAFT PRODUCTS (FOR ADMIN WORKFLOW TESTING)
  {
    name: 'Nordika Prototype Travertine Pedestal [DRAFT]',
    slug: 'nordika-prototype-travertine-pedestal-draft',
    category: 'lighting-decor',
    price: 620,
    images: [
      'https://picsum.photos/seed/nordika-prototype-travertine-pedestal-draft/800/800',
    ],
    colors: ['Honed Travertine'],
    materials: ['Raw Travertine'],
    description: 'Sculptural stone pedestal currently undergoing material stress testing.',
    specs: { dimensions: '14" Dia x 36" H', weight: '70 lbs' },
    rating: 0,
    reviewCount: 0,
    inStock: false,
    stockCount: 0,
    status: 'draft',
  },
  {
    name: 'Oslo Minimalist Daybed Prototype [DRAFT]',
    slug: 'oslo-minimalist-daybed-prototype-draft',
    category: 'living-room',
    price: 1890,
    images: [
      'https://picsum.photos/seed/oslo-minimalist-daybed-prototype-draft/800/800',
    ],
    colors: ['Natural Oak / Camel Leather'],
    materials: ['Solid Oak', 'Saddle Leather'],
    description: 'Bespoke daybed in development with local architectural partners.',
    specs: { dimensions: '78" L x 32" W x 17" H', weight: '80 lbs' },
    rating: 0,
    reviewCount: 0,
    inStock: true,
    stockCount: 2,
    status: 'draft',
  },
];

const SAMPLE_USERS = [
  {
    name: 'Astrid Lindgren',
    email: 'admin@nordika.com',
    role: 'super_admin',
    phone: '+1 (206) 555-0100',
    notes: 'Primary executive administrator with unrestricted platform privileges.',
    addresses: [
      {
        isDefault: true,
        street: '440 Westlake Ave N',
        apartment: 'Suite 300',
        city: 'Seattle',
        state: 'WA',
        postalCode: '98109',
        country: 'United States',
      },
    ],
  },
  {
    name: 'Henrik Vanger',
    email: 'pm@nordika.com',
    role: 'product_manager',
    phone: '+1 (206) 555-0101',
    notes: 'Lead product catalog manager and visual merchandiser.',
  },
  {
    name: 'Elin Blomqvist',
    email: 'sales@nordika.com',
    role: 'sales_manager',
    phone: '+1 (206) 555-0102',
    notes: 'Directs wholesale accounts, trade commissions, and concierge quotes.',
  },
  {
    name: 'Linnea Holm',
    email: 'support@nordika.com',
    role: 'support',
    phone: '+1 (206) 555-0103',
    notes: 'Handles client support tickets, shipping inquiries, and order notes.',
  },
  {
    name: 'Freja Lind',
    email: 'demo@nordika.com',
    role: 'customer',
    addresses: [
      {
        isDefault: true,
        street: '742 Evergreen Terrace',
        apartment: 'Apt 4B',
        city: 'Seattle',
        state: 'WA',
        postalCode: '98101',
        country: 'United States',
      },
    ],
  },
  {
    name: 'Marcus Lindqvist',
    email: 'marcus.l@archstudio.se',
    role: 'customer',
    addresses: [
      {
        isDefault: true,
        street: '1280 Mission Street',
        city: 'San Francisco',
        state: 'CA',
        postalCode: '94103',
        country: 'United States',
      },
    ],
  },
  {
    name: 'Elena Rostova',
    email: 'elena@rostovadesign.com',
    role: 'customer',
    addresses: [
      {
        isDefault: true,
        street: '450 7th Ave',
        city: 'New York',
        state: 'NY',
        postalCode: '10123',
        country: 'United States',
      },
    ],
  },
  {
    name: 'Sophia Chen',
    email: 'sophia.c@interiors.ca',
    role: 'customer',
    addresses: [
      {
        isDefault: true,
        street: '888 Burrard St',
        city: 'Vancouver',
        state: 'BC',
        postalCode: 'V6Z 1X9',
        country: 'Canada',
      },
    ],
  },
];

const SAMPLE_AGENTS = [
  {
    name: 'Astrid Vanger',
    email: 'astrid@vangerinteriors.com',
    phone: '+1 (206) 555-0812',
    city: 'Seattle, WA',
    experience: '8+ years principal designer for residential waterfront estates.',
    salesChannel: 'Interior Designer',
    status: 'approved',
    referralCode: 'ASTRID-NORD',
    totalSales: 48500,
    commissionOwed: 4850,
  },
  {
    name: 'Klaus Eklund',
    email: 'klaus@eklundstudio.com',
    phone: '+1 (415) 555-0934',
    city: 'San Francisco, CA',
    experience: 'Architectural firm specifying commercial and luxury hospitality.',
    salesChannel: 'Architect',
    status: 'approved',
    referralCode: 'KLAUS-ARCH',
    totalSales: 89000,
    commissionOwed: 8900,
  },
  {
    name: 'Clara Sorensen',
    email: 'clara@sorensendesign.dk',
    phone: '+1 (312) 555-0145',
    city: 'Chicago, IL',
    experience: 'Boutique showroom rep specializing in European minimalist furniture.',
    salesChannel: 'Showroom Representative',
    status: 'pending',
    referralCode: 'CLARA-CHI',
    totalSales: 0,
    commissionOwed: 0,
  },
  {
    name: 'David Thorne',
    email: 'david@thornebuilds.com',
    phone: '+1 (503) 555-0198',
    city: 'Portland, OR',
    experience: 'Custom home builder sourcing interior doors and joinery packages.',
    salesChannel: 'Contractor / Builder',
    status: 'pending',
    totalSales: 0,
    commissionOwed: 0,
  },
  {
    name: 'Johan Becker',
    email: 'johan@beckerpartners.com',
    phone: '+1 (212) 555-0377',
    city: 'New York, NY',
    experience: 'Commercial developer and staging consultant.',
    salesChannel: 'Staging & Developer',
    status: 'rejected',
    notes: 'Outside target service territory for white-glove installation.',
    totalSales: 0,
    commissionOwed: 0,
  },
];

const SAMPLE_INQUIRIES = [
  {
    name: 'Lars Holm',
    email: 'lars@holmarchitects.com',
    phone: '+1 (206) 555-7711',
    type: 'custom',
    productContext: 'Bespoke 12-Seat Travertine Dining Table',
    dimensions: '144" L x 48" W x 30" H',
    budget: '$10,000+',
    message: 'We are specifying a custom travertine dining table for a penthouse in Bellevue. Need CAD drawings.',
    status: 'quoted',
    createdAt: getRandomPastDate(5),
  },
  {
    name: 'Soren Dahl',
    email: 'soren@dahlhotel.com',
    phone: '+1 (415) 555-4422',
    type: 'wholesale',
    productContext: 'Vanguard Slatted Solid Oak Interior Doors',
    dimensions: '40 Doors (36" x 84")',
    budget: '$25,000 - $50,000',
    message: 'Requesting trade pricing for 40 solid oak guest room doors for a boutique hotel renovation.',
    status: 'in_review',
    createdAt: getRandomPastDate(12),
  },
  {
    name: 'Emily Watson',
    email: 'emily.w@gmail.com',
    phone: '+1 (212) 555-9988',
    type: 'general',
    message: 'Could you please send material fabric swatch samples for the Haven Bouclé Sofa in Oatmeal and Sage?',
    status: 'new',
    createdAt: getRandomPastDate(2),
  },
  {
    name: 'Henrik Larsson',
    email: 'henrik@nordicestates.se',
    phone: '+1 (310) 555-3344',
    type: 'custom',
    productContext: 'Full Wall Fluted Wardrobe System',
    dimensions: '180" W x 108" H x 24" D',
    budget: '$15,000+',
    message: 'Client approved the proposal. Ready to proceed with contract and initial deposit.',
    status: 'won',
    createdAt: getRandomPastDate(25),
  },
  {
    name: 'Marcus Reed',
    email: 'marcus@reeddesign.com',
    phone: '+1 (512) 555-6677',
    type: 'support',
    message: 'Inquiring regarding white-glove delivery scheduling for Austin, TX.',
    status: 'new',
    createdAt: getRandomPastDate(1),
  },
];

const SAMPLE_REVIEWS_TEMPLATES = [
  {
    rating: 5,
    title: 'Heirloom Craftsmanship and Sculptural Elegance',
    comment: 'The quality of the solid oak and precision joints exceeded all expectations. A truly stunning statement piece.',
  },
  {
    rating: 5,
    title: 'Flawless White-Glove Delivery Experience',
    comment: 'Arrived on schedule, packaged meticulously. The texture of the bouclé is soft yet very durable.',
  },
  {
    rating: 4,
    title: 'Beautiful Materials, True Scandinavian Aesthetic',
    comment: 'Very happy with our purchase. Wood oil finish smells natural and feels wonderfully tactile.',
  },
  {
    rating: 5,
    title: 'Architectural Masterpiece',
    comment: 'The travertine stone table has become the centerpiece of our living room. Worth every penny.',
  },
  {
    rating: 4,
    title: 'Solid and Sturdy',
    comment: 'Solid wood through and through. Delivery team carried it up three flights with great care.',
  },
];

// 4. Main Seed Function
async function seed() {
  console.log('\n=========================================');
  console.log('🌱 NORDIKA LUXURY FURNITURE — SEED SCRIPT');
  console.log('=========================================');
  console.log(`Connecting to: ${MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')}...`);

  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log('✅ Connected to MongoDB successfully!\n');

    // 1. Clean existing records
    console.log('🧹 Cleaning previous collections...');
    await Promise.all([
      Category.deleteMany({}),
      Product.deleteMany({}),
      Order.deleteMany({}),
      Inquiry.deleteMany({}),
      Agent.deleteMany({}),
      User.deleteMany({}),
      Review.deleteMany({}),
      Setting.deleteMany({}),
      Newsletter.deleteMany({}),
      SourcedItem.deleteMany({}),
    ]);

    // 1.1 Seed Store Settings
    console.log('⚙️ Seeding Store Settings & Configuration...');
    const defaultSetting = await Setting.create({
      storeName: 'Nordika Scandinavian Studio',
      storeEmail: 'concierge@nordika.com',
      storePhone: '+1 (206) 555-0199',
      storeAddress: '440 Westlake Ave N, Suite 300, Seattle, WA 98109',
      currency: { code: 'USD', symbol: '$' },
      shippingRules: {
        flatRate: 150,
        freeShippingThreshold: 2000,
        expeditedRate: 350,
        whiteGloveRate: 450,
      },
      taxRates: [
        { region: 'Washington (WA)', rate: 8.5 },
        { region: 'California (CA)', rate: 7.25 },
        { region: 'New York (NY)', rate: 8.875 },
      ],
      paymentMethods: {
        creditCard: true,
        applePay: true,
        bankTransfer: true,
        cashOnDelivery: false,
      },
      globalCommissionRate: 10,
      homepageSections: {
        bestSellersTitle: "Today's Best Selling",
        bestSellersSubtitle: 'Artisanal creations designed for modern living',
        trendingTitle: 'Trending Now',
        trendingSubtitle: 'What customers are loving this month',
      },
      branding: {
        logoUrl: '',
        darkLogoUrl: '',
        watermarkUrl: '',
      },
    });
    console.log('✅ Seeded default store settings.');

    // 1.2 Seed Newsletter Subscribers
    console.log('✉️ Seeding Newsletter Subscribers...');
    const createdNewsletters = await Newsletter.insertMany([
      { email: 'sarah.miller@interiorarch.com', status: 'subscribed', source: 'footer', createdAt: getRandomPastDate(20) },
      { email: 'oliver.wright@modernspace.co', status: 'subscribed', source: 'footer', createdAt: getRandomPastDate(15) },
      { email: 'claire.dubois@atelierdesign.fr', status: 'subscribed', source: 'footer', createdAt: getRandomPastDate(10) },
      { email: 'm.karlsson@nordichomes.se', status: 'subscribed', source: 'footer', createdAt: getRandomPastDate(5) },
      { email: 'jessica.tan@studiozenith.sg', status: 'subscribed', source: 'footer', createdAt: getRandomPastDate(2) },
    ]);
    console.log(`✅ Seeded ${createdNewsletters.length} newsletter subscribers.`);

    // 2. Seed Categories
    console.log('📦 Seeding Product-Type Categories...');
    const createdCategories = await Category.insertMany(SEED_CATEGORIES);
    console.log(`✅ Seeded ${createdCategories.length} categories.`);

    // 3. Seed Products
    console.log('🛋️ Seeding Luxury Products...');
    const createdProducts = await Product.insertMany(RAW_PRODUCTS);
    console.log(`✅ Seeded ${createdProducts.length} products.`);

    // 4. Seed Users with hashed passwords
    console.log('👤 Seeding Users & Customer Accounts...');
    const passwordHash = await bcrypt.hash('password123', 10);
    const userDocs = SAMPLE_USERS.map((u, i) => ({
      ...u,
      passwordHash,
      wishlist: [createdProducts[i % createdProducts.length]._id, createdProducts[(i + 2) % createdProducts.length]._id],
      createdAt: getRandomPastDate(30),
    }));
    const createdUsers = await User.insertMany(userDocs);
    console.log(`✅ Seeded ${createdUsers.length} users (Super Admin: admin@nordika.com / PW: password123).`);

    // 5. Seed Orders (18 orders with audit timeline)
    console.log('📑 Seeding Realistic Orders across last 30 days with Audit Timelines...');
    const orderStatuses = ['pending', 'pending', 'processing', 'processing', 'shipped', 'delivered', 'delivered'];
    const orderDocs = [];

    for (let i = 1; i <= 18; i++) {
      const orderUser = createdUsers[i % createdUsers.length];
      const prod1 = createdProducts[i % createdProducts.length];
      const prod2 = createdProducts[(i + 3) % createdProducts.length];

      const qty1 = 1;
      const qty2 = i % 3 === 0 ? 2 : 1;
      const subtotal = prod1.price * qty1 + (i % 2 === 0 ? prod2.price * qty2 : 0);
      const tax = Math.round(subtotal * 0.085);
      const shipping = subtotal > 2000 ? 0 : 150;
      const total = subtotal + tax + shipping;
      const currentStatus = orderStatuses[i % orderStatuses.length];
      const orderDate = getRandomPastDate(28);

      const items = [
        {
          productId: prod1._id,
          name: prod1.name,
          price: prod1.price,
          quantity: qty1,
          variant: { color: prod1.colors?.[0] || 'Natural', material: prod1.materials?.[0] || 'Oak' },
          image: prod1.images?.[0] || '',
        },
      ];

      if (i % 2 === 0) {
        items.push({
          productId: prod2._id,
          name: prod2.name,
          price: prod2.price,
          quantity: qty2,
          variant: { color: prod2.colors?.[0] || 'Natural', material: prod2.materials?.[0] || 'Oak' },
          image: prod2.images?.[0] || '',
        });
      }

      // Build realistic audit timeline based on status
      const timeline = [
        {
          status: 'pending',
          note: 'Order placed by client via online checkout.',
          updatedAt: orderDate,
          updatedBy: 'Customer / Checkout',
        },
      ];

      if (['processing', 'shipped', 'delivered'].includes(currentStatus)) {
        const procDate = new Date(orderDate.getTime() + 1000 * 60 * 60 * 24);
        timeline.push({
          status: 'processing',
          note: 'Payment verified. Workshop joinery dispatch scheduled.',
          updatedAt: procDate,
          updatedBy: 'Henrik Vanger (Product Lead)',
        });
      }

      if (['shipped', 'delivered'].includes(currentStatus)) {
        const shipDate = new Date(orderDate.getTime() + 1000 * 60 * 60 * 48);
        timeline.push({
          status: 'shipped',
          note: 'White-glove carrier tracking #NORD-TRACK-9921 assigned.',
          updatedAt: shipDate,
          updatedBy: 'Elin Blomqvist (Sales Director)',
        });
      }

      if (currentStatus === 'delivered') {
        const delivDate = new Date(orderDate.getTime() + 1000 * 60 * 60 * 96);
        timeline.push({
          status: 'delivered',
          note: 'White-glove unboxing and room-of-choice placement completed. Signed by customer.',
          updatedAt: delivDate,
          updatedBy: 'White-Glove Logistics',
        });
      }

      orderDocs.push({
        orderNumber: `NORD-${10000 + i}`,
        user: orderUser._id,
        customer: {
          name: orderUser.name,
          email: orderUser.email,
          phone: orderUser.phone || '+1 (206) 555-0199',
          address: orderUser.addresses?.[0] || {
            street: '440 Westlake Ave',
            city: 'Seattle',
            state: 'WA',
            postalCode: '98109',
            country: 'United States',
          },
        },
        items,
        subtotal,
        shipping,
        tax,
        total,
        status: currentStatus,
        paymentMethod: 'credit_card',
        paymentStatus: 'paid',
        timeline,
        internalNotes: i % 3 === 0 ? [{ note: 'VIP Architect client — expedite packaging.', createdAt: orderDate, createdBy: 'Sales Team' }] : [],
        createdAt: orderDate,
      });
    }

    const createdOrders = await Order.insertMany(orderDocs);
    console.log(`✅ Seeded ${createdOrders.length} orders with timelines.`);

    // 6. Seed Inquiries with internal notes
    console.log('💬 Seeding Inquiries & Bespoke Quotes...');
    const inquiryDocs = SAMPLE_INQUIRIES.map((inq, idx) => ({
      ...inq,
      internalNotes: idx === 0 ? [{ note: 'Sent preliminary CAD rendering to client architect.', createdAt: getRandomPastDate(3), createdBy: 'Henrik Vanger' }] : [],
    }));
    const createdInquiries = await Inquiry.insertMany(inquiryDocs);
    console.log(`✅ Seeded ${createdInquiries.length} inquiries.`);

    // 7. Seed Agents with payout history
    console.log('🤝 Seeding Agent Applications & Partners...');
    const agentDocs = SAMPLE_AGENTS.map((agent) => ({
      ...agent,
      commissionRate: 10,
      payoutStatus: agent.commissionOwed > 0 ? 'pending_payout' : 'none',
      payoutHistory: agent.totalSales > 50000 ? [
        {
          amount: 4000,
          paidAt: getRandomPastDate(15),
          reference: 'WIRE-ACH-88901',
          notes: 'Q1 Trade commission payout',
          paidBy: 'Astrid Lindgren (Super Admin)',
        },
      ] : [],
    }));
    const createdAgents = await Agent.insertMany(agentDocs);
    console.log(`✅ Seeded ${createdAgents.length} agents.`);

    // 8. Seed Product Reviews
    console.log('⭐ Seeding Product Customer Reviews...');
    const reviewDocs = [];
    for (let i = 0; i < createdProducts.length; i++) {
      const prod = createdProducts[i];
      if (prod.status === 'published') {
        const t = SAMPLE_REVIEWS_TEMPLATES[i % SAMPLE_REVIEWS_TEMPLATES.length];
        reviewDocs.push({
          productId: prod._id,
          orderId: createdOrders[i % createdOrders.length]._id,
          customerName: createdUsers[i % createdUsers.length].name,
          customerEmail: createdUsers[i % createdUsers.length].email,
          rating: t.rating,
          title: t.title,
          comment: t.comment,
          verifiedPurchase: true,
          createdAt: getRandomPastDate(20),
        });
      }
    }
    const createdReviews = await Review.insertMany(reviewDocs);
    console.log(`✅ Seeded ${createdReviews.length} reviews.`);

    // 9. Seed Sourced Inspiration Items
    console.log('🎨 Seeding Source Studio Inspiration Items...');
    const sourcedItemDocs = [
      {
        sourceImageUrl: 'https://picsum.photos/seed/nordika-armchair-insp/800/800',
        sourceUrl: 'https://pinterest.com/pin/nordic-curved-boucle-chair',
        isReferenceOnly: true,
        aiAnalysis: {
          furnitureType: 'Stockholm Curved Lounge Armchair',
          materials: ['Solid European White Oak', 'Textured Wool Bouclé', 'High-Resilience Foam'],
          estimatedDimensions: '34" W x 32" D x 30" H',
          complexityRating: 'medium',
          suggestedPriceMin: 850,
          suggestedPriceMax: 1250,
          confidenceNote: 'Curved barrel silhouette with exposed solid hardwood frame and premium textured bouclé.',
        },
        manualOverride: {
          materialCost: 280,
          laborHours: 7,
          laborRate: 45,
          overheadPercent: 15,
          markupMultiplier: 2.2,
          calculatedCost: 684,
          finalPrice: 890,
        },
        status: 'reviewed',
        notes: 'Discovered during Copenhagen Design Fair 2026. High client interest for bedroom corner reading nook.',
        createdAt: getRandomPastDate(12),
      },
      {
        sourceImageUrl: 'https://picsum.photos/seed/aura-travertine-walnut-coffee-table/800/800',
        sourceUrl: 'https://pinterest.com/pin/travertine-coffee-table-minimal',
        isReferenceOnly: false,
        aiAnalysis: {
          furnitureType: 'Aura Travertine & Walnut Coffee Table',
          materials: ['Roman Travertine Stone', 'Solid American Walnut', 'Concealed Steel Pins'],
          estimatedDimensions: '48" W x 28" D x 16" H',
          complexityRating: 'high',
          suggestedPriceMin: 950,
          suggestedPriceMax: 1350,
          confidenceNote: 'Honed travertine slab paired with interlocking solid walnut pedestal pillars.',
        },
        manualOverride: {
          materialCost: 340,
          laborHours: 9,
          laborRate: 45,
          overheadPercent: 15,
          markupMultiplier: 2.2,
          calculatedCost: 856,
          finalPrice: 980,
        },
        status: 'converted_to_product',
        linkedProductId: createdProducts[4]._id,
        notes: 'Successfully converted to live catalog product. Primary studio photography verified.',
        createdAt: getRandomPastDate(20),
      },
      {
        sourceImageUrl: 'https://picsum.photos/seed/nordic-floating-platform-bed/800/800',
        sourceUrl: 'https://instagram.com/p/nordic-floating-bed',
        isReferenceOnly: true,
        aiAnalysis: {
          furnitureType: 'Nordic Cantilever Floating Platform Bed',
          materials: ['Solid American Walnut', 'Solid Slats', 'Concealed Cantilever Base'],
          estimatedDimensions: '84" L x 76" W x 38" H (King)',
          complexityRating: 'high',
          suggestedPriceMin: 1800,
          suggestedPriceMax: 2500,
          confidenceNote: 'Cantilever joinery creates weightless illusion with integrated solid wood headboard.',
        },
        manualOverride: {
          materialCost: 580,
          laborHours: 14,
          laborRate: 45,
          overheadPercent: 15,
          markupMultiplier: 2.2,
          calculatedCost: 1391,
          finalPrice: 1950,
        },
        status: 'analyzing',
        notes: 'Inspiration image queued for workshop joinery stress testing and material review.',
        createdAt: getRandomPastDate(3),
      },
    ];
    const createdSourcedItems = await SourcedItem.insertMany(sourcedItemDocs);
    console.log(`✅ Seeded ${createdSourcedItems.length} source studio inspiration items.`);

    console.log('\n=========================================');
    console.log('🎉 SEEDING COMPLETED SUCCESSFULLY!');
    console.log(`Summary:`);
    console.log(` - Categories:    ${createdCategories.length}`);
    console.log(` - Products:      ${createdProducts.length}`);
    console.log(` - Users:         ${createdUsers.length}`);
    console.log(` - Orders:        ${createdOrders.length}`);
    console.log(` - Inquiries:     ${createdInquiries.length}`);
    console.log(` - Agents:        ${createdAgents.length}`);
    console.log(` - Reviews:       ${createdReviews.length}`);
    console.log(` - Sourced Items: ${createdSourcedItems.length}`);
    console.log('=========================================\n');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Error during database seeding:', err.message);
    if (err.message.includes('ENOTFOUND') || err.message.includes('buffering timed out')) {
      console.log('\n💡 Tip: Please check your MONGODB_URI in .env.local.');
      console.log('If using MongoDB Atlas, make sure:');
      console.log(' 1. Your connection string is copied from MongoDB Atlas Connect modal.');
      console.log(' 2. Network Access in MongoDB Atlas allows IP address (0.0.0.0/0 for dev).');
      console.log(' 3. Database user username and password are correct.');
    }
    process.exit(1);
  }
}

seed();
