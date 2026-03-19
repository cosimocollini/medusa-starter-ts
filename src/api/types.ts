export interface ProductVariant {
  id: string;
  title: string;
  prices: {
    amount: number;
    currency_code: string;
  }[];
}

export interface Product {
  id: string;
  title: string;
  handle: string;
  thumbnail: string;
  description: string;
  variants: ProductVariant[];
}

export interface ProductListResponse {
  products: Product[];
  count: number;
  offset: number;
  limit: number;
}

export interface LineItem {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  unit_price: number;
  variant_id: string;
  quantity: number;
}

export interface PaymentSession {
  id: string;
  provider_id: string;
  data: {
    client_secret?: string;
    [key: string]: any;
  };
}

export interface Cart {
  id: string;
  items: LineItem[];
  region_id?: string;
  subtotal: number;
  tax_total: number;
  total: number;
  payment_session?: PaymentSession;
  payment_sessions?: PaymentSession[];
}

export interface CartResponse {
  cart: Cart;
}

// Stripe Global Declaration
declare global {
  interface Window {
    Stripe?: any;
  }
}
