import { NextRequest } from "next/server";
import mongoose from "mongoose";

import { apiSuccess, handleApiError } from "@/lib/api";
import { requireActiveCustomer } from "@/lib/auth";
import { cancelCustomerOrder } from "@/lib/orders";
import { NotFoundError } from "@/lib/errors";
import { Order } from "@/models/order";
import { cancelOrderSchema } from "@/validations/orders";

export const runtime = "nodejs";
type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { user } = await requireActiveCustomer();
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) throw new NotFoundError("Order not found");
    const order = await Order.findOne({ _id: id, customer: user._id })
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
    const { user } = await requireActiveCustomer();
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) throw new NotFoundError("Order not found");
    const body: unknown = await request.json();
    await cancelOrderSchema.validate(body, {
      abortEarly: false,
      stripUnknown: true,
    });
    const order = await cancelCustomerOrder(id, user._id);
    return apiSuccess(order.toJSON(), 200, "Order cancelled.");
  } catch (error) {
    return handleApiError(error);
  }
}
