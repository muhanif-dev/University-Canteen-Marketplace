import type { ClientSession, Types } from "mongoose";

import { Notification } from "@/models/notification";
import {
  NOTIFICATION_ENTITY_TYPE,
  NOTIFICATION_TYPE,
  type NotificationType,
} from "@/types";

interface NotificationInput {
  recipient: Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  entityType: (typeof NOTIFICATION_ENTITY_TYPE)[keyof typeof NOTIFICATION_ENTITY_TYPE];
  entityId: Types.ObjectId;
  relatedOrder?: Types.ObjectId;
  session: ClientSession;
}

export async function createNotification(input: NotificationInput) {
  const eventKey = [
    input.entityType.toLowerCase(),
    input.entityId.toString(),
    input.type,
    input.recipient.toString(),
  ].join(":");

  await Notification.updateOne(
    { eventKey },
    {
      $setOnInsert: {
        recipient: input.recipient,
        type: input.type,
        title: input.title,
        message: input.message,
        relatedEntityType: input.entityType,
        relatedEntityId: input.entityId,
        ...(input.relatedOrder ? { relatedOrder: input.relatedOrder } : {}),
        eventKey,
        isRead: false,
      },
    },
    { upsert: true, session: input.session }
  );
}

const ORDER_NOTIFICATION_COPY: Partial<
  Record<NotificationType, { title: string; message: string }>
> = {
  [NOTIFICATION_TYPE.ORDER_ACCEPTED]: {
    title: "Order accepted",
    message: "The canteen accepted your order and will prepare it soon.",
  },
  [NOTIFICATION_TYPE.ORDER_REJECTED]: {
    title: "Order not accepted",
    message: "The canteen could not accept your order. Any reserved stock has been released.",
  },
  [NOTIFICATION_TYPE.ORDER_PREPARING]: {
    title: "Your order is being prepared",
    message: "The canteen has started preparing your order.",
  },
  [NOTIFICATION_TYPE.ORDER_READY]: {
    title: "Your order is ready",
    message: "Your order is ready for pickup at the canteen.",
  },
  [NOTIFICATION_TYPE.ORDER_COMPLETED]: {
    title: "Order completed",
    message: "Your canteen order has been marked as completed.",
  },
  [NOTIFICATION_TYPE.ORDER_CANCELLED]: {
    title: "Order cancelled",
    message: "Your pending order has been cancelled.",
  },
};

export async function notifyOrderCustomer(
  recipient: Types.ObjectId,
  orderId: Types.ObjectId,
  type: NotificationType,
  session: ClientSession
) {
  const copy = ORDER_NOTIFICATION_COPY[type];
  if (!copy) return;

  await createNotification({
    recipient,
    type,
    ...copy,
    entityType: NOTIFICATION_ENTITY_TYPE.ORDER,
    entityId: orderId,
    relatedOrder: orderId,
    session,
  });
}
export async function notifyCanteenOwnerOfNewOrder(
  recipient: Types.ObjectId,
  orderId: Types.ObjectId,
  session: ClientSession
) {
  const shortId = orderId.toString().slice(-6).toUpperCase();
  await createNotification({
    recipient,
    type: NOTIFICATION_TYPE.NEW_ORDER,
    title: "New order received",
    message: `A new order (#${shortId}) has been placed in your canteen.`,
    entityType: NOTIFICATION_ENTITY_TYPE.ORDER,
    entityId: orderId,
    relatedOrder: orderId,
    session,
  });
}
