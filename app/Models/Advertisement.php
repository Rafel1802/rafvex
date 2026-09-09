<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Advertisement extends Model
{
    protected $fillable = [
        'name',
        'placement',
        'enabled',
        'code',
        'ad_client',
        'ad_slot',
        'ad_format',
        'device',
    ];

    protected $casts = [
        'enabled' => 'boolean',
    ];
}
