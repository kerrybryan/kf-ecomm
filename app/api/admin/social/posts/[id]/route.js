import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SocialPost from '@/models/SocialPost';
import SocialAccount from '@/models/SocialAccount';
import { requireAdminAuth } from '@/lib/adminAuth';
import { publishPostToAllPlatforms } from '@/lib/socialPublisher';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  const auth = await requireAdminAuth(request, ['super_admin', 'product_manager', 'sales_manager', 'admin']);
  if (auth.error) return auth.error;

  try {
    await connectDB();
    const { id } = await params;

    const post = await SocialPost.findById(id)
      .populate('productId', 'name slug price images category')
      .populate('createdBy', 'name email')
      .lean();

    if (!post) {
      return NextResponse.json({ success: false, error: 'Social post not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: post });
  } catch (err) {
    console.error('Fetch post error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch social post' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  const auth = await requireAdminAuth(request, ['super_admin', 'product_manager', 'admin']);
  if (auth.error) return auth.error;

  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();
    const { action, captions, platforms, scheduledFor, status } = body;

    const post = await SocialPost.findById(id);
    if (!post) {
      return NextResponse.json({ success: false, error: 'Social post not found' }, { status: 404 });
    }

    // Handle "Retry" publish action for failed posts
    if (action === 'retry' || action === 'publish_now') {
      const connectedAccounts = await SocialAccount.find({ status: 'connected' });
      await publishPostToAllPlatforms(post, connectedAccounts);

      return NextResponse.json({
        success: true,
        data: post,
        message: 'Post retried and published successfully!',
      });
    }

    // Standard field updates
    if (captions) post.captions = { ...post.captions, ...captions };
    if (platforms) post.platforms = platforms;
    if (scheduledFor !== undefined) post.scheduledFor = scheduledFor ? new Date(scheduledFor) : null;
    if (status) post.status = status;

    await post.save();

    return NextResponse.json({
      success: true,
      data: post,
      message: 'Post updated successfully',
    });
  } catch (err) {
    console.error('Update post error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update social post' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  const auth = await requireAdminAuth(request, ['super_admin', 'product_manager', 'admin']);
  if (auth.error) return auth.error;

  try {
    await connectDB();
    const { id } = await params;

    const post = await SocialPost.findByIdAndDelete(id);
    if (!post) {
      return NextResponse.json({ success: false, error: 'Social post not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Social post cancelled and removed',
    });
  } catch (err) {
    console.error('Delete post error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to delete post' },
      { status: 500 }
    );
  }
}
