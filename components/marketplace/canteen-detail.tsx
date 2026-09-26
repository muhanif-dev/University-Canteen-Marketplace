"use client";

import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";

import { ProductCard } from "@/components/marketplace/product-card";
import { RemoteImage } from "@/components/marketplace/remote-image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ApiResponse, MarketplaceCanteen, MarketplaceProduct } from "@/types/marketplace";

export function CanteenDetail({ canteenId }: { canteenId: string }) {
  const [canteen, setCanteen] = useState<MarketplaceCanteen | null>(null);
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([
      axios.get<ApiResponse<MarketplaceCanteen>>(`/api/marketplace/canteens/${canteenId}`),
      axios.get<ApiResponse<MarketplaceProduct[]>>(`/api/marketplace/products?canteenId=${canteenId}`),
    ])
      .then(([canteenResponse, productResponse]) => {
        if (!active) return;
        setCanteen(canteenResponse.data.data);
        setProducts(productResponse.data.data);
      })
      .catch(() => { if (active) setError("This canteen is unavailable or could not be loaded."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [canteenId]);

  if (loading) return <p role="status" className="py-8 text-sm text-muted-foreground">Loading canteen…</p>;
  if (error || !canteen) return <p role="alert" className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">{error || "Canteen not found."}</p>;

  return (
    <div className="space-y-8">
      <Card className="overflow-hidden">
        {canteen.coverImageUrl && <div className="relative aspect-[4/1] bg-muted"><RemoteImage src={canteen.coverImageUrl} alt={`${canteen.canteenName} cover`} sizes="100vw" className="object-cover" /></div>}
        <CardHeader><div className="flex items-center gap-3">{canteen.logoUrl && <div className="relative size-14 overflow-hidden rounded-full bg-muted"><RemoteImage src={canteen.logoUrl} alt={`${canteen.canteenName} logo`} sizes="56px" className="object-cover" /></div>}<CardTitle>{canteen.canteenName}</CardTitle></div></CardHeader><CardContent className="space-y-3 text-sm">
        <p>{canteen.description}</p><p className="text-muted-foreground">{canteen.location} · {canteen.building}</p>
        <p><span className="font-medium">Opening hours:</span> {canteen.openingTime}–{canteen.closingTime}</p>
        <Link href="/marketplace" className="inline-block text-primary underline underline-offset-4">Back to marketplace</Link>
      </CardContent></Card>
      <section><h2 className="mb-4 text-xl font-semibold">Available products</h2>{products.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{products.map((product) => <ProductCard key={product._id} product={product} />)}</div> : <p className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">No available products at this canteen right now.</p>}</section>
    </div>
  );
}
