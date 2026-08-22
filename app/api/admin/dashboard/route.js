import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';
import Inquiry from '@/models/Inquiry';
import Agent from '@/models/Agent';
import { requireAdminAuth } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const auth = await requireAdminAuth(request);
  if (auth.error) return auth.error;

  try {
    await connectDB();

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Run parallel aggregation and count queries
    const [
      thisMonthOrders,
      lastMonthOrders,
      ordersTodayCount,
      pendingQuotesCount,
      activeAgentsCount,
      lowStockProductsCount,
      recentOrders,
      recentAgents,
      dailySalesTrend,
      topProductsSold,
    ] = await Promise.all([
      // 1. Sales this month
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfThisMonth }, status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } },
      ]),

      // 2. Sales last month (for comparison)
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
            status: { $ne: 'cancelled' },
          },
        },
        { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } },
      ]),

      // 3. Orders Today
      Order.countDocuments({ createdAt: { $gte: startOfToday } }),

      // 4. Pending Custom Quotes
      Inquiry.countDocuments({ status: { $in: ['new', 'in_review', 'quoted'] } }),

      // 5. Active Agents
      Agent.countDocuments({ status: 'approved' }),

      // 6. Low Stock Products (< 5 units)
      Product.countDocuments({ stockCount: { $lte: 5 }, status: 'published', deletedAt: null }),

      // 7. Recent 10 Orders
      Order.find({})
        .sort({ createdAt: -1 })
        .limit(10)
        .select('orderNumber customer total status paymentMethod items createdAt')
        .lean(),

      // 8. Recent Agent Activity
      Agent.find({})
        .sort({ updatedAt: -1, createdAt: -1 })
        .limit(5)
        .select('name email city salesChannel status totalSales commissionOwed referralCode createdAt')
        .lean(),

      // 9. Sales Trend over 30 Days (Group by Day)
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: thirtyDaysAgo },
            status: { $ne: 'cancelled' },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
            },
            revenue: { $sum: '$total' },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // 10. Top 5 Products by Units Sold (Unwind Order Items)
      Order.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.name',
            productId: { $first: '$items.productId' },
            unitsSold: { $sum: '$items.quantity' },
            totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
            image: { $first: '$items.image' },
          },
        },
        { $sort: { unitsSold: -1 } },
        { $limit: 5 },
      ]),
    ]);

    const thisMonthRevenue = thisMonthOrders[0]?.total || 0;
    const thisMonthOrdersCount = thisMonthOrders[0]?.count || 0;
    const lastMonthRevenue = lastMonthOrders[0]?.total || 0;

    let revenueGrowth = 0;
    if (lastMonthRevenue > 0) {
      revenueGrowth = Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100);
    } else if (thisMonthRevenue > 0) {
      revenueGrowth = 100;
    }

    // Ensure all 30 days are filled in the sales trend for a smooth Recharts chart
    const trendMap = new Map();
    dailySalesTrend.forEach((item) => {
      trendMap.set(item._id, { revenue: item.revenue, orders: item.orders });
    });

    const fullSalesTrend = [];
    for (let d = 29; d >= 0; d--) {
      const dayDate = new Date(Date.now() - d * 24 * 60 * 60 * 1000);
      const key = dayDate.toISOString().split('T')[0];
      const monthDay = dayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const found = trendMap.get(key) || { revenue: 0, orders: 0 };
      fullSalesTrend.push({
        date: key,
        label: monthDay,
        revenue: found.revenue,
        orders: found.orders,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        kpis: {
          totalSales: {
            value: thisMonthRevenue,
            formatted: `$${thisMonthRevenue.toLocaleString()}`,
            ordersCount: thisMonthOrdersCount,
            trendPercent: revenueGrowth,
            trendDirection: revenueGrowth >= 0 ? 'up' : 'down',
            label: 'This Month Revenue',
          },
          ordersToday: {
            value: ordersTodayCount,
            label: 'Orders Today',
          },
          pendingQuotes: {
            value: pendingQuotesCount,
            label: 'Pending Quotes & Inquiries',
          },
          activeAgents: {
            value: activeAgentsCount,
            label: 'Active Trade Partners',
          },
          lowStock: {
            value: lowStockProductsCount,
            label: 'Low Stock Alerts (< 5 units)',
          },
        },
        salesTrend: fullSalesTrend,
        topProducts: topProductsSold,
        recentOrders,
        recentAgents,
      },
    });
  } catch (error) {
    console.error('Error fetching admin dashboard data:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch dashboard metrics' },
      { status: 500 }
    );
  }
}
