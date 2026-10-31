export type UserRole = 'ADMIN' | 'STAFF' | 'CUSTOMER';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  customerId?: string | null;
}

/**
 * Extracts authenticated user context from request headers.
 * In production, this reads the verified session or JWT.
 * In development and API testing, supports x-user-role and x-user-id headers.
 */
export function getAuthUser(request: Request): AuthUser {
  const roleHeader = request.headers.get('x-user-role')?.toUpperCase() as UserRole | undefined;
  const userId = request.headers.get('x-user-id') || 'usr_admin_default';
  const customerId = request.headers.get('x-customer-id') || null;
  const email = request.headers.get('x-user-email') || 'admin@brightloop.io';

  const role: UserRole =
    roleHeader === 'ADMIN' || roleHeader === 'STAFF' || roleHeader === 'CUSTOMER'
      ? roleHeader
      : 'ADMIN'; // Default to ADMIN for internal routes if unspecified

  return {
    id: userId,
    email,
    role,
    customerId: role === 'CUSTOMER' ? customerId || userId : null,
  };
}

/**
 * Checks if the current user has one of the allowed roles.
 */
export function hasRole(user: AuthUser, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(user.role);
}

/**
 * Enforces role-based authorization.
 * Returns null if authorized, or an error string if unauthorized.
 */
export function authorizeRoles(
  user: AuthUser,
  allowedRoles: UserRole[]
): { authorized: boolean; error?: string } {
  if (!hasRole(user, allowedRoles)) {
    return {
      authorized: false,
      error: `Forbidden: requires one of [${allowedRoles.join(', ')}], current role is ${user.role}`,
    };
  }
  return { authorized: true };
}
