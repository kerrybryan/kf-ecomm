import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import { requireAdminAuth } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  const auth = await requireAdminAuth(request);
  if (auth.error) return auth.error;

  try {
    await connectDB();
    const { id } = await params;

    const product = await Product.findById(id).lean();
    if (!product || product.deletedAt) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    console.error('Admin get product error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const auth = await requireAdminAuth(request, ['super_admin', 'product_manager', 'admin']);
  if (auth.error) return auth.error;

  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const product = await Product.findById(id);
    if (!product || product.deletedAt) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    // Safeguard check: If attempting to publish a product with unedited reference image
    if (body.status === 'published' && (product.isReferenceImage || body.isReferenceImage)) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Publishing blocked: The primary image is flagged as an unedited external reference. Please edit and brand the image in Image Studio before publishing to the live storefront.',
          isReferenceImage: true,
        },
        { status: 400 }
      );
    }

    // Update fields
    const updatableFields = [
      'name',
      'slug',
      'category',
      'price',
      'originalPrice',
      'description',
      'images',
      'colors',
      'materials',
      'specs',
      'rating',
      'reviewCount',
      'inStock',
      'stockCount',
      'status',
      'isFeatured',
      'isBestSeller',
      'trending',
      'isReferenceImage',
    ];

    updatableFields.forEach((field) => {
      if (body[field] !== undefined) {
        product[field] = body[field];
      }
    });

    await product.save();
    return NextResponse.json({ success: true, data: product, message: 'Product updated successfully' });
  } catch (error) {
    console.error('Admin update product error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const auth = await requireAdminAuth(request, ['super_admin', 'product_manager', 'admin']);
  if (auth.error) return auth.error;

  try {
    await connectDB();
    const { id } = await params;

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    // Soft delete to protect past orders referencing this product ID
    product.deletedAt = new Date();
    product.status = 'draft';
    await product.save();

    return NextResponse.json({ success: true, message: 'Product moved to trash (soft-deleted)' });
  } catch (error) {
    console.error('Admin delete product error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to delete product' }, { status: 500 });
  }
}
