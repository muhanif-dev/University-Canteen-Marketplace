import type { NotificationEntityType, NotificationType } from "@/types";

export interface NotificationItem {
  _id: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedEntityType?: NotificationEntityType;
  relatedEntityId?: string;
  relatedOrder?: string;
  href: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationPage {
  notifications: NotificationItem[];
  page: number;
  limit: number;
  hasMore: boolean;
}
