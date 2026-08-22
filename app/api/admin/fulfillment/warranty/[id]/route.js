import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import WarrantyClaim from '@/models/WarrantyClaim';
import { requireAdminAuth } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function PUT(request, { params }) {
  const auth = await requireAdminAuth(request, ['super_admin', 'sales_manager', 'support', 'admin']);
  if (auth.error) return auth.error;

  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();
    const { status, resolutionNotes, assignedArtisan } = body;

    const claim = await WarrantyClaim.findById(id);
    if (!claim) {
      return NextResponse.json({ success: false, error: 'Claim not found' }, { status: 404 });
    }

    if (status) {
      claim.status = status;
      if (status === 'resolved' || status === 'replacement_approved') {
        claim.resolvedAt = new Date();
      }
    }
    if (resolutionNotes) claim.resolutionNotes = resolutionNotes;
    if (assignedArtisan) claim.assignedArtisan = assignedArtisan;

    await claim.save();

    return NextResponse.json({ success: true, data: claim, message: `Claim updated to ${claim.status}` });
  } catch (err) {
    console.error('Update claim error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Failed to update claim' }, { status: 500 });
  }
}
