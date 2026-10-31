import { NextRequest } from "next/server";
import { requireRole } from "@/lib/auth/rbac";
import { TaxService } from "@/services/tax.service";
import { updateTaxRuleSchema } from "@/validations/tax/tax.schema";
import { apiSuccess, handleApiError } from "@/lib/utils/api-response";
import { UserRole } from "@prisma/client";

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteProps) {
  try {
    const { id } = await params;
    const taxRule = await TaxService.getTaxRuleById(id);
    return apiSuccess(taxRule, "Tax rule retrieved successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: RouteProps) {
  try {
    const user = await requireRole([UserRole.ADMIN]);
    const { id } = await params;

    const body = await req.json();
    const validated = updateTaxRuleSchema.parse(body);
    const updated = await TaxService.updateTaxRule(id, validated, user);

    return apiSuccess(updated, "Tax rule updated successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
