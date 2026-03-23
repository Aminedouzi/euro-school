<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('student_uid')->nullable()->unique()->after('phone');
            $table->date('birth_date')->nullable()->after('student_uid');
            $table->date('inscription_date')->nullable()->after('birth_date');
            $table->unsignedTinyInteger('school_id')->nullable()->after('inscription_date');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['student_uid', 'birth_date', 'inscription_date', 'school_id']);
        });
    }
};
