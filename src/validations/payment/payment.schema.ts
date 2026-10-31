import { z } from 'zod';
import { PaymentMethod, InvoiceStatus } from '@prisma/client';

export const PaymentMethodEnum = z.enum([
  'BANK_TRANSFER',
  'CASH',
  'CARD',
  'UPI',
  'OTHER',
]);

export const CreatePaymentSchema = z.object({
  amountPaise: z
    .number()
    .int('Amount in paise must be an integer')
    .positive('Payment amount must be greater than zero'),
  method: PaymentMethodEnum,
  paidAt: z.coerce.date(),
  reference: z
    .string()
    .trim()
    .max(100, 'Reference cannot exceed 100 characters')
    .optional()
    .transform((val) => (val && val.length > 0 ? val : undefined))
    .optional(),
  note: z
    .string()
    .trim()
    .max(500, 'Note cannot exceed 500 characters')
    .optional()
    .transform((val) => (val && val.length > 0 ? val : undefined))
    .optional(),
});

export type CreatePaymentInput = z.infer<typeof CreatePaymentSchema>;

export const PaymentFilterSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  invoiceId: z.string().optional(),
  customerId: z.string().optional(),
  method: PaymentMethodEnum.optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  search: z.string().optional(),
});

export type PaymentFilterInput = z.infer<typeof PaymentFilterSchema>;

export const InvoiceFilterSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z
    .enum(['ALL', 'DRAFT', 'CONFIRMED', 'PAID', 'CANCELLED'])
    .optional()
    .default('ALL'),
  customerId: z.string().optional(),
  isOverdue: z
    .union([z.boolean(), z.string().transform((v) => v === 'true' || v === '1')])
    .optional(),
  search: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export type InvoiceFilterInput = z.infer<typeof InvoiceFilterSchema>;

export const DashboardFilterSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  period: z
    .enum(['today', '7d', '30d', 'month', 'quarter', 'year', 'all'])
    .optional()
    .default('month'),
});

export type DashboardFilterInput = z.infer<typeof DashboardFilterSchema>;
