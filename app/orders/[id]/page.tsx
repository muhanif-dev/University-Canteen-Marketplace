import { CustomerOrderDetail } from "@/components/orders/customer-orders";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6">
      <CustomerOrderDetail orderId={id} />
    </main>
  );
}
