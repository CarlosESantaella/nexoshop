<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Address;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AddressController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $addresses = Address::where('user_id', $request->user()->id)
            ->orderByDesc('is_default')->latest()->get();

        return $this->successResponse($addresses);
    }

    public function store(Request $request)
    {
        $request->validate([
            'label' => 'nullable|string|max:50',
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'address_line_1' => 'required|string|max:255',
            'address_line_2' => 'nullable|string|max:255',
            'city' => 'required|string|max:255',
            'state' => 'required|string|max:255',
            'postal_code' => 'required|string|max:20',
            'country' => 'nullable|string|max:2',
            'phone' => 'nullable|string|max:20',
            'is_default' => 'boolean',
        ]);

        $data = $request->only('label', 'first_name', 'last_name', 'address_line_1', 'address_line_2', 'city', 'state', 'postal_code', 'country', 'phone', 'is_default');
        $data['user_id'] = $request->user()->id;

        $address = DB::transaction(function () use ($request, $data) {
            if ($request->boolean('is_default')) {
                Address::where('user_id', $request->user()->id)->update(['is_default' => false]);
            }
            return Address::create($data);
        });

        return $this->successResponse($address, 'Address saved', 201);
    }

    public function update(Request $request, Address $address)
    {
        if ($address->user_id !== $request->user()->id) {
            return $this->errorResponse('Unauthorized', 403);
        }

        $request->validate([
            'label' => 'nullable|string|max:50',
            'first_name' => 'sometimes|string|max:255',
            'last_name' => 'sometimes|string|max:255',
            'address_line_1' => 'sometimes|string|max:255',
            'address_line_2' => 'nullable|string|max:255',
            'city' => 'sometimes|string|max:255',
            'state' => 'sometimes|string|max:255',
            'postal_code' => 'sometimes|string|max:20',
            'country' => 'nullable|string|max:2',
            'phone' => 'nullable|string|max:20',
            'is_default' => 'boolean',
        ]);

        $address = DB::transaction(function () use ($request, $address) {
            if ($request->boolean('is_default')) {
                Address::where('user_id', $request->user()->id)->update(['is_default' => false]);
            }
            $address->update($request->only('label', 'first_name', 'last_name', 'address_line_1', 'address_line_2', 'city', 'state', 'postal_code', 'country', 'phone', 'is_default'));
            return $address->fresh();
        });

        return $this->successResponse($address, 'Address updated');
    }

    public function destroy(Request $request, Address $address)
    {
        if ($address->user_id !== $request->user()->id) {
            return $this->errorResponse('Unauthorized', 403);
        }

        $address->delete();
        return $this->successResponse(null, 'Address deleted');
    }

    public function setDefault(Request $request, Address $address)
    {
        if ($address->user_id !== $request->user()->id) {
            return $this->errorResponse('Unauthorized', 403);
        }

        DB::transaction(function () use ($request, $address) {
            Address::where('user_id', $request->user()->id)->update(['is_default' => false]);
            $address->update(['is_default' => true]);
        });

        return $this->successResponse(null, 'Default address set');
    }
}
