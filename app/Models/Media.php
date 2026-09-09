<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Media extends Model
{
    protected $fillable = [
        'user_id',
        'filename',
        'original_filename',
        'disk',
        'path',
        'url',
        'mime_type',
        'extension',
        'size',
        'width',
        'height',
        'alt',
        'caption',
        'description',
        'variants',
    ];

    protected $casts = [
        'variants' => 'array',
    ];

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
