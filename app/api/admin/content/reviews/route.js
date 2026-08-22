import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Review from '@/models/Review';
import { requireAdminAuth } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const auth = await requireAdminAuth(request);
  if (auth.error) return auth.error;

  try {
    await connectDB();
    const reviews = await Review.find({})
      .populate('productId', 'name slug images')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, data: reviews });
  } catch (error) {
    console.error('Admin GET reviews error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function PUT(request) {
  const auth = await requireAdminAuth(request, ['super_admin', 'product_manager', 'admin']);
  if (auth.error) return auth.error;

  try {
    await connectDB();
    const { _id, verifiedPurchase } = await request.json();

    const review = await Review.findById(_id);
    if (!review) {
      return NextResponse.json({ success: false, error: 'Review not found' }, { status: 404 });
    }

    if (verifiedPurchase !== undefined) review.verifiedPurchase = verifiedPurchase;
    await review.save();

    return NextResponse.json({ success: true, data: review, message: 'Review updated' });
  } catch (error) {
    console.error('Admin update review error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to update review' }, { status: 500 });
  }
}

export async function DELETE(request) {
  const auth = await requireAdminAuth(request, ['super_admin', 'product_manager', 'admin']);
  if (auth.error) return auth.error;

  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Review ID is required' }, { status: 400 });
    }

    await Review.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Admin delete review error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to delete review' }, { status: 500 });
  }
}
