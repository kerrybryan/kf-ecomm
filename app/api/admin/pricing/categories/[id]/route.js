import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CategoryPricingTemplate from '@/models/CategoryPricingTemplate';

export const dynamic = 'force-dynamic';

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    await connectDB();
    const body = await request.json();

    const updated = await CategoryPricingTemplate.findByIdAndUpdate(
      id,
      {
        category: body.category?.trim(),
        description: body.description,
        materialInputs: body.materialInputs,
        laborHoursDefault: Number(body.laborHoursDefault),
        laborRatePerHour: Number(body.laborRatePerHour),
        overheadPercentDefault: Number(body.overheadPercentDefault),
        markupMultiplierDefault: Number(body.markupMultiplierDefault),
      },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Category template not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error('Error updating category template:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await connectDB();
    const deleted = await CategoryPricingTemplate.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Category template not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Category template deleted successfully' });
  } catch (err) {
    console.error('Error deleting category template:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
