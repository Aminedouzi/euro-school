<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class FictiveMoroccanTeachersSeeder extends Seeder
{
    public function run(): void
    {
        $teachers = [
            ['name' => 'Dr. Fatima Al-Qasimi', 'email' => 'fatima.qasimi@euroschool.ma', 'phone' => '+212623450001'],
            ['name' => 'Prof. Ahmed Ben Mansour', 'email' => 'ahmed.mansour@euroschool.ma', 'phone' => '+212623450002'],
            ['name' => 'Dr. Leila Bennani', 'email' => 'leila.bennani@euroschool.ma', 'phone' => '+212623450003'],
            ['name' => 'Prof. Karim Tazi', 'email' => 'karim.tazi@euroschool.ma', 'phone' => '+212623450004'],
            ['name' => 'Dr. Nora Alaoui', 'email' => 'nora.alaoui@euroschool.ma', 'phone' => '+212623450005'],
            ['name' => 'Prof. Samir Benjelloun', 'email' => 'samir.benjelloun@euroschool.ma', 'phone' => '+212623450006'],
            ['name' => 'Dr. Amina Chraibi', 'email' => 'amina.chraibi@euroschool.ma', 'phone' => '+212623450007'],
            ['name' => 'Prof. Youssef Ouazzani', 'email' => 'youssef.ouazzani@euroschool.ma', 'phone' => '+212623450008'],
            ['name' => 'Dr. Salma El Fassi', 'email' => 'salma.elfassi@euroschool.ma', 'phone' => '+212623450009'],
            ['name' => 'Prof. Aziz Berrada', 'email' => 'aziz.berrada@euroschool.ma', 'phone' => '+212623450010'],
            ['name' => 'Dr. Hana Skalli', 'email' => 'hana.skalli@euroschool.ma', 'phone' => '+212623450011'],
            ['name' => 'Prof. Malik Idrissi', 'email' => 'malik.idrissi@euroschool.ma', 'phone' => '+212623450012'],
            ['name' => 'Dr. Rania El Kettani', 'email' => 'rania.elkettani@euroschool.ma', 'phone' => '+212623450013'],
            ['name' => 'Prof. Hassan Mernissi', 'email' => 'hassan.mernissi@euroschool.ma', 'phone' => '+212623450014'],
            ['name' => 'Dr. Zineb Chafik', 'email' => 'zineb.chafik@euroschool.ma', 'phone' => '+212623450015'],
        ];

        foreach ($teachers as $index => $teacher) {
            User::updateOrCreate(
                ['email' => $teacher['email']],
                [
                    'name' => $teacher['name'],
                    'password' => Hash::make('password'),
                    'role' => User::ROLE_TEACHER,
                    'phone' => $teacher['phone'],
                    'teacher_uid' => 'PR-MA-' . str_pad((string) ($index + 1), 4, '0', STR_PAD_LEFT),
                    'hire_date' => now()->subYears(rand(2, 10))->subDays(rand(0, 364))->toDateString(),
                ]
            );
        }
    }
}
