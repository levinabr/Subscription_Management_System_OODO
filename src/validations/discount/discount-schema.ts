import { z } from 'zod';

export const createDiscountSchema = z
  .object({
    name: z.string().min(1, 'Discount name is required').max(100),
    type: z.enum(['FIXED', 'PERCENTAGE'], {
      errorMap: () => ({ message: 'Discount type must be FIXED or PERCENTAGE' }),
    }),
    scope: z.enum(['PRODUCT', 'SUBSCRIPTION'], {
      errorMap: () => ({ message: 'Discount scope must be PRODUCT or SUBSCRIPTION' }),
    }),
    value: z
      .number({ invalid_type_error: 'Value must be a number' })
      .int('Value must be an integer')
      .positive('Value must be positive'),
    minPurchasePaise: z
      .number({ invalid_type_error: 'Minimum purchase must be a number' })
      .int()
      .nonnegative('Minimum purchase cannot be negative')
      .default(0),
    minQuantity: z
      .number({ invalid_type_error: 'Minimum quantity must be a number' })
      .int()
      .nonnegative('Minimum quantity cannot be negative')
      .default(0),
    startsAt: z.string().datetime({ message: 'startsAt must be a valid ISO datetime' }),
    endsAt: z.string().datetime({ message: 'endsAt must be a valid ISO datetime' }),
    usageLimit: z
      .number()
      .int()
      .positive('Usage limit must be a positive integer')
      .nullable()
      .optional(),
    isActive: z.boolean().default(true),
    productIds: z.array(z.string()).optional().default([]),
  })
  .superRefine((data, ctx) => {
    // 1. Percentage check: <= 10000 basis points (100%)
    if (data.type === 'PERCENTAGE' && data.value > 10000) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['value'],
        message: 'Percentage discount cannot exceed 100% (10000 basis points)',
      });
    }

    // 2. Date check: startsAt <= endsAt
    const start = new Date(data.startsAt);
    const end = new Date(data.endsAt);
    if (start > end) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['endsAt'],
        message: 'End date (endsAt) must not be before start date (startsAt)',
      });
    }

    // 3. Product scope check: must have at least one eligible product
    if (data.scope === 'PRODUCT' && (!data.productIds || data.productIds.length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['productIds'],
        message: 'Product-specific discounts require at least one eligible product',
      });
    }
  });

export const updateDiscountSchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
    type: z.enum(['FIXED', 'PERCENTAGE']).optional(),
    scope: z.enum(['PRODUCT', 'SUBSCRIPTION']).optional(),
    value: z.number().int().positive().optional(),
    minPurchasePaise: z.number().int().nonnegative().optional(),
    minQuantity: z.number().int().nonnegative().optional(),
    startsAt: z.string().datetime().optional(),
    endsAt: z.string().datetime().optional(),
    usageLimit: z.number().int().positive().nullable().optional(),
    isActive: z.boolean().optional(),
    productIds: z.array(z.string()).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === 'PERCENTAGE' && data.value !== undefined && data.value > 10000) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['value'],
        message: 'Percentage discount cannot exceed 100% (10000 basis points)',
      });
    }

    if (data.startsAt && data.endsAt) {
      const start = new Date(data.startsAt);
      const end = new Date(data.endsAt);
      if (start > end) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['endsAt'],
          message: 'End date (endsAt) must not be before start date (startsAt)',
        });
      }
    }

    if (data.scope === 'PRODUCT' && data.productIds !== undefined && data.productIds.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['productIds'],
        message: 'Product-specific discounts require at least one eligible product',
      });
    }
  });

export type CreateDiscountInput = z.infer<typeof createDiscountSchema>;
export type UpdateDiscountInput = z.infer<typeof updateDiscountSchema>;
