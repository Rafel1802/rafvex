<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ArticleRevision extends Model
{
    public $timestamps = false; // We use created_at only (handled manually or by DB default)

    protected $fillable = [
        'article_id',
        'user_id',
        'title',
        'content',
        'content_raw',
        'excerpt',
        'status',
        'summary',
        'revision_number',
        'created_at',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    public function article(): BelongsTo
    {
        return $this->belongsTo(Article::class);
    }

    public function editor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
