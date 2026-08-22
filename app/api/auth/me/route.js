import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session || !session.userId) {
      return NextResponse.json({ success: true, user: null });
    }

    await connectDB();
    const user = await User.findById(session.userId)
      .select('-passwordHash')
      .populate('wishlist')
      .lean();

    if (!user) {
      return NextResponse.json({ success: true, user: null });
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Error fetching session user:', error);
    return NextResponse.json({ success: true, user: null });
  }
}
