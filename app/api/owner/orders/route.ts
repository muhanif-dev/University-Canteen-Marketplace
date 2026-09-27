import { apiSuccess, handleApiError } from "@/lib/api";
import { requireOwnedCanteen } from "@/lib/canteen-owner";
import { Order } from "@/models/order";

export const runtime = "nodejs";

export async function GET() {
  try {
    const { canteen } = await requireOwnedCanteen();
    const orders = await Order.find({ canteen: canteen._id })
      .select("-customer")
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    return apiSuccess(orders);
  } catch (error) {
    return handleApiError(error);
  }
}
