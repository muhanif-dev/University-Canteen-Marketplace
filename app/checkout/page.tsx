import { CheckoutForm } from "@/components/cart/checkout-form";

export default function CheckoutPage() {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">
      <div className="mb-8"><h1 className="text-3xl font-bold tracking-tight">Checkout</h1><p className="mt-2 text-muted-foreground">Confirm the items and place your Cash on Pickup order.</p></div>
      <CheckoutForm />
    </main>
  );
}
