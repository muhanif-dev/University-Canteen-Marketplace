import { NextRequest } from "next/server";
import mongoose from "mongoose";

import { apiSuccess, handleApiError } from "@/lib/api";
import { requireActiveCustomer } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { NotFoundError } from "@/lib/errors";
import { Canteen } from "@/models/canteen";

export const runtime = "nodejs";
type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    await requireActiveCustomer();
    await connectDB();
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) throw new NotFoundError("Canteen not found");
    const canteen = await Canteen.findOne({ _id: id, isApproved: true, isActive: true })
      .select("canteenName description location building openingTime closingTime logoUrl coverImageUrl")
      .lean();
    if (!canteen) throw new NotFoundError("Canteen not found");
    return apiSuccess(canteen);
  } catch (error) {
    return handleApiError(error);
  }
}
