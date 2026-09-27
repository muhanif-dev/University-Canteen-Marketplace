import { NextRequest } from "next/server";
import mongoose from "mongoose";

import { apiSuccess, handleApiError } from "@/lib/api";
import { requireActiveCustomer } from "@/lib/auth";
import { getCartSummary, getSellableProduct } from "@/lib/cart";
import { ConflictError, NotFoundError } from "@/lib/errors";
import { Cart } from "@/models/cart";
import { cartQuantitySchema } from "@/validations/orders";

export const runtime = "nodejs";
type RouteContext = { params: Promise<{ productId: string }> };

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const { user } = await requireActiveCustomer();
    const { productId } = await params;
    if (!mongoose.isValidObjectId(productId)) throw new NotFoundError("Cart item not found");
    const body: unknown = await request.json();
    const { quantity } = await cartQuantitySchema.validate(body, {
      abortEarly: false,
      stripUnknown: true,
    });
    const { product, canteen } = await getSellableProduct(productId);
    if (quantity > product.stockQuantity) {
      throw new ConflictError("Requested quantity exceeds available stock.");
    }
    const cart = await Cart.findOne({ customer: user._id });
    if (!cart || cart.canteen.toString() !== canteen._id.toString()) {
      throw new NotFoundError("Cart item not found");
    }
    const item = cart.items.find((entry) => entry.product.toString() === productId);
    if (!item) throw new NotFoundError("Cart item not found");
    item.quantity = quantity;
    await cart.save();
    return apiSuccess(await getCartSummary(user._id), 200, "Cart quantity updated.");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    const { user } = await requireActiveCustomer();
    const { productId } = await params;
    if (!mongoose.isValidObjectId(productId)) throw new NotFoundError("Cart item not found");
    const cart = await Cart.findOne({ customer: user._id });
    if (!cart) throw new NotFoundError("Cart item not found");
    const itemIndex = cart.items.findIndex((entry) => entry.product.toString() === productId);
    if (itemIndex < 0) throw new NotFoundError("Cart item not found");
    cart.items.splice(itemIndex, 1);
    if (cart.items.length === 0) await Cart.deleteOne({ _id: cart._id, customer: user._id });
    else await cart.save();
    return apiSuccess(await getCartSummary(user._id), 200, "Item removed from cart.");
  } catch (error) {
    return handleApiError(error);
  }
}
