import { z } from 'zod';

export const createSubscriptionFromTemplateSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  templateId: z.string().min(1, 'Template is required'),
  startDate: z.string().datetime({ message: 'startDate must be a valid ISO datetime string' }),
  paymentTermsDays: z.number().int().min(0).default(15),
});

export type CreateSubscriptionFromTemplateInput = z.infer<typeof createSubscriptionFromTemplateSchema>;
