import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import RawMaterial from '@/models/RawMaterial';
import { requireAdminAuth } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function PUT(request, { params }) {
  const auth = await requireAdminAuth(request, ['super_admin', 'product_manager', 'admin']);
  if (auth.error) return auth.error;

  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const material = await RawMaterial.findByIdAndUpdate(id, body, { new: true });
    if (!material) {
      return NextResponse.json({ success: false, error: 'Material not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: material, message: 'Material stock updated' });
  } catch (err) {
    console.error('Update material error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Failed to update material' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const auth = await requireAdminAuth(request, ['super_admin', 'product_manager', 'admin']);
  if (auth.error) return auth.error;

  try {
    await connectDB();
    const { id } = await params;

    const material = await RawMaterial.findByIdAndDelete(id);
    if (!material) {
      return NextResponse.json({ success: false, error: 'Material not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Material removed from inventory' });
  } catch (err) {
    console.error('Delete material error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Failed to delete material' }, { status: 500 });
  }
}
