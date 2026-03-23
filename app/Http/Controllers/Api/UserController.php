<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class UserController extends Controller
{
    private function generateStudentUID(): string
    {
        $count = User::where('role', 'student')->count() + 1;
        return 'ES-MA-' . str_pad($count, 4, '0', STR_PAD_LEFT);
    }

    private function generateTeacherUID(): string
    {
        $count = User::where('role', 'teacher')->count() + 1;
        return 'PR-MA-' . str_pad($count, 4, '0', STR_PAD_LEFT);
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
            $courseId = $user->enrolledCourses()->first()?->id;
            $data += [
                'student_uid'      => $user->student_uid,
                'birth_date'       => $user->birth_date?->format('Y-m-d'),
                'inscription_date' => $user->inscription_date?->format('Y-m-d'),
                'school_id'        => $user->school_id,
                'course_id'        => $courseId,
            ];
        } elseif ($user->role === 'teacher') {
            $data += [
                'teacher_uid'  => $user->teacher_uid,
                'hire_date'    => $user->hire_date?->format('Y-m-d'),
                'course_ids'   => $user->taughtCourses()->pluck('id')->toArray(),
            ];
        }

        return $data;
    }

    public function index()
    {
        $users = User::with('enrolledCourses')->get()->map(fn($u) => $this->formatUser($u));
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
            'school_id'        => 'nullable|integer|between:1,13',
            'course_id'        => 'nullable|exists:courses,id',
            'hire_date'        => 'nullable|date',
            'course_ids'       => 'nullable|array',
            'course_ids.*'     => 'exists:courses,id',
        ]);

        $courseId = $validated['course_id'] ?? null;
        $courseIds = $validated['course_ids'] ?? [];
        unset($validated['course_id'], $validated['course_ids']);
        $validated['password'] = Hash::make($validated['password']);

        // Auto-generate UIDs based on role
        if ($validated['role'] === 'student') {
            $validated['student_uid'] = $this->generateStudentUID();
        } elseif ($validated['role'] === 'teacher') {
            $validated['teacher_uid'] = $this->generateTeacherUID();
        }

        $user = User::create($validated);

        if ($courseId && $user->role === 'student') {
            $user->enrolledCourses()->sync([$courseId => ['enrolled_at' => now()->toDateString(), 'status' => 'active']]);
        }

        if (!empty($courseIds) && $user->role === 'teacher') {
            $user->taughtCourses()->sync($courseIds);
        }

        return response()->json($this->formatUser($user->load('taughtCourses', 'enrolledCourses')), 201);
    }

    public function show(User $user)
    {
        return response()->json($this->formatUser($user->load('enrolledCourses')));
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
            'school_id'        => 'nullable|integer|between:1,13',
            'course_id'        => 'nullable|exists:courses,id',
            'hire_date'        => 'nullable|date',
            'course_ids'       => 'nullable|array',
            'course_ids.*'     => 'exists:courses,id',
        ]);

        $courseId = array_key_exists('course_id', $validated) ? $validated['course_id'] : false;
        $courseIds = array_key_exists('course_ids', $validated) ? $validated['course_ids'] : false;
        unset($validated['course_id'], $validated['course_ids']);

        if (empty($validated['password'])) {
            unset($validated['password']);
        } else {
            $validated['password'] = Hash::make($validated['password']);
        }

        $user->update($validated);

        if ($courseId !== false && $user->role === 'student') {
            if ($courseId) {
                $user->enrolledCourses()->sync([$courseId => ['enrolled_at' => now()->toDateString(), 'status' => 'active']]);
            } else {
                $user->enrolledCourses()->detach();
            }
        }

        if ($courseIds !== false && $user->role === 'teacher') {
            $user->taughtCourses()->sync($courseIds);
        }

        return response()->json($this->formatUser($user->load('taughtCourses', 'enrolledCourses')));
    }

    public function destroy(User $user)
    {
        $user->delete();
        return response()->json(['message' => 'Utilisateur supprimé avec succès'], 200);
    }
}
