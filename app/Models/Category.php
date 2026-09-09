<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
    protected $fillable = [
        'parent_id',
        'name',
        'slug',
        'description',
        'meta_title',
        'meta_description',
        'cover_image',
        'cover_image_alt',
        'status',
        'sort_order',
        'featured',
    ];

    protected $casts = [
        'featured' => 'boolean',
    ];

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(Category::class, 'parent_id');
    }

    public function articles(): HasMany
    {
        return $this->hasMany(Article::class);
    }
}
