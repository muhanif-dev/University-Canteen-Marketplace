import { NextRequest } from "next/server";

import { apiSuccess, handleApiError } from "@/lib/api";
import { requireOwnedCanteen } from "@/lib/canteen-owner";
import { NotFoundError } from "@/lib/errors";
import { Category } from "@/models/category";
import { Product } from "@/models/product";
import { productInputSchema } from "@/validations/marketplace";

export const runtime = "nodejs";
const productFields = "category name description price discountPrice image stockQuantity isAvailable preparationTime createdAt updatedAt";

export async function GET() {
  try {
    const { canteen } = await requireOwnedCanteen();
    const products = await Product.find({ canteen: canteen._id })
      .select(productFields)
      .populate("category", "name isActive")
      .sort({ updatedAt: -1 })
      .lean();
    return apiSuccess(products);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { canteen } = await requireOwnedCanteen();
    const body: unknown = await request.json();
    const input = await productInputSchema.validate(body, {
      abortEarly: false,
      stripUnknown: true,
    });
    const category = await Category.findOne({
      _id: input.category,
      canteen: canteen._id,
      isActive: true,
    }).select("_id");
    if (!category) throw new NotFoundError("Choose an active category from your canteen.");

    const product = await Product.create({ ...input, canteen: canteen._id });
    const result = await Product.findById(product._id)
      .select(productFields)
      .populate("category", "name isActive");
    return apiSuccess(result, 201, "Product created.");
  } catch (error) {
    return handleApiError(error);
  }
}
