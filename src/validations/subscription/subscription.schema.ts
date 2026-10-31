import { z } from 'zod';

export const subscriptionQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
  status: z.string().optional(),
  customerId: z.string().optional(),
  search: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

export type SubscriptionQueryInput = z.infer<typeof subscriptionQuerySchema>;

export const transitionSchema = z.object({
  toStatus: z.enum(['QUOTATION', 'CONFIRMED', 'ACTIVE', 'PAUSED', 'CLOSED', 'EXPIRED']),
  reason: z.string().optional(),
});

export type TransitionInput = z.infer<typeof transitionSchema>;

export const renewSchema = z.object({
  startDate: z.string().datetime({ message: 'startDate must be a valid ISO datetime string' }),
  paymentTermsDays: z.number().int().min(0).optional(),
});

export type RenewInput = z.infer<typeof renewSchema>;
