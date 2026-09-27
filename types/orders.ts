import type { CustomerType, OrderStatus } from "@/types";

export interface CartLineView {
  productId: string;
  product: null | {
    _id: string;
    name: string;
    description: string;
    image: string;
    canteenName: string;
    categoryName: string;
    stockQuantity: number;
  };
  quantity: number;
  unitPrice: number;
  subtotal: number;
  available: boolean;
  canAdjust: boolean;
}

export interface CartSummary {
  items: CartLineView[];
  subtotal: number;
  total: number;
  currency: "PKR";
  isOrderable: boolean;
}

export interface OrderLineSnapshot {
  product: string;
  productName: string;
  categoryName: string;
  image: string;
  originalUnitPrice: number;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface CustomerOrder {
  _id: string;
  customerType: CustomerType;
  canteen: string;
  canteenName: string;
  items: OrderLineSnapshot[];
  subtotal: number;
  total: number;
  status: OrderStatus;
  paymentMethod: "CASH_ON_PICKUP";
  createdAt: string;
  updatedAt: string;
}
