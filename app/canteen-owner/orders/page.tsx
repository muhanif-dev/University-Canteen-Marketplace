import { redirect } from "next/navigation";

import { OwnerOrders } from "@/components/orders/owner-orders";
import { requireActiveCanteenOwner } from "@/lib/auth";
import { AppError } from "@/lib/errors";

export default async function CanteenOwnerOrdersPage() {
  try {
    await requireActiveCanteenOwner();
  } catch (error) {
    if (error instanceof AppError && (error.statusCode === 401 || error.statusCode === 403)) redirect("/register");
    throw error;
  }

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">
      <div className="mb-8"><h1 className="text-3xl font-bold tracking-tight">Orders</h1><p className="mt-2 text-muted-foreground">Review incoming customer orders and move them through the pickup workflow.</p></div>
      <OwnerOrders />
    </main>
  );
}
