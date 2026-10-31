import { z } from "zod";

export const passwordValidation = z
  .string()
  .min(9, { message: "Password must be longer than 8 characters" })
  .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
  .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
  .regex(/[^a-zA-Z0-9]/, { message: "Password must contain at least one special character" });

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  companyName: z.string().trim().min(2, "Company name must be at least 2 characters"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Invalid email address"),
  password: passwordValidation,
  phone: z.string().trim().optional(),
  taxIdentifier: z.string().trim().optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: passwordValidation,
});

export const createStaffSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().toLowerCase().email("Invalid email address"),
  password: passwordValidation,
  role: z.literal("STAFF", {
    message: "Only STAFF role can be created via this endpoint",
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type CreateStaffInput = z.infer<typeof createStaffSchema>;
