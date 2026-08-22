import mongoose from 'mongoose';

const SettingSchema = new mongoose.Schema(
  {
    storeName: {
      type: String,
      default: 'Nordika Scandinavian Studio',
    },
    storeEmail: {
      type: String,
      default: 'concierge@nordika.com',
    },
    storePhone: {
      type: String,
      default: '+1 (206) 555-0199',
    },
    storeAddress: {
      type: String,
      default: '440 Westlake Ave N, Suite 300, Seattle, WA 98109',
    },
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
    globalCommissionRate: {
      type: Number,
      default: 10,
    },
    homepageSections: {
      bestSellersTitle: { type: String, default: "Today's Best Selling" },
      bestSellersSubtitle: { type: String, default: 'Artisanal creations designed for modern living' },
      trendingTitle: { type: String, default: 'Trending Now' },
      trendingSubtitle: { type: String, default: 'What customers are loving this month' },
      pinnedBestSellers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
      pinnedTrending: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    },
    branding: {
      logoUrl: { type: String, default: '' },
      darkLogoUrl: { type: String, default: '' },
      watermarkUrl: { type: String, default: '' },
      faviconUrl: { type: String, default: '' },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Setting || mongoose.model('Setting', SettingSchema);
