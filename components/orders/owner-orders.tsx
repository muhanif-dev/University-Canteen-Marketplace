"use client";

import axios from "axios";
import { useEffect, useState } from "react";

import { OrderStatusBadge, formatOrderDate } from "@/components/orders/order-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ApiResponse } from "@/types/marketplace";
import type { CustomerOrder } from "@/types/orders";
import { ORDER_STATUS, type OrderStatus } from "@/types";

const nextStatuses: Partial<Record<OrderStatus, OrderStatus[]>> = {
  [ORDER_STATUS.PENDING]: [ORDER_STATUS.ACCEPTED, ORDER_STATUS.REJECTED],
  [ORDER_STATUS.ACCEPTED]: [ORDER_STATUS.PREPARING],
  [ORDER_STATUS.PREPARING]: [ORDER_STATUS.READY],
  [ORDER_STATUS.READY]: [ORDER_STATUS.COMPLETED],
};

const statusLabels: Partial<Record<OrderStatus, string>> = {
  [ORDER_STATUS.ACCEPTED]: "Accept order",
  [ORDER_STATUS.REJECTED]: "Reject order",
  [ORDER_STATUS.PREPARING]: "Start preparing",
  [ORDER_STATUS.READY]: "Mark ready for pickup",
  [ORDER_STATUS.COMPLETED]: "Mark completed",
};

function orderError(error: unknown) {
  return axios.isAxiosError<{ error?: string }>(error)
    ? error.response?.data.error ?? "Orders could not be loaded."
    : "Orders could not be loaded.";
}

export function OwnerOrders() {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyOrder, setBusyOrder] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function load() {
    try {
      const response = await axios.get<ApiResponse<CustomerOrder[]>>("/api/owner/orders");
      setOrders(response.data.data);
      setError("");
    } catch (cause) {
      setError(orderError(cause));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    axios.get<ApiResponse<CustomerOrder[]>>("/api/owner/orders")
      .then(({ data }) => { if (active) setOrders(data.data); })
      .catch((cause: unknown) => { if (active) setError(orderError(cause)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function setStatus(orderId: string, status: OrderStatus) {
    if (status === ORDER_STATUS.REJECTED && !window.confirm("Reject this order and return its reserved stock?")) return;
    setBusyOrder(orderId);
    setError("");
    setNotice("");
    try {
      await axios.patch(`/api/owner/orders/${orderId}`, { status });
      setNotice("Order status updated.");
      await load();
    } catch (cause) {
      setError(orderError(cause));
    } finally {
      setBusyOrder("");
    }
  }

  if (loading) return <p role="status" className="py-8 text-sm text-muted-foreground">Loading orders…</p>;
  return <div className="space-y-4">
    {error && <p role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
    {notice && <p role="status" className="rounded-md bg-secondary p-3 text-sm">{notice}</p>}
    {orders.length === 0 ? <Card><CardHeader><CardTitle>No orders yet</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">New customer orders will appear here.</p></CardContent></Card> : orders.map((order) => (
      <Card key={order._id}><CardHeader><div className="flex flex-wrap items-start justify-between gap-3"><div><CardTitle className="text-lg">Order {order._id}</CardTitle><p className="mt-1 text-sm text-muted-foreground">{formatOrderDate(order.createdAt)}</p></div><OrderStatusBadge status={order.status} /></div></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm"><p><span className="font-medium">Customer type:</span> {order.customerType}</p><p><span className="font-medium">Payment:</span> Cash on Pickup</p><p><span className="font-medium">Total:</span> PKR {order.total.toFixed(2)}</p></div>
          <ul className="divide-y border-y">{order.items.map((item) => <li key={`${item.product}-${item.productName}`} className="flex justify-between gap-4 py-3 text-sm"><span>{item.productName} × {item.quantity}<span className="block text-xs text-muted-foreground">PKR {item.unitPrice.toFixed(2)} each</span></span><span>PKR {item.subtotal.toFixed(2)}</span></li>)}</ul>
          {(nextStatuses[order.status] ?? []).length > 0 && <div className="flex flex-wrap gap-2">{nextStatuses[order.status]?.map((status) => <Button key={status} size="sm" variant={status === ORDER_STATUS.REJECTED ? "destructive" : "default"} disabled={busyOrder === order._id} onClick={() => void setStatus(order._id, status)}>{busyOrder === order._id ? "Updating…" : statusLabels[status]}</Button>)}</div>}
        </CardContent>
      </Card>
    ))}
  </div>;
}
