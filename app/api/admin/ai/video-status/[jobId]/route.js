import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import AiVideoJob from '@/models/AiVideoJob';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const { jobId } = await params;
    await connectDB();

    const job = await AiVideoJob.findOne({ jobId });

    if (!job) {
      return NextResponse.json(
        { success: false, error: 'Video job not found' },
        { status: 404 }
      );
    }

    // Simulate progressive completion on polling if in processing state
    if (job.status === 'processing') {
      const elapsedSeconds = (Date.now() - new Date(job.createdAt).getTime()) / 1000;
      if (elapsedSeconds >= 4) {
        job.status = 'completed';
        job.progressPercent = 100;
        await job.save();
      } else {
        job.progressPercent = Math.min(95, Math.round(job.progressPercent + 25));
        await job.save();
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        jobId: job.jobId,
        type: job.type,
        prompt: job.prompt,
        sourceImageUrl: job.sourceImageUrl,
        status: job.status,
        progressPercent: job.progressPercent,
        resultVideoUrl: job.resultVideoUrl,
        durationSeconds: job.durationSeconds,
        createdAt: job.createdAt,
      },
    });
  } catch (err) {
    console.error('Error fetching video job status:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch job status' },
      { status: 500 }
    );
  }
}
