<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ReviewResource;
use App\Models\Review;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $request->validate([
            'per_page' => 'integer|min:1|max:100',
        ]);

        $query = Review::with(['user:id,name', 'product:id,name,slug']);

        if ($request->filled('status')) {
            $query = match ($request->status) {
                'approved' => $query->where('is_approved', true),
                'pending' => $query->where('is_approved', false),
                default => $query,
            };
        }

        $reviews = $query->latest()->paginate($request->input('per_page', 15));

        return $this->successResponse([
            'reviews' => $reviews->items(),
            'meta' => [
                'current_page' => $reviews->currentPage(),
                'last_page' => $reviews->lastPage(),
                'total' => $reviews->total(),
            ],
        ]);
    }

    public function approve(Review $review)
    {
        $review->update(['is_approved' => true]);
        return $this->successResponse(null, 'Review approved');
    }

    public function reject(Review $review)
    {
        $review->update(['is_approved' => false]);
        return $this->successResponse(null, 'Review rejected');
    }
}
