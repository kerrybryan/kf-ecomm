import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Agent from '@/models/Agent';
import { requireAdminAuth } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function POST(request, context) {
  const auth = await requireAdminAuth(request, ['super_admin', 'sales_manager', 'admin']);
  if (auth.error) return auth.error;

  try {
    await connectDB();
    const resolvedParams = context?.params ? await Promise.resolve(context.params) : {};
    const id = resolvedParams?.id;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Agent ID is required' }, { status: 400 });
    }

    const { amount, reference, notes } = await request.json();
    const payoutAmount = parseFloat(amount);
    if (isNaN(payoutAmount) || payoutAmount <= 0) {
      return NextResponse.json({ success: false, error: 'Valid positive payout amount is required' }, { status: 400 });
    }

    const agent = await Agent.findById(id);
    if (!agent) {
      return NextResponse.json({ success: false, error: 'Agent not found' }, { status: 404 });
    }

    // Deduct owed commission and add to payout history
    agent.commissionOwed = Math.max(0, (agent.commissionOwed || 0) - payoutAmount);
    agent.payoutStatus = agent.commissionOwed === 0 ? 'paid' : 'pending_payout';

    if (!Array.isArray(agent.payoutHistory)) {
      agent.payoutHistory = [];
    }

    agent.payoutHistory.push({
      amount: payoutAmount,
      paidAt: new Date(),
      reference: reference || `PAYOUT-${Date.now().toString().slice(-6)}`,
      notes: notes || 'Commission payout marked via Admin Portal',
      paidBy: `${auth.user?.name || 'Admin'} (${auth.user?.role || 'staff'})`,
    });

    await agent.save();

    return NextResponse.json({
      success: true,
      data: agent,
      message: `Successfully processed payout of $${payoutAmount.toLocaleString()} to ${agent.name}`,
    });
  } catch (error) {
    console.error('Agent payout error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to process payout' }, { status: 500 });
  }
}
