import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import PublishingQueueItem from '@/models/PublishingQueueItem';
import Product from '@/models/Product';
import CaptionTemplate from '@/models/CaptionTemplate';
import { substitutePlaceholders } from '@/lib/publishing';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const platform = searchParams.get('platform');
    const search = searchParams.get('search');
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }
    if (platform && platform !== 'all') {
      query.platform = platform;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { finalCaption: { $regex: search, $options: 'i' } },
      ];
    }
    if (from || to) {
      query.plannedDate = {};
      if (from) query.plannedDate.$gte = new Date(from);
      if (to) query.plannedDate.$lte = new Date(to);
    }

    const items = await PublishingQueueItem.find(query)
      .populate('productId', 'name slug price images category materials')
      .populate('contentExportId', 'fileUrl format platformLabel')
      .sort({ plannedDate: 1, createdAt: -1 });

    // Compute status counts for top bar badges
    const totalCount = await PublishingQueueItem.countDocuments();
    const queuedCount = await PublishingQueueItem.countDocuments({ status: 'queued' });
    const postedCount = await PublishingQueueItem.countDocuments({ status: 'posted' });
    const skippedCount = await PublishingQueueItem.countDocuments({ status: 'skipped' });

    return NextResponse.json({
      success: true,
      data: items,
      counts: {
        total: totalCount,
        queued: queuedCount,
        posted: postedCount,
        skipped: skippedCount,
      },
    });
  } catch (err) {
    console.error('Error fetching publishing queue:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch queue' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const {
      contentExportId = null,
      productId = null,
      title = 'Social Marketing Post',
      mediaUrl,
      mediaType = 'image',
      platform = 'instagram',
      captionTemplateId = null,
      customCaption = '',
      plannedDate = new Date(),
      notes = '',
    } = body;

    if (!mediaUrl) {
      return NextResponse.json(
        { success: false, error: 'Media URL (image or video) is required for publishing queue' },
        { status: 400 }
      );
    }

    let finalCaption = customCaption;

    // If template selected and custom caption not directly finalized, resolve placeholders
    if (!finalCaption && captionTemplateId) {
      const tpl = await CaptionTemplate.findById(captionTemplateId);
      let prodObj = {};
      if (productId) {
        prodObj = (await Product.findById(productId)) || {};
      }
      if (tpl) {
        finalCaption = substitutePlaceholders(tpl.template, prodObj);
      }
    }

    if (!finalCaption) {
      finalCaption = title || 'Check out our latest handcrafted piece at KB Furniture!';
    }

    const item = await PublishingQueueItem.create({
      contentExportId,
      productId,
      title: title.trim(),
      mediaUrl: mediaUrl.trim(),
      mediaType,
      platform,
      captionTemplateId,
      finalCaption: finalCaption.trim(),
      plannedDate: new Date(plannedDate),
      status: 'queued',
      notes: notes.trim(),
    });

    return NextResponse.json({
      success: true,
      data: item,
    });
  } catch (err) {
    console.error('Error creating queue item:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to create queue item' },
      { status: 500 }
    );
  }
}
