<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ReviewResource;
use App\Models\Product;
use App\Models\Review;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    use ApiResponse;

    public function index(Product $product, Request $request)
    {
        $request->validate([
            'per_page' => 'integer|min:1|max:100',
        ]);

        $reviews = $product->approvedReviews()
            ->with('user')
            ->latest()
            ->paginate($request->input('per_page', 15));

        $totalReviews = $product->approvedReviews()->count();
        $avgRating = round($product->approvedReviews()->avg('rating') ?? 0, 1);
        $ratingCounts = $product->approvedReviews()
            ->selectRaw('rating, count(*) as count')
            ->groupBy('rating')
            ->pluck('count', 'rating');

        $stats = [
            'average' => $avgRating,
            'total' => $totalReviews,
            'breakdown' => collect([5, 4, 3, 2, 1])->mapWithKeys(function ($rating) use ($ratingCounts, $totalReviews) {
                $count = $ratingCounts[$rating] ?? 0;
                return [$rating => [
                    'count' => $count,
                    'percentage' => $totalReviews > 0 ? round(($count / $totalReviews) * 100) : 0,
                ]];
            }),
        ];

        return $this->successResponse([
            'reviews' => ReviewResource::collection($reviews),
            'stats' => $stats,
            'meta' => [
                'current_page' => $reviews->currentPage(),
                'last_page' => $reviews->lastPage(),
                'total' => $reviews->total(),
            ],
        ]);
    }

    public function store(Request $request, Product $product)
    {
        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'title' => 'nullable|string|max:255',
            'comment' => 'nullable|string|max:2000',
        ]);

        $existing = Review::where('product_id', $product->id)
            ->where('user_id', $request->user()->id)->first();

        if ($existing) {
            return $this->errorResponse('You have already reviewed this product', 422);
        }

        $review = Review::create([
            'product_id' => $product->id,
            'user_id' => $request->user()->id,
            'rating' => $request->rating,
            'title' => $request->title,
            'comment' => $request->comment,
            'is_approved' => false,
        ]);

        return $this->successResponse(
            new ReviewResource($review->load('user')),
            'Review submitted for approval', 201
        );
    }
}
