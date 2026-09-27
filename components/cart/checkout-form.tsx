"use client";

import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ApiResponse } from "@/types/marketplace";
import type { CartSummary, CustomerOrder } from "@/types/orders";

export function CheckoutForm() {
  const router = useRouter();
  const [cart, setCart] = useState<CartSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    axios.get<ApiResponse<CartSummary>>("/api/cart")
      .then(({ data }) => { if (active) setCart(data.data); })
      .catch((cause: unknown) => {
        if (!active) return;
        setError(axios.isAxiosError(cause) && (cause.response?.status === 401 || cause.response?.status === 403)
          ? "An active Student or Faculty account is required to place an order."
          : "Your cart could not be loaded. Please return to the cart and try again.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function placeOrder() {
    setPlacing(true);
    setError("");
    try {
      const response = await axios.post<ApiResponse<CustomerOrder>>("/api/orders", {});
      router.push(`/orders/${response.data.data._id}`);
    } catch (cause) {
      if (axios.isAxiosError<{ error?: string }>(cause)) {
        setError(cause.response?.data.error ?? "The order could not be placed. Please try again.");
      } else {
        setError("The order could not be placed. Please try again.");
      }
      setPlacing(false);
    }
  }

  if (loading) return <p role="status" className="py-8 text-sm text-muted-foreground">Loading checkout…</p>;
  if (!cart && error) return <p role="alert" className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">{error}</p>;
  if (!cart || cart.items.length === 0) return <Card><CardHeader><CardTitle>Your cart is empty</CardTitle></CardHeader><CardContent><Button asChild><Link href="/marketplace">Browse marketplace</Link></Button></CardContent></Card>;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <Card><CardHeader><CardTitle>Review order</CardTitle></CardHeader><CardContent className="space-y-4">
        {error && <p role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
        {cart.items.map((item) => <div key={item.productId} className="flex justify-between gap-4 border-b pb-3 text-sm"><div><p className="font-medium">{item.product?.name ?? "Unavailable product"} × {item.quantity}</p><p className="text-muted-foreground">{item.product?.canteenName ?? "Canteen unavailable"}</p>{!item.available && <p className="mt-1 text-destructive">This item needs attention.</p>}</div><span className="shrink-0">PKR {item.subtotal.toFixed(2)}</span></div>)}
        <p className="text-sm text-muted-foreground">Payment method: Cash on Pickup. Pay at the canteen when you collect your order.</p>
      </CardContent></Card>
      <Card className="h-fit"><CardHeader><CardTitle>Order total</CardTitle></CardHeader><CardContent className="space-y-4"><div className="flex justify-between border-b pb-4 text-sm"><span>Subtotal</span><span>PKR {cart.subtotal.toFixed(2)}</span></div><div className="flex justify-between font-semibold"><span>Total</span><span>PKR {cart.total.toFixed(2)}</span></div><Button className="w-full" disabled={!cart.isOrderable || placing} onClick={() => void placeOrder()}>{placing ? "Placing order…" : "Place order · Cash on Pickup"}</Button><Button className="w-full" variant="outline" asChild><Link href="/cart">Back to cart</Link></Button></CardContent></Card>
    </div>
  );
}
