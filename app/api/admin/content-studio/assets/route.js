import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ContentAsset from '@/models/ContentAsset';

export const dynamic = 'force-dynamic';

const DEFAULT_STICKERS = [
  {
    type: 'sticker',
    name: 'NEW ARRIVAL',
    category: 'Badges',
    url: 'badge:new-arrival',
    metadata: {
      tagText: 'NEW ARRIVAL',
      badgeColor: '#B8551F',
      dimensions: { width: 220, height: 60 },
    },
    isDefault: true,
  },
  {
    type: 'sticker',
    name: 'BEST SELLER',
    category: 'Badges',
    url: 'badge:best-seller',
    metadata: {
      tagText: '★ BEST SELLER',
      badgeColor: '#D99A2B',
      dimensions: { width: 220, height: 60 },
    },
    isDefault: true,
  },
  {
    type: 'sticker',
    name: 'MADE TO ORDER',
    category: 'Craft',
    url: 'badge:made-to-order',
    metadata: {
      tagText: 'MADE TO ORDER · ETHIOPIA',
      badgeColor: '#2D5A27',
      dimensions: { width: 260, height: 60 },
    },
    isDefault: true,
  },
  {
    type: 'sticker',
    name: 'LIMITED STOCK',
    category: 'Urgency',
    url: 'badge:limited-stock',
    metadata: {
      tagText: 'LIMITED STOCK',
      badgeColor: '#962D18',
      dimensions: { width: 200, height: 60 },
    },
    isDefault: true,
  },
  {
    type: 'sticker',
    name: 'DISCOUNT % OFF',
    category: 'Sales',
    url: 'badge:discount-pct',
    metadata: {
      tagText: '20% OFF',
      badgeColor: '#B8551F',
      dimensions: { width: 180, height: 60 },
    },
    isDefault: true,
  },
  {
    type: 'sticker',
    name: 'SPECIAL OFFER',
    category: 'Sales',
    url: 'badge:special-offer',
    metadata: {
      tagText: 'SPECIAL OFFER',
      badgeColor: '#201C18',
      dimensions: { width: 220, height: 60 },
    },
    isDefault: true,
  },
];

const DEFAULT_AUDIO = [
  {
    type: 'audio',
    name: 'Acoustic Morning (Calm)',
    category: 'Calm',
    url: 'https://res.cloudinary.com/demo/video/upload/sample_audio.mp3',
    metadata: {
      mood: 'Calm',
      durationSeconds: 30,
      license: 'Royalty-Free Commercial License (Pixabay Music)',
    },
    isDefault: true,
  },
  {
    type: 'audio',
    name: 'Modern Ethiopian Beat (Upbeat)',
    category: 'Upbeat',
    url: 'https://res.cloudinary.com/demo/video/upload/sample_audio.mp3',
    metadata: {
      mood: 'Upbeat',
      durationSeconds: 25,
      license: 'Royalty-Free Commercial License (Licensed for KB Furniture)',
    },
    isDefault: true,
  },
  {
    type: 'audio',
    name: 'Luxury Showroom Ambient (Elegant)',
    category: 'Elegant',
    url: 'https://res.cloudinary.com/demo/video/upload/sample_audio.mp3',
    metadata: {
      mood: 'Elegant',
      durationSeconds: 45,
      license: 'Royalty-Free Commercial License',
    },
    isDefault: true,
  },
  {
    type: 'audio',
    name: 'Craft & Woodwork Groove (Corporate)',
    category: 'Corporate',
    url: 'https://res.cloudinary.com/demo/video/upload/sample_audio.mp3',
    metadata: {
      mood: 'Corporate',
      durationSeconds: 30,
      license: 'Royalty-Free Commercial License',
    },
    isDefault: true,
  },
];

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    let query = {};
    if (type) query.type = type;

    let assets = await ContentAsset.find(query).sort({ type: 1, name: 1 }).lean();

    // Auto-seed if empty
    if (assets.length === 0) {
      await ContentAsset.insertMany([...DEFAULT_STICKERS, ...DEFAULT_AUDIO]);
      assets = await ContentAsset.find(query).sort({ type: 1, name: 1 }).lean();
    }

    return NextResponse.json({ success: true, data: assets });
  } catch (err) {
    console.error('Error fetching content assets:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    if (!body.type || !body.name || !body.url) {
      return NextResponse.json(
        { success: false, error: 'Type, name, and URL are required' },
        { status: 400 }
      );
    }

    const asset = await ContentAsset.create({
      type: body.type,
      name: body.name.trim(),
      category: body.category || 'General',
      url: body.url,
      publicId: body.publicId || '',
      metadata: body.metadata || {},
      isDefault: false,
    });

    return NextResponse.json({ success: true, data: asset }, { status: 201 });
  } catch (err) {
    console.error('Error creating content asset:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
