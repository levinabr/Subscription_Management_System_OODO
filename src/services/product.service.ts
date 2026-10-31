import { prisma } from "@/lib/db/prisma";
import { AuthenticatedUser } from "@/lib/auth/session";
import { ApiError } from "@/lib/errors/api-error";
import {
  CreateProductInput,
  UpdateProductInput,
  CreateProductVariantInput,
  UpdateProductVariantInput,
  ProductQueryInput,
} from "@/validations/product/product.schema";
import { Prisma, UserRole } from "@prisma/client";

export class ProductService {
  static sanitizeForCustomer<T extends Record<string, unknown>>(product: T, userRole: UserRole): Omit<T, "costPrice"> | T {
    if (userRole === UserRole.CUSTOMER) {
      const { costPrice: _, ...safe } = product;
      return safe as Omit<T, "costPrice">;
    }
    return product;
  }

  static async listProducts(query: ProductQueryInput, user: AuthenticatedUser) {
    const { search, productType, activeOnly, page, pageSize } = query;
    const skip = (page - 1) * pageSize;

    const where: Prisma.ProductWhereInput = {};

    // Customers can only see active products
    if (user.role === UserRole.CUSTOMER || activeOnly) {
      where.active = true;
    }

    if (productType) {
      where.productType = productType;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
        { notes: { contains: search, mode: "insensitive" } },
      ];
    }

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { name: "asc" },
        include: {
          taxRule: true,
          variants: {
            where: user.role === UserRole.CUSTOMER ? { active: true } : {},
            orderBy: { optionName: "asc" },
          },
        },
      }),
    ]);

    const sanitizedProducts = products.map((p) =>
      this.sanitizeForCustomer(p, user.role)
    );

    return {
      products: sanitizedProducts,
      total,
      page,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  static async getProductById(id: string, user: AuthenticatedUser) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        taxRule: true,
        variants: {
          where: user.role === UserRole.CUSTOMER ? { active: true } : {},
          orderBy: { optionName: "asc" },
        },
      },
    });

    if (!product) {
      throw ApiError.notFound("Product not found.");
    }

    if (user.role === UserRole.CUSTOMER && !product.active) {
      throw ApiError.notFound("Product not found or inactive.");
    }

    return this.sanitizeForCustomer(product, user.role);
  }

  static async createProduct(input: CreateProductInput, user: AuthenticatedUser) {
    if (user.role !== UserRole.ADMIN) {
      throw ApiError.forbidden("Only administrators can create products in the catalog.");
    }

    const existingSku = await prisma.product.findUnique({
      where: { sku: input.sku },
    });

    if (existingSku) {
      throw ApiError.conflict(`Product with SKU '${input.sku}' already exists.`);
    }

    if (input.taxRuleId) {
      const taxExists = await prisma.taxRule.findUnique({
        where: { id: input.taxRuleId },
      });
      if (!taxExists) {
        throw ApiError.badRequest("Specified TaxRule does not exist.");
      }
    }

    return prisma.product.create({
      data: input,
      include: {
        taxRule: true,
        variants: true,
      },
    });
  }

  static async updateProduct(
    id: string,
    input: UpdateProductInput,
    user: AuthenticatedUser
  ) {
    if (user.role !== UserRole.ADMIN) {
      throw ApiError.forbidden("Only administrators can modify products in the catalog.");
    }

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      throw ApiError.notFound("Product not found.");
    }

    if (input.sku && input.sku !== existing.sku) {
      const existingSku = await prisma.product.findUnique({
        where: { sku: input.sku },
      });
      if (existingSku) {
        throw ApiError.conflict(`Product with SKU '${input.sku}' already exists.`);
      }
    }

    if (input.taxRuleId) {
      const taxExists = await prisma.taxRule.findUnique({
        where: { id: input.taxRuleId },
      });
      if (!taxExists) {
        throw ApiError.badRequest("Specified TaxRule does not exist.");
      }
    }

    return prisma.product.update({
      where: { id },
      data: input,
      include: {
        taxRule: true,
        variants: true,
      },
    });
  }

  static async addVariant(
    productId: string,
    input: CreateProductVariantInput,
    user: AuthenticatedUser
  ) {
    if (user.role !== UserRole.ADMIN) {
      throw ApiError.forbidden("Only administrators can manage product variants.");
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      throw ApiError.notFound("Product not found.");
    }

    return prisma.productVariant.create({
      data: {
        ...input,
        productId,
      },
    });
  }

  static async updateVariant(
    variantId: string,
    input: UpdateProductVariantInput,
    user: AuthenticatedUser
  ) {
    if (user.role !== UserRole.ADMIN) {
      throw ApiError.forbidden("Only administrators can manage product variants.");
    }

    const existing = await prisma.productVariant.findUnique({
      where: { id: variantId },
    });
    if (!existing) {
      throw ApiError.notFound("Product variant not found.");
    }

    return prisma.productVariant.update({
      where: { id: variantId },
      data: input,
    });
  }

  /**
   * Helper utility to validate that a variant belongs to a product
   */
  static async validateVariantBelongsToProduct(
    productId: string,
    variantId: string
  ): Promise<boolean> {
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
    });
    return variant?.productId === productId;
  }
}
