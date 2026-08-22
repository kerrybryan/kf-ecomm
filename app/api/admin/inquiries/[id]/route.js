import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Inquiry from '@/models/Inquiry';
import { requireAdminAuth } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  const auth = await requireAdminAuth(request);
  if (auth.error) return auth.error;

  try {
    await connectDB();
    const { id } = await params;

    const inquiry = await Inquiry.findById(id).lean();
    if (!inquiry) {
      return NextResponse.json({ success: false, error: 'Inquiry not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: inquiry });
  } catch (error) {
    console.error('Admin get inquiry error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to fetch inquiry' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const auth = await requireAdminAuth(request);
  if (auth.error) return auth.error;

  try {
    await connectDB();
    const { id } = await params;
    const { status, budget, dimensions } = await request.json();

    const inquiry = await Inquiry.findById(id);
    if (!inquiry) {
      return NextResponse.json({ success: false, error: 'Inquiry not found' }, { status: 404 });
    }

    if (status) inquiry.status = status;
    if (budget !== undefined) inquiry.budget = budget;
    if (dimensions !== undefined) inquiry.dimensions = dimensions;

    await inquiry.save();

    return NextResponse.json({ success: true, data: inquiry, message: 'Inquiry updated successfully' });
  } catch (error) {
    console.error('Admin update inquiry error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to update inquiry' }, { status: 500 });
  }
}
