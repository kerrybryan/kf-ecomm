import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectDB from './mongodb';
import User from '@/models/User';
import { verifyToken, AUTH_COOKIE_CONFIG } from './auth';

// Role definitions and permission scopes
export const ADMIN_ROLES = {
  SUPER_ADMIN: 'super_admin',
  PRODUCT_MANAGER: 'product_manager',
  SALES_MANAGER: 'sales_manager',
  SUPPORT: 'support',
  LEGACY_ADMIN: 'admin',
};

// Module-level permission map
export const ROLE_PERMISSIONS = {
  super_admin: ['*'],
  admin: ['*'], // backward compatibility
  product_manager: [
    'dashboard_view',
    'products_view',
    'products_create',
    'products_edit',
    'products_delete',
    'products_import',
    'source_studio_view',
    'source_studio_edit',
    'image_studio_view',
    'image_studio_edit',
    'content_view',
    'content_edit',
    'categories_edit',
    'inquiries_view',
    'inquiries_edit',
  ],
  sales_manager: [
    'dashboard_view',
    'orders_view',
    'orders_edit',
    'orders_status',
    'inquiries_view',
    'inquiries_edit',
    'agents_view',
    'agents_edit',
    'agents_payout',
    'customers_view',
    'customers_edit',
  ],
  support: [
    'dashboard_view',
    'orders_view',
    'orders_status',
    'inquiries_view',
    'inquiries_edit',
    'customers_view',
  ],
};

/**
 * Checks if a given role has a specific permission
 */
export function hasPermission(role, permission) {
  if (!role) return false;
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes('*') || permissions.includes(permission);
}

/**
 * Checks if role is one of the valid admin roles
 */
export function isAdminRole(role) {
  return [
    ADMIN_ROLES.SUPER_ADMIN,
    ADMIN_ROLES.PRODUCT_MANAGER,
    ADMIN_ROLES.SALES_MANAGER,
    ADMIN_ROLES.SUPPORT,
    ADMIN_ROLES.LEGACY_ADMIN,
  ].includes(role);
}

/**
 * Server-side API route helper to authenticate an admin request.
 * Checks JWT token and role permissions.
 *
 * @param {Request} request Next.js request object
 * @param {string[]|string} requiredRoles (Optional) Allowed roles for this specific endpoint
 * @returns {Promise<{ user: Object } | NextResponse>}
 */
export async function requireAdminAuth(request, requiredRoles = []) {
  try {
    let token = null;

    // 1. Try Authorization header
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    // 2. Try Cookie if no header
    if (!token) {
      const cookieStore = await cookies();
      token = cookieStore.get(AUTH_COOKIE_CONFIG.name)?.value;
    }

    if (!token) {
      return {
        error: NextResponse.json(
          { success: false, error: 'Authentication required. Please log in to the admin panel.' },
          { status: 401 }
        ),
      };
    }

    const payload = verifyToken(token);
    if (!payload || !payload.userId) {
      return {
        error: NextResponse.json(
          { success: false, error: 'Session expired or invalid. Please re-authenticate.' },
          { status: 401 }
        ),
      };
    }

    await connectDB();
    const user = await User.findById(payload.userId).select('-passwordHash').lean();

    if (!user || user.status === 'suspended') {
      return {
        error: NextResponse.json(
          { success: false, error: 'User account not found or suspended.' },
          { status: 403 }
        ),
      };
    }

    if (!isAdminRole(user.role)) {
      return {
        error: NextResponse.json(
          { success: false, error: 'Access denied: Admin privileges required.' },
          { status: 403 }
        ),
      };
    }

    // Check specific roles if provided
    const allowed = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    if (allowed.length > 0 && !allowed.includes(user.role) && user.role !== 'super_admin' && user.role !== 'admin') {
      return {
        error: NextResponse.json(
          {
            success: false,
            error: `Forbidden: Your role (${user.role}) does not have permission to access this resource.`,
          },
          { status: 403 }
        ),
      };
    }

    return { user };
  } catch (err) {
    console.error('requireAdminAuth error:', err);
    return {
      error: NextResponse.json(
        { success: false, error: 'Internal authentication error: ' + err.message },
        { status: 500 }
      ),
    };
  }
}
