"use client";

import axios from "axios";
import { CheckCheck } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { NotificationRow } from "@/components/notifications/notification-row";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { ApiResponse } from "@/types/marketplace";
import type { NotificationItem, NotificationPage } from "@/types/notifications";

const PAGE_SIZE = 20;

function getNotificationError(error: unknown, fallback: string) {
  if (axios.isAxiosError<{ error?: string }>(error)) {
    if (error.response?.status === 401) return "Your session has expired. Sign in again to view notifications.";
    if (error.response?.status === 403) return "Your account cannot access notifications.";
    return error.response?.data.error ?? fallback;
  }
  return fallback;
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const [error, setError] = useState("");

  const loadPage = useCallback(async (nextPage: number) => {
    if (nextPage === 1) setLoading(true);
    else setLoadingMore(true);
    setError("");
    try {
      const response = await axios.get<ApiResponse<NotificationPage>>(
        `/api/notifications?page=${nextPage}&limit=${PAGE_SIZE}`
      );
      const data = response.data.data;
      setNotifications((current) =>
        nextPage === 1 ? data.notifications : [...current, ...data.notifications]
      );
      setPage(data.page);
      setHasMore(data.hasMore);
    } catch (cause) {
      setError(getNotificationError(cause, "Notifications could not be loaded. Please try again."));
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    axios
      .get<ApiResponse<NotificationPage>>(
        `/api/notifications?page=1&limit=${PAGE_SIZE}`
      )
      .then((response) => {
        if (!active) return;
        const data = response.data.data;
        setNotifications(data.notifications);
        setPage(data.page);
        setHasMore(data.hasMore);
      })
      .catch((cause: unknown) => {
        if (active) setError(getNotificationError(cause, "Notifications could not be loaded. Please try again."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function markRead(notificationId: string) {
    try {
      await axios.patch(`/api/notifications/${notificationId}/read`);
      setNotifications((current) =>
        current.map((item) =>
          item._id === notificationId ? { ...item, isRead: true } : item
        )
      );
      setError("");
      window.dispatchEvent(new Event("notifications:updated"));
    } catch (cause) {
      setError(getNotificationError(cause, "This notification could not be marked as read."));
    }
  }

  async function markAllRead() {
    setMarkingAll(true);
    try {
      await axios.patch("/api/notifications/read-all");
      setNotifications((current) => current.map((item) => ({ ...item, isRead: true })));
      setError("");
      window.dispatchEvent(new Event("notifications:updated"));
    } catch (cause) {
      setError(getNotificationError(cause, "Notifications could not be marked as read. Please try again."));
    } finally {
      setMarkingAll(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="outline" onClick={() => void markAllRead()} disabled={markingAll}>
          <CheckCheck /> {markingAll ? "Marking…" : "Mark all as read"}
        </Button>
      </div>
      {error && <p role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
      {loading ? (
        <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">Loading notifications…</CardContent></Card>
      ) : notifications.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">No notifications yet.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <NotificationRow key={notification._id} notification={notification} onMarkRead={markRead} />
          ))}
        </div>
      )}
      {hasMore && (
        <div className="flex justify-center">
          <Button variant="outline" disabled={loadingMore} onClick={() => void loadPage(page + 1)}>
            {loadingMore ? "Loading…" : "Load more"}
          </Button>
        </div>
      )}
    </div>
  );
}
