import prisma from '@/lib/db/prisma';
import { CreateDiscountInput, UpdateDiscountInput } from '@/validations/discount/discount-schema';
import { Prisma } from '@prisma/client';

export class DiscountService {
  /**
   * Retrieves all discounts, optionally filtered by active status, scope, or type.
   */
  static async getDiscounts(filter?: {
    isActive?: boolean;
    scope?: string;
    type?: string;
  }) {
    const where: Prisma.DiscountRuleWhereInput = {};
    if (filter?.isActive !== undefined) {
      where.isActive = filter.isActive;
    }
    if (filter?.scope) {
      where.scope = filter.scope.toUpperCase();
    }
    if (filter?.type) {
      where.type = filter.type.toUpperCase();
    }

    return prisma.discountRule.findMany({
      where,
      include: {
        eligibleProducts: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Retrieves a single discount by ID.
   */
  static async getDiscountById(id: string) {
    return prisma.discountRule.findUnique({
      where: { id },
      include: {
        eligibleProducts: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  /**
   * Creates a new discount rule. Admin only.
   */
  static async createDiscount(input: CreateDiscountInput) {
    const startsAt = new Date(input.startsAt);
    const endsAt = new Date(input.endsAt);

    return prisma.discountRule.create({
      data: {
        name: input.name,
        type: input.type,
        scope: input.scope,
        value: input.value,
        minPurchasePaise: input.minPurchasePaise ?? 0,
        minQuantity: input.minQuantity ?? 0,
        startsAt,
        endsAt,
        usageLimit: input.usageLimit ?? null,
        usedCount: 0,
        isActive: input.isActive ?? true,
        eligibleProducts:
          input.scope === 'PRODUCT' && input.productIds && input.productIds.length > 0
            ? {
                create: input.productIds.map((productId) => ({
                  productId,
                })),
              }
            : undefined,
      },
      include: {
        eligibleProducts: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  /**
   * Updates an existing discount rule. Admin only.
   */
  static async updateDiscount(id: string, input: UpdateDiscountInput) {
    const data: Prisma.DiscountRuleUpdateInput = {};

    if (input.name !== undefined) data.name = input.name;
    if (input.type !== undefined) data.type = input.type;
    if (input.scope !== undefined) data.scope = input.scope;
    if (input.value !== undefined) data.value = input.value;
    if (input.minPurchasePaise !== undefined) data.minPurchasePaise = input.minPurchasePaise;
    if (input.minQuantity !== undefined) data.minQuantity = input.minQuantity;
    if (input.startsAt !== undefined) data.startsAt = new Date(input.startsAt);
    if (input.endsAt !== undefined) data.endsAt = new Date(input.endsAt);
    if (input.usageLimit !== undefined) data.usageLimit = input.usageLimit;
    if (input.isActive !== undefined) data.isActive = input.isActive;

    // Handle product links update if scope is PRODUCT and productIds provided
    if (input.productIds !== undefined) {
      // Delete existing and replace
      return prisma.$transaction(async (tx) => {
        await tx.productDiscountLink.deleteMany({
          where: { discountRuleId: id },
        });

        return tx.discountRule.update({
          where: { id },
          data: {
            ...data,
            eligibleProducts: {
              create: input.productIds?.map((productId) => ({
                productId,
              })),
            },
          },
          include: {
            eligibleProducts: {
              include: {
                product: true,
              },
            },
          },
        });
      });
    }

    return prisma.discountRule.update({
      where: { id },
      data,
      include: {
        eligibleProducts: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  /**
   * Fetches active discount rules that are valid for the given date.
   */
  static async getActiveCandidateRules(asOfDate: Date) {
    return prisma.discountRule.findMany({
      where: {
        isActive: true,
        startsAt: { lte: asOfDate },
        endsAt: { gte: asOfDate },
      },
      include: {
        eligibleProducts: true,
      },
    });
  }

  /**
   * Atomically increments discount usage if usage limit is not exceeded.
   * Runs inside the given Prisma transaction.
   * Returns true if increment was successful, false if limit reached or rule inactive.
   */
  static async tryIncrementUsageTransactional(
    tx: Prisma.TransactionClient,
    ruleId: string
  ): Promise<boolean> {
    const rowsUpdated = await tx.$executeRaw`
      UPDATE "DiscountRule"
      SET "usedCount" = "usedCount" + 1
      WHERE "id" = ${ruleId}
        AND "isActive" = 1
        AND ("usageLimit" IS NULL OR "usedCount" < "usageLimit")
    `;

    return rowsUpdated > 0;
  }
}
