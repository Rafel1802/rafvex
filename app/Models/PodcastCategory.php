<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class PodcastCategory extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
        'cover_image_url',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'sort_order' => 'integer',
        'is_active' => 'boolean',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($cat) {
            if (empty($cat->slug)) {
                $base = Str::slug($cat->name);
                $slug = $base;
                $i = 1;
                while (static::where('slug', $slug)->exists()) {
                    $slug = "{$base}-{$i}";
                    $i++;
                }
                $cat->slug = $slug;
            }
        });
    }

    public function podcasts(): HasMany
    {
        return $this->hasMany(Podcast::class, 'category_id');
    }

    public function publishedPodcasts(): HasMany
    {
        return $this->hasMany(Podcast::class, 'category_id')
            ->published()
            ->latest('published_at');
    }
}
