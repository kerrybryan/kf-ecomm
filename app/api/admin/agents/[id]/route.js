import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Agent from '@/models/Agent';
import Order from '@/models/Order';
import { requireAdminAuth } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  const auth = await requireAdminAuth(request);
  if (auth.error) return auth.error;

  try {
    await connectDB();
    const { id } = await params;

    const agent = await Agent.findById(id).lean();
    if (!agent) {
      return NextResponse.json({ success: false, error: 'Agent not found' }, { status: 404 });
    }

    // Find orders attributed to this agent's referral code or customer email
    let attributedOrders = [];
    if (agent.referralCode) {
      attributedOrders = await Order.find({
        $or: [
          { deliveryNotes: { $regex: agent.referralCode, $options: 'i' } },
          { 'customer.email': agent.email },
        ],
      })
        .sort({ createdAt: -1 })
        .lean();
    }

    return NextResponse.json({
      success: true,
      data: {
        ...agent,
        attributedOrders,
      },
    });
  } catch (error) {
    console.error('Admin get agent detail error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to fetch agent details' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const auth = await requireAdminAuth(request, ['super_admin', 'sales_manager', 'admin']);
  if (auth.error) return auth.error;

  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const agent = await Agent.findById(id);
    if (!agent) {
      return NextResponse.json({ success: false, error: 'Agent not found' }, { status: 404 });
    }

    if (body.commissionRate !== undefined) agent.commissionRate = Number(body.commissionRate);
    if (body.commissionOwed !== undefined) agent.commissionOwed = Number(body.commissionOwed);
    if (body.totalSales !== undefined) agent.totalSales = Number(body.totalSales);
    if (body.referralCode) agent.referralCode = body.referralCode.toUpperCase().trim();
    if (body.notes !== undefined) agent.notes = body.notes;
    if (body.status) agent.status = body.status;

    await agent.save();

    return NextResponse.json({ success: true, data: agent, message: 'Agent updated successfully' });
  } catch (error) {
    console.error('Admin update agent error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to update agent' }, { status: 500 });
  }
}
