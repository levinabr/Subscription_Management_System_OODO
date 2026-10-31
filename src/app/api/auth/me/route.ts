import { requireAuthenticatedUser } from "@/lib/auth/rbac";
import { apiSuccess, handleApiError } from "@/lib/utils/api-response";

export async function GET() {
  try {
    const user = await requireAuthenticatedUser();
    return apiSuccess(user, "Current session user profile");
  } catch (error) {
    return handleApiError(error);
  }
}
