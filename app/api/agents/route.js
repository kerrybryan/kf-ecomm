import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Agent from '@/models/Agent';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();
    const agents = await Agent.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: agents });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch agents' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    const { name, email, phone, city, experience, salesChannel, notes } = body;

    if (!name || !email || !phone || !city || !salesChannel) {
      return NextResponse.json(
        { success: false, error: 'Name, email, phone, city, and sales channel are required' },
        { status: 400 }
      );
    }

    const existingAgent = await Agent.findOne({ email: email.toLowerCase().trim() });
    if (existingAgent) {
      return NextResponse.json(
        { success: false, error: 'An application with this email address already exists' },
        { status: 400 }
      );
    }

    const referralCode = `KB-${name.replace(/\s+/g, '').substring(0, 4).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    const agent = await Agent.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      city: city.trim(),
      experience: experience || '',
      salesChannel: salesChannel.trim(),
      status: 'pending',
      referralCode,
      notes: notes || '',
    });

    return NextResponse.json(
      {
        success: true,
        data: agent,
        message: 'Agent application received! Our partnership director will reach out within 24-48 hours.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating agent application:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to submit application' },
      { status: 500 }
    );
  }
}
