<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $request->validate([
            'per_page' => 'integer|min:1|max:100',
        ]);

        $query = User::withCount('orders')
            ->withSum('orders', 'total');

        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        $users = $query->latest()->paginate($request->input('per_page', 15));

        return $this->successResponse([
            'users' => $users->items(),
            'meta' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'total' => $users->total(),
            ],
        ]);
    }

    public function show(User $user)
    {
        $user->loadCount('orders');
        $user->loadSum('orders', 'total');
        $user->load(['orders' => function ($q) {
            $q->latest()->limit(10);
        }]);

        return $this->successResponse($user);
    }

    public function toggleActive(Request $request, User $user)
    {
        if ($user->id === $request->user()->id) {
            return $this->errorResponse('You cannot deactivate your own account', 422);
        }

        $user->update(['is_active' => !$user->is_active]);
        return $this->successResponse(['is_active' => $user->is_active]);
    }
}
