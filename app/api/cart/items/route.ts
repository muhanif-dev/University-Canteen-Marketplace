import { NextRequest } from "next/server";

import { apiSuccess, handleApiError } from "@/lib/api";
import { requireActiveCustomer } from "@/lib/auth";
import { getCartSummary, getSellableProduct, MAX_CART_LINES } from "@/lib/cart";
import { ConflictError } from "@/lib/errors";
import { Cart } from "@/models/cart";
import { addCartItemSchema } from "@/validations/orders";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const { user } = await requireActiveCustomer();
    const body: unknown = await request.json();
    const input = await addCartItemSchema.validate(body, {
      abortEarly: false,
      stripUnknown: true,
    });
    const { product, canteen } = await getSellableProduct(input.productId);
    if (input.quantity > product.stockQuantity) {
      throw new ConflictError("Requested quantity exceeds available stock.");
    }

    let cart = await Cart.findOne({ customer: user._id });
    if (cart && cart.items.length > 0 && cart.canteen.toString() !== canteen._id.toString()) {
      throw new ConflictError("A cart can contain products from one canteen at a time. Clear your cart before switching canteens.");
    }

    if (!cart) {
      cart = new Cart({ customer: user._id, canteen: canteen._id, items: [] });
    } else if (cart.items.length === 0) {
      cart.canteen = canteen._id;
    }

    const item = cart.items.find((entry) => entry.product.toString() === product._id.toString());
    const nextQuantity = (item?.quantity ?? 0) + input.quantity;
    if (nextQuantity > product.stockQuantity) {
      throw new ConflictError("Requested quantity exceeds available stock.");
    }
    if (item) item.quantity = nextQuantity;
    else {
      if (cart.items.length >= MAX_CART_LINES) {
        throw new ConflictError(`A cart can contain at most ${MAX_CART_LINES} products.`);
      }
      cart.items.push({ product: product._id, quantity: input.quantity });
    }
    await cart.save();

    return apiSuccess(await getCartSummary(user._id), 200, "Added to cart.");
  } catch (error) {
    return handleApiError(error);
  }
}
