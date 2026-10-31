import { NextRequest } from "next/server";
import { requireRole } from "@/lib/auth/rbac";
import { AuthService } from "@/services/auth.service";
import { createStaffSchema } from "@/validations/auth/auth.schema";
import { apiSuccess, handleApiError } from "@/lib/utils/api-response";
import { UserRole } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    // Only ADMIN role may create staff accounts
    await requireRole([UserRole.ADMIN]);

    const body = await req.json();
    const validated = createStaffSchema.parse(body);
    const staff = await AuthService.createStaff(validated);

    return apiSuccess(staff, "Staff account created successfully", 201);
  } catch (error) {
    return handleApiError(error);
  }
}
