export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  is_active: boolean;
  sort_order: number;
  parent_id?: number;
  products_count?: number;
  children?: Category[];
  parent?: Category;
}
