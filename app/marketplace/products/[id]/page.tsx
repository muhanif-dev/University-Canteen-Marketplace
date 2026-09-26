import { ProductDetail } from "@/components/marketplace/product-detail";

export default async function MarketplaceProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">
      <ProductDetail productId={id} />
    </main>
  );
}
