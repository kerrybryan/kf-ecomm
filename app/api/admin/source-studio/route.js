import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SourcedItem from '@/models/SourcedItem';
import Product from '@/models/Product';
import { requireAdminAuth } from '@/lib/adminAuth';
import { uploadImage } from '@/lib/cloudinary';
import { analyzeFurnitureImage } from '@/lib/claudeVision';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const auth = await requireAdminAuth(request, ['super_admin', 'product_manager', 'admin']);
  if (auth.error) return auth.error;

  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '15', 10);
    const skip = (page - 1) * limit;

    const query = {};
    if (status && status !== 'all') {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { 'aiAnalysis.furnitureType': { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
        { sourceUrl: { $regex: search, $options: 'i' } },
      ];
    }

    const [items, total] = await Promise.all([
      SourcedItem.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('linkedProductId', 'name slug price status')
        .lean(),
      SourcedItem.countDocuments(query),
    ]);

    const counts = {
      total: await SourcedItem.countDocuments(),
      analyzing: await SourcedItem.countDocuments({ status: 'analyzing' }),
      reviewed: await SourcedItem.countDocuments({ status: 'reviewed' }),
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
  const auth = await requireAdminAuth(request, ['super_admin', 'product_manager', 'admin']);
  if (auth.error) return auth.error;

  try {
    await connectDB();
    const { imageInput, sourceUrl, notes } = await request.json();

    if (!imageInput) {
      return NextResponse.json(
        { success: false, error: 'Inspiration image or URL is required' },
        { status: 400 }
      );
    }

    // 1. Upload to Cloudinary / storage
    const uploadResult = await uploadImage(imageInput, 'nordika-source-studio');
    const stableImageUrl = uploadResult.secureUrl || uploadResult.url;

    // 2. Create SourcedItem document with initial 'analyzing' state
    const sourcedItem = await SourcedItem.create({
      sourceImageUrl: stableImageUrl,
      sourceUrl: sourceUrl || '',
      isReferenceOnly: true,
      status: 'analyzing',
      notes: notes || '',
    });

    // 3. Trigger Claude Vision Analysis
    try {
      const aiResult = await analyzeFurnitureImage(stableImageUrl);

      // Compute initial default manufacturing costs
      const materialCost = Math.round((aiResult.suggestedPriceMin || 500) * 0.35);
      const laborHours = aiResult.complexityRating === 'high' ? 12 : aiResult.complexityRating === 'low' ? 5 : 8;
      const laborRate = 45;
      const overheadPercent = 15;
      const laborCost = laborHours * laborRate;
      const subtotalCost = materialCost + laborCost;
      const overheadCost = subtotalCost * (overheadPercent / 100);
      const calculatedCost = Math.round(subtotalCost + overheadCost);
      const markupMultiplier = 2.2;
      const finalPrice = Math.round(calculatedCost * markupMultiplier);

      sourcedItem.aiAnalysis = aiResult;
      sourcedItem.manualOverride = {
        materialCost,
        laborHours,
        laborRate,
        overheadPercent,
        markupMultiplier,
        calculatedCost,
        finalPrice,
      };
      sourcedItem.status = 'reviewed';
      await sourcedItem.save();
    } catch (aiErr) {
      console.error('Initial AI analysis error:', aiErr);
      // Keep item in 'analyzing' or 'reviewed' with retry flag
      sourcedItem.status = 'analyzing';
      await sourcedItem.save();
    }

    return NextResponse.json({
      success: true,
      data: sourcedItem,
      message: 'Inspiration image imported and analyzed successfully',
    });
  } catch (error) {
    console.error('Import sourced item error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to import inspiration item' },
      { status: 500 }
    );
  }
}
