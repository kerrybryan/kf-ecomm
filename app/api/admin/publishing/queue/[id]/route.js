import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import PublishingQueueItem from '@/models/PublishingQueueItem';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    await connectDB();

    const item = await PublishingQueueItem.findById(id)
      .populate('productId')
      .populate('contentExportId');

    if (!item) {
      return NextResponse.json(
        { success: false, error: 'Queue item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: item,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    await connectDB();
    const body = await request.json();

    const updateFields = {};

    if (body.status !== undefined) {
      updateFields.status = body.status;
      if (body.status === 'posted') {
        updateFields.postedAt = new Date();
      } else if (body.status === 'queued') {
        updateFields.postedAt = null;
      }
    }
    if (body.finalCaption !== undefined) updateFields.finalCaption = body.finalCaption;
    if (body.plannedDate !== undefined) updateFields.plannedDate = new Date(body.plannedDate);
    if (body.platform !== undefined) updateFields.platform = body.platform;
    if (body.title !== undefined) updateFields.title = body.title;
    if (body.notes !== undefined) updateFields.notes = body.notes;

    const updated = await PublishingQueueItem.findByIdAndUpdate(id, updateFields, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Queue item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await connectDB();

    const deleted = await PublishingQueueItem.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Queue item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Queue item removed successfully',
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
