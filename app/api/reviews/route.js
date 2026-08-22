import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Review from '@/models/Review';
import Product from '@/models/Product';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    let query = {};
    if (productId && mongoose.Types.ObjectId.isValid(productId)) {
      query.productId = productId;
    }

    const reviews = await Review.find(query).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: reviews });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    const { productId, customerName, customerEmail, rating, title, comment } = body;

    if (!productId || !customerName || !rating || !comment) {
      return NextResponse.json(
        { success: false, error: 'Product ID, customer name, rating (1-5), and review text are required' },
        { status: 400 }
      );
    }

    const numericRating = Number(rating);
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      return NextResponse.json(
        { success: false, error: 'Rating must be a number between 1 and 5' },
        { status: 400 }
      );
    }

    const review = await Review.create({
      productId,
      customerName: customerName.trim(),
      customerEmail: customerEmail?.trim() || '',
      rating: numericRating,
      title: title?.trim() || '',
      comment: comment.trim(),
      verifiedPurchase: true,
    });

    // Recalculate product rating & reviewCount
    const allReviews = await Review.find({ productId });
    const count = allReviews.length;
    const avgRating = count > 0 
      ? Math.round((allReviews.reduce((sum, r) => sum + r.rating, 0) / count) * 10) / 10 
      : 5.0;

    await Product.findByIdAndUpdate(productId, {
      rating: avgRating,
      reviewCount: count,
    });

    return NextResponse.json(
      {
        success: true,
        data: review,
        message: 'Review submitted successfully! Thank you for your feedback.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error submitting review:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to submit review' },
      { status: 500 }
    );
  }
}
