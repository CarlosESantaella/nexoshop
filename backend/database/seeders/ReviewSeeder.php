<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\Review;
use App\Models\User;
use Illuminate\Database\Seeder;

class ReviewSeeder extends Seeder
{
    public function run(): void
    {
        $customers = User::where('role', 'customer')->get();
        $products = Product::all();

        $comments = [
            5 => [
                'Excellent product! Exactly what I was looking for.',
                'Amazing quality, highly recommended!',
                'Best purchase I have made this year. Love it!',
                'Outstanding quality and fast shipping.',
                'Perfect! Exceeded my expectations.',
            ],
            4 => [
                'Great product, minor improvements could be made.',
                'Very good quality for the price.',
                'Happy with my purchase, would buy again.',
                'Good product, delivery was quick.',
            ],
            3 => [
                'Decent product, nothing extraordinary.',
                'It is okay, does what it is supposed to do.',
                'Average quality, expected a bit more.',
            ],
            2 => [
                'Below expectations, quality could be better.',
                'Not very impressed with this product.',
            ],
            1 => [
                'Disappointed with the quality.',
            ],
        ];

        foreach ($products as $product) {
            $numReviews = rand(2, 6);
            $reviewers = $customers->random(min($numReviews, $customers->count()));

            foreach ($reviewers as $reviewer) {
                $rating = $this->weightedRating();
                $ratingComments = $comments[$rating];

                Review::create([
                    'product_id' => $product->id,
                    'user_id' => $reviewer->id,
                    'rating' => $rating,
                    'title' => $rating >= 4 ? 'Great product!' : ($rating >= 3 ? 'It is okay' : 'Could be better'),
                    'comment' => $ratingComments[array_rand($ratingComments)],
                    'is_approved' => rand(1, 10) <= 8,
                ]);
            }
        }
    }

    private function weightedRating(): int
    {
        $rand = rand(1, 100);
        if ($rand <= 40) return 5;
        if ($rand <= 70) return 4;
        if ($rand <= 85) return 3;
        if ($rand <= 95) return 2;
        return 1;
    }
}
