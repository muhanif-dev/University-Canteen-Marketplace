import { apiSuccess, handleApiError } from "@/lib/api";
import { requireActiveCustomer } from "@/lib/auth";
import { Cart } from "@/models/cart";
import { getCartSummary } from "@/lib/cart";

export const runtime = "nodejs";

export async function GET() {
  try {
    const { user } = await requireActiveCustomer();
    return apiSuccess(await getCartSummary(user._id));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE() {
  try {
    const { user } = await requireActiveCustomer();
    await Cart.deleteOne({ customer: user._id });
    return apiSuccess({ items: [], subtotal: 0, total: 0, currency: "PKR", isOrderable: false }, 200, "Cart cleared.");
  } catch (error) {
    return handleApiError(error);
  }
}
