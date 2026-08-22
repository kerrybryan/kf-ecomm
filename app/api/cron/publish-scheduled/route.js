import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SocialPost from '@/models/SocialPost';
import SocialAccount from '@/models/SocialAccount';
import { publishPostToAllPlatforms } from '@/lib/socialPublisher';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    await connectDB();
    const now = new Date();

    // Query all due queued posts
    const duePosts = await SocialPost.find({
      status: 'queued',
      scheduledFor: { $lte: now },
    });

    if (duePosts.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No scheduled posts due for publishing at this time.',
        processedCount: 0,
      });
    }

    const connectedAccounts = await SocialAccount.find({ status: 'connected' });
    const results = [];

    for (const post of duePosts) {
      try {
        const updated = await publishPostToAllPlatforms(post, connectedAccounts);
        results.push({
          id: updated._id,
          status: updated.status,
          platforms: updated.platforms,
          platformPostIds: updated.platformPostIds,
        });
      } catch (postErr) {
        console.error(`Error processing post ${post._id}:`, postErr);
        post.status = 'failed';
        post.errorLog = postErr.message;
        await post.save();
        results.push({ id: post._id, status: 'failed', error: postErr.message });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${duePosts.length} scheduled posts.`,
      processedCount: duePosts.length,
      results,
    });
  } catch (err) {
    console.error('Scheduled cron publisher error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Scheduled publisher failed' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  return GET(request);
}
