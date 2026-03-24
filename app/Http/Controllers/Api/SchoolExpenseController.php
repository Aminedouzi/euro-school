<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SchoolExpense;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SchoolExpenseController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = SchoolExpense::query()->with('school')->orderByDesc('paid_on');

        if ($request->filled('school_id')) {
            $query->where('school_id', (int) $request->query('school_id'));
        }

        return response()->json(['expenses' => $query->get()]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'school_id' => ['required', 'exists:schools,id'],
            'title' => ['required', 'string', 'max:255'],
            'vendor' => ['nullable', 'string', 'max:255'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'paid_on' => ['required', 'date'],
            'method' => ['required', 'string', 'in:card,bank_transfer,cash,check,other'],
            'reference' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $expense = SchoolExpense::create($validated);

        return response()->json(['expense' => $expense->load('school')], 201);
    }

    public function update(Request $request, SchoolExpense $schoolExpense): JsonResponse
    {
        $validated = $request->validate([
            'school_id' => ['sometimes', 'required', 'exists:schools,id'],
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'vendor' => ['nullable', 'string', 'max:255'],
            'amount' => ['sometimes', 'required', 'numeric', 'min:0.01'],
            'paid_on' => ['sometimes', 'required', 'date'],
            'method' => ['sometimes', 'required', 'string', 'in:card,bank_transfer,cash,check,other'],
            'reference' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $schoolExpense->update($validated);

        return response()->json(['expense' => $schoolExpense->fresh()->load('school')]);
    }

    public function destroy(SchoolExpense $schoolExpense): JsonResponse
    {
        $schoolExpense->delete();

        return response()->json(['message' => 'Dépense supprimée'], 200);
    }
}
