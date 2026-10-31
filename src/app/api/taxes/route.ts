import { NextRequest } from "next/server";
import { requireAuthenticatedUser, requireRole } from "@/lib/auth/rbac";
import { TaxService } from "@/services/tax.service";
import { createTaxRuleSchema, taxRuleQuerySchema } from "@/validations/tax/tax.schema";
import { apiSuccess, handleApiError } from "@/lib/utils/api-response";
import { UserRole } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    await requireAuthenticatedUser();

    const searchParams = req.nextUrl.searchParams;
    const query = taxRuleQuerySchema.parse({
      activeOnly: searchParams.get("activeOnly") || undefined,
    });

    const taxes = await TaxService.listTaxRules(query.activeOnly);
    return apiSuccess(taxes, "Tax rules retrieved successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole([UserRole.ADMIN]);

    const body = await req.json();
    const validated = createTaxRuleSchema.parse(body);
    const taxRule = await TaxService.createTaxRule(validated, user);

    return apiSuccess(taxRule, "Tax rule created successfully", 201);
  } catch (error) {
    return handleApiError(error);
  }
}
