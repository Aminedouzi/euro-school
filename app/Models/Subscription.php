<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Subscription extends Model
{
    protected $fillable = [
        'user_id',
        'plan_name',
        'plan_type',
        'price',
        'billing_cycle',
        'status',
        'start_date',
        'end_date',
        'auto_renew',
        'description',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'auto_renew' => 'boolean',
        'price' => 'decimal:2',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active')
            ->where('end_date', '>=', now());
    }

    public function scopeExpiring($query)
    {
        return $query->where('status', 'active')
            ->whereDate('end_date', '<', now());
    }

    public function isActive(): bool
    {
        return $this->status === 'active' && $this->end_date >= now();
    }
}
