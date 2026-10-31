import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { requireRole } from "@/lib/auth/rbac";
import { PlanService } from "@/services/plan.service";
import { createPlanSchema, planQuerySchema } from "@/validations/plan/plan.schema";
import { apiSuccess, handleApiError } from "@/lib/utils/api-response";
import { UserRole } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    const searchParams = req.nextUrl.searchParams;
    const query = planQuerySchema.parse({
      search: searchParams.get("search") || undefined,
      billingInterval: searchParams.get("billingInterval") || undefined,
      activeOnly: searchParams.get("activeOnly") || undefined,
      page: searchParams.get("page") || 1,
      pageSize: searchParams.get("pageSize") || 10,
    });

    const result = await PlanService.listPlans(query, user ?? undefined);
    return apiSuccess(result.plans, "Plans retrieved", 200, {
      page: result.page,
      pageSize: query.pageSize,
      total: result.total,
      totalPages: result.totalPages,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole([UserRole.ADMIN]);

    const body = await req.json();
    const validated = createPlanSchema.parse(body);
    const plan = await PlanService.createPlan(validated, user);

    return apiSuccess(plan, "Plan created successfully", 201);
  } catch (error) {
    return handleApiError(error);
  }
}
