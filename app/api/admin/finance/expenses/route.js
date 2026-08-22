import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Expense from '@/models/Expense';
import LedgerEntry from '@/models/LedgerEntry';
import { requireAdminAuth } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const auth = await requireAdminAuth(request, ['super_admin', 'admin']);
  if (auth.error) return auth.error;

  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const query = {};
    if (category && category !== 'all') query.category = category;

    const expenses = await Expense.find(query).sort({ date: -1 }).lean();
    const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);

    return NextResponse.json({
      success: true,
      data: expenses,
      totalExpenses,
    });
  } catch (err) {
    console.error('Fetch expenses error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to load expenses' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const auth = await requireAdminAuth(request, ['super_admin', 'admin']);
  if (auth.error) return auth.error;

  try {
    await connectDB();
    const body = await request.json();
    const {
      title,
      category = 'raw_timber_lumber',
      amount,
      vendor = 'Nordic Timber & Mill',
      paymentMethod = 'bank_wire',
      receiptUrl = '',
      notes = '',
      date,
    } = body;

    if (!title || !amount) {
      return NextResponse.json({ success: false, error: 'Title and amount are required' }, { status: 400 });
    }

    const numAmount = Number(amount);
    const expenseDate = date ? new Date(date) : new Date();

    // 1. Auto-create Ledger Entry (Zero Double Entry)
    const entryNumber = `LEDG-${Date.now().toString().slice(-6)}`;
    const ledgerEntry = await LedgerEntry.create({
      entryNumber,
      date: expenseDate,
      type: 'expense',
      category: category.replace(/_/g, ' ').toUpperCase(),
      amount: numAmount,
      debit: numAmount,
      credit: 0,
      description: `Expense: ${title} (${vendor})`,
      referenceId: `EXP-${Date.now().toString().slice(-4)}`,
      status: 'posted',
      createdBy: auth.user?.name || 'Super Admin',
    });

    // 2. Create Expense record linked to Ledger
    const expense = await Expense.create({
      title,
      category,
      amount: numAmount,
      date: expenseDate,
      vendor,
      paymentMethod,
      receiptUrl,
      notes,
      ledgerEntryId: ledgerEntry._id,
    });

    return NextResponse.json({
      success: true,
      data: expense,
      ledgerEntry,
      message: 'Expense recorded and automatically journaled in General Ledger!',
    }, { status: 201 });
  } catch (err) {
    console.error('Create expense error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to record expense' },
      { status: 500 }
    );
  }
}
