import { NextRequest } from "next/server";
import { AuthService } from "@/services/auth.service";
import { registerSchema } from "@/validations/auth/auth.schema";
import { apiSuccess, handleApiError } from "@/lib/utils/api-response";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = registerSchema.parse(body);
    const user = await AuthService.register(validated);

    return apiSuccess(user, "Registration successful", 201);
  } catch (error) {
    return handleApiError(error);
  }
}
