import { apiSuccess, handleApiError } from "@/lib/api";
import { clearSession } from "@/lib/auth";

export async function POST() {
  try {
    await clearSession();
    return apiSuccess({ loggedOut: true }, 200, "Signed out successfully.");
  } catch (error) {
    return handleApiError(error);
  }
}
