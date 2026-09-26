import { NextRequest } from "next/server";
import mongoose from "mongoose";

import { apiSuccess, handleApiError } from "@/lib/api";
import { requireOwnedCanteen } from "@/lib/canteen-owner";
import { NotFoundError } from "@/lib/errors";
import { Category } from "@/models/category";
import { Product } from "@/models/product";
import { productInputSchema } from "@/validations/marketplace";

export const runtime = "nodejs";
const productFields = "category name description price discountPrice image stockQuantity isAvailable preparationTime createdAt updatedAt";
type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { canteen } = await requireOwnedCanteen();
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) throw new NotFoundError("Product not found");
    const product = await Product.findOne({ _id: id, canteen: canteen._id })
      .select(productFields)
      .populate("category", "name isActive")
      .lean();
    if (!product) throw new NotFoundError("Product not found");
    return apiSuccess(product);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const { canteen } = await requireOwnedCanteen();
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) throw new NotFoundError("Product not found");
    const body: unknown = await request.json();
    const input = await productInputSchema.validate(body, {
      abortEarly: false,
      stripUnknown: true,
    });
    const ownedProduct = await Product.findOne({ _id: id, canteen: canteen._id })
      .select("category")
      .lean();
    if (!ownedProduct) throw new NotFoundError("Product not found");
    const category = await Category.findOne({
      _id: input.category,
      canteen: canteen._id,
      $or: [{ isActive: true }, { _id: ownedProduct.category }],
    }).select("_id");
    if (!category) throw new NotFoundError("Choose an active category from your canteen.");

    const product = await Product.findOneAndUpdate(
      { _id: id, canteen: canteen._id },
      { $set: input },
      { new: true, runValidators: true }
    )
      .select(productFields)
      .populate("category", "name isActive");
    if (!product) throw new NotFoundError("Product not found");
    return apiSuccess(product, 200, "Product updated.");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    const { canteen } = await requireOwnedCanteen();
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) throw new NotFoundError("Product not found");
    const product = await Product.findOneAndUpdate(
      { _id: id, canteen: canteen._id },
      { $set: { isAvailable: false } },
      { new: true }
    ).select("_id isAvailable");
    if (!product) throw new NotFoundError("Product not found");
    return apiSuccess({ id: product._id, isAvailable: product.isAvailable }, 200, "Product marked unavailable.");
  } catch (error) {
    return handleApiError(error);
  }
}
