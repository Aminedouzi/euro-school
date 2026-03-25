<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Course extends Model
{
    protected $fillable = [
        'school_id',
        'title',
        'type',
        'description',
        'start_date',
        'end_date',
        'teacher_id',
        'max_students',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
            'is_active' => 'boolean',
        ];
    }

    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }


    // Old: public function teacher(): BelongsTo { ... }
    // New: Many-to-many relationship for multiple teachers
    public function teachers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'course_teacher', 'course_id', 'teacher_id')->withTimestamps();
    }

    public function students(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'course_user')
            ->withPivot(['enrolled_at', 'status'])
            ->withTimestamps();
    }

    public function schedules(): HasMany
    {
        return $this->hasMany(CourseSchedule::class)
            ->orderBy('weekday')
            ->orderBy('sort_order')
            ->orderBy('start_time');
    }
}
