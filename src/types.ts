export interface Product {
  id: string;
  title: string;
  category: string;
  originalPrice: number;
  price: number;
  costPrice?: number;
  priceDiscount?: number;
  priceOriginal?: number;
  discountPercent: number;
  rating: number;
  reviewsCount: number;
  stockStatus: string;
  inStock: boolean;
  remainingStock: number;
  stockRemaining?: number;
  image: string;
  imageUrl?: string;
  mainImage?: string;
  gallery: string[];
  galleryImages?: string[];
  variations?: any[];
  url?: string;
  badges: string[];
  badge?: string;
  description: string;
  installments: string;
  checkoutUrl: string;
  freeShipping: boolean;
  featured: boolean;
  flashDeal: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CategoryItem {
  id: string;
  name: string;
  icon: string;
  image: string;
}
