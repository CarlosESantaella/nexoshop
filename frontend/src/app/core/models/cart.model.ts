export interface Cart {
  id: number;
  items: CartItem[];
  total: number;
  item_count: number;
  session_id?: string;
  shipping_cost?: number;
  free_shipping_threshold?: number;
  currency?: string;
}

export interface CartItem {
  id: number;
  product_id: number;
  product: {
    id: number;
    name: string;
    slug: string;
    price: number;
    stock: number;
    primary_image?: string;
  };
  quantity: number;
  price: number;
  subtotal: number;
}

export interface AddToCartRequest {
  product_id: number;
  quantity?: number;
}
