import mongoose from 'mongoose';

const SettingSchema = new mongoose.Schema(
  {
    storeName: {
      type: String,
      default: 'KB Furniture Scandinavian Studio',
    },
    storeEmail: {
      type: String,
      default: 'concierge@kbfurniture.com',
    },
    storePhone: {
      type: String,
      default: '+251 911 234 567',
    },
    storeAddress: {
      type: String,
      default: 'Bole Sub-City, Addis Ababa, Ethiopia',
    },
    currency: {
      code: { type: String, default: 'ETB' },
      symbol: { type: String, default: 'Birr' },
    },
    shippingRules: {
      flatRate: { type: Number, default: 1500 },
      freeShippingThreshold: { type: Number, default: 50000 },
      expeditedRate: { type: Number, default: 3500 },
      whiteGloveRate: { type: Number, default: 4500 },
    },
    taxRates: [
      {
        region: { type: String, required: true },
        rate: { type: Number, required: true, default: 15.0 },
      },
    ],
    paymentMethods: {
      cashOnDelivery: { type: Boolean, default: true },
      bankTransfer: { type: Boolean, default: true },
      creditCard: { type: Boolean, default: true },
      telebirr: { type: Boolean, default: true },
      applePay: { type: Boolean, default: false },
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
