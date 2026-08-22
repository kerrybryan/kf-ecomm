import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SocialPost from '@/models/SocialPost';
import SocialAccount from '@/models/SocialAccount';
import Product from '@/models/Product';
import { requireAdminAuth } from '@/lib/adminAuth';
import { publishPostToAllPlatforms } from '@/lib/socialPublisher';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const auth = await requireAdminAuth(request, ['super_admin', 'product_manager', 'sales_manager', 'admin']);
  if (auth.error) return auth.error;

  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const platform = searchParams.get('platform');
    const month = searchParams.get('month'); // YYYY-MM
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const skip = (page - 1) * limit;

    const query = {};
    if (status && status !== 'all') {
      query.status = status;
    }
    if (platform && platform !== 'all') {
      query.platforms = platform;
    }
    if (month) {
      const [year, m] = month.split('-').map(Number);
      const start = new Date(year, m - 1, 1);
      const end = new Date(year, m, 0, 23, 59, 59, 999);
      query.$or = [
        { scheduledFor: { $gte: start, $lte: end } },
        { publishedAt: { $gte: start, $lte: end } },
      ];
    }
    if (search) {
      query.$or = [
        { 'captions.default': { $regex: search, $options: 'i' } },
        { 'captions.instagram': { $regex: search, $options: 'i' } },
      ];
    }

    const [posts, total] = await Promise.all([
      SocialPost.find(query)
        .sort({ scheduledFor: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('productId', 'name slug price images category')
        .populate('createdBy', 'name email role')
        .lean(),
      SocialPost.countDocuments(query),
    ]);

    const counts = {
      total: await SocialPost.countDocuments(),
      queued: await SocialPost.countDocuments({ status: 'queued' }),
      posted: await SocialPost.countDocuments({ status: 'posted' }),
      draft: await SocialPost.countDocuments({ status: 'draft' }),
      failed: await SocialPost.countDocuments({ status: 'failed' }),
    };

    return NextResponse.json({
      success: true,
      data: posts,
      counts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (err) {
    console.error('List social posts error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to load social posts' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const auth = await requireAdminAuth(request, ['super_admin', 'product_manager', 'admin']);
  if (auth.error) return auth.error;

  try {
    await connectDB();
    const body = await request.json();
    const {
      productId,
      mediaUrl,
      mediaType = 'image',
      platforms = ['instagram', 'pinterest'],
      captions = {},
      scheduledFor,
      isDraft = false,
    } = body;

    if (!mediaUrl) {
      return NextResponse.json({ success: false, error: 'Media URL is required' }, { status: 400 });
    }
    if (!platforms || platforms.length === 0) {
      return NextResponse.json({ success: false, error: 'Select at least one destination platform' }, { status: 400 });
    }

    const isScheduled = scheduledFor && new Date(scheduledFor) > new Date();
    const initialStatus = isDraft ? 'draft' : isScheduled ? 'queued' : 'queued';

    // 1. Create SocialPost document
    const newPost = await SocialPost.create({
      productId: productId || null,
      mediaType,
      mediaUrl,
      platforms,
      captions: {
        default: captions.default || '',
        instagram: captions.instagram || captions.default || '',
        facebook: captions.facebook || captions.default || '',
        tiktok: captions.tiktok || captions.default || '',
        pinterest: captions.pinterest || captions.default || '',
      },
      scheduledFor: isScheduled ? new Date(scheduledFor) : null,
      status: initialStatus,
      createdBy: auth.user?._id || null,
    });

    // 2. If immediate publishing (not scheduled & not draft), publish right away!
    if (!isDraft && !isScheduled) {
      const connectedAccounts = await SocialAccount.find({ status: 'connected' });
      await publishPostToAllPlatforms(newPost, connectedAccounts);
    }

    return NextResponse.json({
      success: true,
      data: newPost,
      message: isDraft
        ? 'Draft post saved'
        : isScheduled
        ? `Post queued for ${new Date(scheduledFor).toLocaleString()}`
        : 'Post published successfully across platforms!',
    });
  } catch (err) {
    console.error('Create social post error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to create social post' },
      { status: 500 }
    );
  }
}
