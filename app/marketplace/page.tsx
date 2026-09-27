import { MarketplaceBrowser } from "@/components/marketplace/marketplace-browser";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function MarketplacePage() {
  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-medium text-muted-foreground">University Canteens</p><h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Marketplace</h1><p className="mt-3 max-w-2xl text-muted-foreground">Explore approved campus canteens and browse their currently available products.</p></div><div className="flex gap-2"><Button asChild variant="outline"><Link href="/orders">Your orders</Link></Button><Button asChild><Link href="/cart">Your cart</Link></Button></div></div>
      <MarketplaceBrowser />
    </main>
  );
}
