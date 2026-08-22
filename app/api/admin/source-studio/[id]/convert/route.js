import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SourcedItem from '@/models/SourcedItem';
import Product from '@/models/Product';
import { requireAdminAuth } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

function determineCategory(type = '') {
  const lower = type.toLowerCase();
  if (lower.includes('chair') || lower.includes('sofa') || lower.includes('bench') || lower.includes('seating') || lower.includes('couch')) {
    return 'living-room';
  }
  if (lower.includes('table') || lower.includes('dining') || lower.includes('desk') && lower.includes('dining')) {
    return 'dining-room';
  }
  if (lower.includes('bed') || lower.includes('nightstand') || lower.includes('mattress')) {
    return 'bedroom';
  }
  if (lower.includes('sideboard') || lower.includes('shelf') || lower.includes('cabinet') || lower.includes('wardrobe') || lower.includes('storage')) {
    return 'storage';
  }
  if (lower.includes('door') || lower.includes('fitting') || lower.includes('hardware')) {
    return 'doors';
  }
  if (lower.includes('kitchen') || lower.includes('island') || lower.includes('stool')) {
    return 'kitchen';
  }
  if (lower.includes('outdoor') || lower.includes('patio') || lower.includes('teak')) {
    return 'outdoor';
  }
  if (lower.includes('desk') || lower.includes('office') || lower.includes('workstation')) {
    return 'home-office';
  }
  if (lower.includes('lamp') || lower.includes('light') || lower.includes('pendant') || lower.includes('decor')) {
    return 'lighting-decor';
  }
  return 'living-room';
}

function generateSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '') + '-' + Math.random().toString(36).substring(2, 7);
}

export async function POST(request, { params }) {
  const auth = await requireAdminAuth(request, ['super_admin', 'product_manager', 'admin']);
  if (auth.error) return auth.error;

  try {
    await connectDB();
    const { id } = await params;

    const item = await SourcedItem.findById(id);
    if (!item) {
      return NextResponse.json({ success: false, error: 'Sourced item not found' }, { status: 404 });
    }

    const title = item.aiAnalysis?.furnitureType || 'Nordika Bespoke Furniture Piece';
    const category = determineCategory(title);
    const finalPrice = item.manualOverride?.finalPrice || item.aiAnalysis?.suggestedPriceMin || 950;
    const slug = generateSlug(title);

    // Create Draft Product
    const newProduct = await Product.create({
      name: title,
      slug,
      category,
      price: finalPrice,
      originalPrice: Math.round(finalPrice * 1.15),
      images: [item.sourceImageUrl],
      materials: item.aiAnalysis?.materials?.length > 0 ? item.aiAnalysis.materials : ['Solid European Oak'],
      colors: ['Natural Finish', 'Smoked Oak'],
      description: `Bespoke Scandinavian design crafted with meticulous attention to form, proportion, and materiality. ${item.aiAnalysis?.confidenceNote || ''}`,
      specs: {
        dimensions: item.aiAnalysis?.estimatedDimensions || 'Standard Scandinavian proportions',
        materialDetails: item.aiAnalysis?.materials?.join(', ') || 'Solid hardwood construction',
        warranty: '5-Year Structural Warranty',
        assembly: 'Minimal assembly required',
      },
      status: 'draft', // Always draft until reviewed and verified
      isReferenceImage: Boolean(item.isReferenceOnly), // Flag if image hasn't been edited in Image Studio
      sourceItemId: item._id,
      inStock: true,
      stockCount: 5,
    });

    // Update SourcedItem status and link back to product
    item.status = 'converted_to_product';
    item.linkedProductId = newProduct._id;
    await item.save();

    return NextResponse.json({
      success: true,
      data: {
        product: newProduct,
        sourcedItem: item,
      },
      message: 'Successfully converted to draft Product with reference image flag',
    });
  } catch (error) {
    console.error('Convert sourced item to product error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to convert to draft product' },
      { status: 500 }
    );
  }
}
