/**
 * Publishing Helper: Placeholder Substitution & Default Templates
 */

export function substitutePlaceholders(templateText, product = {}) {
  if (!templateText) return '';

  const productName = product.name || 'KB Handcrafted Furniture';
  const category = product.category || 'Living Room';
  const materials = Array.isArray(product.materials)
    ? product.materials.join(', ')
    : product.materials || 'Solid Hardwood';
  const price = product.price ? product.price.toLocaleString() : 'Price on request';
  const description = product.description || 'Handmade solid wood piece built in Addis Ababa.';

  return templateText
    .replace(/\{productName\}/gi, productName)
    .replace(/\{category\}/gi, category)
    .replace(/\{materials\}/gi, materials)
    .replace(/\{price\}/gi, price)
    .replace(/\{description\}/gi, description);
}

export const STARTER_TEMPLATES = [
  {
    name: 'New Arrival Announcement',
    platform: 'instagram',
    template: '✨ New in the showroom: {productName}!\n\nHandcrafted with {materials}. Built for lasting strength and everyday comfort.\n\n📍 Price: {price} Birr\n🚚 Free delivery & assembly in Addis Ababa.\n\nSend us a DM or message on WhatsApp to reserve yours! #KBFurniture #AddisFurniture #EthiopianWoodwork',
    description: 'Perfect for launching brand new store designs on Instagram',
  },
  {
    name: 'Sale & Discount Special',
    platform: 'facebook',
    template: '🔥 Special Offer: {productName} now available for {price} Birr!\n\nFeatures: {materials}.\n{description}\n\nCall / WhatsApp 0911234567 or visit our showroom in Bole. Free delivery across Addis Ababa.',
    description: 'Direct promotional post for Facebook feed & marketplace groups',
  },
  {
    name: 'Quick Status / Direct Order',
    platform: 'whatsapp',
    template: 'New Arrival: {productName} ({price} Birr). Made of {materials}. In stock today with free Addis delivery. Message here to order!',
    description: 'Short, clear message formatted for WhatsApp status and direct chats',
  },
  {
    name: 'Restock Alert',
    platform: 'general',
    template: 'Back in stock: {productName}! Built with {materials}. Price: {price} Birr. Limited workshop units ready for fast dispatch.',
    description: 'Announcement when a popular item returns to stock',
  },
  {
    name: 'Best Seller Showcase',
    platform: 'tiktok',
    template: 'Why everyone loves our {productName} 🪵 Handcrafted with {materials} in Addis Ababa. Only {price} Birr. Link in bio to order!',
    description: 'Punchy video caption for TikTok and Reels',
  },
  {
    name: 'Custom Order Available',
    platform: 'pinterest',
    template: 'Custom made {productName} inspired design. Crafted from {materials}. {price} Birr. Custom dimensions available upon request.',
    description: 'Inspiration pin caption highlighting custom craftsmanship',
  },
];
