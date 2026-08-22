import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SocialAccount from '@/models/SocialAccount';
import { requireAdminAuth } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function DELETE(request, { params }) {
  const auth = await requireAdminAuth(request, ['super_admin', 'product_manager', 'admin']);
  if (auth.error) return auth.error;

  try {
    await connectDB();
    const { id } = await params;

    const account = await SocialAccount.findByIdAndUpdate(
      id,
      { status: 'disconnected', accessToken: '', refreshToken: '' },
      { new: true }
    ).select('-accessToken -refreshToken');

    if (!account) {
      return NextResponse.json({ success: false, error: 'Social account not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: account,
      message: `Account disconnected successfully.`,
    });
  } catch (err) {
    console.error('Disconnect account error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to disconnect account' },
      { status: 500 }
    );
  }
}
