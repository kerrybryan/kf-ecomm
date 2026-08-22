import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Newsletter from '@/models/Newsletter';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    await connectDB();
    const { email, source = 'footer' } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ success: false, error: 'Valid email address is required.' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await Newsletter.findOne({ email: cleanEmail });

    if (existing) {
      if (existing.status !== 'subscribed') {
        existing.status = 'subscribed';
        await existing.save();
      }
      return NextResponse.json({ success: true, message: 'Thank you for subscribing to Nordic Journal!' });
    }

    await Newsletter.create({
      email: cleanEmail,
      source,
      status: 'subscribed',
    });

    return NextResponse.json({ success: true, message: 'Thank you for subscribing to Nordic Journal!' }, { status: 201 });
  } catch (error) {
    console.error('Newsletter error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Subscription failed' }, { status: 500 });
  }
}
