import Link from "next/link";

import { CartView } from "@/components/cart/cart-view";

export default function CartPage() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
      <div className="mb-8"><Link href="/marketplace" className="text-sm text-primary underline underline-offset-4">← Marketplace</Link><h1 className="mt-4 text-3xl font-bold tracking-tight">Your cart</h1><p className="mt-2 text-muted-foreground">Review your items before placing your order.</p></div>
      <CartView />
    </main>
  );
}
