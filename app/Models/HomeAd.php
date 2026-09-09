<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class HomeAd extends Model
{
    use SoftDeletes;

    protected $table = 'home_ads';

    protected $fillable = [
        'title',
        'sponsor_name',
        'subtitle',
        'media_type',
        'media_url',
        'video_url',
        'link_url',
        'aspect_ratio',
        'badge_text',
        'order',
        'is_active',
        'impressions_count',
        'clicks_count',
        'notes',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'order' => 'integer',
        'impressions_count' => 'integer',
        'clicks_count' => 'integer',
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
        return (bool) $this->is_active;
    }

    public function getStatusLabelAttribute(): string
    {
        return $this->is_active ? 'Active' : 'Paused';
    }
}
