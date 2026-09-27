import { CustomerOrderHistory } from "@/components/orders/customer-orders";

export default function OrderHistoryPage() {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">
      <div className="mb-8"><h1 className="text-3xl font-bold tracking-tight">Your orders</h1><p className="mt-2 text-muted-foreground">Review your order history and current status.</p></div>
      <CustomerOrderHistory />
    </main>
  );
}
