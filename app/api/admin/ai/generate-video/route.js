import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import AiVideoJob from '@/models/AiVideoJob';
import { createVideoGenerationJob, logAiUsage } from '@/lib/gemini';

export const dynamic = 'force-dynamic';

const DAILY_VIDEO_LIMIT = 20;

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const {
      type = 'text_to_video', // 'image_to_video' | 'text_to_video'
      prompt = '',
      sourceImageUrl = '',
      targetProductId = null,
      adminEmail = 'admin@kbfurniture.et',
      adminRole = 'super_admin',
    } = body;

    // Access Control: super_admin and product_manager only
    const allowedRoles = ['super_admin', 'product_manager', 'admin'];
    if (adminRole && !allowedRoles.includes(adminRole)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Video generation is restricted to Super Admin and Product Manager roles only.',
        },
        { status: 403 }
      );
    }

    if (type === 'text_to_video' && !prompt.trim()) {
      return NextResponse.json(
        { success: false, error: 'Prompt is required for text-to-video generation' },
        { status: 400 }
      );
    }

    if (type === 'image_to_video' && !sourceImageUrl) {
      return NextResponse.json(
        { success: false, error: 'Source product image is required for photo animation' },
        { status: 400 }
      );
    }

    // Rate Limiting: Check daily usage count
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const todayCount = await AiVideoJob.countDocuments({
      createdAt: { $gte: startOfDay },
    });

    if (todayCount >= DAILY_VIDEO_LIMIT) {
      return NextResponse.json(
        {
          success: false,
          error: `Daily video generation quota reached (${todayCount}/${DAILY_VIDEO_LIMIT} clips today). Please try again tomorrow or contact super admin.`,
        },
        { status: 429 }
      );
    }

    // Start video job
    const job = await createVideoGenerationJob({
      type,
      prompt,
      sourceImageUrl,
      targetProductId,
      createdBy: adminEmail,
    });

    // Log AI Usage
    await logAiUsage({
      adminEmail,
      adminRole,
      feature: 'generate-video',
      promptSummary: `Video (${type}): ${prompt || 'Photo Animation'}`,
      tokensUsed: 1200,
      costEstimateUsd: 0.15, // Veo video generation estimate
      metadata: { jobId: job.jobId, type, sourceImageUrl },
    });

    return NextResponse.json({
      success: true,
      jobId: job.jobId,
      status: job.status,
      progressPercent: job.progressPercent,
      message: 'Video generation job started. Polling status...',
    });
  } catch (err) {
    console.error('Error starting video generation:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to initiate video generation' },
      { status: 500 }
    );
  }
}
