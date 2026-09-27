"use client";

import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";

import { OrderStatusBadge, formatOrderDate } from "@/components/orders/order-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ApiResponse } from "@/types/marketplace";
import type { CustomerOrder } from "@/types/orders";

function accessMessage(error: unknown) {
  if (axios.isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 403)) {
    return "An active Student or Faculty account is required to view orders.";
  }
  return "Orders could not be loaded. Please try again.";
}

export function CustomerOrderHistory() {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    axios.get<ApiResponse<CustomerOrder[]>>("/api/orders")
      .then(({ data }) => { if (active) setOrders(data.data); })
      .catch((cause: unknown) => { if (active) setError(accessMessage(cause)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  if (loading) return <p role="status" className="py-8 text-sm text-muted-foreground">Loading your orders…</p>;
  if (error) return <p role="alert" className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">{error}</p>;
  if (orders.length === 0) return <Card><CardHeader><CardTitle>No orders yet</CardTitle></CardHeader><CardContent><p className="mb-4 text-sm text-muted-foreground">Your completed checkouts will appear here.</p><Button asChild><Link href="/marketplace">Browse marketplace</Link></Button></CardContent></Card>;

  return <div className="grid gap-4">{orders.map((order) => <Link href={`/orders/${order._id}`} key={order._id}><Card className="transition-colors hover:bg-accent/30"><CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold">{order.canteenName}</p><p className="mt-1 text-sm text-muted-foreground">Order {order._id} · {formatOrderDate(order.createdAt)}</p><p className="mt-1 text-sm">{order.items.length} item{order.items.length === 1 ? "" : "s"} · Cash on Pickup</p></div><div className="flex items-center gap-3"><OrderStatusBadge status={order.status} /><span className="font-semibold">PKR {order.total.toFixed(2)}</span></div></CardContent></Card></Link>)}</div>;
}

export function CustomerOrderDetail({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<CustomerOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function load() {
    try {
      const response = await axios.get<ApiResponse<CustomerOrder>>(`/api/orders/${orderId}`);
      setOrder(response.data.data);
      setError("");
    } catch (cause) {
      setError(accessMessage(cause));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    axios.get<ApiResponse<CustomerOrder>>(`/api/orders/${orderId}`)
      .then(({ data }) => { if (active) setOrder(data.data); })
      .catch((cause: unknown) => { if (active) setError(accessMessage(cause)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [orderId]);

  async function cancelOrder() {
    if (!window.confirm("Cancel this pending order? The reserved stock will be returned.")) return;
    setBusy(true);
    setError("");
    try {
      const response = await axios.patch<ApiResponse<CustomerOrder>>(`/api/orders/${orderId}`, { status: "CANCELLED" });
      setOrder(response.data.data);
      setNotice("Order cancelled.");
    } catch (cause) {
      const message = axios.isAxiosError<{ error?: string }>(cause) ? cause.response?.data.error ?? "Order could not be cancelled." : "Order could not be cancelled.";
      await load();
      setError(message);
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <p role="status" className="py-8 text-sm text-muted-foreground">Loading order…</p>;
  if (!order) return <p role="alert" className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">{error || "Order not found."}</p>;

  return <div className="space-y-5">
    {error && <p role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
    {notice && <p role="status" className="rounded-md bg-secondary p-3 text-sm">{notice}</p>}
    <Card><CardHeader><div className="flex flex-wrap items-center justify-between gap-3"><div><CardTitle>{order.canteenName}</CardTitle><p className="mt-2 text-sm text-muted-foreground">Order {order._id} · {formatOrderDate(order.createdAt)}</p></div><OrderStatusBadge status={order.status} /></div></CardHeader><CardContent className="space-y-4">
      <ul className="divide-y">{order.items.map((item) => <li key={`${item.product}-${item.productName}`} className="flex justify-between gap-4 py-3 text-sm"><div><p className="font-medium">{item.productName} × {item.quantity}</p><p className="text-muted-foreground">{item.categoryName} · PKR {item.unitPrice.toFixed(2)} each</p></div><span>PKR {item.subtotal.toFixed(2)}</span></li>)}</ul>
      <div className="flex justify-between border-t pt-4 font-semibold"><span>Total</span><span>PKR {order.total.toFixed(2)}</span></div>
      <p className="text-sm text-muted-foreground">Customer type: {order.customerType} · Payment: Cash on Pickup</p>
      {order.status === "PENDING" && <Button variant="outline" disabled={busy} onClick={() => void cancelOrder()}>{busy ? "Cancelling…" : "Cancel pending order"}</Button>}
    </CardContent></Card>
    <Button asChild variant="ghost"><Link href="/orders">← Order history</Link></Button>
  </div>;
}
