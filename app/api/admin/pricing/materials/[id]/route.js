import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import MaterialRate from '@/models/MaterialRate';

export const dynamic = 'force-dynamic';

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    await connectDB();
    const body = await request.json();

    const updated = await MaterialRate.findByIdAndUpdate(
      id,
      {
        materialName: body.materialName?.trim(),
        unit: body.unit,
        costPerUnit: Number(body.costPerUnit),
        categoryTag: body.categoryTag,
        notes: body.notes,
      },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Material rate not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error('Error updating material rate:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await connectDB();
    const deleted = await MaterialRate.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Material rate not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Material rate deleted successfully' });
  } catch (err) {
    console.error('Error deleting material rate:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
