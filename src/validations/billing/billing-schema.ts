import { z } from 'zod';

export const billingPreviewQuerySchema = z.object({
  asOfDate: z.string().datetime().optional(),
  subscriptionId: z.string().optional(),
  limit: z.coerce.number().int().positive().optional().default(100),
});

export const billingRunBodySchema = z.object({
  asOfDate: z.string().datetime().optional(),
  subscriptionId: z.string().optional(),
  dryRun: z.boolean().optional().default(false),
  limit: z.coerce.number().int().positive().optional().default(100),
});

export type BillingPreviewQuery = z.infer<typeof billingPreviewQuerySchema>;
export type BillingRunBody = z.infer<typeof billingRunBodySchema>;
