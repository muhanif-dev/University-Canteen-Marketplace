import { NextRequest } from "next/server";
import mongoose from "mongoose";

import { apiSuccess, handleApiError } from "@/lib/api";
import { requireOwnedCanteen } from "@/lib/canteen-owner";
import { updateOwnerOrderStatus } from "@/lib/orders";
import { NotFoundError } from "@/lib/errors";
import { Order } from "@/models/order";
import { orderStatusSchema } from "@/validations/orders";

export const runtime = "nodejs";
type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { canteen } = await requireOwnedCanteen();
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) throw new NotFoundError("Order not found");
    const order = await Order.findOne({ _id: id, canteen: canteen._id })
      .select("-customer")
      .lean();
    if (!order) throw new NotFoundError("Order not found");
    return apiSuccess(order);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const { canteen } = await requireOwnedCanteen();
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) throw new NotFoundError("Order not found");
    const body: unknown = await request.json();
    const { status } = await orderStatusSchema.validate(body, {
      abortEarly: false,
      stripUnknown: true,
    });
    const order = await updateOwnerOrderStatus(id, canteen._id, status);
    return apiSuccess(order.toJSON(), 200, "Order status updated.");
  } catch (error) {
    return handleApiError(error);
  }
}
