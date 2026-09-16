import { NextResponse } from 'next/server';
import { calculateQuickMath, logAiUsage } from '@/lib/gemini';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const { query, adminEmail = 'admin@kbfurniture.et', adminRole = 'super_admin' } = body;

    if (!query || !query.trim()) {
      return NextResponse.json(
        { success: false, error: 'Please enter a math question or raw material estimate request.' },
        { status: 400 }
      );
    }

    const answer = await calculateQuickMath({ query: query.trim() });

    // Log AI Usage
    await logAiUsage({
      adminEmail,
      adminRole,
      feature: 'quick-calc',
      promptSummary: query.substring(0, 100),
      tokensUsed: 120,
      costEstimateUsd: 0.00004,
    });

    return NextResponse.json({
      success: true,
      data: {
        query,
        answer,
        disclaimer:
          'Quick estimate only — not saved anywhere. Use the Pricing Calculator to set an official product price.',
      },
    });
  } catch (err) {
    console.error('Quick calculation error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Calculation helper error' },
      { status: 500 }
    );
  }
}
