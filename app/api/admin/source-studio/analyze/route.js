import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SourcedItem from '@/models/SourcedItem';
import { requireAdminAuth } from '@/lib/adminAuth';
import { analyzeFurnitureImage } from '@/lib/claudeVision';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  const auth = await requireAdminAuth(request, ['super_admin', 'product_manager', 'admin']);
  if (auth.error) return auth.error;

  try {
    await connectDB();
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ success: false, error: 'Sourced item ID is required' }, { status: 400 });
    }

    const item = await SourcedItem.findById(id);
    if (!item) {
      return NextResponse.json({ success: false, error: 'Sourced item not found' }, { status: 404 });
    }

    // Set status to analyzing while call runs
    item.status = 'analyzing';
    await item.save();

    // Run Claude Vision analysis
    const aiResult = await analyzeFurnitureImage(item.sourceImageUrl);

    // Compute suggested manufacturing breakdown
    const materialCost = Math.round((aiResult.suggestedPriceMin || 500) * 0.35);
    const laborHours = aiResult.complexityRating === 'high' ? 12 : aiResult.complexityRating === 'low' ? 5 : 8;
    const laborRate = item.manualOverride?.laborRate || 45;
    const overheadPercent = item.manualOverride?.overheadPercent || 15;
    const laborCost = laborHours * laborRate;
    const subtotalCost = materialCost + laborCost;
    const overheadCost = subtotalCost * (overheadPercent / 100);
    const calculatedCost = Math.round(subtotalCost + overheadCost);
    const markupMultiplier = item.manualOverride?.markupMultiplier || 2.2;
    const finalPrice = Math.round(calculatedCost * markupMultiplier);

    item.aiAnalysis = aiResult;
    item.manualOverride = {
      materialCost,
      laborHours,
      laborRate,
      overheadPercent,
      markupMultiplier,
      calculatedCost,
      finalPrice,
    };
    item.status = 'reviewed';
    await item.save();

    return NextResponse.json({
      success: true,
      data: item,
      message: 'AI analysis completed successfully',
    });
  } catch (error) {
    console.error('Trigger AI analysis error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'AI analysis failed' },
      { status: 500 }
    );
  }
}
