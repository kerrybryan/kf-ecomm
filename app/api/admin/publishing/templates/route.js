import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CaptionTemplate from '@/models/CaptionTemplate';
import { STARTER_TEMPLATES } from '@/lib/publishing';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform');

    let count = await CaptionTemplate.countDocuments();
    if (count === 0) {
      await CaptionTemplate.insertMany(STARTER_TEMPLATES);
    }

    const query = {};
    if (platform && platform !== 'all') {
      query.platform = platform;
    }

    const templates = await CaptionTemplate.find(query).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: templates,
    });
  } catch (err) {
    console.error('Error fetching caption templates:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch caption templates' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { name, template, platform = 'general', description = '' } = body;

    if (!name || !template) {
      return NextResponse.json(
        { success: false, error: 'Name and template formula are required' },
        { status: 400 }
      );
    }

    const created = await CaptionTemplate.create({
      name: name.trim(),
      template: template.trim(),
      platform,
      description: description.trim(),
    });

    return NextResponse.json({
      success: true,
      data: created,
    });
  } catch (err) {
    console.error('Error creating caption template:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to create template' },
      { status: 500 }
    );
  }
}
