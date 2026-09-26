import { NextRequest } from "next/server";
import mongoose from "mongoose";

import { apiSuccess, handleApiError } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { ValidationError } from "@/lib/errors";
import { Canteen } from "@/models/canteen";
import { Category } from "@/models/category";
import { Product } from "@/models/product";
import { marketplaceQuerySchema } from "@/validations/marketplace";

export const runtime = "nodejs";
const productFields = "canteen category name description price discountPrice image stockQuantity isAvailable preparationTime";
const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const raw = Object.fromEntries(request.nextUrl.searchParams.entries());
    const query = await marketplaceQuerySchema.validate(raw, {
      abortEarly: false,
      stripUnknown: true,
    });
    if (raw.canteenId && !query.canteenId) throw new ValidationError("Canteen filter is invalid.");
    if (raw.categoryId && !query.categoryId) throw new ValidationError("Category filter is invalid.");

    const canteenIds = await Canteen.find({ isApproved: true, isActive: true }).distinct("_id");
    const selectedCanteens = query.canteenId
      ? canteenIds.filter((id) => id.toString() === query.canteenId)
      : canteenIds;
    let resolvedCategoryId: mongoose.Types.ObjectId | null | undefined;
    if (query.categoryId) {
      const category = await Category.findOne({
        _id: query.categoryId,
        canteen: { $in: selectedCanteens },
        isActive: true,
      }).select("_id").lean();
      resolvedCategoryId = category?._id ?? null;
    }

    const criteria = {
      canteen: { $in: selectedCanteens },
      isAvailable: true,
      stockQuantity: { $gt: 0 },
      ...(resolvedCategoryId !== undefined ? { category: resolvedCategoryId } : {}),
      ...(query.q
        ? { $or: [{ name: new RegExp(escapeRegex(query.q), "i") }, { description: new RegExp(escapeRegex(query.q), "i") }] }
        : {}),
    };

    const products = await Product.find(criteria)
      .select(productFields)
      .populate({ path: "category", match: { isActive: true }, select: "name" })
      .populate({
        path: "canteen",
        match: { isApproved: true, isActive: true },
        select: "canteenName location building logoUrl",
      })
      .sort({ name: 1 })
      .limit(100)
      .lean();
    return apiSuccess(products.filter((product) => product.canteen && product.category));
  } catch (error) {
    return handleApiError(error);
  }
}
