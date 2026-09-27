"use client";

import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RemoteImage } from "@/components/marketplace/remote-image";
import type { ApiResponse, MarketplaceProduct } from "@/types/marketplace";

export function ProductDetail({ productId }: { productId: string }) {
  const [product, setProduct] = useState<MarketplaceProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cartMessage, setCartMessage] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    let active = true;
    axios.get<ApiResponse<MarketplaceProduct>>(`/api/marketplace/products/${productId}`)
      .then(({ data }) => { if (active) setProduct(data.data); })
      .catch(() => { if (active) setError("This product is unavailable or could not be loaded."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [productId]);

  async function addToCart() {
    setAdding(true);
    setCartMessage("");
    try {
      await axios.post("/api/cart/items", { productId, quantity: 1 });
      setCartMessage("Added to your cart.");
    } catch (cause) {
      if (axios.isAxiosError<{ error?: string }>(cause)) {
        setCartMessage(cause.response?.status === 401 || cause.response?.status === 403
          ? "An active Student or Faculty account is required to add products to your cart."
          : cause.response?.data.error ?? "Could not add this product to your cart.");
      } else {
        setCartMessage("Could not add this product to your cart.");
      }
    } finally {
      setAdding(false);
    }
  }

  if (loading) return <p role="status" className="py-8 text-sm text-muted-foreground">Loading product…</p>;
  if (error || !product) return <p role="alert" className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">{error || "Product not found."}</p>;

  return (
    <div className="space-y-5">
      <Link href={`/marketplace/canteens/${product.canteen._id}`} className="text-sm text-primary underline underline-offset-4">{product.canteen.canteenName}</Link>
      <Card className="overflow-hidden">
        <div className="grid md:grid-cols-2">
          {product.image ? <div className="relative min-h-64 bg-muted md:min-h-96"><RemoteImage src={product.image} alt={product.name} sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" /></div> : <div className="flex min-h-64 items-center justify-center bg-muted text-sm text-muted-foreground md:min-h-96">No image provided</div>}
          <div><CardHeader><p className="text-sm text-muted-foreground">{product.category.name}</p><CardTitle className="text-2xl">{product.name}</CardTitle></CardHeader><CardContent className="space-y-5">
            <p className="whitespace-pre-wrap text-sm leading-6">{product.description}</p>
            <div className="flex items-baseline gap-3"><span className="text-xl font-semibold">PKR {(product.discountPrice ?? product.price).toFixed(2)}</span>{product.discountPrice !== undefined && <span className="text-muted-foreground line-through">PKR {product.price.toFixed(2)}</span>}</div>
            <p className="text-sm text-muted-foreground">Preparation time: {product.preparationTime} minutes</p>
            <p className="text-sm">{product.stockQuantity} in stock</p>
            {cartMessage && <p role="status" className="rounded-md bg-secondary p-3 text-sm">{cartMessage}</p>}
            <div className="flex flex-wrap items-center gap-3"><Button onClick={() => void addToCart()} disabled={adding}>{adding ? "Adding…" : "Add to cart"}</Button><Button asChild variant="outline"><Link href="/cart">View cart</Link></Button></div>
          </CardContent></div>
        </div>
      </Card>
    </div>
  );
}
