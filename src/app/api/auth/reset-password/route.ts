import { NextRequest } from "next/server";
import { AuthService } from "@/services/auth.service";
import { resetPasswordSchema } from "@/validations/auth/auth.schema";
import { apiSuccess, handleApiError } from "@/lib/utils/api-response";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = resetPasswordSchema.parse(body);
    const result = await AuthService.resetPassword(validated);

    return apiSuccess(result, result.message);
  } catch (error) {
    return handleApiError(error);
  }
}
