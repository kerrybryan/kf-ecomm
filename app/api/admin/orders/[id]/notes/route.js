import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { requireAdminAuth } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function POST(request, { params }) {
  const auth = await requireAdminAuth(request);
  if (auth.error) return auth.error;

  try {
    await connectDB();
    const { id } = await params;
    const { note } = await request.json();

    if (!note || !note.trim()) {
      return NextResponse.json({ success: false, error: 'Note text is required' }, { status: 400 });
    }

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    order.internalNotes.push({
      note: note.trim(),
      createdAt: new Date(),
      createdBy: `${auth.user.name} (${auth.user.role})`,
    });

    await order.save();

    return NextResponse.json({
      success: true,
      data: order.internalNotes,
      message: 'Internal note added',
    });
  } catch (error) {
    console.error('Add order note error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to add note' }, { status: 500 });
  }
}
