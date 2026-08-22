import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Agent from '@/models/Agent';
import LedgerEntry from '@/models/LedgerEntry';
import { requireAdminAuth } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  const auth = await requireAdminAuth(request, ['super_admin', 'admin']);
  if (auth.error) return auth.error;

  try {
    await connectDB();
    const body = await request.json();
    const { agentIds = [], notes = 'Monthly Trade Partner Commission Batch Payout' } = body;

    const query = agentIds.length > 0 ? { _id: { $in: agentIds } } : { 'commissions.pendingPayout': { $gt: 0 } };
    const agents = await Agent.find(query);

    let totalPaid = 0;
    const processedAgents = [];

    for (const agent of agents) {
      const pendingAmount = agent.commissions?.pendingPayout || 0;
      if (pendingAmount > 0) {
        totalPaid += pendingAmount;
        agent.commissions.totalPaidOut = (agent.commissions.totalPaidOut || 0) + pendingAmount;
        agent.commissions.pendingPayout = 0;

        agent.payoutHistory.push({
          amount: pendingAmount,
          paidAt: new Date(),
          referenceNumber: `PAY-BATCH-${Date.now().toString().slice(-4)}`,
          status: 'completed',
          notes,
        });

        await agent.save();
        processedAgents.push({ id: agent._id, name: agent.name, amount: pendingAmount });
      }
    }

    // Auto-create General Ledger Entry for Batch Payout
    if (totalPaid > 0) {
      const entryNumber = `LEDG-PAY-${Date.now().toString().slice(-6)}`;
      await LedgerEntry.create({
        entryNumber,
        date: new Date(),
        type: 'agent_payout',
        category: 'TRADE AGENT COMMISSIONS',
        amount: totalPaid,
        debit: totalPaid,
        credit: 0,
        description: `Batch Commission Payout to ${processedAgents.length} trade partner(s)`,
        referenceId: `BATCH-${Date.now().toString().slice(-4)}`,
        status: 'posted',
        createdBy: auth.user?.name || 'Super Admin',
      });
    }

    return NextResponse.json({
      success: true,
      totalPaid,
      processedCount: processedAgents.length,
      processedAgents,
      message: `Batch commission payout of $${totalPaid.toLocaleString()} processed and posted to General Ledger.`,
    });
  } catch (err) {
    console.error('Batch payout error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to process batch payouts' },
      { status: 500 }
    );
  }
}
