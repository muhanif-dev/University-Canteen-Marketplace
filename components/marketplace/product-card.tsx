import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";
import { RemoteImage } from "@/components/marketplace/remote-image";
import type { MarketplaceProduct } from "@/types/marketplace";

export function ProductCard({ product }: { product: MarketplaceProduct }) {
  return (
    <Card className="overflow-hidden">
      <Link href={`/marketplace/products/${product._id}`} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        {product.image ? (
          <div className="relative aspect-[4/3] bg-muted">
            <RemoteImage src={product.image} alt={product.name} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-cover" />
          </div>
        ) : <div className="flex aspect-[4/3] items-center justify-center bg-muted text-sm text-muted-foreground">No image provided</div>}
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground">{product.category.name} · {product.canteen.canteenName}</p>
          <h3 className="mt-2 line-clamp-1 font-semibold">{product.name}</h3>
          <p className="mt-1 line-clamp-2 min-h-10 text-sm text-muted-foreground">{product.description}</p>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-semibold">PKR {(product.discountPrice ?? product.price).toFixed(2)}</span>
            {product.discountPrice !== undefined && <span className="text-sm text-muted-foreground line-through">PKR {product.price.toFixed(2)}</span>}
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
