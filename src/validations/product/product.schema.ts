import { z } from "zod";
import { ProductType } from "@prisma/client";

export const createProductSchema = z.object({
  sku: z
    .string()
    .trim()
    .min(2, "SKU must be at least 2 characters")
    .toUpperCase(),
  name: z.string().trim().min(2, "Product name must be at least 2 characters"),
  productType: z.nativeEnum(ProductType).default(ProductType.SOFTWARE),
  notes: z.string().trim().optional().nullable(),
  salesPrice: z
    .number()
    .int("Sales price must be an integer in paise")
    .min(0, "Sales price cannot be negative"),
  costPrice: z
    .number()
    .int("Cost price must be an integer in paise")
    .min(0, "Cost price cannot be negative"),
  taxRuleId: z.string().cuid().optional().nullable(),
  active: z.boolean().default(true),
});

export const updateProductSchema = createProductSchema.partial();

export const createProductVariantSchema = z.object({
  optionName: z.string().trim().min(1, "Option name is required (e.g. 'Storage', 'Tier')"),
  value: z.string().trim().min(1, "Value is required (e.g. '100GB', 'Enterprise')"),
  priceAdjustment: z
    .number()
    .int("Price adjustment must be an integer in paise")
    .default(0),
  active: z.boolean().default(true),
});

export const updateProductVariantSchema = createProductVariantSchema.partial();

export const productQuerySchema = z.object({
  search: z.string().optional(),
  productType: z.nativeEnum(ProductType).optional(),
  activeOnly: z
    .string()
    .optional()
    .transform((val) => val === "true"),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(10),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type CreateProductVariantInput = z.infer<typeof createProductVariantSchema>;
export type UpdateProductVariantInput = z.infer<typeof updateProductVariantSchema>;
export type ProductQueryInput = z.infer<typeof productQuerySchema>;
