<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class AdminDashboardController extends Controller
{
    public function getStats()
    {
        $enrollments = DB::table('course_user')->count();

        return response()->json([
            'data' => [
                'total_users' => User::count(),
                'total_students' => User::where('role', User::ROLE_STUDENT)->count(),
                'total_teachers' => User::where('role', User::ROLE_TEACHER)->count(),
                'total_courses' => Course::count(),
                'total_enrollments' => $enrollments,
            ],
        ]);
    }
}
