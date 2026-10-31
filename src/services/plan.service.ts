import { prisma } from "@/lib/db/prisma";
import { AuthenticatedUser } from "@/lib/auth/session";
import { ApiError } from "@/lib/errors/api-error";
import { CreatePlanInput, UpdatePlanInput, PlanQueryInput } from "@/validations/plan/plan.schema";
import { Prisma, UserRole } from "@prisma/client";

export class PlanService {
  static async listPlans(query: PlanQueryInput, user?: AuthenticatedUser) {
    const { search, billingInterval, activeOnly, page, pageSize } = query;
    const skip = (page - 1) * pageSize;

    const where: Prisma.PlanWhereInput = {};

    // By default, if customer or public or activeOnly, show only active plans
    if (!user || user.role === UserRole.CUSTOMER || activeOnly) {
      where.active = true;
    }

    if (billingInterval) {
      where.billingInterval = billingInterval;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { code: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const [total, plans] = await Promise.all([
      prisma.plan.count({ where }),
      prisma.plan.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { basePrice: "asc" },
        include: {
          taxRule: true,
          _count: {
            select: {
              subscriptions: true,
            },
          },
        },
      }),
    ]);

    return {
      plans,
      total,
      page,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  static async getPlanById(id: string) {
    const plan = await prisma.plan.findUnique({
      where: { id },
      include: {
        taxRule: true,
        _count: {
          select: {
            subscriptions: true,
          },
        },
      },
    });

    if (!plan) {
      throw ApiError.notFound("Subscription plan not found.");
    }

    return plan;
  }

  static async createPlan(input: CreatePlanInput, user: AuthenticatedUser) {
    if (user.role !== UserRole.ADMIN) {
      throw ApiError.forbidden("Only administrators can create subscription plans.");
    }

    const existingCode = await prisma.plan.findUnique({
      where: { code: input.code },
    });

    if (existingCode) {
      throw ApiError.conflict(`Plan with code '${input.code}' already exists.`);
    }

    if (input.taxRuleId) {
      const taxExists = await prisma.taxRule.findUnique({
        where: { id: input.taxRuleId },
      });
      if (!taxExists) {
        throw ApiError.badRequest("Specified TaxRule does not exist.");
      }
    }

    return prisma.plan.create({
      data: input,
      include: {
        taxRule: true,
      },
    });
  }

  static async updatePlan(
    id: string,
    input: UpdatePlanInput,
    user: AuthenticatedUser
  ) {
    if (user.role !== UserRole.ADMIN) {
      throw ApiError.forbidden("Only administrators can update subscription plans.");
    }

    const existing = await prisma.plan.findUnique({ where: { id } });
    if (!existing) {
      throw ApiError.notFound("Plan not found.");
    }

    if (input.code && input.code !== existing.code) {
      const existingCode = await prisma.plan.findUnique({
        where: { code: input.code },
      });
      if (existingCode) {
        throw ApiError.conflict(`Plan with code '${input.code}' already exists.`);
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

    return prisma.plan.update({
      where: { id },
      data: input,
      include: {
        taxRule: true,
      },
    });
  }

  /**
   * Helper snapshot utility for Levin/Joshil/Joe when creating a Subscription
   */
  static async getPlanSnapshot(planId: string) {
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
      include: { taxRule: true },
    });

    if (!plan) {
      throw ApiError.notFound("Plan not found for snapshotting.");
    }

    return {
      planSnapshotName: plan.name,
      planSnapshotCode: plan.code,
      planSnapshotBillingInterval: plan.billingInterval,
      planSnapshotBasePrice: plan.basePrice,
      taxRateSnapshot: plan.taxRule?.active ? plan.taxRule.rate : 0,
    };
  }
}
