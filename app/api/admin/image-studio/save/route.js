import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import SourcedItem from '@/models/SourcedItem';
import { requireAdminAuth } from '@/lib/adminAuth';
import { uploadImage } from '@/lib/cloudinary';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  const auth = await requireAdminAuth(request, ['super_admin', 'product_manager', 'admin']);
  if (auth.error) return auth.error;

  try {
    await connectDB();
    const { imageDataUrl, productId, sourceItemId, replacePrimary = true } = await request.json();

    if (!imageDataUrl) {
      return NextResponse.json(
        { success: false, error: 'Rendered canvas image data is required' },
        { status: 400 }
      );
    }

    // 1. Upload the edited & branded image to Cloudinary / storage
    const uploadResult = await uploadImage(imageDataUrl, 'nordika-image-studio');
    const stableImageUrl = uploadResult.secureUrl || uploadResult.url;

    let updatedProduct = null;
    let updatedSourcedItem = null;

    // 2. If linked to a Product, update image array and clear the reference image flag!
    if (productId) {
      const product = await Product.findById(productId);
      if (product) {
        if (replacePrimary) {
          product.images = [stableImageUrl, ...(product.images || []).filter((_, idx) => idx !== 0)];
        } else {
          product.images.push(stableImageUrl);
        }
        // Image has been edited in Image Studio, clear reference flag so product can now be safely published!
        product.isReferenceImage = false;
        await product.save();
        updatedProduct = product;
      }
    }

    // 3. If linked to a SourcedItem, update sourceImageUrl and clear isReferenceOnly
    if (sourceItemId) {
      const sourcedItem = await SourcedItem.findById(sourceItemId);
      if (sourcedItem) {
        sourcedItem.sourceImageUrl = stableImageUrl;
        sourcedItem.isReferenceOnly = false;
        await sourcedItem.save();
        updatedSourcedItem = sourcedItem;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        imageUrl: stableImageUrl,
        product: updatedProduct,
        sourcedItem: updatedSourcedItem,
      },
      message: 'Edited studio image saved and reference safeguards cleared successfully',
    });
  } catch (error) {
    console.error('Image Studio save error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save studio image' },
      { status: 500 }
    );
  }
}
