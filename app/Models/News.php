<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Builder;

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
        'views_count',
        'status',
        'published_at',
    ];

    protected $casts = [
        'is_breaking' => 'boolean',
        'published_at' => 'datetime',
    ];

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', 'published');
    }

    public function scopeBreaking(Builder $query): Builder
    {
        return $query->where('is_breaking', true);
    }
}
