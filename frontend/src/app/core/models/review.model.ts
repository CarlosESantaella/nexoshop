export interface Review {
  id: number;
  rating: number;
  title?: string;
  comment?: string;
  is_approved: boolean;
  user: { id: number; name: string };
  created_at: string;
}

export interface ReviewStats {
  average: number;
  total: number;
  breakdown: Record<number, { count: number; percentage: number }>;
}

export interface CreateReviewRequest {
  rating: number;
  title?: string;
  comment?: string;
}
