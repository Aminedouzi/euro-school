<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

class PaymentController extends Controller
{
    private function paymentsTableMissingResponse(): JsonResponse
    {
        return response()->json([
            'message' => 'La table payments est absente. Exécutez : php artisan migrate',
        ], 503);
    }

    /**
     * List all payments
     */
    public function index()
    {
        if (! Schema::hasTable('payments')) {
            return response()->json([]);
        }

        $with = ['user'];
        if (Schema::hasTable('courses')) {
            $with[] = 'course';
        }

        $payments = Payment::with($with)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($payment) {
                return [
                    'id' => $payment->id,
                    'user_id' => $payment->user_id,
                    'user_name' => $payment->user?->name,
                    'course_id' => $payment->course_id,
                    'course_name' => $payment->course?->title,
                    'amount' => (float) $payment->amount,
                    'method' => $payment->method,
                    'status' => $payment->status,
                    'reference' => $payment->reference,
                    'description' => $payment->description,
                    'payment_date' => $payment->payment_date?->format('Y-m-d H:i'),
                    'created_at' => $payment->created_at,
                ];
            });

        return response()->json($payments);
    }

    /**
     * Create a new payment
     */
    public function store(Request $request)
    {
        if (! Schema::hasTable('payments')) {
            return $this->paymentsTableMissingResponse();
        }

        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'course_id' => 'nullable|exists:courses,id',
            'amount' => 'required|numeric|min:0.01',
            'method' => 'required|in:card,bank_transfer,cash,check',
            'status' => 'sometimes|in:pending,completed,failed,refunded',
            'reference' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'payment_date' => 'nullable|date_format:Y-m-d H:i',
        ]);

        $validated['payment_date'] = $validated['payment_date'] ?? now();

        $payment = Payment::create($validated);

        return response()->json([
            'id' => $payment->id,
            'user_id' => $payment->user_id,
            'user_name' => $payment->user?->name,
            'course_id' => $payment->course_id,
            'course_name' => $payment->course?->title,
            'amount' => (float) $payment->amount,
            'method' => $payment->method,
            'status' => $payment->status,
            'reference' => $payment->reference,
            'description' => $payment->description,
            'payment_date' => $payment->payment_date?->format('Y-m-d H:i'),
            'created_at' => $payment->created_at,
        ], 201);
    }

    /**
     * Update a payment
     */
    public function update(Request $request, Payment $payment)
    {
        $validated = $request->validate([
            'user_id' => 'sometimes|exists:users,id',
            'course_id' => 'nullable|exists:courses,id',
            'amount' => 'sometimes|numeric|min:0.01',
            'method' => 'sometimes|in:card,bank_transfer,cash,check',
            'status' => 'sometimes|in:pending,completed,failed,refunded',
            'reference' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'payment_date' => 'nullable|date_format:Y-m-d H:i',
        ]);

        $payment->update($validated);

        return response()->json([
            'id' => $payment->id,
            'user_id' => $payment->user_id,
            'user_name' => $payment->user?->name,
            'course_id' => $payment->course_id,
            'course_name' => $payment->course?->title,
            'amount' => (float) $payment->amount,
            'method' => $payment->method,
            'status' => $payment->status,
            'reference' => $payment->reference,
            'description' => $payment->description,
            'payment_date' => $payment->payment_date?->format('Y-m-d H:i'),
            'created_at' => $payment->created_at,
        ]);
    }

    /**
     * Delete a payment
     */
    public function destroy(Payment $payment)
    {
        $payment->delete();
        return response()->json(['message' => 'Paiement supprimé avec succès'], 200);
    }
}
