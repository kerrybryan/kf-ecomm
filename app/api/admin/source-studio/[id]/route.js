import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SourcedItem from '@/models/SourcedItem';
import Product from '@/models/Product';
import { requireAdminAuth } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  const auth = await requireAdminAuth(request, ['super_admin', 'product_manager', 'admin']);
  if (auth.error) return auth.error;

  try {
    await connectDB();
    const { id } = await params;

    const item = await SourcedItem.findById(id)
      .populate('linkedProductId', 'name slug price status isReferenceImage images')
      .lean();

    if (!item) {
      return NextResponse.json({ success: false, error: 'Sourced item not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    console.error('Fetch single sourced item error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch sourced item' },
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
    const updates = await request.json();

    const item = await SourcedItem.findById(id);
    if (!item) {
      return NextResponse.json({ success: false, error: 'Sourced item not found' }, { status: 404 });
    }

    // Update manual override / cost calculator values
    if (updates.manualOverride) {
      const {
        materialCost = item.manualOverride.materialCost,
        laborHours = item.manualOverride.laborHours,
        laborRate = item.manualOverride.laborRate,
        overheadPercent = item.manualOverride.overheadPercent,
        markupMultiplier = item.manualOverride.markupMultiplier,
        finalPrice,
      } = updates.manualOverride;

      const laborCost = Number(laborHours) * Number(laborRate);
      const subtotalCost = Number(materialCost) + laborCost;
      const overheadCost = subtotalCost * (Number(overheadPercent) / 100);
      const calculatedCost = Math.round(subtotalCost + overheadCost);
      const autoPrice = Math.round(calculatedCost * Number(markupMultiplier));

      item.manualOverride = {
        materialCost: Number(materialCost),
        laborHours: Number(laborHours),
        laborRate: Number(laborRate),
        overheadPercent: Number(overheadPercent),
        markupMultiplier: Number(markupMultiplier),
        calculatedCost,
        finalPrice: finalPrice !== undefined ? Number(finalPrice) : autoPrice,
      };
    }

    if (updates.status) {
      item.status = updates.status;
    }
    if (updates.notes !== undefined) {
      item.notes = updates.notes;
    }
    if (updates.isReferenceOnly !== undefined) {
      item.isReferenceOnly = updates.isReferenceOnly;
    }

    await item.save();

    return NextResponse.json({
      success: true,
      data: item,
      message: 'Sourced item updated successfully',
    });
  } catch (error) {
    console.error('Update sourced item error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update sourced item' },
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

    // Discard rather than hard delete to preserve historical sourcing record
    const item = await SourcedItem.findByIdAndUpdate(
      id,
      { status: 'discarded' },
      { new: true }
    );

    if (!item) {
      return NextResponse.json({ success: false, error: 'Sourced item not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: item,
      message: 'Sourced item marked as discarded',
    });
  } catch (error) {
    console.error('Discard sourced item error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to discard item' },
      { status: 500 }
    );
  }
}
