<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('schools', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->nullable();
            $table->string('address')->nullable();
            $table->timestamps();
        });

        $now = now();
        for ($i = 1; $i <= 13; $i++) {
            DB::table('schools')->insert([
                'id' => $i,
                'name' => 'École '.$i,
                'code' => 'ESC-'.str_pad((string) $i, 2, '0', STR_PAD_LEFT),
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        if (Schema::getConnection()->getDriverName() === 'sqlite') {
            DB::statement("INSERT OR REPLACE INTO sqlite_sequence (name, seq) VALUES ('schools', 13)");
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('schools');
    }
};
