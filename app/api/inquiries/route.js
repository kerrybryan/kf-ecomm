import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Inquiry from '@/models/Inquiry';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();
    const inquiries = await Inquiry.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: inquiries });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch inquiries' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    const { name, email, phone, type, message, referenceImage, productContext, dimensions, budget } = body;

    if (!name || !email || !phone || !message) {
      return NextResponse.json(
        { success: false, error: 'Name, email, phone, and message are required' },
        { status: 400 }
      );
    }

    const inquiry = await Inquiry.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      type: type || 'general',
      message: message.trim(),
      referenceImage: referenceImage || '',
      productContext: productContext || '',
      dimensions: dimensions || '',
      budget: budget || '',
      status: 'new',
    });

    return NextResponse.json(
      {
        success: true,
        data: inquiry,
        message: 'Your inquiry has been submitted to our design concierge team!',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating inquiry:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to submit inquiry' },
      { status: 500 }
    );
  }
}
