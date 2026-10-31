import { NextRequest } from "next/server";
import { AuthService } from "@/services/auth.service";
import { loginSchema } from "@/validations/auth/auth.schema";
import { apiSuccess, handleApiError } from "@/lib/utils/api-response";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = loginSchema.parse(body);
    const user = await AuthService.login(validated);

    return apiSuccess(user, "Login successful");
  } catch (error) {
    return handleApiError(error);
  }
}
