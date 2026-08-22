import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Order from '@/models/Order';
import { requireAdminAuth } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const auth = await requireAdminAuth(request);
  if (auth.error) return auth.error;

  try {
    await connectDB();
    const { searchParams } = new URL(request.url);

    const search = searchParams.get('search') || searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const query = { role: 'customer' };

    if (search.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } },
        { phone: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const [customers, total] = await Promise.all([
      User.find(query).select('-passwordHash').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      User.countDocuments(query),
    ]);

    // Aggregate lifetime spend and orders count for each customer
    const customerIds = customers.map((c) => c._id);
    const orderAgg = await Order.aggregate([
      { $match: { user: { $in: customerIds }, status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: '$user',
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$total' },
          lastOrderDate: { $max: '$createdAt' },
        },
      },
    ]);

    const orderMap = new Map();
    orderAgg.forEach((stat) => {
      orderMap.set(stat._id.toString(), stat);
    });

    const enrichedCustomers = customers.map((cust) => {
      const stats = orderMap.get(cust._id.toString()) || { totalOrders: 0, totalSpent: 0, lastOrderDate: null };
      return {
        ...cust,
        totalOrders: stats.totalOrders,
        totalSpent: stats.totalSpent,
        lastOrderDate: stats.lastOrderDate,
      };
    });

    return NextResponse.json({
      success: true,
      data: enrichedCustomers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Admin GET customers error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to fetch customers' }, { status: 500 });
  }
}
