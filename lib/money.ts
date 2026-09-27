import { ConflictError } from "@/lib/errors";

export function toCents(amount: number): number {
  const cents = Math.round(amount * 100);
  if (!Number.isFinite(amount) || amount < 0 || !Number.isSafeInteger(cents)) {
    throw new ConflictError("A price is outside the supported range.");
  }
  return cents;
}

export function fromCents(cents: number): number {
  if (!Number.isSafeInteger(cents) || cents < 0) {
    throw new ConflictError("The cart total is outside the supported range.");
  }
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
