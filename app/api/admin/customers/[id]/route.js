import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Order from '@/models/Order';
import { requireAdminAuth } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  const auth = await requireAdminAuth(request);
  if (auth.error) return auth.error;

  try {
    await connectDB();
    const { id } = await params;

    const customer = await User.findById(id)
      .select('-passwordHash')
      .populate('wishlist', 'name slug price images category')
      .lean();

    if (!customer) {
      return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 404 });
    }

    // Fetch all orders for this customer
    const orders = await Order.find({
      $or: [{ user: customer._id }, { 'customer.email': customer.email }],
    })
      .sort({ createdAt: -1 })
      .lean();

    const totalSpent = orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + (o.total || 0), 0);

    return NextResponse.json({
      success: true,
      data: {
        ...customer,
        totalSpent,
        totalOrders: orders.length,
        orders,
      },
    });
  } catch (error) {
    console.error('Admin get customer detail error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to fetch customer details' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const auth = await requireAdminAuth(request);
  if (auth.error) return auth.error;

  try {
    await connectDB();
    const { id } = await params;
    const { notes, status, phone } = await request.json();

    const customer = await User.findById(id);
    if (!customer) {
      return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 404 });
    }

    if (notes !== undefined) customer.notes = notes;
    if (status) customer.status = status;
    if (phone !== undefined) customer.phone = phone;

    await customer.save();

    return NextResponse.json({ success: true, data: customer, message: 'Customer CRM profile updated' });
  } catch (error) {
    console.error('Admin update customer error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to update customer' }, { status: 500 });
  }
}
