export function toCents(amount: number): number {
  return Math.round(amount * 100);
}

export function fromCents(cents: number): number {
  return cents / 100;
}

export function effectiveUnitPriceCents(product: {
  price: number;
  discountPrice?: number | null;
}): number {
  const discounted = product.discountPrice;
  return toCents(
    discounted !== undefined && discounted !== null && discounted < product.price
      ? discounted
      : product.price
  );
}
