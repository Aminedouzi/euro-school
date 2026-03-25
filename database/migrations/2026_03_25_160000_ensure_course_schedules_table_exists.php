<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Recreate course_schedules when the DB was migrated with a later destructive migration
     * or the table was dropped while the create migration stayed recorded.
     */
    public function up(): void
    {
        if (Schema::hasTable('course_schedules')) {
            return;
        }

        Schema::create('course_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained()->cascadeOnDelete();
            $table->unsignedTinyInteger('weekday');
            $table->string('start_time', 8);
            $table->string('end_time', 8);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index(['course_id', 'weekday']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('course_schedules');
    }
};
