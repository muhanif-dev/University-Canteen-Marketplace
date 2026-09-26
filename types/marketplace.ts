export interface MarketplaceCanteen {
  _id: string;
  canteenName: string;
  description: string;
  location: string;
  building: string;
  openingTime: string;
  closingTime: string;
  logoUrl: string;
  coverImageUrl?: string;
}

export interface MarketplaceCategory {
  _id: string;
  name: string;
  description?: string;
  canteen?: { _id: string; canteenName: string };
}

export interface MarketplaceProduct {
  _id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  image: string;
  stockQuantity: number;
  isAvailable: boolean;
  preparationTime: number;
  category: { _id: string; name: string; description?: string };
  canteen: MarketplaceCanteen;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
