import { z } from "zod";

export const createCustomerSchema = z.object({
  companyName: z.string().trim().min(2, "Company name must be at least 2 characters"),
  contactName: z.string().trim().min(2, "Contact name must be at least 2 characters"),
  email: z.string().trim().toLowerCase().email("Invalid email address"),
  phone: z.string().trim().optional().nullable(),
  address: z.string().trim().optional().nullable(),
  city: z.string().trim().optional().nullable(),
  state: z.string().trim().optional().nullable(),
  postalCode: z.string().trim().optional().nullable(),
  country: z.string().trim().default("IN"),
  taxIdentifier: z.string().trim().optional().nullable(),
});

export const updateCustomerSchema = createCustomerSchema.partial().extend({
  active: z.boolean().optional(),
});

export const customerQuerySchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(10),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type CustomerQueryInput = z.infer<typeof customerQuerySchema>;
