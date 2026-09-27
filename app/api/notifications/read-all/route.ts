import mongoose from "mongoose";

import { apiSuccess, handleApiError } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Notification } from "@/models/notification";

export const runtime = "nodejs";

export async function PATCH() {
  try {
    const session = await requireAuth();
    await connectDB();
    const result = await Notification.updateMany(
      {
        recipient: new mongoose.Types.ObjectId(session.userId),
        isRead: false,
      },
      { $set: { isRead: true } }
    );
    return apiSuccess({ markedRead: result.modifiedCount });
  } catch (error) {
    return handleApiError(error);
  }
}
