<?php

use App\Models\Invoice;
use App\Models\Payment;
use App\Models\School;
use App\Models\SchoolExpense;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CourseController;
use App\Http\Controllers\Api\AdminDashboardController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\InvoiceController;
use App\Http\Controllers\Api\SchoolController;
use App\Http\Controllers\Api\SchoolExpenseController;
use App\Http\Controllers\Api\SubscriptionController;
use App\Http\Controllers\Api\CourseSessionController;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schema;

Route::bind('school_expense', function (string $value) {
    if (! Schema::hasTable('school_expenses')) {
        throw new HttpResponseException(
            response()->json([
                'message' => 'La table school_expenses est absente. Exécutez : php artisan migrate',
            ], 503)
        );
    }

    return SchoolExpense::whereKey($value)->firstOrFail();
});

Route::bind('school', function (string $value) {
    if (! Schema::hasTable('schools')) {
        throw new HttpResponseException(
            response()->json([
                'message' => 'La table schools est absente. Exécutez : php artisan migrate',
            ], 503)
        );
    }

    return School::whereKey($value)->firstOrFail();
});

Route::bind('payment', function (string $value) {
    if (! Schema::hasTable('payments')) {
        throw new HttpResponseException(
            response()->json([
                'message' => 'La table payments est absente. Exécutez : php artisan migrate',
            ], 503)
        );
    }

    return Payment::whereKey($value)->firstOrFail();
});

Route::bind('invoice', function (string $value) {
    if (! Schema::hasTable('invoices')) {
        throw new HttpResponseException(
            response()->json([
                'message' => 'La table invoices est absente. Exécutez : php artisan migrate',
            ], 503)
        );
    }

    return Invoice::whereKey($value)->firstOrFail();
});

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'me']);

    Route::apiResource('courses', CourseController::class);
    Route::post('courses/{course}/enroll', [CourseController::class, 'enroll'])->name('courses.enroll');
    Route::post('courses/{course}/unenroll', [CourseController::class, 'unenroll'])->name('courses.unenroll');

    Route::get('courses/{course}/sessions', [CourseSessionController::class, 'index']);
    Route::post('courses/{course}/sessions', [CourseSessionController::class, 'store']);
    Route::get('courses/{course}/sessions/{session}', [CourseSessionController::class, 'show']);
    Route::put('courses/{course}/sessions/{session}/attendance', [CourseSessionController::class, 'updateAttendance']);

    Route::get('/schools', [SchoolController::class, 'index']);

    // Admin only routes
    Route::middleware('admin')->group(function () {
        Route::post('/schools', [SchoolController::class, 'store']);
        Route::put('/schools/{school}', [SchoolController::class, 'update']);
        Route::patch('/schools/{school}', [SchoolController::class, 'update']);
        Route::delete('/schools/{school}', [SchoolController::class, 'destroy']);
        Route::apiResource('school-expenses', SchoolExpenseController::class)->only(['index', 'store', 'update', 'destroy']);

        Route::apiResource('users', UserController::class);
        Route::apiResource('payments', PaymentController::class);
        Route::apiResource('invoices', InvoiceController::class);
        Route::apiResource('subscriptions', SubscriptionController::class);
        Route::get('/subscriptions/count/active', [SubscriptionController::class, 'activeCount']);
        Route::get('/subscriptions/user/{userId}', [SubscriptionController::class, 'userSubscriptions']);
        Route::get('/admin/dashboard-stats', [AdminDashboardController::class, 'getStats']);
        Route::get('/admin/students/{user}/absences', [CourseSessionController::class, 'studentAbsencesAdmin']);
    });
});
