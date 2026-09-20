<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class Podcast extends Model
{
    protected $fillable = [
        'category_id',
        'author_id',
        'title',
        'slug',
        'summary',
        'description',
        'audio_url',
        'audio_path',
        'audio_format',
        'audio_size_bytes',
        'duration_seconds',
        'cover_image_url',
        'host_name',
        'episode_number',
        'season_number',
        'status',
        'published_at',
        'is_featured',
        'live_status',
        'live_started_at',
        'live_scheduled_at',
        'live_ended_at',
        'views_count',
        'plays_count',
    ];

    protected $casts = [
        'duration_seconds' => 'integer',
        'audio_size_bytes' => 'integer',
        'episode_number' => 'integer',
        'season_number' => 'integer',
        'is_featured' => 'boolean',
        'published_at' => 'datetime',
        'live_started_at' => 'datetime',
        'live_scheduled_at' => 'datetime',
        'live_ended_at' => 'datetime',
        'views_count' => 'integer',
        'plays_count' => 'integer',
    ];

    protected $appends = [
        'stream_url',
        'formatted_duration',
        'live_offset_seconds',
        'is_live_now',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($podcast) {
            if (empty($podcast->slug)) {
                $base = Str::slug($podcast->title);
                $slug = $base;
                $i = 1;
                while (static::where('slug', $slug)->exists()) {
                    $slug = "{$base}-{$i}";
                    $i++;
                }
                $podcast->slug = $slug;
            }

            if (empty($podcast->published_at) && $podcast->status === 'published') {
                $podcast->published_at = now();
            }
        });

        // Save storage: automatically delete local audio file when a podcast is deleted
        static::deleting(function ($podcast) {
            if ($podcast->audio_path && Storage::disk('public')->exists($podcast->audio_path)) {
                Storage::disk('public')->delete($podcast->audio_path);
            }
        });
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(PodcastCategory::class, 'category_id');
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }

    public function scopeLive($query)
    {
        return $query->where('live_status', 'live');
    }

    public function getStreamUrlAttribute(): ?string
    {
        if ($this->audio_path) {
            return Storage::url($this->audio_path);
        }

        return $this->audio_url;
    }

    public function getFormattedDurationAttribute(): string
    {
        $sec = (int) ($this->duration_seconds ?? 0);
        if ($sec <= 0) {
            return 'Audio Episode';
        }

        $hours = floor($sec / 3600);
        $minutes = floor(($sec % 3600) / 60);
        $seconds = $sec % 60;

        if ($hours > 0) {
            return sprintf('%d:%02d:%02d', $hours, $minutes, $seconds);
        }

        return sprintf('%02d:%02d', $minutes, $seconds);
    }

    public function getLiveOffsetSecondsAttribute(): int
    {
        if ($this->live_status !== 'live' || ! $this->live_started_at) {
            return 0;
        }

        $diff = now()->diffInSeconds($this->live_started_at, false);
        $elapsed = abs($diff);

        if ($this->duration_seconds > 0 && $elapsed > $this->duration_seconds) {
            return $this->duration_seconds;
        }

        return (int) $elapsed;
    }

    public function getIsLiveNowAttribute(): bool
    {
        return $this->live_status === 'live';
    }
}
