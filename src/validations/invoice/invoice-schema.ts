import { z } from 'zod';

export const invoiceListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  search: z.string().optional(),
  status: z.enum(['DRAFT', 'CONFIRMED', 'PAID', 'CANCELLED']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  overdue: z
    .enum(['true', 'false'])
    .optional()
    .transform((val) => val === 'true'),
  customerId: z.string().optional(),
});

export const cancelInvoiceSchema = z.object({
  reason: z.string().max(255).optional(),
});

export const sendInvoiceSchema = z.object({
  email: z.string().email().optional(),
});

export type InvoiceListQuery = z.infer<typeof invoiceListQuerySchema>;
export type CancelInvoiceInput = z.infer<typeof cancelInvoiceSchema>;
export type SendInvoiceInput = z.infer<typeof sendInvoiceSchema>;
