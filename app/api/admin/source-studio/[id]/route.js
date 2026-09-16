import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SourcedItem from '@/models/SourcedItem';
import Product from '@/models/Product';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
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
  try {
    await connectDB();
    const { id } = await params;
    const updates = await request.json();

    const item = await SourcedItem.findById(id);
    if (!item) {
      return NextResponse.json({ success: false, error: 'Sourced item not found' }, { status: 404 });
    }

    if (updates.name !== undefined) item.name = updates.name.trim();
    if (updates.category !== undefined) item.category = updates.category;
    if (updates.notes !== undefined) item.notes = updates.notes;
    if (updates.price !== undefined) item.price = Number(updates.price);
    if (updates.costBreakdown !== undefined) item.costBreakdown = updates.costBreakdown;
    if (updates.status !== undefined) item.status = updates.status;
    if (updates.linkedProductId !== undefined) item.linkedProductId = updates.linkedProductId;

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
  try {
    const { id } = await params;
    await connectDB();

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
