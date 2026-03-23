<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasTable('subscriptions')) {
            Schema::create('subscriptions', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
                $table->string('plan_name');
                $table->string('plan_type');
                $table->decimal('price', 10, 2);
                $table->string('billing_cycle');
                $table->string('status')->default('active');
                $table->date('start_date');
                $table->date('end_date')->nullable();
                $table->boolean('auto_renew')->default(true);
                $table->text('description')->nullable();
                $table->timestamps();

                $table->index('user_id');
                $table->index('status');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscriptions');
    }
};
