import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Agent from '@/models/Agent';
import { requireAdminAuth } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const auth = await requireAdminAuth(request);
  if (auth.error) return auth.error;

  try {
    await connectDB();
    const { searchParams } = new URL(request.url);

    const status = searchParams.get('status'); // all, pending, approved, rejected
    const search = searchParams.get('search') || searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } },
        { city: { $regex: search.trim(), $options: 'i' } },
        { referralCode: { $regex: search.trim(), $options: 'i' } },
        { salesChannel: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const [agents, total, pendingCount, approvedCount] = await Promise.all([
      Agent.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Agent.countDocuments(query),
      Agent.countDocuments({ status: 'pending' }),
      Agent.countDocuments({ status: 'approved' }),
    ]);

    return NextResponse.json({
      success: true,
      data: agents,
      counts: {
        total,
        pending: pendingCount,
        approved: approvedCount,
      },
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Admin GET agents error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to fetch agents' }, { status: 500 });
  }
}

export async function POST(request) {
  const auth = await requireAdminAuth(request, ['super_admin', 'sales_manager', 'admin']);
  if (auth.error) return auth.error;

  try {
    await connectDB();
    const { agentId, action, notes, commissionRate } = await request.json();

    if (!agentId || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ success: false, error: 'Agent ID and valid action (approve/reject) are required' }, { status: 400 });
    }

    const agent = await Agent.findById(agentId);
    if (!agent) {
      return NextResponse.json({ success: false, error: 'Agent not found' }, { status: 404 });
    }

    if (action === 'approve') {
      agent.status = 'approved';
      if (commissionRate) agent.commissionRate = Number(commissionRate);

      // Generate unique referral code if missing
      if (!agent.referralCode) {
        const cleanName = agent.name.split(' ')[0].toUpperCase().replace(/[^A-Z]/g, '');
        const randomCode = Math.floor(1000 + Math.random() * 9000);
        agent.referralCode = `${cleanName || 'AGENT'}-NORD-${randomCode}`;
      }
    } else {
      agent.status = 'rejected';
      if (notes) agent.notes = notes;
    }

    await agent.save();

    return NextResponse.json({
      success: true,
      data: agent,
      message: `Agent ${action === 'approve' ? 'approved with code ' + agent.referralCode : 'application rejected'}`,
    });
  } catch (error) {
    console.error('Admin agent action error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to process agent action' }, { status: 500 });
  }
}
