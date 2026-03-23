<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CourseController;
use App\Http\Controllers\Api\AdminDashboardController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\InvoiceController;
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

    // Admin only routes
    Route::middleware('admin')->group(function () {
        Route::apiResource('users', UserController::class);
        Route::apiResource('payments', PaymentController::class);
        Route::apiResource('invoices', InvoiceController::class);
        Route::apiResource('subscriptions', SubscriptionController::class);
        Route::get('/subscriptions/count/active', [SubscriptionController::class, 'activeCount']);
        Route::get('/subscriptions/user/{userId}', [SubscriptionController::class, 'userSubscriptions']);
        Route::get('/admin/dashboard-stats', [AdminDashboardController::class, 'getStats']);
    });
});
