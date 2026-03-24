<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CourseController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Course::query()->with(['teacher', 'school']);

        if ($user->role === 'admin') {
            // Les admins voient tous les cours
            return response()->json(['courses' => Course::with(['teacher', 'school'])->orderBy('title')->get()]);
        }
        if ($user->role === 'student') {
            $query->where('is_active', true);
        }
        if ($user->role === 'teacher') {
            $query->where('teacher_id', $user->id);
        }

        $courses = $query->orderBy('title')->get();

        return response()->json(['courses' => $courses]);
    }

    public function store(Request $request): JsonResponse
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Seuls les administrateurs peuvent créer des cours'], 403);
        }

        $validated = $request->validate([
            'school_id' => ['required', 'exists:schools,id'],
            'title' => ['required', 'string', 'max:255'],
            'type' => ['required', 'string', 'in:communication,langue'],
            'description' => ['nullable', 'string'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'teacher_id' => ['nullable', 'exists:users,id'],
            'max_students' => ['integer', 'min:1', 'max:500'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $validated['teacher_id'] = $validated['teacher_id'] ?? null;
        $validated['max_students'] = $validated['max_students'] ?? 30;
        $validated['is_active'] = $validated['is_active'] ?? true;

        $course = Course::create($validated);

        return response()->json(['course' => $course->load(['teacher', 'school'])], 201);
    }

    public function show(Course $course): JsonResponse
    {
        $course->load(['teacher', 'students', 'school']);
        return response()->json(['course' => $course]);
    }

    public function update(Request $request, Course $course): JsonResponse
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Seuls les administrateurs peuvent modifier des cours'], 403);
        }

        $validated = $request->validate([
            'school_id' => ['sometimes', 'required', 'exists:schools,id'],
            'title' => ['sometimes', 'string', 'max:255'],
            'type' => ['sometimes', 'string', 'in:communication,langue'],
            'description' => ['nullable', 'string'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date'],
            'teacher_id' => ['nullable', 'exists:users,id'],
            'max_students' => ['sometimes', 'integer', 'min:1', 'max:500'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $course->update($validated);

        return response()->json(['course' => $course->fresh()->load(['teacher', 'school'])]);
    }

    public function destroy(Course $course): JsonResponse
    {
        if (request()->user()->role !== 'admin') {
            return response()->json(['message' => 'Seuls les administrateurs peuvent supprimer des cours'], 403);
        }

        $course->delete();
        return response()->json(['message' => 'Cours supprimé avec succès'], 200);
    }

    public function enroll(Request $request, Course $course): JsonResponse
    {
        $studentId = $request->input('user_id', $request->user()->id);
        if ($course->students()->where('user_id', $studentId)->exists()) {
            return response()->json(['message' => 'Déjà inscrit'], 422);
        }
        if ($course->students()->count() >= $course->max_students) {
            return response()->json(['message' => 'Cours complet'], 422);
        }
        $course->students()->attach($studentId, ['enrolled_at' => now(), 'status' => 'active']);
        return response()->json(['message' => 'Inscription réussie'], 201);
    }

    public function unenroll(Request $request, Course $course): JsonResponse
    {
        $studentId = $request->input('user_id', $request->user()->id);
        $course->students()->detach($studentId);
        return response()->json(['message' => 'Désinscription effectuée']);
    }
}
