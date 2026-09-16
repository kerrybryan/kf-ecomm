import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SourcedItem from '@/models/SourcedItem';
import Product from '@/models/Product';
import { uploadImage } from '@/lib/cloudinary';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const skip = (page - 1) * limit;

    const query = {};
    if (status && status !== 'all') {
      query.status = status;
    }
    if (category && category !== 'all') {
      query.category = category;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
        { sourceUrl: { $regex: search, $options: 'i' } },
      ];
    }

    const [items, total] = await Promise.all([
      SourcedItem.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('linkedProductId', 'name slug price status images')
        .lean(),
      SourcedItem.countDocuments(query),
    ]);

    const counts = {
      total: await SourcedItem.countDocuments(),
      new: await SourcedItem.countDocuments({ status: 'new' }),
      priced: await SourcedItem.countDocuments({ status: 'priced' }),
      content_ready: await SourcedItem.countDocuments({ status: 'content_ready' }),
      converted: await SourcedItem.countDocuments({ status: 'converted_to_product' }),
      discarded: await SourcedItem.countDocuments({ status: 'discarded' }),
    };

    return NextResponse.json({
      success: true,
      data: items,
      counts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    console.error('List sourced items error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch sourced items' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { imageInput, sourceUrl, name, category, notes } = body;

    if (!imageInput) {
      return NextResponse.json(
        { success: false, error: 'Inspiration image or URL is required' },
        { status: 400 }
      );
    }

    // 1. Upload/store image safely
    let stableImageUrl = imageInput;
    try {
      if (imageInput.startsWith('data:') || imageInput.startsWith('http')) {
        const uploadResult = await uploadImage(imageInput, 'kb-furniture-source-studio');
        stableImageUrl = uploadResult.secureUrl || uploadResult.url || imageInput;
      }
    } catch (e) {
      console.warn('Image storage fallback to raw url:', e.message);
    }

    // 2. Create SourcedItem document with initial 'new' state (No AI)
    const sourcedItem = await SourcedItem.create({
      name: name?.trim() || 'Untitled Sourced Piece',
      category: category || 'Sofas & Couches',
      sourceImageUrl: stableImageUrl,
      sourceUrl: sourceUrl || '',
      isReferenceOnly: true,
      status: 'new',
      notes: notes || '',
    });

    return NextResponse.json({
      success: true,
      data: sourcedItem,
      message: 'Inspiration piece added successfully',
    });
  } catch (error) {
    console.error('Import sourced item error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to import inspiration item' },
      { status: 500 }
    );
  }
}
