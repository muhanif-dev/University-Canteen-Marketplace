import { NextRequest } from "next/server";

import { apiSuccess, handleApiError } from "@/lib/api";
import { requireActiveCustomer } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Canteen } from "@/models/canteen";
import { Category } from "@/models/category";
import { ValidationError } from "@/lib/errors";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await requireActiveCustomer();
    await connectDB();
    const canteenId = request.nextUrl.searchParams.get("canteenId");
    const activeCanteens = await Canteen.find({ isApproved: true, isActive: true }).distinct("_id");
    if (canteenId && !/^[a-f\d]{24}$/i.test(canteenId)) {
      throw new ValidationError("Canteen filter is invalid.");
    }
    const canteenFilter = canteenId
      ? { $in: activeCanteens.filter((id) => id.toString() === canteenId) }
      : { $in: activeCanteens };
    const categories = await Category.find({ canteen: canteenFilter, isActive: true })
      .select("canteen name description")
      .populate({
        path: "canteen",
        select: "canteenName",
      })
      .sort({ name: 1 })
      .lean();
    return apiSuccess(categories);
  } catch (error) {
    return handleApiError(error);
  }
}
