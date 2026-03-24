<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\School;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SchoolController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $schools = School::query()->orderBy('name')->get();

        return response()->json(['schools' => $schools]);
    }

    public function store(Request $request): JsonResponse
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Non autorisé'], 403);
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
