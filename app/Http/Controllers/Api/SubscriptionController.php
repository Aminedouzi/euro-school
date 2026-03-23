<?php

namespace App\Http\Controllers\Api;

use App\Models\Subscription;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SubscriptionController
{
    /**
     * Get all subscriptions (with admin filtering).
     */
    public function index(): JsonResponse
    {
        $subscriptions = Subscription::with('user')
            ->orderBy('start_date', 'desc')
            ->get()
            ->map(function ($sub) {
                return [
                    'id' => $sub->id,
                    'user_id' => $sub->user_id,
                    'user_name' => $sub->user->name,
                    'user_email' => $sub->user->email,
                    'plan_name' => $sub->plan_name,
                    'plan_type' => $sub->plan_type,
                    'price' => $sub->price,
                    'billing_cycle' => $sub->billing_cycle,
                    'status' => $sub->status,
                    'start_date' => $sub->start_date->format('Y-m-d'),
                    'end_date' => $sub->end_date?->format('Y-m-d'),
                    'auto_renew' => $sub->auto_renew,
                    'description' => $sub->description,
                    'is_active' => $sub->isActive(),
                ];
            });

        return response()->json($subscriptions);
    }

    /**
     * Create a new subscription.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'plan_name' => 'required|string|max:50',
            'plan_type' => 'required|string|max:50',
            'price' => 'required|numeric|min:0',
            'billing_cycle' => 'required|in:monthly,quarterly,annual',
            'status' => 'in:active,inactive,cancelled,expired',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'auto_renew' => 'boolean',
            'description' => 'nullable|string',
        ]);

        $subscription = Subscription::create($validated);

        return response()->json([
            'id' => $subscription->id,
            'user_id' => $subscription->user_id,
            'user_name' => $subscription->user->name,
            'plan_name' => $subscription->plan_name,
            'plan_type' => $subscription->plan_type,
            'price' => $subscription->price,
            'billing_cycle' => $subscription->billing_cycle,
            'status' => $subscription->status,
            'start_date' => $subscription->start_date->format('Y-m-d'),
            'end_date' => $subscription->end_date->format('Y-m-d'),
            'auto_renew' => $subscription->auto_renew,
            'description' => $subscription->description,
        ], 201);
    }

    /**
     * Update subscription.
     */
    public function update(Request $request, Subscription $subscription): JsonResponse
    {
        $validated = $request->validate([
            'plan_name' => 'string|max:50',
            'plan_type' => 'string|max:50',
            'price' => 'numeric|min:0',
            'billing_cycle' => 'in:monthly,quarterly,annual',
            'status' => 'in:active,inactive,cancelled,expired',
            'end_date' => 'date',
            'auto_renew' => 'boolean',
            'description' => 'nullable|string',
        ]);

        $subscription->update($validated);

        return response()->json([
            'id' => $subscription->id,
            'user_id' => $subscription->user_id,
            'user_name' => $subscription->user->name,
            'plan_name' => $subscription->plan_name,
            'plan_type' => $subscription->plan_type,
            'price' => $subscription->price,
            'billing_cycle' => $subscription->billing_cycle,
            'status' => $subscription->status,
            'start_date' => $subscription->start_date->format('Y-m-d'),
            'end_date' => $subscription->end_date->format('Y-m-d'),
            'auto_renew' => $subscription->auto_renew,
            'description' => $subscription->description,
        ]);
    }

    /**
     * Delete subscription.
     */
    public function destroy(Subscription $subscription): JsonResponse
    {
        $subscription->delete();
        return response()->json(['message' => 'Subscription deleted']);
    }

    /**
     * Get active subscriptions count.
     */
    public function activeCount(): JsonResponse
    {
        $count = Subscription::active()->count();
        return response()->json(['active_subscriptions' => $count]);
    }

    /**
     * Get subscriptions by user.
     */
    public function userSubscriptions($userId): JsonResponse
    {
        $subscriptions = Subscription::where('user_id', $userId)
            ->orderBy('start_date', 'desc')
            ->get();

        return response()->json($subscriptions);
    }
}
