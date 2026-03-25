<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Irreversible: removes billing, multi-school, and weekly schedule data.
     */
    public function up(): void
    {
        Schema::dropIfExists('invoices');
        Schema::dropIfExists('payments');
        Schema::dropIfExists('subscriptions');
        Schema::dropIfExists('course_schedules');
        Schema::dropIfExists('school_expenses');

        if (Schema::hasTable('courses') && Schema::hasColumn('courses', 'school_id')) {
            Schema::table('courses', function (Blueprint $table) {
                $table->dropConstrainedForeignId('school_id');
            });
        }

        if (Schema::hasTable('users') && Schema::hasColumn('users', 'school_id')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropConstrainedForeignId('school_id');
            });
        }

        Schema::dropIfExists('schools');
    }

    public function down(): void
    {
        throw new \RuntimeException('This migration cannot be reversed.');
    }
};
