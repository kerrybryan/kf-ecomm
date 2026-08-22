import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Inquiry from '@/models/Inquiry';
import { requireAdminAuth } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function POST(request, { params }) {
  const auth = await requireAdminAuth(request);
  if (auth.error) return auth.error;

  try {
    await connectDB();
    const { id } = await params;
    const { note } = await request.json();

    if (!note || !note.trim()) {
      return NextResponse.json({ success: false, error: 'Note is required' }, { status: 400 });
    }

    const inquiry = await Inquiry.findById(id);
    if (!inquiry) {
      return NextResponse.json({ success: false, error: 'Inquiry not found' }, { status: 404 });
    }

    inquiry.internalNotes.push({
      note: note.trim(),
      createdAt: new Date(),
      createdBy: `${auth.user.name} (${auth.user.role})`,
    });

    await inquiry.save();

    return NextResponse.json({
      success: true,
      data: inquiry.internalNotes,
      message: 'Staff CRM note added',
    });
  } catch (error) {
    console.error('Add inquiry note error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to add note' }, { status: 500 });
  }
}
