import { z } from "zod";

export const createTaxRuleSchema = z.object({
  name: z.string().trim().min(2, "Tax rule name must be at least 2 characters"),
  rate: z
    .number()
    .int("Tax rate must be an integer in basis points (e.g. 1800 for 18%)")
    .min(0, "Tax rate cannot be negative")
    .max(10000, "Tax rate cannot exceed 100% (10000 basis points)"),
  startDate: z.coerce.date().optional().nullable(),
  endDate: z.coerce.date().optional().nullable(),
  active: z.boolean().default(true),
});

export const updateTaxRuleSchema = createTaxRuleSchema.partial();

export const taxRuleQuerySchema = z.object({
  activeOnly: z
    .string()
    .optional()
    .transform((val) => val === "true"),
});

export type CreateTaxRuleInput = z.infer<typeof createTaxRuleSchema>;
export type UpdateTaxRuleInput = z.infer<typeof updateTaxRuleSchema>;
