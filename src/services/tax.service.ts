import { prisma } from "@/lib/db/prisma";
import { AuthenticatedUser } from "@/lib/auth/session";
import { ApiError } from "@/lib/errors/api-error";
import { CreateTaxRuleInput, UpdateTaxRuleInput } from "@/validations/tax/tax.schema";
import { UserRole } from "@prisma/client";

export class TaxService {
  static async listTaxRules(activeOnly = false) {
    return prisma.taxRule.findMany({
      where: activeOnly ? { active: true } : {},
      orderBy: { rate: "asc" },
      include: {
        _count: {
          select: {
            products: true,
            plans: true,
          },
        },
      },
    });
  }

  static async getTaxRuleById(id: string) {
    const taxRule = await prisma.taxRule.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: true,
            plans: true,
          },
        },
      },
    });

    if (!taxRule) {
      throw ApiError.notFound("Tax rule not found.");
    }

    return taxRule;
  }

  static async createTaxRule(input: CreateTaxRuleInput, user: AuthenticatedUser) {
    if (user.role !== UserRole.ADMIN) {
      throw ApiError.forbidden("Only administrators can create tax rules.");
    }

    return prisma.taxRule.create({
      data: input,
    });
  }

  static async updateTaxRule(
    id: string,
    input: UpdateTaxRuleInput,
    user: AuthenticatedUser
  ) {
    if (user.role !== UserRole.ADMIN) {
      throw ApiError.forbidden("Only administrators can update tax rules.");
    }

    const existing = await prisma.taxRule.findUnique({ where: { id } });
    if (!existing) {
      throw ApiError.notFound("Tax rule not found.");
    }

    return prisma.taxRule.update({
      where: { id },
      data: input,
    });
  }
}
