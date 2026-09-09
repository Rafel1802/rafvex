<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AuthorProfile extends Model
{
    protected $fillable = [
        'user_id',
        'slug',
        'display_name',
        'bio',
        'avatar',
        'job_title',
        'website',
        'twitter',
        'linkedin',
        'youtube',
        'is_public',
    ];

    protected $casts = [
        'is_public' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
