import { UserRole } from "@prisma/client";
import { getCurrentUser, AuthenticatedUser } from "./session";
import { ApiError } from "@/lib/errors/api-error";

/**
 * Requires the request to have a valid authenticated session
 */
export async function requireAuthenticatedUser(): Promise<AuthenticatedUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw ApiError.unauthorized("Authentication required to access this resource");
  }
  return user;
}

/**
 * Requires the authenticated user to hold one of the specified roles
 */
export async function requireRole(allowedRoles: UserRole[]): Promise<AuthenticatedUser> {
  const user = await requireAuthenticatedUser();
  if (!allowedRoles.includes(user.role)) {
    throw ApiError.forbidden(
      `Access forbidden: requires one of the following roles: [${allowedRoles.join(", ")}]`
    );
  }
  return user;
}

/**
 * Enforces customer data isolation:
 * - Admin and Staff can access any customer's data
 * - Customer users can only access data belonging to their own customer account
 */
export async function requireCustomerOwnership(
  customerId: string
): Promise<AuthenticatedUser> {
  const user = await requireAuthenticatedUser();

  if (user.role === UserRole.ADMIN || user.role === UserRole.STAFF) {
    return user;
  }

  if (user.role === UserRole.CUSTOMER) {
    if (!user.customerId || user.customerId !== customerId) {
      throw ApiError.forbidden("Access denied: You can only access your own customer account");
    }
    return user;
  }

  throw ApiError.forbidden("Access denied");
}
