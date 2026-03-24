<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class UserController extends Controller
{
    private function generateUidForRole(string $role): string
    {
        $column = $role === User::ROLE_STUDENT ? 'student_uid' : 'teacher_uid';
        $prefix = $role === User::ROLE_STUDENT ? 'ES-MA-' : 'PR-MA-';

        $latestUid = User::where('role', $role)
            ->whereNotNull($column)
            ->lockForUpdate()
            ->orderByDesc($column)
            ->value($column);

        $nextNumber = 1;

        if ($latestUid && preg_match('/(\d+)$/', $latestUid, $matches)) {
            $nextNumber = ((int) $matches[1]) + 1;
        }

        return $prefix . str_pad((string) $nextNumber, 4, '0', STR_PAD_LEFT);
    }

    private function syncStudentCourses(User $user, array $courseIds): void
    {
        $normalized = collect($courseIds)
            ->filter(fn ($id) => $id !== null && $id !== '')
            ->map(fn ($id) => (int) $id)
            ->unique()
            ->values()
            ->all();

        if ($normalized === []) {
            $user->enrolledCourses()->detach();

            return;
        }

        $syncPayload = [];
        foreach ($normalized as $courseId) {
            $syncPayload[$courseId] = [
                'enrolled_at' => now()->toDateString(),
                'status' => 'active',
            ];
        }

        $user->enrolledCourses()->sync($syncPayload);
    }

    private function clearTeacherCourses(User $user): void
    {
        Course::where('teacher_id', $user->id)->update(['teacher_id' => null]);
    }

    private function syncTeacherCourses(User $user, array $courseIds): void
    {
        $normalizedCourseIds = collect($courseIds)
            ->filter(fn ($courseId) => $courseId !== null && $courseId !== '')
            ->map(fn ($courseId) => (int) $courseId)
            ->unique()
            ->values()
            ->all();

        if (empty($normalizedCourseIds)) {
            $this->clearTeacherCourses($user);
            return;
        }

        Course::where('teacher_id', $user->id)
            ->whereNotIn('id', $normalizedCourseIds)
            ->update(['teacher_id' => null]);

        Course::whereIn('id', $normalizedCourseIds)->update(['teacher_id' => $user->id]);
    }

    private function prepareUserAttributes(array $validated, ?User $existingUser = null): array
    {
        $targetRole = $validated['role'] ?? $existingUser?->role;
        $roleChanged = $existingUser !== null && $targetRole !== $existingUser->role;

        if ($targetRole === User::ROLE_STUDENT) {
            if ($existingUser === null || $roleChanged || empty($existingUser->student_uid)) {
                $validated['student_uid'] = $this->generateUidForRole(User::ROLE_STUDENT);
            }

            $validated['teacher_uid'] = null;
            $validated['hire_date'] = null;

            return $validated;
        }

        if ($targetRole === User::ROLE_TEACHER) {
            if ($existingUser === null || $roleChanged || empty($existingUser->teacher_uid)) {
                $validated['teacher_uid'] = $this->generateUidForRole(User::ROLE_TEACHER);
            }

            $validated['student_uid'] = null;
            $validated['birth_date'] = null;
            $validated['inscription_date'] = null;
            $validated['school_id'] = null;

            return $validated;
        }

        $validated['student_uid'] = null;
        $validated['birth_date'] = null;
        $validated['inscription_date'] = null;
        $validated['school_id'] = null;
        $validated['teacher_uid'] = null;
        $validated['hire_date'] = null;

        return $validated;
    }

    private function formatUser(User $user): array
    {
        $data = [
            'id'               => $user->id,
            'name'             => $user->name,
            'email'            => $user->email,
            'phone'            => $user->phone,
            'role'             => $user->role,
            'created_at'       => $user->created_at,
        ];

        if ($user->role === 'student') {
            $courseIds = $user->relationLoaded('enrolledCourses')
                ? $user->enrolledCourses->pluck('id')->values()->all()
                : $user->enrolledCourses()->get()->pluck('id')->values()->all();

            $data += [
                'student_uid'      => $user->student_uid,
                'birth_date'       => $user->birth_date?->format('Y-m-d'),
                'inscription_date' => $user->inscription_date?->format('Y-m-d'),
                'school_id'        => $user->school_id,
                'course_ids'       => $courseIds,
            ];
        } elseif ($user->role === 'teacher') {
            $courseIds = $user->relationLoaded('taughtCourses')
                ? $user->taughtCourses->pluck('id')->values()->all()
                : $user->taughtCourses()->pluck('id')->toArray();

            $data += [
                'teacher_uid'  => $user->teacher_uid,
                'hire_date'    => $user->hire_date?->format('Y-m-d'),
                'course_ids'   => $courseIds,
            ];
        }

        return $data;
    }

    public function index()
    {
        $users = User::with(['enrolledCourses', 'taughtCourses'])
            ->get()
            ->map(fn ($user) => $this->formatUser($user));

        return response()->json($users);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'             => 'required|string|max:255',
            'email'            => 'required|email|unique:users,email',
            'password'         => ['required', Password::defaults()],
            'phone'            => 'nullable|string|max:20',
            'role'             => 'required|in:admin,secretary,teacher,student',
            'birth_date'       => 'nullable|date',
            'inscription_date' => 'nullable|date',
            'school_id'        => 'nullable|exists:schools,id',
            'hire_date'        => 'nullable|date',
            'course_ids'       => 'nullable|array',
            'course_ids.*'     => 'exists:courses,id',
        ]);

        $courseIdsPayload = $validated['course_ids'] ?? [];
        unset($validated['course_ids']);
        $validated['password'] = Hash::make($validated['password']);

        $user = DB::transaction(function () use ($validated, $courseIdsPayload) {
            $attributes = $this->prepareUserAttributes($validated);
            $user = User::create($attributes);

            if ($user->role === User::ROLE_STUDENT) {
                $this->syncStudentCourses($user, $courseIdsPayload);
            }

            if ($user->role === User::ROLE_TEACHER) {
                $this->syncTeacherCourses($user, $courseIdsPayload);
            }

            return $user;
        });

        return response()->json($this->formatUser($user->load('taughtCourses', 'enrolledCourses')), 201);
    }

    public function show(User $user)
    {
        return response()->json($this->formatUser($user->load('taughtCourses', 'enrolledCourses')));
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name'             => 'sometimes|required|string|max:255',
            'email'            => 'sometimes|required|email|unique:users,email,' . $user->id,
            'phone'            => 'nullable|string|max:20',
            'role'             => 'sometimes|required|in:admin,secretary,teacher,student',
            'password'         => ['sometimes', 'nullable', Password::defaults()],
            'birth_date'       => 'nullable|date',
            'inscription_date' => 'nullable|date',
            'school_id'        => 'nullable|exists:schools,id',
            'hire_date'        => 'nullable|date',
            'course_ids'       => 'nullable|array',
            'course_ids.*'     => 'exists:courses,id',
        ]);

        $studentCourseIds = array_key_exists('course_ids', $validated) ? $validated['course_ids'] : false;
        $teacherCourseIds = array_key_exists('course_ids', $validated) ? $validated['course_ids'] : false;
        unset($validated['course_ids']);

        if (empty($validated['password'])) {
            unset($validated['password']);
        } else {
            $validated['password'] = Hash::make($validated['password']);
        }

        $currentRole = $user->role;
        $targetRole = $validated['role'] ?? $currentRole;

        $user = DB::transaction(function () use ($validated, $user, $studentCourseIds, $teacherCourseIds, $currentRole, $targetRole) {
            $attributes = $this->prepareUserAttributes($validated, $user);
            $user->update($attributes);

            if ($targetRole === User::ROLE_STUDENT) {
                if ($studentCourseIds !== false || $currentRole !== $targetRole) {
                    $this->syncStudentCourses($user, $studentCourseIds !== false ? $studentCourseIds : []);
                }
            } else {
                $user->enrolledCourses()->detach();
            }

            if ($targetRole === User::ROLE_TEACHER) {
                if ($teacherCourseIds !== false || $currentRole !== $targetRole) {
                    $this->syncTeacherCourses($user, $teacherCourseIds !== false ? $teacherCourseIds : []);
                }
            } else {
                $this->clearTeacherCourses($user);
            }

            return $user->fresh();
        });

        return response()->json($this->formatUser($user->load('taughtCourses', 'enrolledCourses')));
    }

    public function destroy(User $user)
    {
        $user->delete();
        return response()->json(['message' => 'Utilisateur supprimé avec succès'], 200);
    }
}
