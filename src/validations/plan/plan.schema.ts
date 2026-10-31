import { z } from "zod";
import { BillingInterval } from "@prisma/client";

export const createPlanSchema = z.object({
  code: z
    .string()
    .trim()
    .min(2, "Plan code must be at least 2 characters")
    .toUpperCase(),
  name: z.string().trim().min(2, "Plan name must be at least 2 characters"),
  description: z.string().trim().optional().nullable(),
  basePrice: z
    .number()
    .int("Base price must be an integer in paise")
    .min(0, "Base price cannot be negative"),
  billingInterval: z.nativeEnum(BillingInterval).default(BillingInterval.MONTHLY),
  minimumQuantity: z.number().int().min(1, "Minimum quantity must be at least 1").default(1),
  availabilityStartDate: z.coerce.date().optional().nullable(),
  availabilityEndDate: z.coerce.date().optional().nullable(),
  autoCloseAtEnd: z.boolean().default(false),
  canCloseEarly: z.boolean().default(true),
  canPause: z.boolean().default(true),
  canRenew: z.boolean().default(true),
  taxRuleId: z.string().cuid().optional().nullable(),
  active: z.boolean().default(true),
});

export const updatePlanSchema = createPlanSchema.partial();

export const planQuerySchema = z.object({
  search: z.string().optional(),
  billingInterval: z.nativeEnum(BillingInterval).optional(),
  activeOnly: z
    .string()
    .optional()
    .transform((val) => val === "true"),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(10),
});

export type CreatePlanInput = z.infer<typeof createPlanSchema>;
export type UpdatePlanInput = z.infer<typeof updatePlanSchema>;
export type PlanQueryInput = z.infer<typeof planQuerySchema>;
