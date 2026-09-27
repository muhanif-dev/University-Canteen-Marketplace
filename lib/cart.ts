import mongoose from "mongoose";

import { Cart } from "@/models/cart";
import { Canteen } from "@/models/canteen";
import { Category } from "@/models/category";
import { Product } from "@/models/product";
import { ConflictError, NotFoundError } from "@/lib/errors";
import { effectiveUnitPriceCents, fromCents } from "@/lib/money";

export async function getSellableProduct(productId: string) {
  if (!mongoose.isValidObjectId(productId)) {
    throw new NotFoundError("Product not found");
  }
  const product = await Product.findById(productId);
  if (!product) throw new NotFoundError("Product not found");
  if (!product.isAvailable || product.stockQuantity < 1) {
    throw new ConflictError("This product is currently unavailable or out of stock.");
  }
  const canteen = await Canteen.findOne({
    _id: product.canteen,
    isApproved: true,
    isActive: true,
  }).select("_id canteenName");
  if (!canteen) {
    throw new ConflictError("This canteen is not currently accepting orders.");
  }
  const category = await Category.findOne({
    _id: product.category,
    canteen: canteen._id,
    isActive: true,
  }).select("_id");
  if (!category) {
    throw new ConflictError("This product is no longer in an active category.");
  }
  return { product, canteen };
}

export async function getCartSummary(customerId: mongoose.Types.ObjectId) {
  const cart = await Cart.findOne({ customer: customerId }).lean();
  if (!cart || cart.items.length === 0) {
    return { items: [], subtotal: 0, total: 0, currency: "PKR", isOrderable: false };
  }

  const productIds = cart.items.map((item) => item.product);
  const products = await Product.find({ _id: { $in: productIds } })
    .select("canteen category name description price discountPrice image stockQuantity isAvailable")
    .lean();
  const canteenIds = [...new Set(products.map((product) => product.canteen.toString()))];
  const categoryIds = [...new Set(products.map((product) => product.category.toString()))];
  const [canteens, categories] = await Promise.all([
    Canteen.find({ _id: { $in: canteenIds } })
      .select("canteenName isApproved isActive")
      .lean(),
    Category.find({ _id: { $in: categoryIds } })
      .select("name isActive")
      .lean(),
  ]);
  const productById = new Map(products.map((product) => [product._id.toString(), product]));
  const canteenById = new Map(canteens.map((canteen) => [canteen._id.toString(), canteen]));
  const categoryById = new Map(categories.map((category) => [category._id.toString(), category]));
  let subtotalCents = 0;
  let isOrderable = true;

  const items = cart.items.map((cartItem) => {
    const product = productById.get(cartItem.product.toString());
    if (!product) {
      isOrderable = false;
      return {
        productId: cartItem.product.toString(),
        product: null,
        quantity: cartItem.quantity,
        unitPrice: 0,
        subtotal: 0,
        available: false,
        canAdjust: false,
      };
    }
    const canteen = canteenById.get(product.canteen.toString());
    const category = categoryById.get(product.category.toString());
    const unitPriceCents = effectiveUnitPriceCents(product);
    const itemSubtotalCents = unitPriceCents * cartItem.quantity;
    const canAdjust =
      product.isAvailable &&
      product.stockQuantity > 0 &&
      canteen?.isApproved === true &&
      canteen.isActive &&
      category?.isActive === true &&
      product.canteen.toString() === cart.canteen.toString();
    const available = canAdjust && product.stockQuantity >= cartItem.quantity;
    if (!available) isOrderable = false;
    subtotalCents += itemSubtotalCents;

    return {
      productId: product._id.toString(),
      product: {
        _id: product._id.toString(),
        name: product.name,
        description: product.description,
        image: product.image,
        canteenName: canteen?.canteenName ?? "Unavailable canteen",
        categoryName: category?.name ?? "Unavailable category",
        stockQuantity: product.stockQuantity,
      },
      quantity: cartItem.quantity,
      unitPrice: fromCents(unitPriceCents),
      subtotal: fromCents(itemSubtotalCents),
      available,
      canAdjust,
    };
  });

  const subtotal = fromCents(subtotalCents);
  return {
    items,
    subtotal,
    total: subtotal,
    currency: "PKR",
    isOrderable: isOrderable && items.length > 0,
  };
}
