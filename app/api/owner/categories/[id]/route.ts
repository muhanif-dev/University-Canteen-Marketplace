import { NextRequest } from "next/server";
import mongoose from "mongoose";

import { apiSuccess, handleApiError } from "@/lib/api";
import { requireOwnedCanteen } from "@/lib/canteen-owner";
import { NotFoundError } from "@/lib/errors";
import { Category } from "@/models/category";
import { categoryInputSchema } from "@/validations/marketplace";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { canteen } = await requireOwnedCanteen();
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) throw new NotFoundError("Category not found");
    const category = await Category.findOne({ _id: id, canteen: canteen._id }).lean();
    if (!category) throw new NotFoundError("Category not found");
    return apiSuccess(category);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const { canteen } = await requireOwnedCanteen();
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) throw new NotFoundError("Category not found");
    const body: unknown = await request.json();
    const input = await categoryInputSchema.validate(body, {
      abortEarly: false,
      stripUnknown: true,
    });
    const category = await Category.findOneAndUpdate(
      { _id: id, canteen: canteen._id },
      { $set: input },
      { new: true, runValidators: true }
    );
    if (!category) throw new NotFoundError("Category not found");
    return apiSuccess(category.toJSON(), 200, "Category updated.");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    const { canteen } = await requireOwnedCanteen();
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) throw new NotFoundError("Category not found");
    const category = await Category.findOneAndUpdate(
      { _id: id, canteen: canteen._id },
      { $set: { isActive: false } },
      { new: true }
    );
    if (!category) throw new NotFoundError("Category not found");
    return apiSuccess({ id: category._id, isActive: category.isActive }, 200, "Category deactivated.");
  } catch (error) {
    return handleApiError(error);
  }
}
