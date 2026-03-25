<?php

namespace Database\Seeders;

use App\Models\Payment;
use App\Models\User;
use App\Models\Course;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class StudentPaymentsSeeder extends Seeder
{
    public function run(): void
    {
        // Get all students and courses
        $students = User::where('role', 'student')->get();
        $courses = Course::all();

        if ($students->isEmpty() || $courses->isEmpty()) {
            $this->command->warn('No students or courses found. Skipping payment seeding.');
            return;
        }

        $paymentMethods = ['card', 'bank_transfer', 'cash', 'check'];
        $paymentStatuses = ['pending', 'completed', 'failed', 'refunded'];

        // Create payment records for each student
        foreach ($students as $student) {
            // Each student gets 1-3 payment records
            $paymentCount = rand(1, 3);
            
            for ($i = 0; $i < $paymentCount; $i++) {
                $course = $courses->random();
                
                // Generate realistic Moroccan payment amounts
                $baseAmount = rand(400, 1000); // in dh
                $amount = $baseAmount + (rand(0, 9) * 10);
                
                $paymentDate = Carbon::now()->subDays(rand(1, 90));
                
                // Higher likelihood of completed payments
                $statusWeights = [
                    'completed' => 0.65,
                    'pending' => 0.20,
                    'refunded' => 0.10,
                    'failed' => 0.05,
                ];
                
                $status = $this->weightedRandom($statusWeights);
                
                // Generate reference number
                $reference = strtoupper('PAY-' . date('Ymd', $paymentDate->timestamp) . '-' . rand(1000, 9999));
                
                Payment::create([
                    'user_id' => $student->id,
                    'course_id' => $course->id,
                    'amount' => $amount,
                    'method' => $paymentMethods[array_rand($paymentMethods)],
                    'status' => $status,
                    'reference' => $reference,
                    'description' => "Payment for {$course->title} course",
                    'payment_date' => $paymentDate,
                ]);
            }
        }

        $this->command->info("Payment records created successfully for {$students->count()} students!");
    }

    /**
     * Select a random value from array with weighted probabilities
     */
    private function weightedRandom(array $weights): mixed
    {
        $rand = mt_rand(1, 100) / 100;
        $sum = 0;
        
        foreach ($weights as $value => $weight) {
            $sum += $weight;
            if ($rand <= $sum) {
                return $value;
            }
        }
        
        return key($weights);
    }
}
