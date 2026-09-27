"use client";

import axios from "axios";
import Link from "next/link";
import { Bell, CheckCheck } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { NotificationRow } from "@/components/notifications/notification-row";
import { Button } from "@/components/ui/button";
import type { ApiResponse } from "@/types/marketplace";
import type { NotificationItem, NotificationPage } from "@/types/notifications";

interface UnreadCountResponse {
  unreadCount: number;
}

function getNotificationError(error: unknown, fallback: string) {
  if (axios.isAxiosError<{ error?: string }>(error)) {
    if (error.response?.status === 401) return "Your session has expired. Sign in again to view notifications.";
    if (error.response?.status === 403) return "Your account cannot access notifications.";
    return error.response?.data.error ?? fallback;
  }
  return fallback;
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);

  const refreshUnreadCount = useCallback(async () => {
    try {
      const response = await axios.get<ApiResponse<UnreadCountResponse>>(
        "/api/notifications/unread-count"
      );
      setUnreadCount(response.data.data.unreadCount);
    } catch {
      // Keep the bell usable if a temporary API or connection error occurs.
    }
  }, []);

  useEffect(() => {
    let active = true;
    axios
      .get<ApiResponse<UnreadCountResponse>>("/api/notifications/unread-count")
      .then((response) => {
        if (active) setUnreadCount(response.data.data.unreadCount);
      })
      .catch(() => {
        // Keep the bell usable if a temporary API or connection error occurs.
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    function handleNotificationUpdate() {
      void refreshUnreadCount();
    }
    window.addEventListener("notifications:updated", handleNotificationUpdate);
    return () => window.removeEventListener("notifications:updated", handleNotificationUpdate);
  }, [refreshUnreadCount]);

  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    axios
      .get<ApiResponse<NotificationPage>>("/api/notifications?limit=8&page=1")
      .then((response) => {
        if (active) setNotifications(response.data.data.notifications);
      })
      .catch((cause: unknown) => {
        if (active) setError(getNotificationError(cause, "Notifications could not be loaded. Please try again."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    function handleOutsideClick(event: MouseEvent) {
      if (event.target instanceof Node && !panelRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      active = false;
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen]);

  async function markRead(notificationId: string) {
    try {
      await axios.patch(`/api/notifications/${notificationId}/read`);
      setNotifications((current) =>
        current.map((item) =>
          item._id === notificationId ? { ...item, isRead: true } : item
        )
      );
      setError("");
      await refreshUnreadCount();
    } catch (cause) {
      setError(getNotificationError(cause, "This notification could not be marked as read."));
    }
  }

  async function markAllRead() {
    try {
      await axios.patch("/api/notifications/read-all");
      setNotifications((current) => current.map((item) => ({ ...item, isRead: true })));
      setUnreadCount(0);
      setError("");
    } catch (cause) {
      setError(getNotificationError(cause, "Notifications could not be marked as read. Please try again."));
    }
  }

  return (
    <div className="relative" ref={panelRef}>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="relative"
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
        aria-expanded={isOpen}
        aria-controls="notification-panel"
        onClick={() => {
          if (!isOpen) {
            setLoading(true);
            setError("");
          }
          setIsOpen((open) => !open);
        }}
      >
        <Bell />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <section
          id="notification-panel"
          className="absolute right-0 top-12 z-50 w-[min(24rem,calc(100vw-2rem))] rounded-xl border bg-background p-3 shadow-lg"
          aria-label="Notifications"
        >
          <div className="mb-3 flex items-center justify-between gap-2 px-1">
            <h2 className="font-semibold">Notifications</h2>
            <Button variant="ghost" size="sm" onClick={() => void markAllRead()} disabled={unreadCount === 0}>
              <CheckCheck /> Mark all read
            </Button>
          </div>
          {error && <p role="alert" className="mb-2 rounded-md bg-destructive/10 p-2 text-sm text-destructive">{error}</p>}
          {loading ? (
            <p className="p-4 text-center text-sm text-muted-foreground">Loading notifications…</p>
          ) : notifications.length === 0 ? (
            <p className="p-5 text-center text-sm text-muted-foreground">No notifications yet.</p>
          ) : (
            <div className="max-h-[min(60vh,28rem)] space-y-2 overflow-y-auto">
              {notifications.map((notification) => (
                <NotificationRow
                  key={notification._id}
                  notification={notification}
                  onMarkRead={markRead}
                  compact
                />
              ))}
            </div>
          )}
          <Link
            href="/notifications"
            className="mt-3 block rounded-md border-t px-2 pt-3 text-center text-sm font-medium text-primary hover:underline"
            onClick={() => setIsOpen(false)}
          >
            View all notifications
          </Link>
        </section>
      )}
    </div>
  );
}
