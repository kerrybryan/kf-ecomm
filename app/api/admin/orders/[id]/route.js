import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { requireAdminAuth } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  const auth = await requireAdminAuth(request);
  if (auth.error) return auth.error;

  try {
    await connectDB();
    const { id } = await params;

    const order = await Order.findById(id).populate('items.productId').lean();
    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error('Admin get order detail error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to fetch order' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const auth = await requireAdminAuth(request);
  if (auth.error) return auth.error;

  try {
    await connectDB();
    const { id } = await params;
    const { status, note, paymentStatus, deliveryNotes } = await request.json();

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    const previousStatus = order.status;
    let statusChanged = false;

    if (status && status !== order.status) {
      order.status = status;
      statusChanged = true;

      // Add to audit timeline
      order.timeline.push({
        status,
        note: note || `Status updated from "${previousStatus}" to "${status}".`,
        updatedAt: new Date(),
        updatedBy: `${auth.user.name} (${auth.user.role})`,
      });
    }

    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }

    if (deliveryNotes !== undefined) {
      order.deliveryNotes = deliveryNotes;
    }

    await order.save();

    return NextResponse.json({
      success: true,
      data: order,
      message: statusChanged
        ? `Order status updated to ${status}`
        : 'Order details updated successfully',
    });
  } catch (error) {
    console.error('Admin update order error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to update order' }, { status: 500 });
  }
}
