import crypto from "crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db/prisma";
import type { User, Customer } from "@prisma/client";
export const UserRole = { ADMIN: "ADMIN", STAFF: "STAFF", CUSTOMER: "CUSTOMER" } as const;
export type UserRole = "ADMIN" | "STAFF" | "CUSTOMER";

export const SESSION_COOKIE_NAME = "planzo_session";
export const SESSION_EXPIRATION_DAYS = 7;
export const SESSION_MAX_AGE = SESSION_EXPIRATION_DAYS * 24 * 60 * 60; // in seconds

export type AuthenticatedUser = Omit<User, "passwordHash" | "password"> & {
  customer: Customer | null;
};

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole | string;
  customerId?: string | null;
}

// Development default users for mock/header extraction
export const DEFAULT_STAFF_USER: AuthUser = {
  id: "usr_staff_01",
  name: "Joe Finance Lead",
  email: "joe.finance@planzo.com",
  role: UserRole.STAFF,
};

export const DEFAULT_CUSTOMER_USER: AuthUser = {
  id: "usr_cust_01",
  name: "Acme Corp Admin",
  email: "billing@acme.com",
  role: UserRole.CUSTOMER,
  customerId: "cust_acme_01",
};

export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Creates a new session in DB and returns the raw opaque token
 */
export async function createSession(userId: string): Promise<string> {
  const token = generateToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000);

  await prisma.session.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
    },
  });

  return token;
}

/**
 * Sets the HttpOnly session cookie on the response
 */
export async function setSessionCookie(token: string): Promise<void> {
  try {
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });
  } catch {
    // Safely ignored outside HTTP request scope (e.g. CLI or tests)
  }
}

/**
 * Clears the session cookie
 */
export async function clearSessionCookie(): Promise<void> {
  try {
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
  } catch {
    // Safely ignored outside HTTP request scope
  }
}

/**
 * Validates the raw token from cookie against the database
 */
export async function validateSessionToken(
  token: string
): Promise<AuthenticatedUser | null> {
  if (!token) return null;

  const tokenHash = hashToken(token);
  const session = await prisma.session.findUnique({
    where: { tokenHash },
    include: {
      user: {
        include: {
          customer: true,
        },
      },
    },
  });

  if (!session) return null;

  // Check expiration
  if (session.expiresAt.getTime() < Date.now()) {
    prisma.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }

  const { passwordHash: _, ...safeUser } = session.user;
  return safeUser;
}

/**
 * Gets the current authenticated user from incoming request cookies
 */
export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;

    return await validateSessionToken(token);
  } catch {
    return null;
  }
}

/**
 * Invalidates the current session from DB and clears the cookie
 */
export async function invalidateCurrentSession(): Promise<void> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (token) {
      const tokenHash = hashToken(token);
      await prisma.session.deleteMany({
        where: { tokenHash },
      });
    }
    await clearSessionCookie();
  } catch {
    // Ignore error on invalidation
  }
}

/**
 * Invalidate all sessions for a specific user (e.g. after password reset)
 */
export async function invalidateAllUserSessions(userId: string): Promise<void> {
  await prisma.session.deleteMany({
    where: { userId },
  });
}

/**
 * Extracts authenticated user context from request headers, cookies or dev defaults
 */
export async function getSessionUser(req?: Request): Promise<AuthUser | null> {
  if (req) {
    const userId = req.headers.get("x-user-id");
    const userRole = req.headers.get("x-user-role");
    const customerId = req.headers.get("x-customer-id");
    const userEmail = req.headers.get("x-user-email");

    if (userId && userRole) {
      return {
        id: userId,
        name: userEmail ? userEmail.split("@")[0] : "Authenticated User",
        email: userEmail || "user@planzo.com",
        role: userRole,
        customerId: customerId || null,
      };
    }
  }

  // Fallback to cookie authentication
  const current = await getCurrentUser();
  if (current) {
    return {
      id: current.id,
      name: current.name,
      email: current.email,
      role: current.role,
      customerId: current.customerId,
    };
  }

  return DEFAULT_STAFF_USER;
}

/**
 * Validates that the current user has Staff or Admin privileges
 */
export function isStaffOrAdmin(user: AuthUser | null): boolean {
  if (!user) return false;
  return user.role === UserRole.ADMIN || user.role === UserRole.STAFF || user.role === "ADMIN" || user.role === "STAFF";
}

/**
 * Validates customer portal access for a specific customer resource
 */
export function canAccessCustomerResource(
  user: AuthUser | null,
  resourceCustomerId: string
): boolean {
  if (!user) return false;
  if (isStaffOrAdmin(user)) return true;
  return (user.role === UserRole.CUSTOMER || user.role === "CUSTOMER") && user.customerId === resourceCustomerId;
}
