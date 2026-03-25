<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\School;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

class SchoolController extends Controller
{
    private function schoolsTableMissingResponse(): JsonResponse
    {
        return response()->json([
            'message' => 'La table schools est absente. Exécutez : php artisan migrate',
        ], 503);
    }

    public function index(Request $request): JsonResponse
    {
        if (! Schema::hasTable('schools')) {
            return response()->json(['schools' => []]);
        }

        $schools = School::query()->orderBy('name')->get();

        return response()->json(['schools' => $schools]);
    }

    public function store(Request $request): JsonResponse
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        if (! Schema::hasTable('schools')) {
            return $this->schoolsTableMissingResponse();
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => ['nullable', 'string', 'max:50'],
            'address' => ['nullable', 'string', 'max:500'],
        ]);

        $school = School::create($validated);

        return response()->json(['school' => $school], 201);
    }

    public function update(Request $request, School $school): JsonResponse
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'code' => ['nullable', 'string', 'max:50'],
            'address' => ['nullable', 'string', 'max:500'],
        ]);

        $school->update($validated);

        return response()->json(['school' => $school->fresh()]);
    }

    public function destroy(Request $request, School $school): JsonResponse
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        if ($school->courses()->exists() || $school->users()->exists()) {
            return response()->json(['message' => 'Impossible de supprimer une école encore utilisée'], 422);
        }

        $school->delete();

        return response()->json(['message' => 'École supprimée'], 200);
    }
}
