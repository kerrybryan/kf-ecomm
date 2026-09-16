import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SocialAccount from '@/models/SocialAccount';
import { requireAdminAuth } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

const PLATFORM_DEFAULTS = {
  instagram: {
    accountName: 'KB Furniture Studio',
    accountHandle: '@kbfurniture.studio',
    accountAvatarUrl: 'https://picsum.photos/seed/kb-furniture-avatar/200/200',
    profileUrl: 'https://instagram.com/kbfurniture.studio',
    followerCount: 24800,
  },
  facebook: {
    accountName: 'KB Furniture Official Page',
    accountHandle: 'KB Furniture',
    accountAvatarUrl: 'https://picsum.photos/seed/kb-furniture-avatar/200/200',
    profileUrl: 'https://facebook.com/kbfurniture',
    followerCount: 18200,
  },
  tiktok: {
    accountName: 'KB Furniture Workshop',
    accountHandle: '@kbfurnituredesign',
    accountAvatarUrl: 'https://picsum.photos/seed/kb-furniture-avatar/200/200',
    profileUrl: 'https://tiktok.com/@kbfurnituredesign',
    followerCount: 52400,
  },
  pinterest: {
    accountName: 'KB Furniture Living',
    accountHandle: '@kbfurniturehome',
    accountAvatarUrl: 'https://picsum.photos/seed/kb-furniture-avatar/200/200',
    profileUrl: 'https://pinterest.com/kbfurniturehome',
    followerCount: 41200,
  },
};

export async function GET(request) {
  const auth = await requireAdminAuth(request, ['super_admin', 'product_manager', 'sales_manager', 'admin']);
  if (auth.error) return auth.error;

  try {
    await connectDB();
    const accounts = await SocialAccount.find()
      .select('-accessToken -refreshToken')
      .lean();

    return NextResponse.json({
      success: true,
      data: accounts,
    });
  } catch (err) {
    console.error('Fetch social accounts error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to load social accounts' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const auth = await requireAdminAuth(request, ['super_admin', 'product_manager', 'admin']);
  if (auth.error) return auth.error;

  try {
    await connectDB();
    const { platform, accountName, accountHandle, isSimulated = true } = await request.json();

    if (!platform) {
      return NextResponse.json({ success: false, error: 'Platform identifier is required' }, { status: 400 });
    }

    const defaults = PLATFORM_DEFAULTS[platform] || {
      accountName: `${platform.toUpperCase()} Official Account`,
      accountHandle: `@kbfurniture_${platform}`,
      accountAvatarUrl: 'https://picsum.photos/seed/kb-furniture-avatar/200/200',
      profileUrl: `https://${platform}.com/kbfurniture`,
      followerCount: 12000,
    };

    // Upsert the social account document
    const account = await SocialAccount.findOneAndUpdate(
      { platform },
      {
        platform,
        accountName: accountName || defaults.accountName,
        accountHandle: accountHandle || defaults.accountHandle,
        accountAvatarUrl: defaults.accountAvatarUrl,
        profileUrl: defaults.profileUrl,
        followerCount: defaults.followerCount,
        status: 'connected',
        connectedAt: new Date(),
        accessToken: isSimulated ? `mock_tok_${platform}_${Date.now()}` : 'live_token_set',
      },
      { upsert: true, new: true }
    ).select('-accessToken -refreshToken');

    return NextResponse.json({
      success: true,
      data: account,
      message: `Successfully connected ${platform} account!`,
    });
  } catch (err) {
    console.error('Connect social account error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to connect social account' },
      { status: 500 }
    );
  }
}
