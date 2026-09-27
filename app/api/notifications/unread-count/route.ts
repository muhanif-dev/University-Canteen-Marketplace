import mongoose from "mongoose";

import { apiSuccess, handleApiError } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Notification } from "@/models/notification";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await requireAuth();
    await connectDB();
    const unreadCount = await Notification.countDocuments({
      recipient: new mongoose.Types.ObjectId(session.userId),
      isRead: false,
    });
    return apiSuccess({ unreadCount });
  } catch (error) {
    return handleApiError(error);
  }
}
