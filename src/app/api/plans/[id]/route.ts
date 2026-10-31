import { NextRequest } from "next/server";
import { requireRole } from "@/lib/auth/rbac";
import { PlanService } from "@/services/plan.service";
import { updatePlanSchema } from "@/validations/plan/plan.schema";
import { apiSuccess, handleApiError } from "@/lib/utils/api-response";
import { UserRole } from "@prisma/client";

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteProps) {
  try {
    const { id } = await params;
    const plan = await PlanService.getPlanById(id);
    return apiSuccess(plan, "Plan retrieved successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: RouteProps) {
  try {
    const user = await requireRole([UserRole.ADMIN]);
    const { id } = await params;

    const body = await req.json();
    const validated = updatePlanSchema.parse(body);
    const updated = await PlanService.updatePlan(id, validated, user);

    return apiSuccess(updated, "Plan updated successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
