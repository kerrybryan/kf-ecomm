import { NextResponse } from 'next/server';
import { requireAdminAuth, ROLE_PERMISSIONS } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const auth = await requireAdminAuth(request);
  if (auth.error) return auth.error;

  const permissions = ROLE_PERMISSIONS[auth.user.role] || [];
  const userProfile = {
    _id: auth.user._id,
    name: auth.user.name,
    email: auth.user.email,
    role: auth.user.role,
    phone: auth.user.phone,
    lastLogin: auth.user.lastLogin,
    permissions,
  };

  return NextResponse.json({
    success: true,
    data: userProfile,
    user: userProfile,
  });
}
