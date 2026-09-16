<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Schema;

class News extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'title',
        'slug',
        'summary',
        'content',
        'content_raw',
        'cover_image_url',
        'cover_image_alt',
        'video_url',
        'source',
        'source_url',
        'is_breaking',
        'breaking_until',
        'views_count',
        'status',
        'published_at',
    ];

    protected $casts = [
        'is_breaking' => 'boolean',
        'breaking_until' => 'datetime',
        'published_at' => 'datetime',
    ];

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', 'published');
    }

    public function scopeBreaking(Builder $query): Builder
    {
        return $query->where('is_breaking', true)
            ->where(function ($q) {
                try {
                    if (Schema::hasColumn('news', 'breaking_until')) {
                        $q->whereNull('breaking_until')
                          ->orWhere('breaking_until', '>=', now());
                    }
                } catch (\Throwable $e) {}
            });
    }

    public function isCurrentlyBreaking(): bool
    {
        if (!$this->is_breaking) {
            return false;
        }
        if ($this->breaking_until && $this->breaking_until->isPast()) {
            return false;
        }
        return true;
    }

    protected static function booted()
    {
        static::saved(function () {
            cache()->forget('active_breaking_news');
            cache()->forget('active_breaking_items');
        });
        static::deleted(function () {
            cache()->forget('active_breaking_news');
            cache()->forget('active_breaking_items');
        });
    }
}
