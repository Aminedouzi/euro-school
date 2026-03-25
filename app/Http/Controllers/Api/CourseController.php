<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class CourseController extends Controller
{
    private function scheduleRules(): array
    {
        return [
            'schedules' => ['nullable', 'array'],
            'schedules.*.weekday' => ['required', 'integer', 'between:1,7'],
            'schedules.*.start_time' => ['required', 'date_format:H:i'],
            'schedules.*.end_time' => ['required', 'date_format:H:i'],
        ];
    }

    /**
     * @param  array<int, array{weekday: int, start_time: string, end_time: string}>  $schedules
     */
    private function assertSchedulesLogical(array $schedules): void
    {
        foreach ($schedules as $i => $slot) {
            if (strcmp($slot['end_time'], $slot['start_time']) <= 0) {
                throw ValidationException::withMessages([
                    "schedules.$i.end_time" => ['La heure de fin doit être après le début.'],
                ]);
            }
        }
    }

    /**
     * @param  array<int, array{weekday: int, start_time: string, end_time: string}>  $schedules
     */
    private function syncCourseSchedules(Course $course, array $schedules): void
    {
        $course->schedules()->delete();
        foreach (array_values($schedules) as $order => $row) {
            $course->schedules()->create([
                'weekday' => (int) $row['weekday'],
                'start_time' => $row['start_time'],
                'end_time' => $row['end_time'],
                'sort_order' => $order,
            ]);
        }
    }

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Course::query()->with(['teachers', 'school', 'schedules']);

        if ($user->role === 'admin') {
            return response()->json([
                'courses' => Course::with(['teachers', 'students', 'school', 'schedules'])
                    ->orderBy('title')
                    ->get(),
            ]);
        }
        if ($user->role === 'student') {
            $query->where('is_active', true)
                ->whereHas('students', fn ($q) => $q->where('users.id', $user->id));
        }
        if ($user->role === 'teacher') {
            $query->where(function ($q) use ($user) {
                $q->where('teacher_id', $user->id)
                    ->orWhereHas('teachers', fn ($t) => $t->where('users.id', $user->id));
            });
        }

        $courses = $query->orderBy('title')->get();

        return response()->json(['courses' => $courses]);
    }

    public function store(Request $request): JsonResponse
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Seuls les administrateurs peuvent créer des cours'], 403);
        }

        $validated = $request->validate(array_merge([
            'school_id' => ['required', 'exists:schools,id'],
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
        ], $this->scheduleRules()));

        $validated['max_students'] = $validated['max_students'] ?? 30;
        $validated['is_active'] = $validated['is_active'] ?? true;

        $schedules = $validated['schedules'] ?? [];
        unset($validated['schedules']);

        $this->assertSchedulesLogical($schedules);

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
        if ($schedules !== []) {
            $this->syncCourseSchedules($course, $schedules);
        }

        return response()->json(['course' => $course->load(['teachers', 'students', 'school', 'schedules'])], 201);
    }

    public function show(Course $course): JsonResponse
    {
        $course->load(['teachers', 'students', 'school', 'schedules']);
        return response()->json(['course' => $course]);
    }

    public function update(Request $request, Course $course): JsonResponse
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Seuls les administrateurs peuvent modifier des cours'], 403);
        }

        $validated = $request->validate(array_merge([
            'school_id' => ['sometimes', 'required', 'exists:schools,id'],
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
        ], $this->scheduleRules()));

        $syncSchedules = array_key_exists('schedules', $validated);
        $schedules = $validated['schedules'] ?? [];
        if ($syncSchedules) {
            unset($validated['schedules']);
            $this->assertSchedulesLogical($schedules);
        }

        $course->update($validated);
        if (isset($validated['teacher_ids'])) {
            $course->teachers()->sync($validated['teacher_ids']);
        }
        if (isset($validated['student_ids'])) {
            $course->students()->sync($validated['student_ids']);
        }
        if ($syncSchedules) {
            $this->syncCourseSchedules($course, $schedules);
        }

        return response()->json(['course' => $course->fresh()->load(['teachers', 'students', 'school', 'schedules'])]);
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
