import mongoose, { type ClientSession } from "mongoose";

import { connectDB } from "@/lib/db";
import { AppError, ConflictError, NotFoundError } from "@/lib/errors";
import { Cart } from "@/models/cart";
import { Canteen } from "@/models/canteen";
import { Category } from "@/models/category";
import { Order } from "@/models/order";
import { Product } from "@/models/product";
import { ORDER_STATUS, type CustomerType, type OrderStatus } from "@/types";
import { effectiveUnitPriceCents, fromCents, toCents } from "@/lib/money";

const OWNER_TRANSITIONS: Partial<Record<OrderStatus, OrderStatus[]>> = {
  [ORDER_STATUS.PENDING]: [ORDER_STATUS.ACCEPTED, ORDER_STATUS.REJECTED],
  [ORDER_STATUS.ACCEPTED]: [ORDER_STATUS.PREPARING],
  [ORDER_STATUS.PREPARING]: [ORDER_STATUS.READY],
  [ORDER_STATUS.READY]: [ORDER_STATUS.COMPLETED],
};

function isTransactionUnsupported(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? (error as { code: unknown }).code
      : undefined;
  return (
    code === 20 ||
    error.message.includes("Transaction numbers are only allowed") ||
    error.message.includes("does not support transactions")
  );
}

export async function withMongoTransaction<T>(
  operation: (session: ClientSession) => Promise<T>
): Promise<T> {
  await connectDB();
  const session = await mongoose.startSession();
  try {
    let result: T | undefined;
    await session.withTransaction(async () => {
      result = await operation(session);
    });
    if (result === undefined) {
      throw new AppError("The database transaction did not complete.", 500, "TRANSACTION_FAILED");
    }
    return result;
  } catch (error) {
    if (isTransactionUnsupported(error)) {
      throw new AppError(
        "This operation requires MongoDB transaction support. No changes were made.",
        503,
        "TRANSACTIONS_UNAVAILABLE"
      );
    }
    throw error;
  } finally {
    await session.endSession();
  }
}

export async function createOrderFromCart(
  customerId: mongoose.Types.ObjectId,
  customerType: CustomerType
) {
  return withMongoTransaction(async (session) => {
    const cart = await Cart.findOne({ customer: customerId }).session(session);
    if (!cart || cart.items.length === 0) {
      throw new ConflictError("Your cart is empty.");
    }

    const canteen = await Canteen.findOne({
      _id: cart.canteen,
      isApproved: true,
      isActive: true,
    }).session(session);
    if (!canteen) {
      throw new ConflictError("This canteen is no longer accepting orders.");
    }

    const cartLines = cart.items.map((item) => ({
      productId: item.product,
      quantity: item.quantity,
    }));
    const products = await Product.find({
      _id: { $in: cartLines.map((item) => item.productId) },
      canteen: canteen._id,
    }).session(session);
    const productById = new Map(products.map((product) => [product._id.toString(), product]));
    const categories = await Category.find({
      _id: { $in: products.map((product) => product.category) },
      canteen: canteen._id,
      isActive: true,
    }).session(session);
    const categoryById = new Map(categories.map((category) => [category._id.toString(), category]));
    let subtotalCents = 0;
    const orderItems = [];

    for (const line of cartLines) {
      const product = productById.get(line.productId.toString());
      if (!product || !product.isAvailable) {
        throw new ConflictError("A product in your cart is no longer available.");
      }
      if (product.stockQuantity < line.quantity) {
        throw new ConflictError(`Only ${product.stockQuantity} of ${product.name} remain in stock.`);
      }
      const category = categoryById.get(product.category.toString());
      if (!category) {
        throw new ConflictError(`${product.name} no longer belongs to an active category.`);
      }

      const stockUpdate = await Product.updateOne(
        {
          _id: product._id,
          canteen: canteen._id,
          isAvailable: true,
          stockQuantity: { $gte: line.quantity },
        },
        { $inc: { stockQuantity: -line.quantity } },
        { session }
      );
      if (stockUpdate.modifiedCount !== 1) {
        throw new ConflictError(`${product.name} no longer has enough stock.`);
      }

      const unitPriceCents = effectiveUnitPriceCents(product);
      const lineSubtotalCents = unitPriceCents * line.quantity;
      subtotalCents += lineSubtotalCents;
      orderItems.push({
        product: product._id,
        productName: product.name,
        categoryName: category.name,
        image: product.image,
        originalUnitPrice: fromCents(toCents(product.price)),
        unitPrice: fromCents(unitPriceCents),
        quantity: line.quantity,
        subtotal: fromCents(lineSubtotalCents),
      });
    }

    const subtotal = fromCents(subtotalCents);
    const [order] = await Order.create(
      [
        {
          customer: customerId,
          customerType,
          canteen: canteen._id,
          canteenName: canteen.canteenName,
          items: orderItems,
          subtotal,
          total: subtotal,
          status: ORDER_STATUS.PENDING,
          paymentMethod: "CASH_ON_PICKUP",
        },
      ],
      { session }
    );
    const cartDelete = await Cart.deleteOne({ _id: cart._id, customer: customerId }, { session });
    if (cartDelete.deletedCount !== 1) {
      throw new ConflictError("Your cart changed while the order was being placed. Please retry.");
    }
    return order;
  });
}

async function restoreOrderStock(
  order: InstanceType<typeof Order>,
  session: ClientSession
) {
  for (const item of order.items) {
    const result = await Product.updateOne(
      {
        _id: item.product,
        canteen: order.canteen,
        stockQuantity: { $lte: 1000000 - item.quantity },
      },
      { $inc: { stockQuantity: item.quantity } },
      { session }
    );
    if (result.matchedCount !== 1) {
      throw new ConflictError("A product could not be restored to stock. The order was not changed.");
    }
  }
}

export async function updateOwnerOrderStatus(
  orderId: string,
  canteenId: mongoose.Types.ObjectId,
  nextStatus: OrderStatus
) {
  return withMongoTransaction(async (session) => {
    const order = await Order.findOne({ _id: orderId, canteen: canteenId }).session(session);
    if (!order) throw new NotFoundError("Order not found");
    if (!OWNER_TRANSITIONS[order.status as OrderStatus]?.includes(nextStatus)) {
      throw new ConflictError("That order status transition is not allowed.");
    }
    if (nextStatus === ORDER_STATUS.REJECTED) {
      await restoreOrderStock(order, session);
    }
    order.status = nextStatus;
    await order.save({ session });
    return order;
  });
}

export async function cancelCustomerOrder(
  orderId: string,
  customerId: mongoose.Types.ObjectId
) {
  return withMongoTransaction(async (session) => {
    const order = await Order.findOne({ _id: orderId, customer: customerId }).session(session);
    if (!order) throw new NotFoundError("Order not found");
    if (order.status !== ORDER_STATUS.PENDING) {
      throw new ConflictError("Only pending orders can be cancelled.");
    }
    await restoreOrderStock(order, session);
    order.status = ORDER_STATUS.CANCELLED;
    await order.save({ session });
    return order;
  });
}
