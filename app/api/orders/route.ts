import { apiSuccess, handleApiError } from "@/lib/api";
import { requireActiveCustomer } from "@/lib/auth";
import { createOrderFromCart } from "@/lib/orders";
import { Order } from "@/models/order";

export const runtime = "nodejs";

export async function GET() {
  try {
    const { user } = await requireActiveCustomer();
    const orders = await Order.find({ customer: user._id })
      .select("-customer")
      .sort({ createdAt: -1 })
      .lean();
    return apiSuccess(orders);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST() {
  try {
    const { user, customerType } = await requireActiveCustomer();
    const order = await createOrderFromCart(user._id, customerType);
    return apiSuccess(order.toJSON(), 201, "Order placed successfully with Cash on Pickup.");
  } catch (error) {
    return handleApiError(error);
  }
}
