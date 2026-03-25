<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class FictiveMoroccanStudentsSeeder extends Seeder
{
    public function run(): void
    {
        $students = [
            ['name' => 'Yassine El Amrani', 'email' => 'yassine.elamrani@euroschool.ma', 'phone' => '+212612340001'],
            ['name' => 'Salma Benjelloun', 'email' => 'salma.benjelloun@euroschool.ma', 'phone' => '+212612340002'],
            ['name' => 'Omar Alaoui', 'email' => 'omar.alaoui@euroschool.ma', 'phone' => '+212612340003'],
            ['name' => 'Khadija Idrissi', 'email' => 'khadija.idrissi@euroschool.ma', 'phone' => '+212612340004'],
            ['name' => 'Hamza Berrada', 'email' => 'hamza.berrada@euroschool.ma', 'phone' => '+212612340005'],
            ['name' => 'Noura Tazi', 'email' => 'noura.tazi@euroschool.ma', 'phone' => '+212612340006'],
            ['name' => 'Rachid Skalli', 'email' => 'rachid.skalli@euroschool.ma', 'phone' => '+212612340007'],
            ['name' => 'Imane Chraibi', 'email' => 'imane.chraibi@euroschool.ma', 'phone' => '+212612340008'],
            ['name' => 'Mehdi Ouazzani', 'email' => 'mehdi.ouazzani@euroschool.ma', 'phone' => '+212612340009'],
            ['name' => 'Sara El Fassi', 'email' => 'sara.elfassi@euroschool.ma', 'phone' => '+212612340010'],
            ['name' => 'Ayoub Lahlou', 'email' => 'ayoub.lahlou@euroschool.ma', 'phone' => '+212612340011'],
            ['name' => 'Asmae Zniber', 'email' => 'asmae.zniber@euroschool.ma', 'phone' => '+212612340012'],
            ['name' => 'Anas Belkadi', 'email' => 'anas.belkadi@euroschool.ma', 'phone' => '+212612340013'],
            ['name' => 'Meryem Ait Taleb', 'email' => 'meryem.aittaleb@euroschool.ma', 'phone' => '+212612340014'],
            ['name' => 'Soufiane Bouzidi', 'email' => 'soufiane.bouzidi@euroschool.ma', 'phone' => '+212612340015'],
            ['name' => 'Chaimae El Kettani', 'email' => 'chaimae.elkettani@euroschool.ma', 'phone' => '+212612340016'],
            ['name' => 'Youssef Mernissi', 'email' => 'youssef.mernissi@euroschool.ma', 'phone' => '+212612340017'],
            ['name' => 'Hiba Bennis', 'email' => 'hiba.bennis@euroschool.ma', 'phone' => '+212612340018'],
            ['name' => 'Zakaria El Mansouri', 'email' => 'zakaria.elmansouri@euroschool.ma', 'phone' => '+212612340019'],
            ['name' => 'Lina Chafik', 'email' => 'lina.chafik@euroschool.ma', 'phone' => '+212612340020'],
        ];

        foreach ($students as $index => $student) {
            User::updateOrCreate(
                ['email' => $student['email']],
                [
                    'name' => $student['name'],
                    'password' => Hash::make('password'),
                    'role' => User::ROLE_STUDENT,
                    'phone' => $student['phone'],
                    'student_uid' => 'ES-MA-' . str_pad((string) ($index + 1), 4, '0', STR_PAD_LEFT),
                    'birth_date' => now()->subYears(rand(12, 22))->subDays(rand(0, 364))->toDateString(),
                    'inscription_date' => now()->subDays(rand(1, 180))->toDateString(),
                ]
            );
        }
    }
}
