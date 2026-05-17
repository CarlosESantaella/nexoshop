import { Category } from './category.model';
import { Review } from './review.model';

export interface Product {
  id: number;
  name: string;
  slug: string;
  description?: string;
  short_description?: string;
  price: number;
  compare_price?: number;
  discount_percent: number;
  is_on_sale: boolean;
  sku?: string;
  stock: number;
  is_active: boolean;
  is_featured: boolean;
  weight?: number;
  meta_title?: string;
  meta_description?: string;
  primary_image?: string;
  average_rating: number;
  review_count: number;
  category?: Category;
  images?: ProductImage[];
  reviews?: Review[];
  created_at: string;
}

export interface ProductImage {
  id: number;
  image_path: string;
  alt_text?: string;
  sort_order: number;
  is_primary: boolean;
}

export interface ProductFilters {
  category?: string;
  min_price?: number;
  max_price?: number;
  search?: string;
  sort_by?: string;
  in_stock?: boolean;
  featured?: boolean;
  rating?: number;
  page?: number;
  per_page?: number;
}
