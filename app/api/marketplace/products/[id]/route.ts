import { NextRequest } from "next/server";
import mongoose from "mongoose";

import { apiSuccess, handleApiError } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { NotFoundError } from "@/lib/errors";
import { Product } from "@/models/product";

export const runtime = "nodejs";
type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    await connectDB();
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) throw new NotFoundError("Product not found");
    const product = await Product.findOne({ _id: id, isAvailable: true, stockQuantity: { $gt: 0 } })
      .select("canteen category name description price discountPrice image stockQuantity isAvailable preparationTime")
      .populate({ path: "category", match: { isActive: true }, select: "name description" })
      .populate({
        path: "canteen",
        match: { isApproved: true, isActive: true },
        select: "canteenName description location building openingTime closingTime logoUrl coverImageUrl",
      })
      .lean();
    if (!product || !product.canteen || !product.category) {
      throw new NotFoundError("Product not found");
    }
    return apiSuccess(product);
  } catch (error) {
    return handleApiError(error);
  }
}
