"use client";

import axios from "axios";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

import { ProductCard } from "@/components/marketplace/product-card";
import { RemoteImage } from "@/components/marketplace/remote-image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ApiResponse, MarketplaceCanteen, MarketplaceCategory, MarketplaceProduct } from "@/types/marketplace";

export function MarketplaceBrowser() {
  const [canteens, setCanteens] = useState<MarketplaceCanteen[]>([]);
  const [categories, setCategories] = useState<MarketplaceCategory[]>([]);
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [canteenId, setCanteenId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [loadedQuery, setLoadedQuery] = useState("");
  const [error, setError] = useState("");
  const queryKey = `${canteenId}|${categoryId}|${search}`;
  const loading = loadedQuery !== queryKey;

  useEffect(() => {
    axios.get<ApiResponse<MarketplaceCanteen[]>>("/api/marketplace/canteens")
      .then(({ data }) => setCanteens(data.data))
      .catch(() => setError("Canteens could not be loaded. Please try again."));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (canteenId) params.set("canteenId", canteenId);
    axios.get<ApiResponse<MarketplaceCategory[]>>(`/api/marketplace/categories?${params.toString()}`)
      .then(({ data }) => setCategories(data.data))
      .catch(() => setError("Categories could not be loaded. Please try again."));
  }, [canteenId]);

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams();
    if (canteenId) params.set("canteenId", canteenId);
    if (categoryId) params.set("categoryId", categoryId);
    if (search) params.set("q", search);
    axios.get<ApiResponse<MarketplaceProduct[]>>(`/api/marketplace/products?${params.toString()}`)
      .then(({ data }) => { if (active) { setProducts(data.data); setError(""); setLoadedQuery(queryKey); } })
      .catch(() => { if (active) { setError("Products could not be loaded. Please try again."); setLoadedQuery(queryKey); } });
    return () => { active = false; };
  }, [canteenId, categoryId, search, queryKey]);

  function changeCanteen(value: string) {
    setCanteenId(value);
    setCategoryId("");
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearch(searchInput.trim().slice(0, 80));
  }

  return (
    <div className="space-y-10">
      <section aria-labelledby="canteens-heading">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div><h2 id="canteens-heading" className="text-xl font-semibold">Canteens</h2><p className="mt-1 text-sm text-muted-foreground">Browse approved, active campus canteens.</p></div>
          <div className="w-52"><Label htmlFor="canteen-filter" className="sr-only">Filter by canteen</Label><select id="canteen-filter" value={canteenId} onChange={(event) => changeCanteen(event.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="">All canteens</option>{canteens.map((canteen) => <option key={canteen._id} value={canteen._id}>{canteen.canteenName}</option>)}</select></div>
        </div>
        {canteens.length === 0 ? <p className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">No approved active canteens are available yet.</p> : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {canteens.map((canteen) => (
              <Link key={canteen._id} href={`/marketplace/canteens/${canteen._id}`}>
                <Card className="h-full overflow-hidden transition-colors hover:bg-accent/40">
                  {canteen.coverImageUrl ? <div className="relative aspect-[3/1] bg-muted"><RemoteImage src={canteen.coverImageUrl} alt={`${canteen.canteenName} cover`} sizes="(max-width: 640px) 100vw, 33vw" className="object-cover" /></div> : null}
                  <CardContent className="p-4"><div className="flex items-center gap-3">{canteen.logoUrl && <div className="relative size-12 shrink-0 overflow-hidden rounded-full bg-muted"><RemoteImage src={canteen.logoUrl} alt={`${canteen.canteenName} logo`} sizes="48px" className="object-cover" /></div>}<h3 className="font-semibold">{canteen.canteenName}</h3></div><p className="mt-2 text-sm text-muted-foreground">{canteen.location} · {canteen.building}</p><p className="mt-2 line-clamp-2 text-sm">{canteen.description}</p></CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section aria-labelledby="products-heading">
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div><h2 id="products-heading" className="text-xl font-semibold">Available products</h2><p className="mt-1 text-sm text-muted-foreground">Products are shown only when available and in stock.</p></div>
          <form onSubmit={submitSearch} className="flex w-full gap-2 sm:max-w-sm"><Label htmlFor="market-search" className="sr-only">Search products</Label><Input id="market-search" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} maxLength={80} placeholder="Search products" /><Button type="submit" variant="outline">Search</Button></form>
        </div>
        <div className="mb-5 max-w-xs"><Label htmlFor="category-filter">Filter by category</Label><select id="category-filter" value={categoryId} onChange={(event) => setCategoryId(event.target.value)} className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="">All categories</option>{categories.map((category) => <option key={category._id} value={category._id}>{category.name}{category.canteen ? ` · ${category.canteen.canteenName}` : ""}</option>)}</select></div>
        {error && <p role="alert" className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
        {loading ? <p role="status" className="py-8 text-sm text-muted-foreground">Loading marketplace…</p> : products.length === 0 ? <p className="rounded-lg border border-dashed p-8 text-sm text-muted-foreground">No products match these filters.</p> : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{products.map((product) => <ProductCard key={product._id} product={product} />)}</div>}
      </section>
    </div>
  );
}
