<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PopupAd extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'title',
        'subtitle',
        'sponsor_name',
        'media_type',
        'media_url',
        'video_url',
        'aspect_ratio',
        'button_text',
        'button_url',
        'button_color',
        'is_active',
        'delay_seconds',
        'show_on_pages',
        'show_frequency',
        'start_at',
        'end_at',
        'impressions_count',
        'clicks_count',
        'notes',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'delay_seconds' => 'integer',
        'impressions_count' => 'integer',
        'clicks_count' => 'integer',
        'start_at' => 'datetime',
        'end_at' => 'datetime',
    ];

    protected $appends = [
        'ctr',
        'status_label',
        'is_currently_running',
    ];

    public function getCtrAttribute(): float
    {
        if ($this->impressions_count > 0) {
            return round(($this->clicks_count / $this->impressions_count) * 100, 1);
        }
        return 0.0;
    }

    public function getIsCurrentlyRunningAttribute(): bool
    {
        if (!$this->is_active) {
            return false;
        }

        $now = now();

        if ($this->start_at && $now->lt($this->start_at)) {
            return false;
        }

        if ($this->end_at && $now->gt($this->end_at)) {
            return false;
        }

        return true;
    }

    public function getStatusLabelAttribute(): string
    {
        if (!$this->is_active) {
            return 'Paused';
        }

        $now = now();

        if ($this->start_at && $now->lt($this->start_at)) {
            return 'Scheduled';
        }

        if ($this->end_at && $now->gt($this->end_at)) {
            return 'Expired';
        }

        return 'Live / Active';
    }

    public function scopeActive($query)
    {
        $now = now();
        return $query->where('is_active', true)
            ->where(function ($q) use ($now) {
                $q->whereNull('start_at')->orWhere('start_at', '<=', $now);
            })
            ->where(function ($q) use ($now) {
                $q->whereNull('end_at')->orWhere('end_at', '>=', $now);
            });
    }
}
