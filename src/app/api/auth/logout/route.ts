import { apiSuccess, handleApiError } from "@/lib/utils/api-response";
import { AuthService } from "@/services/auth.service";

export async function POST() {
  try {
    await AuthService.logout();
    return apiSuccess({ loggedOut: true }, "Logged out successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
