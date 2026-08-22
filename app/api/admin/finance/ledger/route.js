import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import LedgerEntry from '@/models/LedgerEntry';
import { requireAdminAuth } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const auth = await requireAdminAuth(request, ['super_admin', 'admin']);
  if (auth.error) return auth.error;

  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const skip = (page - 1) * limit;

    const query = {};
    if (type && type !== 'all') query.type = type;
    if (search) {
      query.$or = [
        { entryNumber: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { referenceId: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    const [entries, total] = await Promise.all([
      LedgerEntry.find(query).sort({ date: -1, createdAt: -1 }).skip(skip).limit(limit).lean(),
      LedgerEntry.countDocuments(query),
    ]);

    const allEntries = await LedgerEntry.find().lean();
    const totalCredits = allEntries.reduce((acc, e) => acc + (e.credit || 0), 0);
    const totalDebits = allEntries.reduce((acc, e) => acc + (e.debit || 0), 0);

    return NextResponse.json({
      success: true,
      data: entries,
      totals: {
        totalCredits,
        totalDebits,
        netBalance: totalCredits - totalDebits,
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (err) {
    console.error('Fetch ledger error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to load general ledger' },
      { status: 500 }
    );
  }
}
