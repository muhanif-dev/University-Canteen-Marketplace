import mongoose from "mongoose";

import { apiSuccess, handleApiError } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { Notification } from "@/models/notification";
import { notificationIdSchema } from "@/validations/notifications";

type RouteContext = { params: Promise<{ id: string }> };
export const runtime = "nodejs";

export async function PATCH(_request: Request, { params }: RouteContext) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    await notificationIdSchema.validate(id);
    if (!mongoose.isValidObjectId(id)) {
      throw new ValidationError("Invalid notification ID.");
    }

    await connectDB();
    const notification = await Notification.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(id),
        recipient: new mongoose.Types.ObjectId(session.userId),
      },
      { $set: { isRead: true } },
      { new: true }
    )
      .select("_id isRead")
      .lean();
    if (!notification) throw new NotFoundError("Notification not found.");

    return apiSuccess({ _id: notification._id.toString(), isRead: notification.isRead });
  } catch (error) {
    return handleApiError(error);
  }
}
