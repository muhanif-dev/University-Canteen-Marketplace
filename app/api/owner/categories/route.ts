import { NextRequest } from "next/server";

import { apiSuccess, handleApiError } from "@/lib/api";
import { requireOwnedCanteen } from "@/lib/canteen-owner";
import { Category } from "@/models/category";
import { categoryInputSchema } from "@/validations/marketplace";

export const runtime = "nodejs";

export async function GET() {
  try {
    const { canteen } = await requireOwnedCanteen();
    const categories = await Category.find({ canteen: canteen._id })
      .sort({ name: 1 })
      .lean();
    return apiSuccess(categories);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { canteen } = await requireOwnedCanteen();
    const body: unknown = await request.json();
    const input = await categoryInputSchema.validate(body, {
      abortEarly: false,
      stripUnknown: true,
    });
    const category = await Category.create({ ...input, canteen: canteen._id });
    return apiSuccess(category.toJSON(), 201, "Category created.");
  } catch (error) {
    return handleApiError(error);
  }
}
