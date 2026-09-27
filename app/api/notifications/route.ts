import mongoose from "mongoose";
import { NextRequest } from "next/server";

import { apiSuccess, handleApiError } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { ValidationError } from "@/lib/errors";
import { Notification } from "@/models/notification";
import { ROLES } from "@/types";
import { notificationPaginationSchema } from "@/validations/notifications";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    const query = Object.fromEntries(request.nextUrl.searchParams.entries());
    const unexpectedKey = Object.keys(query).find(
      (key) => key !== "page" && key !== "limit"
    );
    if (unexpectedKey) {
      throw new ValidationError("Only page and limit query parameters are supported.");
    }
    if (["page", "limit"].some((key) => request.nextUrl.searchParams.getAll(key).length > 1)) {
      throw new ValidationError("Each pagination parameter can only be provided once.");
    }
    const { page, limit } = await notificationPaginationSchema.validate(query, {
      abortEarly: false,
      strict: false,
    });
    const recipient = new mongoose.Types.ObjectId(session.userId);

    await connectDB();
    const rows = await Notification.find({ recipient })
      .select("_id type title message relatedEntityType relatedEntityId relatedOrder isRead createdAt")
      .sort({ createdAt: -1, _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit + 1)
      .lean();
    const hasMore = rows.length > limit;
    const notifications = rows.slice(0, limit).map((item) => {
      const orderId = item.relatedOrder?.toString();
      const href = orderId
        ? session.role === ROLES.CANTEEN_OWNER
          ? "/canteen-owner/orders"
          : `/orders/${orderId}`
        : "/notifications";

      return {
        ...item,
        _id: item._id.toString(),
        ...(item.relatedEntityId
          ? { relatedEntityId: item.relatedEntityId.toString() }
          : {}),
        ...(orderId ? { relatedOrder: orderId } : {}),
        href,
      };
    });

    return apiSuccess({ notifications, page, limit, hasMore });
  } catch (error) {
    return handleApiError(error);
  }
}
