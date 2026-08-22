import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session?.userId) {
      return NextResponse.json({ success: true, wishlist: [] });
    }

    await connectDB();
    const user = await User.findById(session.userId)
      .populate('wishlist')
      .lean();

    return NextResponse.json({
      success: true,
      wishlist: user?.wishlist || [],
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch wishlist' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await getSessionUser();
    if (!session?.userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required to save wishlist' },
        { status: 401 }
      );
    }

    await connectDB();
    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const user = await User.findById(session.userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const index = user.wishlist.indexOf(productId);
    let isAdded = false;

    if (index > -1) {
      // Remove from wishlist
      user.wishlist.splice(index, 1);
      isAdded = false;
    } else {
      // Add to wishlist
      user.wishlist.push(productId);
      isAdded = true;
    }

    await user.save();

    return NextResponse.json({
      success: true,
      isAdded,
      wishlist: user.wishlist,
      message: isAdded ? 'Added to wishlist' : 'Removed from wishlist',
    });
  } catch (error) {
    console.error('Error updating wishlist:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update wishlist' },
      { status: 500 }
    );
  }
}
