import crypto from "crypto";
import { prisma } from "@/lib/db/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import {
  createSession,
  setSessionCookie,
  invalidateCurrentSession,
  hashToken,
  AuthenticatedUser,
} from "@/lib/auth/session";
import { ApiError } from "@/lib/errors/api-error";
import {
  RegisterInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  CreateStaffInput,
} from "@/validations/auth/auth.schema";
import { UserRole } from "@prisma/client";

export class AuthService {
  /**
   * Registers a new customer and primary business user within a transaction
   */
  static async register(input: RegisterInput): Promise<AuthenticatedUser> {
    const normalizedEmail = input.email.toLowerCase().trim();

    // Check unique email
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      throw ApiError.conflict("An account with this email address already exists.");
    }

    const passwordHash = await hashPassword(input.password);

    // Transaction creates Customer and User
    const result = await prisma.$transaction(async (tx) => {
      const customer = await tx.customer.create({
        data: {
          companyName: input.companyName.trim(),
          contactName: input.name.trim(),
          email: normalizedEmail,
          phone: input.phone?.trim() || null,
          taxIdentifier: input.taxIdentifier?.trim() || null,
        },
      });

      const user = await tx.user.create({
        data: {
          name: input.name.trim(),
          email: normalizedEmail,
          passwordHash,
          role: UserRole.CUSTOMER, // Always CUSTOMER for public registration
          customerId: customer.id,
        },
        include: {
          customer: true,
        },
      });

      return user;
    });

    // Auto-login after registration
    const sessionToken = await createSession(result.id);
    await setSessionCookie(sessionToken);

    const { passwordHash: _, ...safeUser } = result;
    return safeUser;
  }

  /**
   * Logs in a user and establishes a secure session
   */
  static async login(input: LoginInput): Promise<AuthenticatedUser> {
    const normalizedEmail = input.email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        customer: true,
      },
    });

    if (!user || !user.passwordHash) {
      throw ApiError.unauthorized("Invalid email or password.");
    }

    const isValidPassword = await verifyPassword(input.password, user.passwordHash);
    if (!isValidPassword) {
      throw ApiError.unauthorized("Invalid email or password.");
    }

    const sessionToken = await createSession(user.id);
    await setSessionCookie(sessionToken);

    const { passwordHash: _, password: _p, ...safeUser } = user;
    return safeUser;
  }

  /**
   * Logs out the current session
   */
  static async logout(): Promise<void> {
    await invalidateCurrentSession();
  }

  /**
   * Creates an Admin-only Staff account
   */
  static async createStaff(input: CreateStaffInput): Promise<AuthenticatedUser> {
    const normalizedEmail = input.email.toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      throw ApiError.conflict("An account with this email address already exists.");
    }

    const passwordHash = await hashPassword(input.password);

    const staffUser = await prisma.user.create({
      data: {
        name: input.name.trim(),
        email: normalizedEmail,
        passwordHash,
        role: UserRole.STAFF,
      },
    });

    const { passwordHash: _, ...safeStaff } = staffUser;
    return { ...safeStaff, customer: null };
  }

  /**
   * Initiates forgot-password workflow
   */
  static async forgotPassword(input: ForgotPasswordInput): Promise<{ message: string }> {
    const normalizedEmail = input.email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (user) {
      const resetToken = crypto.randomBytes(32).toString("hex");
      const tokenHash = hashToken(resetToken);
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt,
        },
      });

      const resetUrl = `${process.env.APP_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`;

      // In local dev without SMTP configured, write reset URL to server log
      console.log(`[PASSWORD RESET] Link for ${user.email}: ${resetUrl}`);
    }

    return {
      message: "If an account with that email exists, password reset instructions have been generated.",
    };
  }

  /**
   * Completes password reset and invalidates all previous sessions
   */
  static async resetPassword(input: ResetPasswordInput): Promise<{ message: string }> {
    const tokenHash = hashToken(input.token);

    const resetTokenRecord = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!resetTokenRecord || resetTokenRecord.usedAt || resetTokenRecord.expiresAt < new Date()) {
      throw ApiError.badRequest("Password reset token is invalid, used, or expired.");
    }

    const newPasswordHash = await hashPassword(input.password);

    await prisma.$transaction(async (tx) => {
      // Update password
      await tx.user.update({
        where: { id: resetTokenRecord.userId },
        data: { passwordHash: newPasswordHash },
      });

      // Mark token as used
      await tx.passwordResetToken.update({
        where: { id: resetTokenRecord.id },
        data: { usedAt: new Date() },
      });

      // Invalidate all existing sessions
      await tx.session.deleteMany({
        where: { userId: resetTokenRecord.userId },
      });
    });

    return { message: "Password updated successfully. Please log in with your new password." };
  }
}
