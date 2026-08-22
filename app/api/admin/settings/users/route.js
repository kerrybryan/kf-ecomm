import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { requireAdminAuth } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const auth = await requireAdminAuth(request, ['super_admin', 'admin']);
  if (auth.error) return auth.error;

  try {
    await connectDB();
    const adminUsers = await User.find({
      role: { $in: ['super_admin', 'product_manager', 'sales_manager', 'support', 'admin'] },
    })
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, data: adminUsers });
  } catch (error) {
    console.error('Admin GET users error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to fetch admin users' }, { status: 500 });
  }
}

export async function POST(request) {
  const auth = await requireAdminAuth(request, ['super_admin', 'admin']);
  if (auth.error) return auth.error;

  try {
    await connectDB();
    const { name, email, password, role, phone, notes } = await request.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { success: false, error: 'Name, email, password, and role are required' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return NextResponse.json({ success: false, error: 'User with this email already exists' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newAdmin = await User.create({
      name: name.trim(),
      email: cleanEmail,
      passwordHash,
      role,
      phone: phone || '',
      notes: notes || '',
      status: 'active',
    });

    const userDoc = newAdmin.toObject();
    delete userDoc.passwordHash;

    return NextResponse.json({ success: true, data: userDoc, message: 'Admin account created successfully' }, { status: 201 });
  } catch (error) {
    console.error('Create admin user error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to create admin user' }, { status: 500 });
  }
}

export async function PUT(request) {
  const auth = await requireAdminAuth(request, ['super_admin', 'admin']);
  if (auth.error) return auth.error;

  try {
    await connectDB();
    const { _id, role, status, phone, notes, password } = await request.json();

    if (!_id) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    const user = await User.findById(_id);
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Protect super admin from self-demotion/deactivation
    if (user._id.toString() === auth.user._id.toString() && (status === 'suspended' || (role && role !== 'super_admin' && role !== 'admin'))) {
      return NextResponse.json({ success: false, error: 'Cannot revoke or suspend your own super admin account' }, { status: 400 });
    }

    if (role) user.role = role;
    if (status) user.status = status;
    if (phone !== undefined) user.phone = phone;
    if (notes !== undefined) user.notes = notes;

    if (password && password.trim()) {
      user.passwordHash = await bcrypt.hash(password.trim(), 10);
    }

    await user.save();

    const userDoc = user.toObject();
    delete userDoc.passwordHash;

    return NextResponse.json({ success: true, data: userDoc, message: 'Admin account updated successfully' });
  } catch (error) {
    console.error('Update admin user error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to update admin user' }, { status: 500 });
  }
}
