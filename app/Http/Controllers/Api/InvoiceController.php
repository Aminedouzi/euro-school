<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

class InvoiceController extends Controller
{
    private function paymentIdValidationRule(): array
    {
        return Schema::hasTable('payments')
            ? ['nullable', 'exists:payments,id']
            : ['nullable'];
    }

    /**
     * List all invoices
     */
    public function index()
    {
        if (! Schema::hasTable('invoices')) {
            return response()->json([]);
        }

        $query = Invoice::query()->with('user')->orderBy('created_at', 'desc');
        if (Schema::hasTable('payments')) {
            $query->with('payment');
        }

        $invoices = $query->get()
            ->map(function ($invoice) {
                return [
                    'id' => $invoice->id,
                    'invoice_number' => $invoice->invoice_number,
                    'user_id' => $invoice->user_id,
                    'user_name' => $invoice->user?->name,
                    'payment_id' => $invoice->payment_id,
                    'subtotal' => (float) $invoice->subtotal,
                    'tax' => (float) $invoice->tax,
                    'total' => (float) $invoice->total,
                    'status' => $invoice->status,
                    'issue_date' => $invoice->issue_date?->format('Y-m-d'),
                    'due_date' => $invoice->due_date?->format('Y-m-d'),
                    'description' => $invoice->description,
                    'notes' => $invoice->notes,
                    'created_at' => $invoice->created_at,
                ];
            });

        return response()->json($invoices);
    }

    /**
     * Create a new invoice
     */
    public function store(Request $request)
    {
        if (! Schema::hasTable('invoices')) {
            return response()->json([
                'message' => 'La table invoices est absente. Exécutez : php artisan migrate',
            ], 503);
        }

        $validated = $request->validate([
            'invoice_number' => 'required|string|unique:invoices,invoice_number|max:255',
            'user_id' => 'required|exists:users,id',
            'payment_id' => $this->paymentIdValidationRule(),
            'subtotal' => 'required|numeric|min:0',
            'tax' => 'sometimes|numeric|min:0',
            'total' => 'required|numeric|min:0',
            'status' => 'sometimes|in:draft,issued,paid,overdue,cancelled',
            'issue_date' => 'required|date_format:Y-m-d',
            'due_date' => 'required|date_format:Y-m-d|after_or_equal:issue_date',
            'description' => 'nullable|string',
            'notes' => 'nullable|string|max:255',
        ]);

        $validated['tax'] = $validated['tax'] ?? 0;

        $invoice = Invoice::create($validated);

        return response()->json([
            'id' => $invoice->id,
            'invoice_number' => $invoice->invoice_number,
            'user_id' => $invoice->user_id,
            'user_name' => $invoice->user?->name,
            'payment_id' => $invoice->payment_id,
            'subtotal' => (float) $invoice->subtotal,
            'tax' => (float) $invoice->tax,
            'total' => (float) $invoice->total,
            'status' => $invoice->status,
            'issue_date' => $invoice->issue_date?->format('Y-m-d'),
            'due_date' => $invoice->due_date?->format('Y-m-d'),
            'description' => $invoice->description,
            'notes' => $invoice->notes,
            'created_at' => $invoice->created_at,
        ], 201);
    }

    /**
     * Update an invoice
     */
    public function update(Request $request, Invoice $invoice)
    {
        $validated = $request->validate([
            'invoice_number' => 'sometimes|string|unique:invoices,invoice_number,' . $invoice->id . '|max:255',
            'user_id' => 'sometimes|exists:users,id',
            'payment_id' => $this->paymentIdValidationRule(),
            'subtotal' => 'sometimes|numeric|min:0',
            'tax' => 'sometimes|numeric|min:0',
            'total' => 'sometimes|numeric|min:0',
            'status' => 'sometimes|in:draft,issued,paid,overdue,cancelled',
            'issue_date' => 'sometimes|date_format:Y-m-d',
            'due_date' => 'sometimes|date_format:Y-m-d',
            'description' => 'nullable|string',
            'notes' => 'nullable|string|max:255',
        ]);

        $invoice->update($validated);

        return response()->json([
            'id' => $invoice->id,
            'invoice_number' => $invoice->invoice_number,
            'user_id' => $invoice->user_id,
            'user_name' => $invoice->user?->name,
            'payment_id' => $invoice->payment_id,
            'subtotal' => (float) $invoice->subtotal,
            'tax' => (float) $invoice->tax,
            'total' => (float) $invoice->total,
            'status' => $invoice->status,
            'issue_date' => $invoice->issue_date?->format('Y-m-d'),
            'due_date' => $invoice->due_date?->format('Y-m-d'),
            'description' => $invoice->description,
            'notes' => $invoice->notes,
            'created_at' => $invoice->created_at,
        ]);
    }

    /**
     * Delete an invoice
     */
    public function destroy(Invoice $invoice)
    {
        $invoice->delete();
        return response()->json(['message' => 'Facture supprimée avec succès'], 200);
    }
}
