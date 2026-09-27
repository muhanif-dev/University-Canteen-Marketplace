"use client";

import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";

import { RemoteImage } from "@/components/marketplace/remote-image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ApiResponse } from "@/types/marketplace";
import type { CartSummary } from "@/types/orders";

function requestError(error: unknown) {
  if (axios.isAxiosError<{ error?: string }>(error)) {
    if (error.response?.status === 401 || error.response?.status === 403) {
      return "An active Student or Faculty account is required to use the cart.";
    }
    return error.response?.data.error ?? "The cart could not be updated. Please try again.";
  }
  return "The cart could not be updated. Please try again.";
}

export function CartView() {
  const [cart, setCart] = useState<CartSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busyProduct, setBusyProduct] = useState("");

  async function load() {
    try {
      const response = await axios.get<ApiResponse<CartSummary>>("/api/cart");
      setCart(response.data.data);
      setError("");
    } catch (cause) {
      setError(requestError(cause));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    axios.get<ApiResponse<CartSummary>>("/api/cart")
      .then(({ data }) => { if (active) setCart(data.data); })
      .catch((cause: unknown) => { if (active) setError(requestError(cause)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function updateQuantity(productId: string, quantity: number) {
    setBusyProduct(productId);
    setNotice("");
    try {
      const response = await axios.patch<ApiResponse<CartSummary>>(`/api/cart/items/${productId}`, { quantity });
      setCart(response.data.data);
      setError("");
    } catch (cause) {
      const message = requestError(cause);
      await load();
      setError(message);
    } finally {
      setBusyProduct("");
    }
  }

  async function removeItem(productId: string) {
    setBusyProduct(productId);
    setNotice("");
    try {
      const response = await axios.delete<ApiResponse<CartSummary>>(`/api/cart/items/${productId}`);
      setCart(response.data.data);
      setError("");
      setNotice("Item removed from cart.");
    } catch (cause) {
      setError(requestError(cause));
    } finally {
      setBusyProduct("");
    }
  }

  async function clearCart() {
    if (!window.confirm("Clear all items from your cart?")) return;
    try {
      const response = await axios.delete<ApiResponse<CartSummary>>("/api/cart");
      setCart(response.data.data);
      setError("");
      setNotice("Cart cleared.");
    } catch (cause) {
      setError(requestError(cause));
    }
  }

  if (loading) return <p role="status" className="py-8 text-sm text-muted-foreground">Loading your cart…</p>;

  return (
    <div className="space-y-5">
      {error && <p role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
      {notice && <p role="status" className="rounded-md bg-secondary p-3 text-sm">{notice}</p>}
      {!cart || cart.items.length === 0 ? (
        <Card><CardHeader><CardTitle>Your cart is empty</CardTitle></CardHeader><CardContent><p className="mb-4 text-sm text-muted-foreground">Browse the marketplace to find something you like.</p><Button asChild><Link href="/marketplace">Browse marketplace</Link></Button></CardContent></Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <Card><CardHeader><div className="flex items-center justify-between gap-3"><CardTitle>Cart items</CardTitle><Button variant="ghost" size="sm" onClick={() => void clearCart()}>Clear cart</Button></div></CardHeader><CardContent>
            <ul className="divide-y">
              {cart.items.map((item) => (
                <li key={item.productId} className="flex flex-col gap-4 py-5 first:pt-0 last:pb-0 sm:flex-row">
                  {item.product?.image && <div className="relative h-24 w-28 shrink-0 overflow-hidden rounded-md bg-muted"><RemoteImage src={item.product.image} alt={item.product.name} sizes="112px" className="object-cover" /></div>}
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{item.product?.name ?? "Unavailable product"}</p>
                    <p className="text-sm text-muted-foreground">{item.product?.canteenName ?? "Canteen unavailable"}</p>
                    <p className="mt-1 text-sm">PKR {item.unitPrice.toFixed(2)} each · Subtotal PKR {item.subtotal.toFixed(2)}</p>
                    {!item.available && <p className="mt-1 text-sm text-destructive">{item.canAdjust ? "Quantity exceeds current stock. Reduce it or remove this item." : "This item is no longer available. Remove it from your cart."}</p>}
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Button size="sm" variant="outline" aria-label="Decrease quantity" disabled={busyProduct === item.productId || item.quantity <= 1 || !item.canAdjust} onClick={() => void updateQuantity(item.productId, item.quantity - 1)}>−</Button>
                      <span aria-live="polite" className="min-w-8 text-center text-sm">{item.quantity}</span>
                      <Button size="sm" variant="outline" aria-label="Increase quantity" disabled={busyProduct === item.productId || !item.available || item.quantity >= (item.product?.stockQuantity ?? 0)} onClick={() => void updateQuantity(item.productId, item.quantity + 1)}>+</Button>
                      <Button size="sm" variant="ghost" disabled={busyProduct === item.productId} onClick={() => void removeItem(item.productId)}>Remove</Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent></Card>
          <Card className="h-fit"><CardHeader><CardTitle>Order summary</CardTitle></CardHeader><CardContent className="space-y-4">
            <div className="flex justify-between text-sm"><span>Subtotal</span><span>PKR {cart.subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between border-t pt-4 font-semibold"><span>Total</span><span>PKR {cart.total.toFixed(2)}</span></div>
            <p className="text-sm text-muted-foreground">Payment is due in cash at pickup.</p>
            {cart.isOrderable ? <Button className="w-full" asChild><Link href="/checkout">Continue to checkout</Link></Button> : <Button className="w-full" disabled>Resolve unavailable items</Button>}
          </CardContent></Card>
        </div>
      )}
    </div>
  );
}
