export interface Coupon {
  id: number;
  code: string;
  type: 'fixed' | 'percentage';
  value: number;
  min_order_amount?: number;
  max_uses?: number;
  used_count: number;
  starts_at?: string;
  expires_at?: string;
  is_active: boolean;
}

export interface CouponValidation {
  coupon: { id: number; code: string; type: string; value: number };
  discount: number;
  new_total: number;
}
