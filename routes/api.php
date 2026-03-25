<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CourseController;
use App\Http\Controllers\Api\AdminDashboardController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\InvoiceController;
use App\Http\Controllers\Api\SchoolController;
use App\Http\Controllers\Api\SchoolExpenseController;
use App\Http\Controllers\Api\SubscriptionController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'me']);

    Route::apiResource('courses', CourseController::class);
    Route::post('courses/{course}/enroll', [CourseController::class, 'enroll'])->name('courses.enroll');
    Route::post('courses/{course}/unenroll', [CourseController::class, 'unenroll'])->name('courses.unenroll');

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
    });
});
