<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Playlist extends Model
{
    protected $fillable = [
        'title',
        'slug',
        'description',
        'cover_image_url',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($playlist) {
            if (empty($playlist->slug)) {
                $playlist->slug = Str::slug($playlist->title);
            }
        });
    }

    public function articles(): HasMany
    {
        return $this->hasMany(Article::class)
            ->orderBy('playlist_order', 'asc')
            ->orderBy('id', 'asc');
    }

    public function publishedArticles(): HasMany
    {
        return $this->hasMany(Article::class)
            ->published()
            ->orderBy('playlist_order', 'asc')
            ->orderBy('id', 'asc');
    }
}
