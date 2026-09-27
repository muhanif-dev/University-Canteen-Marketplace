"use client";

import { useRouter } from "next/navigation";
import { Bell, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { NotificationItem } from "@/types/notifications";

interface NotificationRowProps {
  notification: NotificationItem;
  onMarkRead: (notificationId: string) => Promise<void>;
  compact?: boolean;
}

export function NotificationRow({
  notification,
  onMarkRead,
  compact = false,
}: NotificationRowProps) {
  const router = useRouter();
  const timestamp = new Date(notification.createdAt);

  async function openNotification() {
    if (!notification.isRead) await onMarkRead(notification._id);
    router.push(notification.href);
  }

  return (
    <Card className={notification.isRead ? "bg-background" : "border-primary/30 bg-primary/[0.035]"}>
      <CardContent className={compact ? "flex items-start gap-3 p-3" : "flex items-start gap-4 p-4"}>
        <span className={`mt-1 rounded-full p-2 ${notification.isRead ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"}`} aria-hidden="true">
          <Bell className="size-4" />
        </span>
        <button
          type="button"
          className="min-w-0 flex-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={() => void openNotification()}
        >
          <span className="flex items-center gap-2 font-semibold">
            {notification.title}
            {!notification.isRead && <span className="size-2 rounded-full bg-primary" aria-label="Unread" />}
          </span>
          <span className="mt-1 block text-sm leading-5 text-muted-foreground">{notification.message}</span>
          <time className="mt-2 block text-xs text-muted-foreground" dateTime={timestamp.toISOString()}>
            {timestamp.toLocaleString()}
          </time>
        </button>
        {!notification.isRead && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            title="Mark as read"
            aria-label={`Mark ${notification.title} as read`}
            onClick={() => void onMarkRead(notification._id)}
          >
            <Check />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
