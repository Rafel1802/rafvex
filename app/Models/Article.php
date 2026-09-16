<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Article extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'category_id',
        'cover_image_id',
        'title',
        'slug',
        'excerpt',
        'content',
        'content_raw',
        'status',
        'published_at',
        'scheduled_at',
        'cover_image_url',
        'cover_image_alt',
        'video_url',
        'meta_title',
        'meta_description',
        'canonical_url',
        'noindex',
        'nofollow',
        'og_title',
        'og_description',
        'og_image',
        'reading_time',
        'views_count',
        'featured',
        'allow_comments',
        'ai_assisted',
        'revision_count',
        'playlist_id',
        'playlist_order',
        'is_breaking',
        'breaking_until',
    ];

    protected $casts = [
        'published_at' => 'datetime',
        'scheduled_at' => 'datetime',
        'noindex' => 'boolean',
        'nofollow' => 'boolean',
        'featured' => 'boolean',
        'allow_comments' => 'boolean',
        'ai_assisted' => 'boolean',
        'playlist_order' => 'integer',
        'is_breaking' => 'boolean',
        'breaking_until' => 'datetime',
    ];

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function coverImage(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'cover_image_id');
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class);
    }

    public function revisions(): HasMany
    {
        return $this->hasMany(ArticleRevision::class);
    }

    public function relatedArticles(): BelongsToMany
    {
        return $this->belongsToMany(Article::class, 'article_related', 'article_id', 'related_article_id')
                    ->withPivot('sort_order')
                    ->orderBy('article_related.sort_order');
    }

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    public function favorites(): HasMany
    {
        return $this->hasMany(UserFavorite::class);
    }

    public function favoritedBy(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_favorites')->withTimestamps();
    }

    public function readingHistory(): HasMany
    {
        return $this->hasMany(UserReadingHistory::class);
    }

    public function readers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_reading_history')
            ->withPivot('read_at', 'read_count')
            ->withTimestamps();
    }

    public function playlist(): BelongsTo
    {
        return $this->belongsTo(Playlist::class);
    }

    public function scopePublished($query)
    {
        // Auto-convert any due scheduled posts to published
        static::autoPublishScheduled();

        return $query->where(function ($q) {
            $q->where('status', 'published')
              ->orWhere(function ($sq) {
                  $sq->where('status', 'scheduled')
                     ->whereNotNull('scheduled_at')
                     ->where('scheduled_at', '<=', now());
              });
        });
    }

    public static function autoPublishScheduled(): int
    {
        try {
            return static::where('status', 'scheduled')
                ->whereNotNull('scheduled_at')
                ->where('scheduled_at', '<=', now())
                ->update([
                    'status' => 'published',
                    'published_at' => \Illuminate\Support\Facades\DB::raw('COALESCE(published_at, scheduled_at, NOW())'),
                ]);
        } catch (\Throwable $e) {
            return 0;
        }
    }

    public function scopeBreaking($query)
    {
        return $query->where('is_breaking', true)
            ->where(function ($q) {
                try {
                    if (\Illuminate\Support\Facades\Schema::hasColumn('articles', 'breaking_until')) {
                        $q->whereNull('breaking_until')
                          ->orWhere('breaking_until', '>=', now());
                    }
                } catch (\Throwable $e) {}
            });
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
