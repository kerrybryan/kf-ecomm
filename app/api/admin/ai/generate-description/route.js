import { NextResponse } from 'next/server';
import { generateProductDescription, logAiUsage } from '@/lib/gemini';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, category, materials, dimensions, price } = body;

    if (!name && !category) {
      return NextResponse.json(
        { success: false, error: 'Product name or category is required to draft a description' },
        { status: 400 }
      );
    }

    const description = await generateProductDescription({
      name,
      category,
      materials,
      dimensions,
      price,
    });

    // Log AI Usage
    await logAiUsage({
      feature: 'generate-description',
      promptSummary: `Description for: ${name || category}`,
      tokensUsed: 85,
      costEstimateUsd: 0.00003,
      metadata: { name, category, price },
    });

    return NextResponse.json({
      success: true,
      description,
      note: 'AI-drafted — please review before publishing',
    });
  } catch (err) {
    console.error('Error generating description with Gemini:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to generate description' },
      { status: 500 }
    );
  }
}
