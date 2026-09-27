import mongoose, { type InferSchemaType, model } from "mongoose";

import { NOTIFICATION_ENTITY_TYPE, NOTIFICATION_TYPE } from "@/types";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(NOTIFICATION_TYPE),
      required: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    message: { type: String, required: true, trim: true, maxlength: 500 },
    relatedEntityType: {
      type: String,
      enum: Object.values(NOTIFICATION_ENTITY_TYPE),
    },
    relatedEntityId: { type: mongoose.Schema.Types.ObjectId },
    relatedOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
    eventKey: { type: String, required: true, unique: true, maxlength: 160 },
    isRead: { type: Boolean, default: false, required: true },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

export type NotificationDocument = InferSchemaType<typeof notificationSchema>;

export const Notification: mongoose.Model<NotificationDocument> =
  (mongoose.models?.Notification as mongoose.Model<NotificationDocument>) ||
  model<NotificationDocument>("Notification", notificationSchema);
