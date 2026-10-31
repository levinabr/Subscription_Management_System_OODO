import { Role } from '@prisma/client';
import { NextRequest } from 'next/server';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  customerId?: string | null;
}

// Development default staff user when auth header is not provided
export const DEFAULT_STAFF_USER: AuthUser = {
  id: 'usr_staff_01',
  name: 'Joe Finance Lead',
  email: 'joe.finance@brightloop.com',
  role: 'STAFF',
};

// Development default customer user
export const DEFAULT_CUSTOMER_USER: AuthUser = {
  id: 'usr_cust_01',
  name: 'Acme Corp Admin',
  email: 'billing@acme.com',
  role: 'CUSTOMER',
  customerId: 'cust_acme_01',
};

/**
 * Extracts authenticated user context from request headers, cookies or dev defaults
 */
export async function getSessionUser(req?: Request | NextRequest): Promise<AuthUser | null> {
  if (!req) {
    return DEFAULT_STAFF_USER;
  }

  const userId = req.headers.get('x-user-id');
  const userRole = req.headers.get('x-user-role') as Role | null;
  const customerId = req.headers.get('x-customer-id');
  const userEmail = req.headers.get('x-user-email');

  if (userId && userRole) {
    return {
      id: userId,
      name: userEmail ? userEmail.split('@')[0] : 'Authenticated User',
      email: userEmail || 'user@brightloop.com',
      role: userRole,
      customerId: customerId || null,
    };
  }

  // Check URL pathname to intelligently determine portal vs internal in dev/mock
  const url = req.url ? new URL(req.url) : null;
  if (url && url.pathname.startsWith('/portal')) {
    return DEFAULT_CUSTOMER_USER;
  }

  return DEFAULT_STAFF_USER;
}

/**
 * Validates that the current user has Staff or Admin privileges
 */
export function isStaffOrAdmin(user: AuthUser | null): boolean {
  if (!user) return false;
  return user.role === 'ADMIN' || user.role === 'STAFF';
}

/**
 * Validates customer portal access for a specific customer resource
 */
export function canAccessCustomerResource(user: AuthUser | null, resourceCustomerId: string): boolean {
  if (!user) return false;
  if (isStaffOrAdmin(user)) return true;
  return user.role === 'CUSTOMER' && user.customerId === resourceCustomerId;
}
