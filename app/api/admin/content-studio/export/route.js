import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import SourcedItem from '@/models/SourcedItem';
import ContentExport from '@/models/ContentExport';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    const {
      targetId,
      targetType = 'Product', // 'Product' | 'SourcedItem'
      platform = 'instagram_feed',
      platformLabel = 'Instagram Feed (4:5)',
      format = 'image', // 'image' | 'video'
      renderedFileUrl = '',
      settings = {},
    } = body;

    if (!targetId) {
      return NextResponse.json(
        { success: false, error: 'Target product or item ID is required' },
        { status: 400 }
      );
    }

    // SERVER-SIDE PRICE GATE (Part C.1)
    let itemDoc = null;
    let itemPrice = 0;
    let itemName = '';
    let itemCategory = '';

    if (targetType === 'Product') {
      itemDoc = await Product.findById(targetId).lean();
      if (!itemDoc) {
        return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
      }
      itemPrice = itemDoc.price || 0;
      itemName = itemDoc.name;
      itemCategory = itemDoc.category;
    } else if (targetType === 'SourcedItem') {
      itemDoc = await SourcedItem.findById(targetId).lean();
      if (!itemDoc) {
        return NextResponse.json({ success: false, error: 'Sourced piece not found' }, { status: 404 });
      }
      itemPrice = itemDoc.price || 0;
      itemName = itemDoc.name || 'Sourced Piece';
      itemCategory = itemDoc.category;
    }

    // Enforce gate: price MUST be greater than 0
    if (!itemPrice || itemPrice <= 0) {
      const pricingUrl = `/admin/pricing/calculate?${
        targetType === 'Product' ? `productId=${targetId}` : `sourceItemId=${targetId}`
      }&category=${encodeURIComponent(itemCategory || '')}`;

      return NextResponse.json(
        {
          success: false,
          locked: true,
          error: 'Set a price for this item before downloading content for social media.',
          pricingUrl,
        },
        { status: 403 }
      );
    }

    // Price is verified! Generate export record & file url
    const fileUrl =
      renderedFileUrl ||
      itemDoc.sourceImageUrl ||
      (itemDoc.images && itemDoc.images[0]) ||
      '';

    const exportRecord = await ContentExport.create({
      targetId,
      targetType,
      targetName: itemName,
      platform,
      platformLabel,
      format,
      fileUrl,
      priceAtExport: itemPrice,
      costBreakdownSnapshot: itemDoc.costBreakdown || null,
      settingsSnapshot: {
        canvasDimensions: settings.canvasDimensions || { width: 1080, height: 1350 },
        stickersApplied: settings.stickersApplied || [],
        watermarkApplied: Boolean(settings.watermarkApplied),
        musicTrackName: settings.musicTrackName || '',
        trimSettings: settings.trimSettings || { startSec: 0, endSec: 0 },
      },
      exportedBy: 'Admin',
    });

    // If sourced item, update status to 'content_ready'
    if (targetType === 'SourcedItem') {
      await SourcedItem.findByIdAndUpdate(targetId, { status: 'content_ready' });
    }

    return NextResponse.json({
      success: true,
      data: {
        exportId: exportRecord._id,
        fileUrl,
        priceAtExport: itemPrice,
        exportedAt: exportRecord.createdAt,
      },
      message: 'Content exported and logged successfully',
    });
  } catch (err) {
    console.error('Content export error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const exportsList = await ContentExport.find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({ success: true, data: exportsList });
  } catch (err) {
    console.error('Error fetching export history:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
