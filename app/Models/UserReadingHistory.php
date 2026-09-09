<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserReadingHistory extends Model
{
    use HasFactory;

    protected $table = 'user_reading_history';

    protected $fillable = [
        'user_id',
        'article_id',
        'read_at',
        'read_count',
    ];

    protected $casts = [
        'read_at' => 'datetime',
        'read_count' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function article(): BelongsTo
    {
        return $this->belongsTo(Article::class);
    }
}
