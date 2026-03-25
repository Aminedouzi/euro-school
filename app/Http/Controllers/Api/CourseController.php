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
        $query = Course::query()->with(['teachers']);

        if ($user->role === 'admin') {
            return response()->json([
                'courses' => Course::with(['teachers', 'students'])
                    ->orderBy('title')
                    ->get(),
            ]);
        }
        if ($user->role === 'student') {
            return response()->json([
                'courses' => Course::query()
                    ->with(['teachers'])
                    ->where('is_active', true)
                    ->orderBy('title')
                    ->get(),
            ]);
        }
        if ($user->role === 'teacher') {
            $query->where(function ($q) use ($user) {
                $q->where('teacher_id', $user->id)
                    ->orWhereHas('teachers', fn ($t) => $t->where('users.id', $user->id));
            });
        }

        return response()->json(['courses' => $query->orderBy('title')->get()]);
    }

    public function store(Request $request): JsonResponse
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Seuls les administrateurs peuvent créer des cours'], 403);
        }

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'type' => ['required', 'string', 'in:communication,langue'],
            'description' => ['nullable', 'string'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'teacher_ids' => ['array'],
            'teacher_ids.*' => ['exists:users,id'],
            'student_ids' => ['array'],
            'student_ids.*' => ['exists:users,id'],
            'max_students' => ['integer', 'min:1', 'max:500'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $validated['max_students'] = $validated['max_students'] ?? 30;
        $validated['is_active'] = $validated['is_active'] ?? true;

        $teacherIds = $validated['teacher_ids'] ?? [];
        $studentIds = $validated['student_ids'] ?? [];
        unset($validated['teacher_ids'], $validated['student_ids']);

        $course = Course::create($validated);
        if ($teacherIds !== []) {
            $course->teachers()->sync($teacherIds);
        }
        if ($studentIds !== []) {
            $course->students()->sync($studentIds);
        }

        return response()->json(['course' => $course->load(['teachers', 'students'])], 201);
    }

    public function show(Course $course): JsonResponse
    {
        $course->load(['teachers', 'students']);

        return response()->json(['course' => $course]);
    }

    public function update(Request $request, Course $course): JsonResponse
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Seuls les administrateurs peuvent modifier des cours'], 403);
        }

        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'type' => ['sometimes', 'string', 'in:communication,langue'],
            'description' => ['nullable', 'string'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date'],
            'teacher_ids' => ['array'],
            'teacher_ids.*' => ['exists:users,id'],
            'student_ids' => ['array'],
            'student_ids.*' => ['exists:users,id'],
            'max_students' => ['sometimes', 'integer', 'min:1', 'max:500'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $course->update($validated);
        if (isset($validated['teacher_ids'])) {
            $course->teachers()->sync($validated['teacher_ids']);
        }
        if (isset($validated['student_ids'])) {
            $course->students()->sync($validated['student_ids']);
        }

        return response()->json(['course' => $course->fresh()->load(['teachers', 'students'])]);
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
