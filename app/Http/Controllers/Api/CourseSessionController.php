<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\CourseSession;
use App\Models\SessionAttendance;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class CourseSessionController extends Controller
{
    private function userCanAccessCourse(Request $request, Course $course): bool
    {
        $user = $request->user();
        if ($user->role === 'admin') {
            return true;
        }
        if ($user->role === 'teacher') {
            return (int) $course->teacher_id === (int) $user->id
                || $course->teachers()->where('users.id', $user->id)->exists();
        }

        return false;
    }

    public function index(Request $request, Course $course): JsonResponse
    {
        if (! $this->userCanAccessCourse($request, $course)) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $sessions = $course->sessions()
            ->with('creator:id,name')
            ->orderByDesc('session_date')
            ->get();

        return response()->json(['sessions' => $sessions]);
    }

    public function store(Request $request, Course $course): JsonResponse
    {
        if (! $this->userCanAccessCourse($request, $course)) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }
        if (! in_array($request->user()->role, ['teacher', 'admin'], true)) {
            return response()->json(['message' => 'Seuls les professeurs peuvent créer une séance'], 403);
        }

        $validated = $request->validate([
            'session_date' => [
                'required',
                'date',
                Rule::unique('course_sessions')->where(fn ($q) => $q->where('course_id', $course->id)),
            ],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $session = $course->sessions()->create([
            'session_date' => $validated['session_date'],
            'notes' => $validated['notes'] ?? null,
            'created_by' => $request->user()->id,
        ]);
        $session->load('creator:id,name');

        return response()->json(['session' => $session], 201);
    }

    public function show(Request $request, Course $course, CourseSession $session): JsonResponse
    {
        if ((int) $session->course_id !== (int) $course->id) {
            return response()->json(['message' => 'Séance introuvable'], 404);
        }
        if (! $this->userCanAccessCourse($request, $course)) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $course->loadMissing('students');
        $attendanceByUser = $session->attendances()->get()->keyBy('user_id');
        $students = $course->students->map(function (User $s) use ($attendanceByUser) {
            $row = $attendanceByUser->get($s->id);

            return [
                'id' => $s->id,
                'name' => $s->name,
                'email' => $s->email,
                'status' => $row?->status,
            ];
        });

        return response()->json([
            'session' => $session->load('creator:id,name'),
            'students' => $students,
        ]);
    }

    public function updateAttendance(Request $request, Course $course, CourseSession $session): JsonResponse
    {
        if ((int) $session->course_id !== (int) $course->id) {
            return response()->json(['message' => 'Séance introuvable'], 404);
        }
        if (! $this->userCanAccessCourse($request, $course)) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }
        if (! in_array($request->user()->role, ['teacher', 'admin'], true)) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $validated = $request->validate([
            'attendances' => ['required', 'array', 'min:1'],
            'attendances.*.user_id' => ['required', 'integer', 'exists:users,id'],
            'attendances.*.status' => ['required', 'string', 'in:present,absent,late,excused'],
        ]);

        $enrolledIds = $course->students()->pluck('users.id')->all();
        foreach ($validated['attendances'] as $i => $row) {
            if (! in_array((int) $row['user_id'], array_map('intval', $enrolledIds), true)) {
                throw ValidationException::withMessages([
                    "attendances.$i.user_id" => ['Cet élève n’est pas inscrit à ce cours.'],
                ]);
            }
        }

        foreach ($validated['attendances'] as $row) {
            SessionAttendance::updateOrCreate(
                [
                    'course_session_id' => $session->id,
                    'user_id' => $row['user_id'],
                ],
                ['status' => $row['status']]
            );
        }

        return response()->json(['message' => 'Présences enregistrées']);
    }

    public function studentAbsencesAdmin(Request $request, User $user): JsonResponse
    {
        if ($user->role !== User::ROLE_STUDENT) {
            return response()->json(['message' => 'Cet utilisateur n’est pas un élève'], 422);
        }

        $missed = SessionAttendance::query()
            ->where('session_attendances.user_id', $user->id)
            ->where('session_attendances.status', 'absent')
            ->join('course_sessions', 'course_sessions.id', '=', 'session_attendances.course_session_id')
            ->orderByDesc('course_sessions.session_date')
            ->select('session_attendances.*')
            ->with(['courseSession.course:id,title'])
            ->get()
            ->map(function (SessionAttendance $a) {
                $cs = $a->courseSession;

                return [
                    'id' => $a->id,
                    'session_date' => $cs?->session_date?->format('Y-m-d'),
                    'course_title' => $cs?->course?->title,
                    'session_notes' => $cs?->notes,
                ];
            });

        return response()->json([
            'student' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
            'missed_sessions' => $missed,
        ]);
    }
}
