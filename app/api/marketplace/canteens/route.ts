import { apiSuccess, handleApiError } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { Canteen } from "@/models/canteen";

export const runtime = "nodejs";

export async function GET() {
  try {
    await connectDB();
    const canteens = await Canteen.find({ isApproved: true, isActive: true })
      .select("canteenName description location building openingTime closingTime logoUrl coverImageUrl")
      .sort({ canteenName: 1 })
      .lean();
    return apiSuccess(canteens);
  } catch (error) {
    return handleApiError(error);
  }
}
